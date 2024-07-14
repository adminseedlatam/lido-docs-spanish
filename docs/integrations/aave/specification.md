## Especificación

El objetivo principal de la integración es proporcionar la capacidad de depositar stETH en AAVE y permitir su uso como colateral. No se supone que se permita el préstamo de stETH (tanto estable como variable). La motivación detrás de este diseño es fomentar el uso de stETH como colateral en lugar de pedirlo prestado. stETH está vinculado de manera estable a ETH, por lo que usarlo como colateral implica bajos riesgos de liquidación.

El stETH se implementa como un token de rebase. En condiciones normales, los saldos de los usuarios se actualizan una vez al día con el informe del Oracle. En el fondo, stETH almacena los saldos de los usuarios como acciones del tenedor en la cantidad total de ether controlada por el protocolo Lido. stETH tiene un par de métodos para convertir acciones internas en saldos y viceversa:

```solidity
/// @return the amount of ether that corresponds to `_sharesAmount` token shares.
function getPooledEthByShares(uint256 _sharesAmount) public view returns (uint256);

/// @return the amount of shares that corresponds to `_ethAmount` protocol-controlled ether.
function getSharesByPooledEth(uint256 _ethAmount) public view returns (uint256);
```

El aSTETH, de manera similar a los aTokens regulares, es un token generador de recompensas que se acuña y quema en los depósitos y retiros en el LendingPool. El valor de aSTETH está vinculado al valor del token depositado correspondiente en una proporción de 1:1 y puede almacenarse, transferirse o negociarse de manera segura. Todos los intereses recaudados por la reserva de aSTETH (de rebase y recompensas AAVE) se distribuyen directamente a los tenedores de aTokens mediante el aumento continuo de su saldo en la cartera (en caso de rebases negativos de stETH, podría disminuir).

La implementación de aSTETH garantiza lo siguiente:

- **En cualquier momento, un usuario puede depositar X stETH para acuñar X aSTETH \***
  La oferta total de aSTETH aumenta en X.

- **En cualquier momento, un usuario puede quemar x aSTETH por x stETH \***
  La oferta total de aSTETH disminuye en x.

- **En cualquier momento, el usuarioA puede transferir X aSTETH al usuarioB \***
  El saldo de aSTETH del usuarioA se reduce en X.
  El saldo de aSTETH del usuarioB aumenta en X.
  La oferta total de aSTETH sigue siendo exactamente la misma.

- **Cuando stETH hace rebase, aSTETH también hace rebase.**
  Supongamos que hay 1000 stETH bloqueados en la reserva. Consideremos las siguientes situaciones:
  1. Caso común: ocurre un rebase positivo y la oferta total de stETH aumenta en un 1%:
    - La oferta total del token aSTETH se vuelve igual a 1010 aSTETH.
    - El saldo de cada tenedor de aSTETH también aumenta en un 1%.
  2. Caso raro: ocurre un rebase negativo y la oferta total de stETH disminuye en un 1%:
    - La oferta total del token aSTETH se vuelve igual a 990 aSTETH.
    - El saldo de cada tenedor de aSTETH también disminuye en un 1%.

**\*** La cantidad real de tokens será menor o igual a X debido a operaciones de redondeo enteras de la tasa de rebase del token subyacente y la tasa de interés de AAVE. Sin embargo, el error de redondeo real no excederá un par de WEI en ningún momento.

## Token AStETH

Para implementar la lógica anterior, el contrato `AStETH` modifica la implementación del aToken predeterminado pero se mantiene lo más cercano posible al contrato original. Al igual que el contrato `AToken` predeterminado, hereda de los contratos `VersionedInitializable` y `IncentivizedERC20` e implementa la interfaz `IAToken`.

El aToken predeterminado implementa la interfaz ERC20 pero tiene dos métodos específicos:

- `scaledBalanceOf(user)` - Devuelve el **saldo escalado** del usuario como un `uint256`. El saldo escalado es el saldo del token subyacente del usuario (cantidad depositada), dividido por el índice de liquidez actual en el momento de la actualización. $scaledBalance = amountDeposited/currentLiquidityIndex$
  Esto esencialmente 'marca' cuando un usuario ha depositado en el pool de reservas y puede usarse para calcular el saldo actual compuesto de aToken del usuario.
  Ejemplo:
  - El usuario A deposita 1000 DAI con un índice de liquidez de 1.1
  - El usuario B deposita otra cantidad en el mismo pool
  - El índice de liquidez ahora es 1.2
  - Por lo tanto, para calcular el saldo compuesto actual de aToken del usuario A, se debe realizar la operación inversa: $aTokenBalance = scaledBalance*currentLiquidityIndex$

- `scaledTotalSupply()` - Devuelve la oferta total escalada del aToken como `uint256`.

Pero el enfoque anterior no puede usarse con el token stETH sin modificaciones porque no toma en consideración los rebases de stETH.

Si se aplican las ecuaciones anteriores a stETH tal cual, el beneficio del staking no se distribuirá entre los tenedores de aSTETH, sino que se acumulará en el saldo del token aSTETH.

Para hacer que el beneficio de los rebases sea contable, `AStETH` introduce un índice adicional - **índice de rebase de stETH**. El índice de rebase de stETH expresa las recompensas de los rebases del token stETH en el tiempo. El índice de rebase de stETH puede calcularse de la siguiente manera:

```solidity
function _stEthRebasingIndex() returns (uint256) {
  // Below expression returns how much ether corresponds
  // to 10 ** 27 shares. 10 ** 27 was taken  to provide
  // same precision as AAVE's liquidity index, which
  // counted in RAY's (decimals with 27 digits).
  return stETH.getPooledEthByShares(WadRayMath.RAY);
}
```

Con el índice de rebase de stETH, `AStETH` permite que el beneficio de los rebases sea contable, aplicando un escalado adicional cuando ocurre la acuñación o quema del token:

```solidity
function mint(address user, uint256 amount, uint256 liquidityIndex) {
    ...
    uint256 stEthRebasingIndex = _stEthRebasingIndex();
    _mint(user, _toInternalAmount(amount, stEthRebasingIndex, liquidityIndex));
    ...
}

function burn(address user, uint256 amount, uint256 liquidityIndex) {
    ...
    uint256 stEthRebasingIndex = _stEthRebasingIndex();
    _burn(user, _toInternalAmount(amount, stEthRebasingIndex, liquidityIndex));
    ...
}

function _toInternalAmount(
    uint256 amount,
    uint256 stEthRebasingIndex,
    uint256 aaveLiquidityIndex
  ) internal view returns (uint256) {
    return amount.mul(WadRayMath.RAY).div(stEthRebasingIndex).rayDiv(aaveLiquidityIndex);
  }
```

Luego, de acuerdo con las definiciones de AAVE, `scaledTotalSupply()` y `scaledBalanceOf()` pueden calcularse como:

```solidity
function scaledTotalSupply() returns (uint256) {
  return _totalSupply.mul(_stEthRebasingIndex()).div(WadRayMath.RAY);
}

function scaledBalanceOf(address user) returns (uint256) {
  return _balances[user].mul(_stEthRebasingIndex()).div(WadRayMath.RAY);
}
```

Además, el contrato `AStETH` introduce los siguientes métodos:

- `internalBalanceOf(user)` - devuelve el **saldo interno** del usuario. El saldo interno es el saldo del token subyacente del usuario (suma de los depósitos del usuario), dividido por el índice de liquidez actual en el momento de la actualización y por el índice de rebase de stETH actual.
- `internalTotalSupply()` - Devuelve la oferta total interna del aSTETH.

```solidity
function internalTotalSupply(address user) returns (uint256) {
  return _totalSupply;
}

function internalBalanceOf(address user) returns (uint256) {
  return _balances[user];
}
```

## Tokens StableDebtSTETH y VariableDebtSTETH

La integración actual no soporta préstamos, ni con tasas de interés variables ni estables. Debido a esto, los contratos StableDebtSTETH y VariableDebtSTETH extienden los contratos `StableDebtToken` y `VariableDebtToken` predeterminados, respectivamente, y anulan el método `mint()` con un stub, que revierte con el error `CONTRACT_NOT_ACTIVE`. Esto se hizo para hacer imposible el uso de préstamos con aSTETH porque los tokens de deuda predeterminados no son compatibles con el contrato `AStETH`.

En el futuro, se puede activar el préstamo actualizando la implementación de los tokens de deuda. Pero los contratos `StableDebtToken` y `VariableDebtToken` **NO DEBEN** usarse con `AStETH` porque no toman en consideración los rebases del token stETH y romperán la matemática de la integración.

## Controlador de Incentivos

Al inicio de la integración de stETH en el protocolo AAVE, no se supone que se use el controlador de incentivos. Si en el futuro Lido decide agregar incentivos a la integración, puede hacerse actualizando la implementación del token aSTETH. El ejemplo de implementación del `IncentivesController` para el contrato `AStETH` puede encontrarse aquí: https://github.com/lidofinance/aave-asteth-incentives-controller