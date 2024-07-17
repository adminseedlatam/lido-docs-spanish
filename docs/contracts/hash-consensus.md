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

#### Returns

| Name                           | Type      | Description                                                                          |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| `refSlot`                      | `uint256` | The frame's reference slot: if the data the consensus is being reached upon includes or depends on any onchain state, this state should be queried at the reference slot. If the slot contains a block, the state should include all changes from that block. |
| `reportProcessingDeadlineSlot` | `uint256` | The last slot at which the report can be processed by the report processor contract. |

### getInitialRefSlot()

Returns the earliest possible reference slot, i.e. the reference slot of the reporting frame with zero index.

```solidity
function getInitialRefSlot() external view returns (uint256)
```

### getIsMember()

Returns whether the given address is currently a member of the consensus.

```solidity
function getIsMember(address addr) external view returns (bool)
```

### getIsFastLaneMember()

Returns whether the given address is a fast lane member for the current reporting frame.

```solidity
function getIsFastLaneMember(address addr) external view returns (bool)
```

### getMembers()

Returns all current members, together with the last reference slot each member submitted a report for.

```solidity
function getMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

### getFastLaneMembers()

Returns the subset of the oracle committee members (consisting of `quorum` items) that changes each frame.

```solidity
function getFastLaneMembers() external view returns (
    address[] memory addresses,
    uint256[] memory lastReportedRefSlots
)
```

### getQuorum()

Returns quorum number

```solidity
function getQuorum() external view returns (uint256)
```

### getReportProcessor()

Returns report processor address, i.e oracle address

```solidity
function getReportProcessor() external view returns (address)
```

### getConsensusState()

Returns info about the current frame and consensus state in that frame.

```solidity
function getConsensusState() external view returns (
    uint256 refSlot,
    bytes32 consensusReport,
    bool isReportProcessing
)
```

#### Returns

Returns info about the current frame and consensus state in that frame.

| Name                 | Type      | Description                                                           |
| -------------------- | --------- | --------------------------------------------------------------------- |
| `refSlot`            | `uint256` | Reference slot of the current reporting frame.                        |
| `consensusReport`    | `bytes32` | Consensus report for the current frame, if any. Zero bytes otherwise. |
| `isReportProcessing` | `bool`    | If consensus report for the current frame is already being processed. Consensus can be changed before the processing starts. |

### getReportVariants()

Returns report variants and their support for the current reference slot.

```solidity
function getReportVariants() external view returns (
    bytes32[] memory variants,
    uint256[] memory support
)
```

### getConsensusStateForMember()

Returns the extended information related to an oracle committee member with the
given address and the current consensus state. Provides all the information needed for
an oracle daemon to decide if it needs to submit a report.

```solidity
function getConsensusStateForMember(address addr) external view returns (MemberConsensusState memory result)
```

#### Parameters

| Name   | Type      | Description         |
| ------ | --------- | ------------------- |
| `addr` | `address` | The member address. |

#### Returns

Returns a new type `MemberConsensusState`

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

## Methods

### updateInitialEpoch()

Sets a new initial epoch given that the current initial epoch is in the future.

Can only be called by users with `DEFAULT_ADMIN_ROLE`.

```solidity
function updateInitialEpoch(uint256 initialEpoch) external
```

- Reverts with `InitialEpochAlreadyArrived()` if current epoch more or equal initial epoch from current frame config.
- Reverts with `InitialEpochRefSlotCannotBeEarlierThanProcessingSlot()` if initial frame refSlot less than last processing refSlot.
- Reverts with `EpochsPerFrameCannotBeZero()` if `epochsPerFrame` from frame config is zero.
- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` from config more than frame length.

### setFrameConfig()

Updates the time-related configuration.

Can only be called by users with `MANAGE_FRAME_CONFIG_ROLE`.

```solidity
function setFrameConfig(uint256 epochsPerFrame, uint256 fastLaneLengthSlots) external
```

- Reverts with `EpochsPerFrameCannotBeZero()` if `epochsPerFrame` is zero.
- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` more than frame length.

#### Parameters

| Name                  | Type      | Description                                                           |
| --------------------- | --------- | --------------------------------------------------------------------- |
| `epochsPerFrame`      | `uint256` | ALength of a frame in epochs.                                         |
| `fastLaneLengthSlots` | `uint256` | Length of the fast lane interval in slots; see `getIsFastLaneMember`. |

### setFastLaneLengthSlots()

Sets the duration of the fast lane interval of the reporting frame.

Can only be called by users with `MANAGE_FAST_LANE_CONFIG_ROLE`.

```solidity
function setFastLaneLengthSlots(uint256 fastLaneLengthSlots) external
```

- Reverts with `FastLanePeriodCannotBeLongerThanFrame()` if `fastLaneLengthSlots` more than frame length.

#### Parameters

| Name                  | Type      | Description                                                           |
| --------------------- | --------- | --------------------------------------------------------------------- |
| `fastLaneLengthSlots` | `uint256` | The length of the fast lane reporting interval in slots. Setting it to zero disables the fast lane subset, allowing any oracle to report starting from the first slot of a frame and until the frame's reporting deadline. |

### addMember()

Add a new member of the consensus.

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function addMember(address addr, uint256 quorum) external
```

- Reverts with `DuplicateMember()` if `addr` address is already the member of consensus.
- Reverts with `AddressCannotBeZero()` if `addr` address is zero.
- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### removeMember()

Remove a member from the consensus.

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function removeMember(address addr, uint256 quorum) external
```

- Reverts with `NonMember()` if `addr` address doesn't exists
- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### setQuorum()

Update consensus quorum

Can only be called by users with `DISABLE_CONSENSUS_ROLE` role if `quorum` set as UINT256_MAX.

Can only be called by users with `MANAGE_MEMBERS_AND_QUORUM_ROLE` role if `quorum` not set as UINT256_MAX.

```solidity
function setQuorum(uint256 quorum) external
```

- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### disableConsensus()

Disable consensus quorum, i.e set quorum as `UINT256_MAX` (UNREACHABLE_QUORUM)

Can only be called by users with `DISABLE_CONSENSUS_ROLE`

```solidity
function disableConsensus() external
```

- Reverts with `QuorumTooSmall(uint256 minQuorum, uint256 receivedQuorum)` if `quorum` less or equal than total members of consensus divided by 2  (`quorum <= total members / 2`)

### setReportProcessor()

Set report processor address, i.e oracle address

Can only be called by users with `MANAGE_REPORT_PROCESSOR_ROLE`.

```solidity
function setReportProcessor(address newProcessor) external
```

- Reverts with `ReportProcessorCannotBeZero()` if `newProcessor` address is zero.
- Reverts with `NewProcessorCannotBeTheSame()` if `newProcessor` address is equal to the previous processor address.

### submitReport()

Used by oracle members to submit hash of the data calculated for the given reference slot.

```solidity
function submitReport(uint256 slot, bytes32 report, uint256 consensusVersion) external
```

#### Parameters

| Name               | Type      | Description                                                           |
| ------------------ | --------- | --------------------------------------------------------------------- |
| `slot`             | `uint256` | The reference slot the data was calculated for. Reverts if doesn't match the current reference slot.                                         |
| `report`           | `bytes32` | Hash of the data calculated for the given reference slot. |
| `consensusVersion` | `uint256` | Version of the oracle consensus rules. Reverts if doesn't match the version returned by the currently set consensus report processor, or zero if no report processor is set. |

#### Reverts

- Reverts with `InvalidSlot()` if `slot` is zero.
- Reverts with `InvalidSlot()` if `slot` is not equal current frame refSlot.
- Reverts with `NumericOverflow()` if `slot` is more than `UINT64_MAX`
- Reverts with `EmptyReport()` if `reports` is zero hash (`bytes32(0)`)
- Reverts with `NonMember()` if caller address doesn't exists in members array
- Reverts with `UnexpectedConsensusVersion(uint256 expected, uint256 received)` if `consensusVersion` is not equal report processor consensus version.
- Reverts with `StaleReport()` if the current frame slot is more than the frame report processing deadline slot.
- Reverts with `NonFastLaneMemberCannotReportWithinFastLaneInterval()` if the current frame slot is less or equal frame ref slot plus fastlane length AND the member who submits the report is not fastlane member.
- Reverts with `ConsensusReportAlreadyProcessing()` if the member sends a report for the same slot.
- Reverts with `DuplicateReport()` if the member already sends the report.

## Events

### FrameConfigSet()

Emits when a new frame config set via [`setFrameConfig`](#setframeconfig).

```solidity
event FrameConfigSet(uint256 newInitialEpoch, uint256 newEpochsPerFrame)
```

### FastLaneConfigSet()

Emits when fast lane length changed (i.e., length defined in slots).

```solidity
event FastLaneConfigSet(uint256 fastLaneLengthSlots)
```

### MemberAdded()

Emits when a new member of consensus is added.

```solidity
event MemberAdded(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### MemberRemoved()

Emits when an existing member of consensus is removed.

```solidity
event MemberRemoved(address indexed addr, uint256 newTotalMembers, uint256 newQuorum)
```

### QuorumSet()

Emits when a quorum of consensus members is changed.

```solidity
event QuorumSet(uint256 newQuorum, uint256 totalMembers, uint256 prevQuorum)
```

### ReportReceived()

Emits when a new report received for the provided `refSlot` by `member` containing the `report` hash.

```solidity
 event ReportReceived(uint256 indexed refSlot, address indexed member, bytes32 report)
```

### ConsensusReached()

Emits when a consensus reached for the provided `refSlot` containing the `report` hash.

```solidity
event ConsensusReached(uint256 indexed refSlot, bytes32 report, uint256 support)
```

### ConsensusLost()

Emits when the previously established consensus for the provided `refSlot` is disbanded.

```solidity
event ConsensusLost(uint256 indexed refSlot)
```

### ReportProcessorSet()

Emits when the report processor is changed from `prevProcessor` to `processor`.
Both addresses must comply with the `IReportAsyncProcessor` interface.

```solidity
event ReportProcessorSet(address indexed processor, address indexed prevProcessor)
```
