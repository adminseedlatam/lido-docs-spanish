# ValidatorsExitBusOracle

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol)
- [Contrato desplegado](https://etherscan.io/address/0x0De4Ea0184c2ad0BacA7183356Aea5B8d5Bf5c6e)
- Hereda de [BaseOracle](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/oracle/BaseOracle.sol)

:::info
Se recomienda leer [¿Qué es el mecanismo de oráculo de Lido?](/guías/oracle-operator-manual#introducción) antes de continuar.
:::

## ¿Qué es ValidatorsExitBusOracle?

Es un contrato que implementa un "bus de mensajes" en la cadena como fuente de verdad entre el oráculo fuera de la cadena del protocolo y los observadores fuera de la cadena, con el objetivo principal de entregar solicitudes de salida de validadores a los operadores de nodos que participan en Lido.

El cálculo de un informe consta de 4 pasos clave:

1. Calcular la cantidad de retiros a cubrir con ether.
2. Calcular la predicción de recompensas en ether por época.
3. Calcular la época de retiro para el siguiente validador elegible para salir y cubrir las solicitudes de retiro si es necesario.
4. Preparar la cola de órdenes de salida de validadores.
5. Recorrer la cola hasta que los saldos de los validadores que han salido cubran todas las solicitudes de retiro (considerando el saldo final predicho de cada validador que ha salido).

:::note
Las solicitudes de salida realizadas a través de `ValidatorsExitBusOracle` deben procesarse a tiempo según la política ratificada [Lido en Ethereum Políticas de Salidas de Validadores V1.0](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330).
:::

El acceso a los métodos de palanca está restringido utilizando la funcionalidad del contrato [AccessControlEnumerable](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/utils/access/AccessControlEnumerable.sol) y un conjunto de [roles granulares](#permisos).

## Ciclo del informe

El trabajo del oráculo se divide en períodos de tiempo iguales llamados marcos. En operación normal, los oráculos finalizan un informe en cada marco (la duración del marco es de 75 épocas de la Capa de Consenso de Ethereum, cada marco comienza aproximadamente a las 04:00, 12:00 y 20:00 UTC). Cada marco tiene una ranura de referencia y una fecha límite de procesamiento. Los datos del informe se recopilan observando el estado del mundo (tanto en las Capas de Ejecución y Consenso de Ethereum) en el momento de la ranura de referencia del marco (incluyendo cualquier cambio de estado realizado en esa ranura), y deben procesarse antes de la fecha límite de procesamiento del marco.

La ranura de referencia para cada marco se establece en la última ranura de la época que precede a la primera época del marco. La fecha límite de procesamiento se establece en la última ranura de la última época del marco.

Vale la pena señalar que la duración del marco [puede cambiar](./hash-consensus#setframeconfig). Y si el informe del oráculo se retrasa, no extiende el período del informe, a menos que se pierda. En este caso, el siguiente informe tendrá el período del informe aumentado.

El marco incluye estas etapas:

- **Esperando**: el oráculo comienza como un [daemon](/guías/oracle-operator-manual#el-daemon-del-oráculo) y se despierta cada 12 segundos (por defecto) para encontrar la última ranura finalizada, tratando de hacerla coincidir con la ranura de referencia esperada;
- **Recolección de datos**: los oráculos monitorean el estado de las capas de ejecución y consenso y recopilan los datos para la ranura de referencia finalizada que ha llegado con éxito;
- **Consenso de hash**: los oráculos analizan los datos del informe, compilan el informe y envían su hash al contrato inteligente [HashConsensus](/contracts/hash-consensus);
- **Informe de actualización principal**: una vez que se alcanza el [quórum](./hash-consensus#getquorum) de hashes, es decir, más de la mitad de los oráculos enviaron el mismo hash (es decir, 5 de 9 miembros del comité de oráculos en el momento de escribir esto), uno de los oráculos elegidos por turno envía el informe real al contrato `ValidatorsExitBusOracle`, lo que desencadena una cadena de eventos [`ValidatorExitRequest`](#validatorexitrequest) que contienen detalles sobre los siguientes validadores a ser expulsados (para iniciar una salida voluntaria del lado de la Capa de Consenso de Ethereum).

## Datos del informe

La función `submitReportData()` acepta la siguiente estructura `ReportData`.

```solidity
struct ReportData {
    uint256 consensusVersion;
    uint256 refSlot;
    uint256 requestsCount;
    uint256 dataFormat;
    bytes data;
}
```

**Información del consenso del oráculo**

- `consensusVersion`: versión de las reglas de consenso del oráculo. Se puede obtener la versión actual esperada por el oráculo llamando a `getConsensusVersion()`.
- `refSlot`: ranura de referencia para la cual se calculó el informe. El estado informado debe incluir todos los cambios de estado resultantes de todos los bloques hasta esta ranura (inclusive). La época que contiene la ranura debe estar finalizada antes de calcular el informe.

**Datos de solicitudes**

- `requestsCount`: número total de solicitudes de salida de validadores en este informe. No debe ser mayor que el límite impuesto por `OracleReportSanityChecker.checkExitBusOracleReport`.
- `dataFormat`: formato de los datos de solicitudes de salida de validadores. Actualmente, solo se admite el valor `DATA_FORMAT_LIST=1`.
- `data`: datos de solicitudes de salida de validadores. Pueden diferir según el formato de datos, consulte la constante que define un formato de datos específico [aquí](#data_format_list) para obtener más información.

## Constantes

### DATA_FORMAT_LIST()

El formato de lista de los datos de solicitudes de salida de validadores.

:::note
Cada solicitud de salida de validador se describe con el siguiente array de 64 bytes:

```
    MSB <------------------------------------------------------- LSB
    |  3 bytes   |  5 bytes   |     8 bytes      |    48 bytes     |
    |  moduleId  |  nodeOpId  |  validatorIndex  | validatorPubkey |
```

 Todas las solicitudes están empaquetadas estrechamente en un array de bytes donde las solicitudes siguen
 unas a otras sin ningún separador o relleno, y se pasan al campo `data` de la estructura del informe.

Las solicitudes deben estar ordenadas en orden ascendente por la siguiente clave compuesta: `(moduleId, nodeOpId, validatorIndex)`.
:::

```solidity
uint256 public constant DATA_FORMAT_LIST = 1
```

### SECONDS_PER_SLOT()

Vea [https://ethereum.org/en/developers/docs/blocks/#block-time](https://ethereum.org/en/developers/docs/blocks/#block-time)

:::note
Siempre devuelve 12 segundos debido a [el Merge](https://ethereum.org/en/roadmap/merge/)
:::

```solidity
uint256 public immutable SECONDS_PER_SLOT
```

### GENESIS_TIME()

Vea [https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21)

:::note
Siempre devuelve 1606824023 (1 de diciembre de 2020, 12:00:23pm UTC) en la [Mainnet](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21)
:::

```solidity
uint256 public immutable GENESIS_TIME
```
### PAUSE_INFINITELY()

Valor especial para la pausa infinita.
Vea [`pauseFor`](#pausefor) y [`pauseUntil`](#pauseuntil).

```solidity
uint256 public constant PAUSE_INFINITELY = type(uint256).max
```

## ProcessingState

```solidity
struct ProcessingState {
    uint256 currentFrameRefSlot;
    uint256 processingDeadlineTime;
    bytes32 dataHash;
    bool dataSubmitted;
    uint256 dataFormat;
    uint256 requestsCount;
    uint256 requestsSubmitted;
}
```

- `currentFrameRefSlot` — Ranura de referencia para el marco de informes actual.
- `processingDeadlineTime` — El último momento en que se pueden enviar datos del informe para el marco de informes actual.
- `dataHash` — Hash de los datos del informe. Bytes cero si no se ha alcanzado el consenso sobre el hash para el marco de informes actual.
- `dataSubmitted` — Si ya se han enviado datos del informe para el marco de informes actual.
- `dataFormat` — Formato de los datos del informe para el marco de informes actual.
- `requestsCount` — Número total de solicitudes de salida de validadores para el marco de informes actual.
- `requestsSubmitted` — Cuántas solicitudes de salida de validadores ya se han enviado para el marco de informes actual.

## Métodos de vista

### getTotalRequestsProcessed()

Devuelve el número total de solicitudes de salida de validadores procesadas en todos los informes recibidos.

```solidity
function getTotalRequestsProcessed() external view returns (uint256)
```

### getLastRequestedValidatorIndices()

Devuelve los últimos índices de validadores que se solicitaron para salir para los
`nodeOpIds` dados en el `moduleId` dado. Para los operadores de nodos que nunca se solicitaron para salir
ningún validador, el índice se establece en `-1`.

```solidity
function getLastRequestedValidatorIndices(uint256 moduleId, uint256[] calldata nodeOpIds)
        external view returns (int256[] memory)
```

#### Parámetros

| Nombre      | Tipo      | Descripción                                 |
| ----------- | --------- | ------------------------------------------- |
| `moduleId`  | `uint256` | ID del módulo de staking.                   |
| `nodeOpIds` | `uint256` | IDs de los operadores de nodos del módulo de staking. |

#### Reversiones

- Revierte con `ArgumentOutOfBounds()` si `moduleId > UINT24_MAX`
- Revierte con `ArgumentOutOfBounds()` si `nodeOpId > UINT40_MAX`

### getProcessingState()

Devuelve el estado de procesamiento de datos para el marco de informes actual. Consulte la documentación de la estructura [ProcessingState](#processingstate).

```solidity
function getProcessingState() external view returns (ProcessingState memory result)
```

### getConsensusContract()

Devuelve la dirección de la instancia del contrato [HashConsensus](/contracts/hash-consensus) utilizada por `ValidatorsExitBusOracle`.

```solidity
function getConsensusContract() external view returns (address)
```

### getConsensusReport()

Devuelve el último hash del informe de consenso y metadatos.

```solidity
function getConsensusReport() external view returns (
    bytes32 hash,
    uint256 refSlot,
    uint256 processingDeadlineTime,
    bool processingStarted
)
```

### getConsensusVersion()

Devuelve la versión actual del consenso esperada por el contrato del oráculo.

:::note
La versión del consenso debe cambiar cada vez que cambian las reglas del consenso, lo que significa que
un oráculo que mire la misma ranura de referencia calcularía un hash diferente.
:::

```solidity
function getConsensusVersion() external view returns (uint256)
```

### getContractVersion()

Devuelve la versión actual del contrato.

```solidity
function getContractVersion() public view returns (uint256)
```

### getLastProcessingRefSlot()

Devuelve la última ranura de referencia para la cual se inició el procesamiento del informe.

```solidity
function getLastProcessingRefSlot() external view returns (uint256)
```

#### Devuelve

| Nombre                  | Tipo      | Descripción                                                                 |
| ----------------------- | --------- | --------------------------------------------------------------------------- |
| `hash`                  | `bytes32` | El último hash informado                                                    |
| `refSlot`               | `uint256` | La ranura de referencia del marco: si los datos de los que se está alcanzando el consenso incluyen o dependen de algún estado en la cadena, este estado debe consultarse en la ranura de referencia. Si la ranura contiene un bloque, el estado debe incluir todos los cambios de ese bloque. |
| `processingDeadlineTime`| `uint256` | La marca de tiempo de la última ranura en la que se puede informar y procesar un informe |
| `processingStarted`     | `bool`    | Si se ha iniciado o no el procesamiento del informe                          |

### getResumeSinceTimestamp()

Devuelve uno de los valores `timestamp`:

- `PAUSE_INFINITELY` si está pausado permanentemente (es decir, sin marca de tiempo de expiración)
- el primer segundo cuando el contrato se reanuda si está pausado por una duración específica (si `timestamp ≥ block.timestamp`)
- alguna marca de tiempo en el pasado si no está pausado (si `timestamp < block.timestamp`)

```solidity
function getResumeSinceTimestamp() external view returns (uint256 timestamp)
```

### isPaused()

Devuelve si el contrato está pausado o no en este momento.

```solidity
function isPaused() public view returns (bool)
```

## Métodos

### submitReportData()

Envía datos del informe para su procesamiento.

```solidity
function submitReportData(ReportData calldata data, uint256 contractVersion)
        external whenResumed
```

#### Parámetros

| Nombre            | Tipo         | Descripción                                      |
| ----------------- | ------------ | ------------------------------------------------ |
| `data`            | `ReportData` | Los datos del informe. Consulte [`ReportData`](#datos-del-informe) para más detalles. |
| `contractVersion` | `uint256`    | Versión esperada del contrato del oráculo.       |

#### Reversiones

- Revierte con `SenderNotAllowed()` si el remitente no tiene el rol `SUBMIT_DATA_ROLE` y no es un miembro del comité de oráculos.
- Revierte con `UnexpectedContractVersion(expectedVersion, version)` si la versión del contrato proporcionada difiere de la actual.
- Revierte con `UnexpectedConsensusVersion(expectedConsensusVersion, consensusVersion)` si la versión de consenso proporcionada difiere de la esperada.
- Revierte con `UnexpectedRefSlot(report.refSlot, refSlot)` si la ranura de referencia proporcionada difiere de la del marco de consenso actual.
- Revierte con `UnexpectedDataHash(report.hash, hash)` si un hash `keccak256` de los datos codificados en ABI difiere del último hash.
- Revierte con `NoConsensusReportToProcess()` si el hash de datos del informe es `0`.
- Revierte con `RefSlotAlreadyProcessing()` si la ranura de referencia del informe es igual a la ranura de referencia de procesamiento anterior.
- Revierte con `InvalidRequestsData()` si `moduleId` en los datos proporcionados es `0`
- Revierte con `InvalidRequestsDataLength()` si los datos proporcionados están empaquetados incorrectamente
- Revierte con `UnexpectedRequestsDataLength()` si la longitud de los datos empaquetados proporcionados no es igual a `data.requestsCount`
- Revierte con `InvalidRequestsDataSortOrder` cuando los datos proporcionados no están ordenados
- Revierte con `NodeOpValidatorIndexMustIncrease(
        uint256 moduleId,
        uint256 nodeOpId,
        uint256 prevRequestedValidatorIndex,
        uint256 requestedValidatorIndex
    )` si `requested validator index <= last requested index` del mismo módulo

### pauseFor()

Pausa la aceptación de los datos de los informes y la formación de nuevas solicitudes de salida de validadores por la duración proporcionada en segundos.

```solidity
function pauseFor(uint256 _duration) external
```

#### Parámetros

| Nombre      | Tipo      | Descripción                                                  |
| ----------- | --------- | ------------------------------------------------------------ |
| `_duration` | `uint256` | duración de la pausa, en segundos (usar `PAUSE_INFINITELY` para ilimitado) |

#### Reversiones

- Revierte con `ResumedExpected()` si el contrato ya está pausado
- Revierte con `AccessControl:...` razón si el remitente no tiene el rol `PAUSE_ROLE`
- Revierte con `ZeroPauseDuration()` si se pasa una duración cero

### pauseUntil()

Pausa la aceptación de los datos de los informes y la formación de nuevas solicitudes de salida de validadores hasta la marca de tiempo dada (inclusive).

```solidity
function pauseUntil(uint256 _pauseUntilInclusive) external
```

#### Parámetros

| Nombre                | Tipo      | Descripción                     |
| --------------------- | --------- | ------------------------------- |
| `_pauseUntilInclusive`| `uint256` | el último segundo para pausar (inclusive) |

#### Reversiones

- Revierte con `ResumeSinceInPast()` si la marca de tiempo proporcionada está en el pasado
- Revierte con `AccessControl:...` razón si el remitente no tiene el rol `PAUSE_ROLE`
- Revierte con `ResumedExpected()` si el contrato ya está pausado

### resume()

Reanuda la aceptación de los datos de los informes y la formación de nuevas solicitudes de salida de validadores.

```solidity
function resume() external
```

#### Reversiones

- Revierte con `PausedExpected()` si el contrato ya está reanudado (es decir, no pausado)
- Revierte con `AccessControl:...` razón si el remitente no tiene el rol `RESUME_ROLE`

## Permisos

### SUBMIT_DATA_ROLE()

Un rol de ACL que otorga el permiso para enviar los datos para un informe del comité.

```solidity
bytes32 public constant SUBMIT_DATA_ROLE = keccak256("SUBMIT_DATA_ROLE")
```

### PAUSE_ROLE()

Un rol de ACL que otorga el permiso para pausar la aceptación de los datos de los informes y la formación de nuevas solicitudes de salida de validadores.

```solidity
bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE")
```

### RESUME_ROLE()

Un rol de ACL que otorga el permiso para reanudar la aceptación de los datos de los informes y la formación de nuevas solicitudes de salida de validadores.

```solidity
bytes32 public constant RESUME_ROLE = keccak256("RESUME_ROLE")
```

### MANAGE_CONSENSUS_CONTRACT_ROLE()

Un rol de ACL que otorga el permiso para establecer la dirección del contrato de consenso llamando a `setConsensusContract`.

```solidity
bytes32 public constant MANAGE_CONSENSUS_CONTRACT_ROLE = keccak256("MANAGE_CONSENSUS_CONTRACT_ROLE");
```

### MANAGE_CONSENSUS_VERSION_ROLE()

Un rol de ACL que otorga el permiso para establecer la versión del consenso llamando a `setConsensusVersion`.

```solidity
bytes32 public constant MANAGE_CONSENSUS_VERSION_ROLE = keccak256("MANAGE_CONSENSUS_VERSION_ROLE");
```

## Eventos

### ValidatorExitRequest()

Se emite cuando se envían nuevos datos del informe para su procesamiento.

```solidity
event ValidatorExitRequest(
    uint256 indexed stakingModuleId,
    uint256 indexed nodeOperatorId,
    uint256 indexed validatorIndex,
    bytes validatorPubkey,
    uint256 timestamp
)
```

### WarnDataIncompleteProcessing()

Se emite al intentar enviar nuevos datos cuando no se han procesado todos los elementos.

```solidity
event WarnDataIncompleteProcessing(
    uint256 indexed refSlot,
    uint256 requestsProcessed,
    uint256 requestsCount
)
```

### Paused()

Se emite cuando el contrato se pausa, ya sea mediante las llamadas a `pauseFor` o `pauseUntil`.

```solidity
event Paused(uint256 duration)
```

### Resumed()

Se emite cuando el contrato se reanuda mediante la llamada a `resume`.

```solidity
event Resumed()
```