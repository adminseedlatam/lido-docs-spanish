# Módulo de Seguridad de Depósitos (DepositSecurityModule)

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/DepositSecurityModule.sol)
- [Contrato Desplegado](https://etherscan.io/address/0xC77F8768774E1c9244BEed705C4354f2113CFc09)

Debido a una vulnerabilidad de front-running, [proponemos](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) establecer el Comité de Seguridad de Depósitos dedicado a garantizar la seguridad de los depósitos en la cadena Beacon:

- monitorear el historial de depósitos y el conjunto de claves de Lido disponibles para el depósito, firmando y difundiendo mensajes que permitan depósitos;
- firmar el mensaje especial que permite a cualquier persona pausar los depósitos una vez que se detecten pre-depósitos maliciosos de operadores de nodos.

Cada miembro debe generar una dirección EOA para firmar mensajes con su clave privada. Las direcciones de los miembros del comité se añadirán al contrato inteligente.

Para hacer un depósito, proponemos recolectar un quórum de 4/6 de las firmas de los miembros del comité. Los miembros del comité pueden coludirse con los operadores de nodos y robar dinero firmando datos incorrectos que contienen pre-depósitos maliciosos. Para mitigar esto, proponemos permitir que un solo miembro del comité detenga los depósitos y también hacer cumplir los depósitos espaciales en el tiempo (por ejemplo, no más de 150 depósitos con 25 bloques entre ellos) para proporcionar al participante honesto la capacidad de detener más depósitos incluso si la supermayoría se colude.

El guardián mismo, o cualquier otra persona que tenga un mensaje de pausa firmado, puede llamar a `pauseDeposits` que pausa `DepositSecurityModule`.

Para prevenir un ataque de repetición, los guardianes firman el número de bloque cuando se observan pre-depósitos maliciosos. Después de un cierto número de bloques (`pauseIntentValidityPeriodBlocks`) el mensaje se vuelve inválido.

Los valores de los parámetros `maxDepositsPerBlock` y `minDepositBlockDistance` son controlados por Lido DAO y deben armonizarse con `churnValidatorsPerDayLimit` de [`OracleReportSanityChecker`](/contracts/oracle-report-sanity-checker).

## Métodos de Vista

### getOwner()

Devuelve la dirección del propietario del contrato.

```sol
function getOwner() external view returns (address);
```

### getPauseIntentValidityPeriodBlocks()

Devuelve `PAUSE_INTENT_VALIDITY_PERIOD_BLOCKS` (ver `pauseDeposits`).

```sol
function getPauseIntentValidityPeriodBlocks() external view returns (uint256)
```

### getMaxDeposits()

Devuelve la cantidad máxima de depósitos por bloque (ver `depositBufferedEther`).

```sol
function getMaxDeposits() external view returns (uint256)
```

### getMinDepositBlockDistance()

Devuelve la distancia mínima en bloques entre depósitos (ver `depositBufferedEther`).

```sol
function getMinDepositBlockDistance() external view returns (uint256)
```

### getGuardianQuorum()

Devuelve el número de firmas válidas de guardianes requeridas para verificar el par (depositRoot, nonce).

```sol
function getGuardianQuorum() external view returns (uint256)
```

### getGuardians()

Devuelve la lista de miembros del comité de guardianes.

```sol
function getGuardians() external view returns (address[] memory)
```

### isGuardian()

Verifica si la dirección dada es un guardián.

```sol
function isGuardian(address addr) external view returns (bool)
```

#### Parámetros

| Nombre | Tipo      | Descripción            |
| ------ | --------- | ---------------------- |
| `addr` | `address` | Dirección ETH-1 válida |

### getGuardianIndex()

Devuelve el índice del guardián, o -1 si la dirección no es un guardián.

```sol
function getGuardianIndex(address addr) external view returns (int256)
```

#### Parámetros

| Nombre | Tipo      | Descripción            |
| ------ | --------- | ---------------------- |
| `addr` | `address` | Dirección ETH-1 válida |

### canDeposit()

Devuelve si se puede llamar a `LIDO.deposit()` y hacer un depósito para el módulo de staking con id `stakingModuleId`, dado que el llamador proporcionará las certificaciones de los guardianes de la raíz de depósito no obsoleta y `nonce`, y el número de tales certificaciones será suficiente para alcanzar un quórum.

```sol
function canDeposit(uint256 stakingModuleId) external view returns (bool)
```

#### Parámetros

| Nombre             | Tipo      | Descripción                  |
| ------------------ | --------- | ---------------------------- |
| `stakingModuleId`  | `uint256` | Id del módulo de staking     |

## Métodos

### setOwner()

Establece un nuevo propietario.

```sol
function setOwner(address newValue) external;
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
- `newValue` es la dirección cero.
:::

#### Parámetros

| Nombre     | Tipo      | Descripción            |
| ---------- | --------- | ---------------------- |
| `newValue` | `address` | Nueva dirección del propietario |

### setPauseIntentValidityPeriodBlocks()

Establece `pauseIntentValidityPeriodBlocks`.

```sol
function setPauseIntentValidityPeriodBlocks(uint256 newValue)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
- `newValue` es 0 (cero).
:::

#### Parámetros

| Nombre     | Tipo      | Descripción                                      |
| ---------- | --------- | ------------------------------------------------ |
| `newValue` | `uint256` | Número de bloques después de los cuales el mensaje se vuelve inválido |

### setMaxDeposits()

Establece `maxDepositsPerBlock`.

El valor debe armonizarse con el parámetro `churnValidatorsPerDayLimit` de [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker).

```sol
function setMaxDeposits(uint256 newValue)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario.
:::

#### Parámetros

| Nombre     | Tipo      | Descripción                                  |
| ---------- | --------- | -------------------------------------------- |
| `newValue` | `uint256` | Nuevo valor del parámetro maxDepositsPerBlock |

### setMinDepositBlockDistance()

Establece `minDepositBlockDistance`.

El valor debe armonizarse con el parámetro `churnValidatorsPerDayLimit` de [OracleReportSanityChecker](/contracts/oracle-report-sanity-checker).

```sol
function setMinDepositBlockDistance(uint256 newValue)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario.
:::

#### Parámetros

| Nombre     | Tipo      | Descripción                                  |
| ---------- | --------- | -------------------------------------------- |
| `newValue` | `uint256` | Nuevo valor del parámetro minDepositBlockDistance |

### setGuardianQuorum()

Establece el número de firmas válidas de guardianes requeridas para verificar el par (depositRoot, nonce) (también conocido como "quórum").

```sol
function setGuardianQuorum(uint256 newValue)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
:::

#### Parámetros

| Nombre     | Tipo      | Descripción      |
| ---------- | --------- | ---------------- |
| `newValue` | `uint256` | Nuevo valor del quórum |

### addGuardian()

Añade una dirección de guardián y establece un nuevo valor de quórum.

```sol
function addGuardian(address addr, uint256 newQuorum)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
- `addr` ya es un guardián.
:::

#### Parámetros

| Nombre      | Tipo      | Descripción        |
| ----------- | --------- | ------------------ |
| `addr`      | `address` | Dirección del guardián |
| `newQuorum` | `uint256` | Nuevo valor del quórum |

### addGuardians()

Añade un conjunto de direcciones de guardianes y establece un nuevo valor de quórum.

```sol
function addGuardians(address[] memory addresses, uint256 newQuorum)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
- cualquiera de las `addresses` ya es un guardián.
:::

#### Parámetros

| Nombre      | Tipo        | Descripción                    |
| ----------- | ----------- | ------------------------------ |
| `addresses` | `address[]` | Array de direcciones de guardianes |
| `newQuorum` | `uint256`   | Nuevo valor del quórum         |

### removeGuardian()

Elimina un guardián con la dirección dada y establece un nuevo valor de quórum.

```sol
function removeGuardian(address addr, uint256 newQuorum)
```

:::note
Revierte si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario;
- `addr` no es un guardián.
:::

### Parámetros

| Nombre               | Tipo         | Descripción                                                                 |
| -------------------- | ------------ | --------------------------------------------------------------------------- |
| `addr`               | `address`    | Dirección del guardián                                                     |
| `newQuorum`          | `uint256`    | Nuevo valor de quórum                                                       |

### pauseDeposits()

Pausa los depósitos para el módulo de staking siempre que se cumplan ambas condiciones (de lo contrario, revierte):

1. La función es llamada por el guardián con índice `guardianIndex` O `sig` es una firma válida por el guardián con índice `guardianIndex` de los datos definidos a continuación.

2. `block.number - blockNumber <= pauseIntentValidityPeriodBlocks`

La firma, si está presente, debe ser producida para el hash `keccak256` del siguiente mensaje (cada componente tomando 32 bytes):

| PAUSE_MESSAGE_PREFIX | blockNumber | stakingModuleId |

Si el módulo de staking no está activo, no hace nada.
En caso de una emergencia, se supone que la función `pauseDeposits` será llamada por todos los guardianes. Por lo tanto, solo la primera llamada realizará el cambio real. Así que las otras llamadas serán operaciones OK desde el punto de vista de la lógica del protocolo.

```solidity
function pauseDeposits(uint256 blockNumber, uint256 stakingModuleId, Signature memory sig)
```

### Parámetros

| Nombre            | Tipo         | Descripción                                                                           |
| ----------------- | ------------ | ------------------------------------------------------------------------------------- |
| `blockNumber`     | `uint256`    | Número de bloque donde se han observado pre-depósitos maliciosos por el guardián      |
| `stakingModuleId` | `uint256`    | Id del módulo de staking para pausar los depósitos                                    |
| `sig`             | `Signature`  | Firma corta de guardianes ECDSA como se define en [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |

### unpauseDeposits()

Reanuda los depósitos para el módulo de staking.
Si el módulo de staking no está pausado, no hace nada.

```solidity
function unpauseDeposits(uint256 stakingModuleId)
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- `msg.sender` no es el propietario.
:::

### Parámetros

| Nombre            | Tipo         | Descripción                  |
| ----------------- | ------------ | ---------------------------- |
| `stakingModuleId` | `uint256`    | Id del módulo de staking     |

### depositBufferedEther()

Verifica que se cumplan las condiciones de seguridad del depósito y llama a `LIDO.deposit(maxDepositsPerBlock, stakingModuleId, depositCalldata)`. De lo contrario, revoca.

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

1. `IDepositContract.get_deposit_root() != depositRoot`;
2. `StakingModule.getNonce() != nonce`;
3. El número de firmas de guardianes es menor que `getGuardianQuorum()`;
4. Se recibió una firma no válida o no de un guardián;
5. `block.number - StakingModule.getLastDepositBlock() < minDepositBlockDistance`;
6. `blockhash(blockNumber) != blockHash`.
:::

Las firmas deben estar ordenadas en orden ascendente por el índice del guardián. Cada firma debe ser producida para el hash `keccak256` del siguiente mensaje (cada componente tomando 32 bytes):

| ATTEST_MESSAGE_PREFIX | blockNumber | blockHash | depositRoot | stakingModuleId | nonce |

```solidity
function depositBufferedEther(
        uint256 blockNumber,
        bytes32 blockHash,
        bytes32 depositRoot,
        uint256 stakingModuleId,
        uint256 nonce,
        bytes calldata depositCalldata,
        Signature[] calldata sortedGuardianSignatures
    )
```

### Parámetros

| Nombre                       | Tipo             | Descripción                                                                                      |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `blockNumber`                | `uint256`        | Número del bloque de depósito actual                                                              |
| `blockHash`                  | `bytes32`        | Hash del bloque de depósito actual                                                                |
| `depositRoot`                | `bytes32`        | Raíz de depósito del contrato de depósito Ethereum                                                |
| `stakingModuleId`            | `uint256`        | Id del módulo de staking para realizar el depósito                                                |
| `nonce`                      | `uint256`        | Nonce de las operaciones clave del módulo de staking                                              |
| `depositCalldata`            | `bytes`          | Datos de calldata del depósito del módulo de staking                                               |
| `sortedGuardianSignatures`   | `Signature[]`    | Firmas cortas de guardianes ECDSA según se define en [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) |