# wstETH

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.6.12/WstETH.sol)
- [Contrato Desplegado](https://etherscan.io/token/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0)

## ¿Qué es wrapped stETH (wstETH)?

Es un token envoltorio [ERC-20](https://eips.ethereum.org/EIPS/eip-20) de acumulación de valor para `stETH`. Su balance no cambia con cada informe del oráculo, pero su valor en `stETH` sí lo hace. Internamente, representa la [participación](https://lidofinance.github.io/docs/guides/lido-tokens-integration-guide#steth-internals-share-mechanics) del usuario en el suministro total de tokens `stETH`.

## ¿Por qué usar wstETH?

`wstETH` se utiliza principalmente como una capa de compatibilidad para integrar `stETH` en otros protocolos DeFi que no soportan tokens rebasables, especialmente puentes hacia L2s y otras cadenas, ya que los rebases no funcionan por defecto para activos puenteados.

## ¿Cómo usar wstETH?

El contrato puede ser utilizado como un envoltorio sin confianza que acepta tokens stETH y emite wstETH a cambio. Cuando el usuario desenvuelve, el contrato quema el `wstETH` del usuario y le envía el `stETH` bloqueado a cambio.

### Atajo de Staking

El usuario puede enviar ETH con una transferencia regular a la dirección del contrato y recibir wstETH a cambio. El contrato enviará ETH al método submit de Lido, haciendo staking y envolviendo el stETH recibido de manera transparente.

## Estándares

El contrato implementa los siguientes estándares de Ethereum:

- [ERC-20: Estándar de Token](https://eips.ethereum.org/EIPS/eip-20)
- [ERC-2612: Extensión de Permiso para Aprobaciones Firmadas ERC-20](https://eips.ethereum.org/EIPS/eip-2612)
- [EIP-712: Hashing y firma de datos estructurados tipados](https://eips.ethereum.org/EIPS/eip-712)

## Métodos de Vista

### getWstETHByStETH()

Devuelve la cantidad de `wstETH` para una cantidad dada de `stETH`

```sol
function getWstETHByStETH(uint256 _stETHAmount) returns (uint256)
```

#### Parámetros

| Nombre         | Tipo      | Descripción       |
| -------------- | --------- | ----------------- |
| `_stETHAmount` | `uint256` | cantidad de stETH |

### getStETHByWstETH()

Devuelve la cantidad de `stETH` para una cantidad dada de `wstETH`

```sol
function getStETHByWstETH(uint256 _wstETHAmount) returns (uint256)
```

#### Parámetros

| Nombre del Parámetro | Tipo      | Descripción        |
| -------------------- | --------- | ------------------ |
| `_wstETHAmount`      | `uint256` | cantidad de wstETH |

### stEthPerToken()

Devuelve la cantidad de tokens stETH correspondientes a un `wstETH`

```sol
function stEthPerToken() returns (uint256)
```

### tokensPerStEth()

Devuelve la cantidad de tokens `wstETH` correspondientes a un `stETH`

```sol
function tokensPerStEth() returns (uint256)
```

## Métodos

### wrap()

Intercambia `stETH` por `wstETH`

```sol
function wrap(uint256 _stETHAmount) returns (uint256)
```

:::note
Requisitos:

- `_stETHAmount` debe ser mayor a cero
- `msg.sender` debe aprobar al menos `_stETHAmount` de stETH a este contrato.
- `msg.sender` debe tener al menos `_stETHAmount` de stETH.

:::

#### Parámetros

| Nombre del Parámetro | Tipo      | Descripción                                        |
| -------------------- | --------- | -------------------------------------------------- |
| `_stETHAmount`       | `uint256` | cantidad de stETH para envolver a cambio de wstETH |

#### Devuelve

Cantidad de wstETH que el usuario recibe después de envolver

### unwrap()

Intercambia wstETH por `stETH`

```sol
function unwrap(uint256 _wstETHAmount) returns (uint256)
```

:::note
Requisitos:

- `_wstETHAmount` debe ser mayor a cero
- `msg.sender` debe tener al menos `_wstETHAmount` de wstETH.

:::

#### Parámetros

| Nombre del Parámetro | Tipo      | Descripción                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `_wstETHAmount`      | `uint256` | cantidad de wstETH para desenvolver a cambio de stETH |

#### Devuelve

Cantidad de stETH que el usuario recibe después de desenvolver

### receive()

Atajo para hacer staking de ETH y envolver automáticamente el `stETH` recibido

```sol
receive() payable
```
