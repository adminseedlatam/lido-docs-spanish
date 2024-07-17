# Burner

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/Burner.sol)
- [Contrato Desplegado](https://etherscan.io/address/0xD15a672319Cf0352560eE76d9e89eAB0889046D3)

El contrato proporciona una forma para el protocolo Lido de quemar acciones de tokens stETH como un medio para finalizar retiros, penalizar a los operadores de nodos que salen fuera de tiempo y, posiblemente, cubrir pérdidas en el staking.

Depende de la naturaleza de rebasamiento (rebasing) de stETH. El contrato `Lido` calcula el saldo del usuario utilizando la siguiente ecuación:
`balanceOf(cuenta) = shares[cuenta] * totalPooledEther / totalShares`.
Por lo tanto, quemar acciones (por ejemplo, disminuir la cantidad de `totalShares`) aumenta los saldos de los poseedores de stETH.

Se presume que la quema real de acciones ocurre dentro del contrato [`Lido`](/contracts/lido) como parte del informe del [`AccountingOracle`](/contracts/accounting-oracle).

`Burner` proporciona una manera segura y determinística de incurrir en un rebasamiento positivo del token stETH disminuyendo gradualmente `totalShares`, lo cual puede ser manejado correctamente por protocolos de terceros integrados con stETH.

`Burner` acepta solicitudes de quema de dos maneras:

- Bloqueando stETH **preaprobado de alguien** por el llamador con el rol asignado `REQUEST_BURN_SHARES_ROLE`.
- Bloqueando stETH **provisto por el llamador** con el rol asignado `REQUEST_BURN_MY_STETH_ROLE`.

Estas solicitudes de quema se establecen inicialmente en un estado pendiente. La quema real ocurre como parte de un informe del oráculo ([`AccountingOracle`](/contracts/accounting-oracle)) manejado por [`Lido`](/contracts/lido) para prevenir fluctuaciones adicionales en el período de rebasamiento del token stETH (~24h).

También distinguimos dos tipos de solicitudes de quema de acciones:

- solicitud para **cubrir** un evento de reducción (por ejemplo, disminución del monto total de ETH agrupado entre dos informes de oráculo consecutivos);
- solicitud para quemar acciones para cualquier otro caso (**no cubrir**).

El contrato tiene dos contadores separados para las acciones quemadas: uno para las que cubren (`cover`) y otro para las que no cubren (`non-cover`). El contrato es exclusivamente responsable de la quema de acciones de stETH por parte de [`Lido`](/contracts/lido) y solo permite la quema desde el propio saldo del contrato.

## Contadores de acciones quemadas

El contrato lleva un registro de todas las acciones quemadas manteniendo dos contadores internos: `totalCoverSharesBurnt` y `totalNonCoverSharesBurnt` para las quemas de cobertura y no cobertura, respectivamente. Estos contadores se incrementan cuando se realiza la quema real de stETH como parte del informe del Oráculo de Lido.

Esto permite dividir cualquier rebasamiento de stETH en dos subcomponentes: el rebasamiento inducido por recompensas y el rebasamiento inducido por la aplicación de cobertura, que se puede hacer de la siguiente manera:

1. Antes del rebasamiento, guardar los valores anteriores de ambos contadores, así como el valor del precio de la acción stETH:

   ```sol
   prevCoverSharesBurnt = Burner.totalCoverSharesBurnt()
   prevSharePrice = stETH.totalSupply() / stETH.getTotalShares()
   ```

2. Después del rebasamiento, realizar los siguientes cálculos:

   ```sol
   sharesBurntFromOldToNew = Burner.totalCoverSharesBurnt() - prevCoverSharesBurnt;
   newSharePriceAfterCov = stETH.totalSupply() / (stETH.getTotalShares() + sharesBurntFromOldToNew);
   newSharePrice = stETH.totalSupply() / stETH.getTotalShares();

   // incremento del precio de la acción inducido por recompensas
   rewardPerShare = newSharePriceAfterCov - prevSharePrice;

   // incremento del precio de la acción inducido por la cobertura
   nonRewardSharePriceIncrease = newSharePrice - prevSharePrice - rewardPerShare;
   ```

## Métodos de Vista

### getCoverSharesBurnt()

Devuelve el total de acciones de cobertura quemadas hasta el momento.

```sol
function getCoverSharesBurnt() external view returns (uint256)
```

### getNonCoverSharesBurnt()

Devuelve el total de acciones no cubiertas quemadas hasta el momento.

```sol
function getNonCoverSharesBurnt() external view returns (uint256)
```

### getExcessStETH()

Devuelve la cantidad de stETH perteneciente a la dirección del contrato quemador pero que no está marcada para quemar.

```sol
function getExcessStETH() external view returns (uint256)
```

### getSharesRequestedToBurn()

Devuelve el número de acciones de cobertura y no cobertura solicitadas para quemar.

```sol
function getSharesRequestedToBurn() external view returns (uint256 coverShares, uint256 nonCoverShares)
```

## Métodos

### requestBurnMyStETHForCover()

Transfiere tokens stETH desde el remitente del mensaje y los bloquea de manera irreversible en la dirección del contrato quemador. Internamente convierte la cantidad de tokens en la cantidad subyacente de acciones y marca la cantidad convertida para la quema respaldada por cobertura mediante el aumento del contador interno `coverSharesBurnRequested`.

```sol
function requestBurnMyStETHForCover(uint256 _stETHAmountToBurn) external
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- El remitente del mensaje no es titular del rol `REQUEST_BURN_MY_STETH_ROLE`.
- No se proporciona stETH (`_stETHAmountToBurn == 0`).
- No se transfieren stETH (se excede la asignación).
:::

#### Parámetros

| Nombre               | Tipo      | Descripción                                         |
| -------------------- | --------- | --------------------------------------------------- |
| `_stETHAmountToBurn` | `uint256` | cantidad de tokens stETH (no cantidad de acciones) a quemar |

### requestBurnSharesForCover()

Transfiere acciones stETH desde `_from` y las bloquea de manera irreversible en la dirección del contrato quemador. Internamente marca la cantidad de acciones para la quema respaldada por cobertura mediante el aumento del contador interno `coverSharesBurnRequested`.

Solo puede ser llamado por un titular del rol `REQUEST_BURN_SHARES_ROLE`. Después de la actualización a Lido V2, no es llamado realmente por ningún contrato y se supone que es llamado por el Agente de Lido DAO en caso de necesidad de cobertura.

```sol
function requestBurnSharesForCover(address _from, uint256 _sharesAmountToBurn)
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- El remitente del mensaje no es titular del rol `REQUEST_BURN_SHARES_ROLE`.
- No se proporcionan acciones stETH (`_sharesAmountToBurn == 0`).
- No se transfieren acciones stETH (se excede la asignación).
:::

#### Parámetros

| Nombre                  | Tipo      | Descripción                                         |
| ----------------------- | --------- | --------------------------------------------------- |
| `_from`                 | `address` | dirección desde la cual transferir las acciones     |
| `_sharesAmountToBurn`   | `uint256` | cantidad de acciones (no cantidad de tokens stETH) a quemar |

### requestBurnMyStETH()

Transfiere tokens stETH desde el remitente del mensaje y los bloquea de manera irreversible en la dirección del contrato quemador. Internamente convierte la cantidad de tokens en la cantidad subyacente de acciones y marca la cantidad convertida para la quema no respaldada por cobertura mediante el aumento del contador interno `nonCoverSharesBurnRequested`.

```sol
function requestBurnMyStETH(uint256 _stETHAmountToBurn) external
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- El remitente del mensaje no es titular del rol `REQUEST_BURN_MY_STETH_ROLE`.
- No se proporciona stETH (`_stETHAmountToBurn == 0`).
- No se transfieren stETH (se excede la asignación).
:::

#### Parámetros

| Nombre               | Tipo      | Descripción                                         |
| -------------------- | --------- | --------------------------------------------------- |
| `_stETHAmountToBurn` | `uint256` | cantidad de tokens stETH (no cantidad de acciones) a quemar.

### requestBurnShares()

Transfiere acciones stETH desde `_from` y las bloquea de manera irreversible en la dirección del contrato quemador. Internamente marca la cantidad de acciones para la quema no respaldada por cobertura mediante el aumento del contador interno `nonCoverSharesBurnRequested`.

Solo puede ser llamado por un titular del rol `REQUEST_BURN_SHARES_ROLE`, que después de la actualización a Lido V2 es [`Lido`](/contracts/lido) o [`NodeOperatorsRegistry`](/contracts/node-operators-registry).
[`Lido`](/contracts/lido) necesita esto para solicitar acciones bloqueadas en la cola de retiros [`WithdrawalQueueERC721`](/contracts/withdrawal-queue-erc721) y
[`NodeOperatorsRegistry`](/contracts/node-operators-registry) lo necesita para solicitar la quema de acciones para penalizar las recompensas de operadores de nodos que se comportan incorrectamente.

```sol
function requestBurnShares(address _from, uint256 _sharesAmountToBurn)
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- El remitente del mensaje no es titular del rol `REQUEST_BURN_SHARES_ROLE`.
- No se proporcionan acciones stETH (`_sharesAmountToBurn == 0`).
- No se transfieren acciones stETH (se excede la asignación).
:::

#### Parámetros

| Nombre                  | Tipo      | Descripción                                         |
| ----------------------- | --------- | --------------------------------------------------- |
|        `_from`           | `address` | dirección desde la cual transferir las acciones     |
| `_sharesAmountToBurn` | `uint256` | cantidad de acciones (no cantidad de tokens stETH) a quemar |

### recoverExcessStETH()

Transfiere la cantidad excedente de stETH (por ejemplo, perteneciente a la dirección del contrato quemador pero no marcada para quemar) a la dirección del tesoro de Lido (el contrato `DAO Agent`) configurado durante la construcción del contrato.

No hace nada si la función de vista `getExcessStETH` devuelve 0 (cero), es decir, no hay exceso de stETH en el balance del contrato.

```sol
function recoverExcessStETH() external
```

### recoverERC20()

Transfiere una cantidad dada de un token ERC20 (definido por la dirección del contrato proporcionada) perteneciente a la dirección del contrato quemador a la dirección del tesoro de Lido (el contrato `DAO Agent`).

```sol
function recoverERC20(address _token, uint256 _amount) external
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- El valor `_amount` es 0 (cero).
- La dirección `_token` es 0 (cero).
- La dirección `_token` es igual a la dirección de `stETH` (usar `recoverExcessStETH` en su lugar).
:::

#### Parámetros

| Nombre      | Tipo      | Descripción                                 |
| ----------- | --------- | ------------------------------------------- |
| `_token`    | `address` | dirección del token ERC20 para recuperar    |
| `_amount`   | `uint256` | Cantidad a recuperar                        |

### recoverERC721()

Transfiere un NFT compatible con ERC721 dado (definido por la dirección del contrato proporcionada) perteneciente a la dirección del contrato quemador a la dirección del tesoro de Lido (el `DAO Agent`).

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- La dirección `_token` es 0 (cero).
- La dirección `_token` es igual a la dirección de `stETH` (usar `recoverExcessStETH` en su lugar).
:::

#### Parámetros

| Nombre       | Tipo      | Descripción                                 |
| ------------ | --------- | ------------------------------------------- |
| `_token`     | `address` | dirección del token compatible con ERC721 para recuperar |
| `_tokenId`   | `uint256` | ID del token a recuperar                     |

### commitSharesToBurn()

Marca las acciones previamente solicitadas para quemar, tanto las de cobertura como las no de cobertura, como quemadas.
Emite el evento `StETHBurnt` para las acciones de cobertura y no de cobertura marcadas como quemadas.

Esta función es llamada por el contrato `Lido` junto con (es decir, en la misma transacción) la realización real de la quema de acciones.

Si `_sharesToBurn` es 0, no hace nada.

```sol
function commitSharesToBurn(uint256 _sharesToBurn) external
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- La dirección del `msg.sender` NO es igual a la dirección de `stETH`.
- `_sharesToBurn` es mayor que las acciones solicitadas para quemar de cobertura más no de cobertura.

:::

#### Parámetros

| Nombre            | Tipo      | Descripción                                            |
| ----------------- | --------- | ------------------------------------------------------ |
| `_sharesToBurn`   | `uint256` | Cantidad de acciones de cobertura más no de cobertura para marcar como quemadas |

### requestBurnShares()

Transfers stETH shares from `_from` and irreversibly locks these on the burner contract address.
Internally marks the shares amount for non-cover backed burning by increasing the internal `nonCoverSharesBurnRequested` counter.

Can be called only by a holder of the `REQUEST_BURN_SHARES_ROLE` role which after
Lido V2 upgrade is either [`Lido`](/contracts/lido) or [`NodeOperatorsRegistry`](/contracts/node-operators-registry).
[`Lido`](/contracts/lido) needs this to request shares locked on the [`WithdrawalQueueERC721`](/contracts/withdrawal-queue-erc721) and
[`NodeOperatorsRegistry`](/contracts/node-operators-registry) needs it to request burning shares to penalize the rewards of misbehaving node operators.

```sol
function requestBurnShares(address _from, uint256 _sharesAmountToBurn)
```

:::note
Reverts if any of the following is true:

- `msg.sender` is not a holder of `REQUEST_BURN_SHARES_ROLE` role;
- no stETH shares provided (`_sharesAmountToBurn == 0`);
- no stETH shares transferred (allowance exceeded).

:::

#### Parameters

| Name                  | Type      | Description                                     |
| --------------------- | --------- | ----------------------------------------------- |
|        `_from`        | `address` |         address to transfer shares from         |
| `_sharesAmountToBurn` | `uint256` | shares amount (not stETH tokens amount) to burn |

### recoverExcessStETH()

Transfers the excess stETH amount (e.g. belonging to the burner contract address but not marked for burning)
to the Lido treasury address (the `DAO Agent` contract) set upon the contract construction.

Does nothing if the `getExcessStETH` view func returns 0 (zero), i.e. there is no excess stETH
on the contract's balance.

```sol
function recoverExcessStETH() external
```

### recoverERC20()

Transfers a given amount of an ERC20-token (defined by the provided contract address) belonging
to the burner contract address to the Lido treasury (the `DAO Agent` contract) address.

```sol
function recoverERC20(address _token, uint256 _amount) external
```

:::note
Reverts if any of the following is true:

- `_amount` value is 0 (zero);
- `_token` address is 0 (zero);
- `_token` address equals to the `stETH` address (use `recoverExcessStETH` instead).

:::

#### Parameters

| Name      | Type      | Description                                 |
| --------- | --------- | ------------------------------------------- |
| `_token`  | `address` | ERC20-compatible token address to recover   |
| `_amount` | `uint256` | Amount to recover                           |

### recoverERC721()

Transfers a given ERC721-compatible NFT (defined by the contract address) belonging
to the burner contract address to the Lido treasury (the `DAO Agent`) address.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

:::note
Reverts if any of the following is true:

- `_token` address is 0 (zero);
- `_token` address equals to the `stETH` address (use `recoverExcessStETH` instead).

:::

#### Parameters

| Name       | Type      | Description                                 |
| ---------- | --------- | ------------------------------------------- |
| `_token`   | `address` | ERC721-compatible token address to recover  |
| `_tokenId` | `uint256` | Token id to recover                         |

### commitSharesToBurn()

Marks previously requested to burn cover and non-cover share as burnt.
Emits `StETHBurnt` event for the cover and non-cover shares marked as burnt.

This function is called by the `Lido` contract together with (i.e., the same tx) performing the actual shares burning.

If `_sharesToBurn` is 0 does nothing.

```sol
function commitSharesToBurn(uint256 _sharesToBurn) external
```

:::note
Reverts if any of the following is true:

- `msg.sender` address is NOT equal to the `stETH` address;
- `_sharesToBurn` is greater than the cover plus non-cover shares requested to burn.

:::

#### Parameters

| Name            | Type      | Description                                            |
| --------------- | --------- | ------------------------------------------------------ |
| `_sharesToBurn` | `uint256` | Amount of cover plus non-cover shares to mark as burnt |
