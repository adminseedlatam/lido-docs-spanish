# Palancas del Protocolo

El protocolo proporciona una serie de ajustes controlables por la DAO. Modificar cada uno de ellos requiere que el llamante tenga un permiso específico. Después de implementar la DAO, todos los permisos pertenecen a las aplicaciones DAO `Voting` o `Agent`, las cuales también pueden gestionarlos. Esto significa que, inicialmente, las palancas solo pueden ser modificadas mediante votación de la DAO, y otras entidades solo pueden permitirse lo mismo como resultado de esa votación.

A continuación se enumeran todas las palancas existentes, agrupadas por contrato.

### Nota sobre la capacidad de actualización

Los siguientes contratos pueden ser actualizables mediante votación de la DAO:

- [`LidoLocator`](/contracts/lido-locator)
- [`Lido`](/contracts/lido)
- [`StakingRouter`](/contracts/staking-router)
- [`NodeOperatorsRegistry`](/contracts/node-operators-registry)
- [`AccountingOracle`](/contracts/accounting-oracle)
- [`ValidatorsExitBusOracle`](/contracts/validators-exit-bus-oracle)
- [`WithdrawalVault`](/contracts/withdrawal-vault)
- [`WithdrawalQueueERC721`](/contracts/withdrawal-queue-erc721)
- [`LegacyOracle`](/contracts/legacy-oracle)

La capacidad de actualización está implementada ya sea mediante el kernel y los contratos base de Aragon o mediante instancias de [OssifiableProxy](/contracts/ossifiable-proxy).
Para actualizar una aplicación de Aragon, se necesita el permiso `dao.APP_MANAGER_ROLE` proporcionado por Aragon.
Para actualizar una implementación de `OssifiableProxy`, se necesita ser propietario del proxy.
Como se mencionó anteriormente, ambos pertenecen a las aplicaciones DAO `Voting` o `Agent`.

Todos los contratos actualizables utilizan el [patrón de almacenamiento no estructurado] para proporcionar una estructura de almacenamiento estable a través de las actualizaciones.

:::note
Algunos de los contratos todavía contienen datos de almacenamiento estructurado, por lo que el orden de herencia siempre es importante.
:::

[patrón de almacenamiento no estructurado]: https://blog.openzeppelin.com/upgradeability-using-unstructured-storage

## [Lido](/contracts/lido)

### Quema de tokens stETH

Existe un contrato dedicado responsable de la quema de tokens `stETH`.
La quema en sí misma es parte de los procedimientos centrales del protocolo:

- deducir la solicitud de retiro finalizada subyacente de `stETH`, ver [`Lido.handleOracleReport`](/contracts/lido#handleoraclereport)
- penalizar a los operadores de nodos morosos reduciendo a la mitad sus recompensas, ver [Salidas y penalizaciones de los validadores](/guías/oracle-spec/penalties)

Estas responsabilidades están controladas por el rol `REQUEST_BURN_SHARES_ROLE`, que se asigna tanto a los contratos [`Lido`](/contracts/lido) como [`NodeOperatorsRegistry`](/contracts/node-operators-registry).
Este rol nunca debe asignarse permanentemente a otras entidades.

Además de esto, la quema de tokens `stETH` puede aplicarse para compensar penalizaciones/pérdidas por slashing según la decisión de la DAO.
Es posible a través de un rol más restrictivo `REQUEST_BURN_MY_STETH_ROLE`, que actualmente no está asignado.

La diferencia clave es que ambos roles dependen de la asignación de `stETH` proporcionada al contrato `Burner`,
este último permite la quema de tokens solo desde el saldo del originador de la solicitud.

### Pausa

- Mutador: `stop()`
  - Permiso requerido: `PAUSE_ROLE`
- Mutador: `resume()`
  - Permiso requerido: `RESUME_ROLE`
- Accesorio: `isStopped() returns (bool)`

Cuando está pausado, `Lido` no acepta envíos de usuarios, ni permite retiros de usuarios ni envíos de informes de oráculo. No se permiten acciones con tokens (quema, transferencia, aprobación de transferencias y cambio de asignaciones). Las siguientes transacciones revierten:

- transferencias de ether simples a `Lido`;
- llamadas a `submit(address)`;
- llamadas a `deposit(uint256, uint256, bytes)`;
- llamadas a `handleOracleReport(...)`;
- llamadas a `transfer(address, uint256)`;
- llamadas a `transferFrom(address, address, uint256)`;
- llamadas a `transferShares(address, uint256)`;
- llamadas a `transferSharesFrom(address, uint256)`;
- llamadas a `approve(address, uint256)`;
- llamadas a `increaseAllowance(address, uint256)`;
- llamadas a `decreaseAllowance(address, uint256)`.

Como consecuencia de la lista anterior:

- llamadas a `WithdrawalQueueERC721.requestWithdrawals(uint256[] calldata, address)`, y sus variantes;
- llamadas a `wstETH.wrap(uint256)` y `wstETH.unwrap(uint256)`;
- llamadas a `Burner.requestBurnShares`, `Burner.requestBurnMyStETH`, y sus variantes;

:::note
Las integraciones externas de stETH/wstETH en DeFi también se ven directamente afectadas.
:::

### Anular el contador de validadores depositados

- Mutador: `unsafeChangeDepositedValidators(uint256)`
  - Permiso requerido: `UNSAFE_CHANGE_DEPOSITED_VALIDATORS_ROLE`

El método cambia de forma insegura el contador de validadores depositados.
Puede ser necesario al integrar validadores externos a Lido (es decir, que hayan depositado antes y rotado sus credenciales de retiro tipo-0x00 a Lido).

Valores incorrectos pueden afectar la operación del protocolo.

### Informe del oráculo

TODO: los informes del oráculo son impulsados por el comité

### Control de acceso al depósito

El método `Lido.deposit` realiza un depósito real (stake) de ether almacenado en el Consensus Layer,
pasando por `StakingRouter`, su módulo seleccionado y finalmente el contrato oficial de depósito de Ethereum.

El método solo puede ser llamado por `DepositSecurityModule` ya que el control de acceso es parte de la mitigación de vulnerabilidades de frontrunning en los depósitos.

Por favor, consulta [LIP-5](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md) para más detalles.

### Límite de iteración del bucle de depósito

Controla cuántos depósitos de Ethereum pueden hacerse en una sola transacción.

- El parámetro `_maxDepositsCount` de la función `deposit(uint256 _maxDepositsCount, uint256 _stakingModuleId, bytes _depositCalldata)`
- Valor predeterminado: `16`
- [Prueba de escenario](https://github.com/lidofinance/lido-dao/blob/master/test/scenario/lido_deposit_iteration_limit.js)

Cuando DSM llama a `depositBufferedEther`, `Lido` intenta registrar tantos validadores de Ethereum como sea posible dada la cantidad de ether almacenado en búfer. El límite se pasa como argumento a esta función y es necesario para evitar que la transacción falle debido al límite de gas del bloque, lo cual es posible si la cantidad de ether almacenado en búfer se vuelve suficientemente grande.

[Fallo debido al límite de gas del bloque]: https://github.com/ConsenSys/smart-contract-best-practices/blob/8f99aef/docs/known_attacks.md#gas-limit-dos-on-a-contract-via-unbounded-operations

### Recompensas de la capa de ejecución

Lido implementa un diseño arquitectónico propuesto en la Propuesta de Mejora de Lido [#12](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-12.md) para recolectar las recompensas a nivel de ejecución (a partir del hardfork Merge) y distribuirlas como parte del informe del oráculo de Lido.

Estas recompensas de la capa de ejecución se acumulan inicialmente en el contrato dedicado [`LidoExecutionLayerRewardsVault`](/contracts/lido-execution-layer-rewards-vault) y consisten en tarifas de prioridad y MEV.

Existe un límite adicional para prevenir eventos drásticos de rebase de tokens.
Consulte el siguiente problema: [`#405`](https://github.com/lidofinance/lido-dao/issues/405)

- Modificador: `setELRewardsVault()`

  - Permiso requerido: `SET_EL_REWARDS_VAULT_ROLE`

- Modificador: `setELRewardsWithdrawalLimit()`

  - Permiso requerido: `SET_EL_REWARDS_WITHDRAWAL_LIMIT_ROLE`

- Accesores:
  - `getELRewardsVault()`;
  - `getELRewardsWithdrawalLimit()`.

### Limitación de la tasa de staking

Lido cuenta con un mecanismo de salvaguardia para prevenir pérdidas significativas en el APR frente a la demanda de la cola de entrada [post-merge](https://blog.lido.fi/modelling-the-entry-queue-post-merge-an-analysis-of-impacts-on-lidos-socialized-model/).

Las nuevas solicitudes de staking pueden estar limitadas con un límite móvil suave para la cantidad de staking por período deseado.

Esquema de explicación de límite:

```
    * ▲ Límite de staking
    * │.....  .....   ........ ...            ....     ... Límite de staking = máximo
    * │      .       .        .   .   .      .    . . .
    * │     .       .              . .  . . .      . .
    * │            .                .  . . .
    * │──────────────────────────────────────────────────> Tiempo
    * │     ^      ^          ^   ^^^  ^ ^ ^     ^^^ ^     Eventos de staking
```

- Modificadores: `resumeStaking()`, `setStakingLimit(uint256, uint256)`, `removeStakingLimit()`

  - Permiso requerido: `STAKING_CONTROL_ROLE`

- Modificador: `pauseStaking()`

  - Permiso requerido: `STAKING_PAUSE_ROLE`

- Accesores:
  - `isStakingPaused()`
  - `getCurrentStakeLimit()`
  - `getStakeLimitFullInfo()`

Cuando el staking está pausado, `Lido` no acepta envíos de usuarios. Las siguientes transacciones revierten:

- Transferencias simples de ether;
- llamadas a `submit(address)`.

Para más detalles, consulte la Propuesta de Mejora de Lido [#14](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-14.md).

## [StakingRouter](/contracts/staking-router)

### Tarifa

La tarifa total, en puntos base (`10000` correspondientes a `100%`).

- Modificador: `setFee(uint16)`
  - Permiso requerido: `MANAGE_FEE`
- Accesor: `getFee() returns (uint16)`

La tarifa se aplica a las recompensas de staking y se distribuye entre el tesoro, el fondo de seguro y
los operadores de nodos.

### Distribución de la tarifa

Controla cómo se distribuye la tarifa entre el tesoro, el fondo de seguro y los operadores de nodos.
Cada componente de la tarifa está en puntos base; la suma de todos los componentes debe sumar 1 (`10000` puntos base).

- Modificador: `setFeeDistribution(uint16 treasury, uint16 insurance, uint16 operators)`
  - Permiso requerido: `MANAGE_FEE`
- Accesor: `getFeeDistribution() returns (uint16 treasury, uint16 insurance, uint16 operators)`

### Credenciales de retiro de Ethereum

Credenciales para retirar ETH en el lado de la Capa de Ejecución

- Mutador: `setWithdrawalCredentials(bytes)`
  - Permiso requerido: `MANAGE_WITHDRAWAL_KEY`
- Accesor: `getWithdrawalCredentials() returns (bytes)`

El protocolo utiliza estas credenciales para registrar nuevos validadores de Ethereum.

## [NodeOperatorsRegistry](/contracts/node-operators-registry)

### Lista de Operadores de Nodos

- Mutador: `addNodeOperator(string _name, address _rewardAddress, uint64 _stakingLimit)`
  - Permiso requerido: `ADD_NODE_OPERATOR_ROLE`
- Mutador: `setNodeOperatorName(uint256 _id, string _name)`
  - Permiso requerido: `SET_NODE_OPERATOR_NAME_ROLE`
- Mutador: `setNodeOperatorRewardAddress(uint256 _id, address _rewardAddress)`
  - Permiso requerido: `SET_NODE_OPERATOR_ADDRESS_ROLE`
- Mutador: `setNodeOperatorStakingLimit(uint256 _id, uint64 _stakingLimit)`
  - Permiso requerido: `SET_NODE_OPERATOR_LIMIT_ROLE`

Los Operadores de Nodos actúan como validadores en la cadena Beacon en beneficio del protocolo. Cada operador de nodo envía no más de `_stakingLimit` claves de firma que serán utilizadas más tarde por el protocolo para registrar los validadores de Ethereum correspondientes. A medida que el comité oráculo reporta recompensas en el lado de Ethereum, se aplica una tarifa sobre estas recompensas, y parte de esa tarifa se envía a las direcciones de recompensa de los operadores de nodos (`_rewardAddress`).

### Desactivación de un operador de nodo

- Mutador: `setNodeOperatorActive(uint256 _id, bool _active)`
  - Permiso requerido: `SET_NODE_OPERATOR_ACTIVE_ROLE`

Los operadores de nodo que se comporten mal pueden ser desactivados llamando a esta función. El protocolo omite los operadores desactivados durante el registro de validadores; además, los operadores desactivados no participan en la distribución de tarifas.

### Gestión de las claves de firma del operador de nodo

- Mutador: `addSigningKeys(uint256 _operator_id, uint256 _quantity, bytes _pubkeys, bytes _signatures)`
  - Permiso requerido: `MANAGE_SIGNING_KEYS`
- Mutador: `removeSigningKey(uint256 _operator_id, uint256 _index)`
  - Permiso requerido: `MANAGE_SIGNING_KEYS`

Permite gestionar las claves de firma para el operador de nodo dado.

> Las claves de firma también pueden ser gestionadas por la dirección de recompensa de un proveedor de firmas llamando a las funciones equivalentes con el sufijo `OperatorBH`: `addSigningKeysOperatorBH`, `removeSigningKeyOperatorBH`.

### Reporte de nuevos validadores detenidos

- Mutador: `reportStoppedValidators(uint256 _id, uint64 _stoppedIncrement)`
  - Permiso requerido: `REPORT_STOPPED_VALIDATORS_ROLE`

Permite informar que `_stoppedIncrement` validadores adicionales de un operador de nodo se han detenido.

## [LegacyOracle](/contracts/legacy-oracle)

### Lido

Dirección del contrato Lido.

- Accesor: `getLido() returns (address)`

### Lista de miembros

La lista de miembros del comité oráculo.

- Mutadores: `addOracleMember(address)`, `removeOracleMember(address)`
  - Permiso requerido: `MANAGE_MEMBERS`
- Accesor: `getOracleMembers() returns (address[])`

### El quórum

El número exacto de informes necesarios para finalizar el epoch.

- Mutador: `setQuorum(uint256)`
  - Permiso requerido: `MANAGE_QUORUM`
- Accesor: `getQuorum() returns (uint256)`

Cuando se recolecta el número `quorum` de informes iguales para el epoch actual,

- el epoch se finaliza (no se aceptan más informes para él),
- el informe final se envía a Lido,
- se recopilan estadísticas y se evalúa la [verificación de integridad][1].

### Verificación de integridad

Para hacer que los oráculos sean menos peligrosos, podemos limitar el informe de recompensas por un aumento del 0.1% en el saldo y una disminución del 15% en el saldo, ambos valores configurables por el gobierno en caso de circunstancias extremadamente inusuales.

- Mutadores: `setAllowedBeaconBalanceAnnualRelativeIncrease(uint256)` y `setAllowedBeaconBalanceRelativeDecrease(uint256)`
  - Permiso requerido: `SET_REPORT_BOUNDARIES`
- Accesores: `getAllowedBeaconBalanceAnnualRelativeIncrease() returns (uint256)` y `getAllowedBeaconBalanceRelativeDecrease() returns (uint256)`

### Estado actual de los informes

Para transparencia, proporcionamos accesos para devolver el estado de los informes de los demonios oráculo para el "[epoch esperado][3]" actual.

- Accesores:
  - `getCurrentOraclesReportStatus() returns (uint256)` - devuelve el bitmap actual de informes, representando los oráculos que ya han enviado su versión del informe durante el [epoch esperado][3], cada bit de oráculo corresponde al índice del oráculo en la lista actual de miembros,
  - `getCurrentReportVariantsSize() returns (uint256)` - devuelve el tamaño actual del array de variantes de informes,
  - `getCurrentReportVariant(uint256 _index) returns (uint64 beaconBalance, uint32 beaconValidators, uint16 count)` - devuelve el elemento actual del array de informes con el índice dado.

### Epoch esperado

Los demonios oráculo pueden proporcionar sus informes solo para un epoch en cada marco: el primero. El siguiente accesor puede usarse para buscar el epoch actual que este contrato espera para los informes.

- Accesor: `getExpectedEpochId() returns (uint256)`.

Ten en cuenta que cualquier epoch posterior, que ya haya llegado y también sea el primer epoch de su marco, también es elegible para el informe. Si algún demonio oráculo lo informa, el contrato descarta cualquier resultado de este epoch y avanza al que acaba de ser informado.

### Versión del contrato

Devuelve la versión inicializada de este contrato comenzando desde 0.

- Accesor: `getVersion() returns (uint256)`.

### Especificación de Beacon

Establece y consulta la especificación configurable de la cadena Beacon.

- Mutador: `setBeaconSpec( uint64 _epochsPerFrame, uint64 _slotsPerEpoch, uint64 _secondsPerSlot, uint64 _genesisTime )`,
  - Permiso requerido: `SET_BEACON_SPEC`,
- Accesor: `getBeaconSpec() returns (uint64 epochsPerFrame, uint64 slotsPerEpoch, uint64 secondsPerSlot, uint64 genesisTime)`.

### Epoch actual

Devuelve el epoch calculado a partir del timestamp actual.

- Accesor: `getCurrentEpochId() returns (uint256)`.

### Información adicional del epoch

Devuelve el epoch actualmente reportable (el primer epoch del marco actual) así como su inicio y fin en segundos.

- Accesor: `getCurrentFrame() returns (uint256 frameEpochId, uint256 frameStartTime, uint256 frameEndTime)`.

### Último epoch completado

Devuelve el último epoch que ha sido enviado a Lido.

- Accesor: `getLastCompletedEpochId() returns (uint256)`.

### Información adicional de recompensas

Informa el saldo del beacon y su cambio durante el último frame.

- Accesor: `getLastCompletedReportDelta() returns (uint256 postTotalPooledEther, uint256 preTotalPooledEther, uint256 timeElapsed)`.

[1]: #verificación-de-integridad
[3]: #epoch-esperado
