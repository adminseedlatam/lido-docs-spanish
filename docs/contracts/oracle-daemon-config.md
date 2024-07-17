### OracleDaemonConfig

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/OracleDaemonConfig.sol)
- [Contrato desplegado](https://etherscan.io/address/0xbf05A929c3D7885a6aeAd833a992dA6E5ac23b09)

OracleDaemonConfig actúa como un registro de parámetros para el daemon oráculo de Lido.
La lista completa de parámetros se proporciona en la [guía de parámetros de Lido V2 en mainnet](/guías/verify-lido-v2-upgrade-manual#oracledaemonconfig).

:::note
A diferencia de [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker), los valores almacenados no son obligatorios por el código del protocolo en cadena.
:::

## Métodos de vista

### get(string calldata _key)

Recupera el valor correspondiente a la clave proporcionada.

```solidity
function get(string calldata _key) external view returns (bytes memory)
```

:::note
Revirtirá si el valor está ausente.
:::

### getList(string[] calldata _keys)

Recupera una lista de valores correspondientes a las claves proporcionadas.

```solidity
function getList(string[] calldata _keys) external view returns (bytes[] memory)
```

:::note
Revirtirá si falta algún valor para una clave específica.
:::

## Métodos

### set(string calldata _key, bytes calldata _value)

Establece el valor para la clave proporcionada. Solo puede ser llamado por usuarios con el rol `CONFIG_MANAGER_ROLE`.

```solidity
function set(string calldata _key, bytes calldata _value) external
```

:::note
Revirtirá si ocurre alguna de las siguientes condiciones:
- el valor con la clave proporcionada ya existe
- el valor está vacío
- es llamado por alguien que no tiene el rol `CONFIG_MANAGER_ROLE`
:::

### update(string calldata _key, bytes calldata _value)

Actualiza el valor para la clave proporcionada. Solo puede ser llamado por usuarios con el rol `CONFIG_MANAGER_ROLE`.

```solidity
function update(string calldata _key, bytes calldata _value) external
```

:::note
Revirtirá si ocurre alguna de las siguientes condiciones:
- el valor con la clave proporcionada no existe
- el valor es el mismo que el ya establecido
- el valor está vacío
- es llamado por alguien que no tiene el rol `CONFIG_MANAGER_ROLE`
:::

### unset(string calldata _key)

Elimina el valor de la clave proporcionada. Solo puede ser llamado por usuarios con el rol `CONFIG_MANAGER_ROLE`.

```solidity
function unset(string calldata _key) external
```

:::note
Revirtirá si ocurre alguna de las siguientes condiciones:
- el valor con la clave proporcionada no existe
- es llamado por alguien que no tiene el rol `CONFIG_MANAGER_ROLE`
:::

## Eventos

### ConfigValueSet

Se emite cuando se establece un nuevo par clave-valor.

```solidity
event ConfigValueSet(string indexed key, bytes value)
```

### ConfigValueUpdated

Se emite cuando se actualiza un par clave-valor.

```solidity
event ConfigValueUpdated(string indexed key, bytes value)
```

### ConfigValueUnset

Se emite cuando se elimina un par clave-valor.

```solidity
event ConfigValueUnset(string indexed key)
```