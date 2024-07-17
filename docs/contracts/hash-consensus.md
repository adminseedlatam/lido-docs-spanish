## ¿Qué es HashConsensus?

HashConsensus es un contrato responsable de gestionar el comité de miembros del oráculo y permitir que los miembros alcancen un consenso sobre un hash de datos para cada marco de informes.

El tiempo se divide en marcos de igual longitud, cada uno con una ranura de referencia y una fecha límite de procesamiento. Los datos del informe deben recopilarse observando el estado del mundo (tanto en las capas de consenso como de ejecución de Ethereum) en el momento de la ranura de referencia del marco (incluidos los cambios de estado realizados en esa ranura) y deben procesarse antes de la fecha límite de procesamiento del marco.

## Procesador de informes (`IReportAsyncProcessor`)

`IReportAsyncProcessor` define la interfaz para un contrato que recibe informes de consenso (es decir, hashes) y los procesa de manera asincrónica. `HashConsensus` no espera un comportamiento específico de un procesador de informes y garantiza lo siguiente:

1. `HashConsensus` no enviará informes a través de `IReportAsyncProcessor.submitConsensusReport` ni pedirá descartar informes a través de `IReportAsyncProcessor.discardConsensusReport` para cualquier ranura hasta (e incluyendo) la ranura devuelta por `IReportAsyncProcessor.getLastProcessingRefSlot`.

2. `HashConsensus` no aceptará informes de miembros (y, por lo tanto, no los incluirá en el cálculo del consenso) que tengan el argumento `consensusVersion` de la llamada `HashConsensus.submitReport` con un valor diferente al devuelto por `IReportAsyncProcessor.getConsensusVersion` en el momento de la llamada `HashConsensus.submitReport`.

### Fast-lane members

Los miembros de Fast-lane son un subconjunto de todos los miembros que cambia en cada marco de informes. Estos miembros pueden, y se espera que, envíen un informe durante la primera parte del marco llamada "intervalo de fast lane" y definida a través de `setFrameConfig` o `setFastLaneLengthSlots`. El cálculo del subconjunto de miembros de Fast-lane depende de `frameIndex`, `totalMembers` y `quorum`. En circunstancias normales, todos los demás miembros solo pueden enviar un informe después de que pase el intervalo de fast lane. Esto se hace para alentar a cada oráculo del conjunto completo a participar en los informes de manera regular e identificar a los miembros que no funcionan correctamente.

El subconjunto de fast lane consiste en miembros del quórum; la selección se implementa como una ventana deslizante del ancho del quórum sobre los índices de miembros (`mod` total de miembros). La ventana avanza un índice en cada marco de informes.

Con el mecanismo de fast lane activo, es suficiente para la supervisión verificar que se alcanza consistentemente el consenso durante la parte de fast lane de cada marco para concluir que todos los miembros están activos y comparten las mismas reglas de consenso.

### Métodos de visualización

#### getChainConfig()

Devuelve los parámetros de cadena inmutables necesarios para calcular la época y la ranura dada una marca de tiempo.

```solidity
function getChainConfig() external view returns (
    uint256 slotsPerEpoch,
    uint256 secondsPerSlot,
    uint256 genesisTime
)
```

##### Retornos

| Nombre             | Tipo      | Descripción                                                |
| ------------------ | --------- | ---------------------------------------------------------- |
| `slotsPerEpoch`    | `uint256` | Número de ranuras por época, `32` por defecto              |
| `secondsPerSlot`   | `uint256` | El tiempo asignado para cada ranura, `12` por defecto      |
| `genesisTime`      | `uint256` | Hora de génesis de la capa de consenso, `1606824023` en [Mainnet](https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21) |

#### getFrameConfig()

Devuelve la configuración relacionada con el tiempo.

```solidity
function getFrameConfig() external view returns (
    uint256 initialEpoch,
    uint256 epochsPerFrame,
    uint256 fastLaneLengthSlots
)
```

##### Retornos

| Nombre                  | Tipo      | Descripción                                                           |
| ----------------------- | --------- | --------------------------------------------------------------------- |
| `initialEpoch`          | `uint256` | Época del marco con índice cero                                       |
| `epochsPerFrame`        | `uint256` | Longitud de un marco en épocas                                        |
| `fastLaneLengthSlots`   | `uint256` | Longitud del intervalo de fast lane en ranuras; ver `getIsFastLaneMember`  |

#### getCurrentFrame()

Devuelve el marco de informes actual.

```solidity
function getCurrentFrame() external view returns (
    uint256 refSlot,
    uint256 reportProcessingDeadlineSlot
)
```

### Devoluciones

#### getCurrentFrame()

Devuelve el marco de informe actual.

| Nombre                          | Tipo      | Descripción                                                                          |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `refSlot`                       | `uint256` | El slot de referencia del marco: Si los datos sobre los que se alcanza el consenso dependen de algún estado en la cadena, este estado debe consultarse en el slot de referencia. Si este slot contiene un bloque, todos los cambios de ese bloque deben incluirse. |
| `reportProcessingDeadlineSlot`  | `uint256` | El último slot en el cual el informe puede ser procesado por el contrato procesador de informes. |

#### getInitialRefSlot()

Devuelve el slot de referencia más temprano posible, es decir, el slot de referencia del marco de informe con índice cero.

```solidity
function getInitialRefSlot() external view returns (uint256)
```

#### getIsMember()

Devuelve si la dirección proporcionada es actualmente un miembro del consenso.

```solidity
function getIsMember(address addr) external view returns (bool)
```

#### getIsFastLaneMember()

Devuelve si la dirección proporcionada es un miembro del carril rápido para el marco de informe actual.

```solidity
function getIsFastLaneMember(address addr) external view returns (bool)
```

#### getMembers()

Devuelve todos los miembros actuales, junto con el último slot de referencia en el que cada miembro presentó un informe.

```solidity
function getMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

#### getFastLaneMembers()

Devuelve el subconjunto de miembros del comité oráculo (que consiste en `quorum` elementos) que cambia en cada marco.

```solidity
function getFastLaneMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

#### getQuorum()

Devuelve el número de quórum.

```solidity
function getQuorum() external view returns (uint256)
```

#### getReportProcessor()

Devuelve la dirección del procesador de informes, es decir, la dirección del oráculo.

```solidity
function getReportProcessor() external view returns (address)
```

#### getConsensusState()

Devuelve información sobre el marco actual y el estado de consenso en ese marco.

```solidity
function getConsensusState() external view returns (
    uint256 refSlot,
    bytes32 consensusReport,
    bool isReportProcessing
)
```

##### Devoluciones

Devuelve información sobre el marco actual y el estado de consenso en ese marco.

| Nombre                 | Tipo      | Descripción                                                           |
| ---------------------- | --------- | --------------------------------------------------------------------- |
| `refSlot`              | `uint256` | Slot de referencia del marco de informe actual.                       |
| `consensusReport`      | `bytes32` | Informe de consenso para el marco actual, si existe. Cero bytes de lo contrario. |
| `isReportProcessing`   | `bool`    | Indica si el informe de consenso para el marco actual ya está siendo procesado. El consenso puede cambiar antes de que comience el procesamiento. |

#### getReportVariants()

Devuelve las variantes de informe y su soporte para el slot de referencia actual.

```solidity
function getReportVariants() external view returns (
    bytes32[] memory variants,
    uint256[] memory support
)
```

### getConsensusStateForMember()

Devuelve la información extendida relacionada con un miembro del comité oráculo con la dirección proporcionada y el estado de consenso actual. Proporciona toda la información necesaria para que un demonio oráculo decida si necesita enviar un informe.

```solidity
function getConsensusStateForMember(address addr) external view returns (MemberConsensusState memory result)
```

#### Parámetros

| Nombre   | Tipo      | Descripción         |
| ------   | --------- | ------------------- |
| `addr`   | `address` | La dirección del miembro. |

#### Devoluciones

Devuelve un nuevo tipo `MemberConsensusState`


```solidity
struct MemberConsensusState {
    /// @notice Current frame's reference slot.
    uint256 currentFrameRefSlot;

    /// @notice Consensus report for the current frame, if any. Zero bytes otherwise.
    bytes32 currentFrameConsensusReport;

    /// @notice Whether the provided address is a member of the oracle committee.
    bool isMember;

    /// @notice Whether the oracle committee member is in the fast lane members subset
    /// of the current reporting frame. See `getIsFastLaneMember`.
    bool isFastLane;

    /// @notice Whether the oracle committee member is allowed to submit a report at
    /// the moment of the call.
    bool canReport;

    /// @notice The last reference slot for which the member submitted a report.
    uint256 lastMemberReportRefSlot;

    /// @notice The hash reported by the member for the current frame, if any.
    /// Zero bytes otherwise.
    bytes32 currentFrameMemberReport;
}
```

## Métodos

### updateInitialEpoch()

Establece una nueva época inicial dado que la época inicial actual está en el futuro.

Solo puede ser llamado por usuarios con el rol `DEFAULT_ADMIN_ROLE`.

```solidity
function updateInitialEpoch(uint256 initialEpoch) external
```

- Revierte con `InitialEpochAlreadyArrived()` si la época actual es mayor o igual a la época inicial desde la configuración del marco actual.
- Revierte con `InitialEpochRefSlotCannotBeEarlierThanProcessingSlot()` si el slot de referencia inicial es menor que el último slot de procesamiento.
- Revierte con `EpochsPerFrameCannotBeZero()` si `epochsPerFrame` desde la configuración del marco es cero.
- Revierte con `FastLanePeriodCannotBeLongerThanFrame()` si `fastLaneLengthSlots` desde la configuración del marco es mayor que la longitud del marco.

### setFrameConfig()

Actualiza la configuración relacionada con el tiempo.

Solo puede ser llamado por usuarios con el rol `MANAGE_FRAME_CONFIG_ROLE`.

```solidity
function setFrameConfig(uint256 epochsPerFrame, uint256 fastLaneLengthSlots) external
```

- Revierte con `EpochsPerFrameCannotBeZero()` si `epochsPerFrame` es cero.
- Revierte con `FastLanePeriodCannotBeLongerThanFrame()` si `fastLaneLengthSlots` es mayor que la longitud del marco.

#### Parámetros

| Nombre                  | Tipo      | Descripción                                                           |
| ---------------------   | --------- | --------------------------------------------------------------------- |
| `epochsPerFrame`        | `uint256` | Longitud de un marco en épocas.                                       |
| `fastLaneLengthSlots`   | `uint256` | Longitud del intervalo de carril rápido en slots; ver `getIsFastLaneMember`. |

### setFastLaneLengthSlots()

Establece la duración del intervalo de carril rápido del marco de informe.

Solo puede ser llamado por usuarios con el rol `MANAGE_FAST_LANE_CONFIG_ROLE`.

```solidity
function setFastLaneLengthSlots(uint256 fastLaneLengthSlots) external
```

- Revierte con `FastLanePeriodCannotBeLongerThanFrame()` si `fastLaneLengthSlots` es mayor que la longitud del marco.

#### Parámetros

| Nombre                  | Tipo      | Descripción                                                           |
| ---------------------   | --------- | --------------------------------------------------------------------- |
| `fastLaneLengthSlots`   | `uint256` | La longitud del intervalo de informe rápido en slots. Configurándolo a cero desactiva el subconjunto de carril rápido, permitiendo que cualquier oráculo informe a partir del primer slot de un marco y hasta el plazo de presentación del marco. |

### addMember()

Agrega un nuevo miembro al consenso.

Solo puede ser llamado por usuarios con el rol `DISABLE_CONSENSUS_ROLE` si `quorum` está configurado como UINT256_MAX.

Solo puede ser llamado por usuarios con el rol `MANAGE_MEMBERS_AND_QUORUM_ROLE` si `quorum` no está configurado como UINT256_MAX.

```solidity
function addMember(address addr, uint256 quorum) external
```

- Revierte con `DuplicateMember()` si la dirección `addr` ya es miembro del consenso.
- Revierte con `AddressCannotBeZero()` si la dirección `addr` es cero.
- Revierte con `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` si `quorum` es menor o igual que el total de miembros del consenso dividido por 2 (`quorum <= total de miembros / 2`).

### removeMember()

Elimina un miembro del consenso.

Solo puede ser llamado por usuarios con el rol `DISABLE_CONSENSUS_ROLE` si `quorum` está configurado como UINT256_MAX.

Solo puede ser llamado por usuarios con el rol `MANAGE_MEMBERS_AND_QUORUM_ROLE` si `quorum` no está configurado como UINT256_MAX.

```solidity
function removeMember(address addr, uint256 quorum) external
```

- Revierte con `NonMember()` si la dirección `addr` no existe.
- Revierte con `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` si `quorum` es menor o igual que el total de miembros del consenso dividido por 2 (`quorum <= total de miembros / 2`).

### setQuorum()

Actualiza el quórum del consenso.

Solo puede ser llamado por usuarios con el rol `DISABLE_CONSENSUS_ROLE` si `quorum` está configurado como UINT256_MAX.

Solo puede ser llamado por usuarios con el rol `MANAGE_MEMBERS_AND_QUORUM_ROLE` si `quorum` no está configurado como UINT256_MAX.

```solidity
function setQuorum(uint256 quorum) external
```

- Revierte con `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` si `quorum` es menor o igual que el total de miembros del consenso dividido por 2 (`quorum <= total de miembros / 2`).

### disableConsensus()

Deshabilita el quórum del consenso, es decir, establece el quórum como `UINT256_MAX` (UNREACHABLE_QUORUM).

Solo puede ser llamado por usuarios con el rol `DISABLE_CONSENSUS_ROLE`.

```solidity
function disableConsensus() external
```

- Revierte con `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` si `quorum` es menor o igual que el total de miembros del consenso dividido por 2 (`quorum <= total de miembros / 2`).

### setReportProcessor()

Establece la dirección del procesador de informes, es decir, la dirección del oráculo.

Solo puede ser llamado por usuarios con el rol `MANAGE_REPORT_PROCESSOR_ROLE`.

```solidity
function setReportProcessor(address newProcessor) external
```

- Revierte con `ReportProcessorCannotBeZero()` si la dirección `newProcessor` es cero.
- Revierte con `NewProcessorCannotBeTheSame()` si la dirección `newProcessor` es igual a la dirección del procesador anterior.

### submitReport()

Usado por los miembros del oráculo para enviar el hash de los datos calculados para el slot de referencia dado.

```solidity
function submitReport(uint256 slot, bytes32 report, uint256 consensusVersion) external
```

#### Parámetros

| Nombre              | Tipo      | Descripción                                                           |
| ------------------- | --------- | --------------------------------------------------------------------- |
| `slot`              | `uint256` | El slot de referencia para el que se calcularon los datos. Revierte si no coincide con el slot de referencia actual.                                         |
| `report`            | `bytes32` | Hash de los datos calculados para el slot de referencia dado. |
| `consensusVersion`  | `uint256` | Versión de las reglas de consenso del oráculo. Revierte si no coincide con la versión devuelta por el procesador de informes de consenso actualmente configurado, o cero si no se ha establecido un procesador de informes. |

#### Revierte

- Revierte con `InvalidSlot()` si `slot` es cero.
- Revierte con `InvalidSlot()` si `slot` no es igual al refSlot del marco actual.
- Revierte con `NumericOverflow()` si `slot` es mayor que `UINT64_MAX`.
- Revierte con `EmptyReport()` si `report` es un hash cero (`bytes32(0)`).
- Revierte con `NonMember()` si la dirección del llamador no existe en la lista de miembros.
- Revierte con `UnexpectedConsensusVersion(uint256 expected, uint256 received)` si `consensusVersion` no es igual a la versión del consenso del procesador de informes.
- Revierte con `StaleReport()` si el slot del marco actual es mayor que el slot de plazo de procesamiento del informe del marco.
- Revierte con `NonFastLaneMemberCannotReportWithinFastLaneInterval()` si el slot del marco actual es menor o igual al refSlot del marco más la longitud del carril rápido Y el miembro que envía el informe no es miembro del carril rápido.
- Revierte con `ConsensusReportAlreadyProcessing()` si el miembro envía un informe para el mismo slot.
- Revierte con `DuplicateReport()` si el miembro ya ha enviado el informe.

## Eventos

### FrameConfigSet()

Emite cuando se establece una nueva configuración de marco a través de [`setFrameConfig`](#setframeconfig).

```solidity
event FrameConfigSet(uint256 newInitialEpoch, uint256 newEpochsPerFrame)
```

### FastLaneConfigSet()

Emite cuando la longitud del carril rápido cambia (es decir, la longitud definida en slots).

```solidity
event FastLaneConfigSet(uint256 fastLaneLengthSlots)
```

### MemberAdded()

Emite cuando se agrega un nuevo miembro del consenso.

```solidity
event MemberAdded(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### MemberRemoved()

Emite cuando se elimina un miembro existente del consenso.

```solidity
event MemberRemoved(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### QuorumSet()

Emite cuando se cambia el quórum de los miembros del consenso.

```solidity
event QuorumSet(uint256 newQuorum, uint256 totalMembers, uint256 prevQuorum)
```

### ReportReceived()

Emite cuando se recibe un nuevo informe para el `refSlot` proporcionado por `member` que contiene el hash del `report`.

```solidity
 event ReportReceived(uint256 indexed refSlot, address indexed member, bytes32 report)
```

### ConsensusReached()

Emite cuando se alcanza un consenso para el `refSlot` proporcionado que contiene el hash del `report`.

```solidity
event ConsensusReached(uint256 indexed refSlot, bytes32 report, uint256 support)
```

### ConsensusLost()

Emite cuando se disuelve el consenso previamente establecido para el `refSlot` proporcionado.

```solidity
event ConsensusLost(uint256 indexed refSlot)
```

### ReportProcessorSet()

Emite cuando el procesador de informes se cambia de `prevProcessor` a `processor`.
Ambas direcciones deben cumplir con la interfaz `IReportAsyncProcessor`.

```solidity
event ReportProcessorSet(address indexed processor, address indexed prevProcessor)
```