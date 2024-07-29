### StakingRouter

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/StakingRouter.sol)
- [Contrato desplegado](https://etherscan.io/address/0xFdDf38947aFB03C621C71b06C9C70bce73f12999)

StakingRouter es un registro de módulos de staking, cada uno encapsulando un subconjunto específico de validadores, por ejemplo, el módulo de staking curado por Lido DAO. El contrato asigna stake a los módulos, distribuye tarifas del protocolo y realiza el seguimiento de información relevante.

## ¿Qué es StakingRouter?

StakingRouter es un contrato controlador de alto nivel para módulos de staking. Cada módulo de staking es un contrato que gestiona su propio subconjunto de validadores, por ejemplo, el [módulo Curated](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5) es un conjunto de operadores de nodos verificados por Lido DAO. Este diseño modular abre la oportunidad para que cualquier persona construya un módulo de staking y se una a la plataforma de staking de Lido, incluyendo stakers comunitarios sin permisos, validadores habilitados por DVT o cualquier otro subconjunto de validadores, tecnología o mecánica.

StakingRouter realiza varias funciones, incluyendo:

- Mantener un registro de módulos de staking,
- Asignar stake a los módulos, y
- Distribuir tarifas del protocolo.

## Gestión de módulos

### Registro de un módulo

Los módulos se registran en StakingRouter a través del proceso de votación de Lido DAO. Para ser considerado por la gobernanza, el contrato de módulo solicitante debe implementar la interfaz de módulo adecuada, cumplir con requisitos de seguridad y tener una estructura de tarifas alineada con la sostenibilidad del protocolo Lido. Una vez aprobado en la votación, el módulo comienza a recibir stake y tarifas del protocolo.

Los módulos de staking se registran utilizando la función `addStakingModule`, proporcionando detalles como:

- El nombre del módulo: un nombre legible por humanos;
- La dirección del contrato de módulo de staking desplegado;
- El share objetivo, un límite relativo duro en los depósitos dentro de Lido;
- La tarifa del módulo, un porcentaje de las recompensas de staking que se otorgará al módulo,
- Y la tarifa de tesorería, un porcentaje de las recompensas de staking que se dirigirá a la tesorería del protocolo.

### Pausa de módulos

Cada módulo de staking tiene un estado: un estado que determina si el módulo puede realizar depósitos y recibir recompensas:

- `Active`, puede realizar depósitos y recibir recompensas,
- `DepositsPaused`, no se permiten depósitos pero sí se reciben recompensas,
- `Stopped`, no puede realizar depósitos y no recibe recompensas.

```solidity
enum StakingModuleStatus {
	Active, // depósitos y recompensas permitidos
	DepositsPaused, // depósitos NO permitidos, recompensas permitidas
	Stopped // depósitos y recompensas NO permitidos
}
```

### Validadores salidos y atascados

Cuando las solicitudes de retiro exceden el éter almacenado en Lido junto con las recompensas proyectadas, el protocolo indica a los operadores de nodos que comiencen a sacar validadores para cubrir los retiros. En este contexto, StakingRouter distingue dos tipos de estados de validadores:

- Validadores [salidos](https://hackmd.io/zHYFZr4eRGm3Ju9_vkcSgQ?view),
- Y validadores atascados, es decir, aquellos validadores que no cumplieron con la señal de salida.

StakingRouter lleva un seguimiento de ambos tipos de validadores para asignar correctamente el stake y penalizar a los validadores atascados. Estas estadísticas se mantienen actualizadas mediante los oráculos que envían los datos al contrato.

## Asignación de stake

StakingRouter lleva a cabo la tarea vital de distribuir éter depositable a módulos de staking de manera que se alinee con los objetivos de crecimiento establecidos por DAO. Este diseño asegura un crecimiento regulado y controlado para los módulos que han sido recientemente integrados en el sistema. Los principios que rigen esta metodología se discuten de manera exhaustiva en [ADR: Staking Router](https://hackmd.io/f1wvHzpjTIq41-GCrdaMjw?view#Target-shares).

### Depósito

El flujo de depósito implica enviar lotes de depósitos de 32 éter, junto con claves de validador asociadas, al [`Contrato de Depósito`](https://ethereum.org/en/staking/deposit-contract/) en una transacción. Dado que cada módulo de staking maneja sus propios depósitos, cada depósito por lote está restringido a claves originadas desde un solo módulo.

La operación de depósito es, en su núcleo, una secuencia de llamadas de contrato desencadenadas por un software fuera de la cadena, el [bot depositador](https://github.com/lidofinance/depositor-bot). Este bot recopila mensajes de guardianes para confirmar que no existen claves preexistentes en el registro que puedan aprovechar la [vulnerabilidad de frontrunning](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-5.md). Una vez alcanzado el quórum necesario de guardianes, el bot reenvía estos mensajes junto con el identificador del módulo al `DepositSecurityModule` (no confundir con un módulo de staking). Este contrato primero verifica los mensajes, luego inicia la función de depósito en Lido, transmitiendo el número máximo de depósitos que el tamaño actual del bloque puede acomodar. Posteriormente, Lido calcula el número máximo de depósitos que se pueden incluir en el lote según el búfer de depósitos existente, y activa la función de depósito de StakingRouter. Luego, StakingRouter determina la distribución del éter en búfer al módulo que utilizará sus claves en el depósito, y finalmente ejecuta el depósito por lotes.

La función `deposit` comienza verificando la identidad del remitente y comprobando las credenciales de retiro y el estado del módulo de staking. Después de estas verificaciones, actualiza el estado local del contrato registrando la marca de tiempo y el número de bloque actual como el último tiempo y bloque de depósito para el módulo de staking. Luego emite un evento para registrar la transacción de depósito, y verifica si el valor del depósito coincide con el tamaño total de depósito requerido. Si hay depósitos por realizar, obtiene los datos de depósito (claves públicas y firmas) del contrato de módulo de staking. Luego realiza los depósitos al `DepositContract` utilizando los datos obtenidos. Finalmente, confirma que todo el ETH depositado se ha transferido correctamente al contrato comparando el saldo de éter del contrato antes y después de la transacción de depósito.

### Algoritmo de asignación

El algoritmo utilizado para el proceso de asignación está diseñado para considerar varios factores, incluyendo el límite de depósitos por transacción, la cantidad de éter listo para el depósito, las claves activas disponibles dentro de cada módulo y el share objetivo de cada módulo. Luego estima el máximo depósito basado en estos parámetros. El algoritmo también identifica los límites de claves para todos los módulos e inicia la asignación de claves, comenzando por el módulo que tiene menos claves activas. Esto continúa hasta que no haya más éter para asignar o hasta que todos los módulos alcancen su capacidad. Al final del proceso, cualquier éter restante se devuelve.

La función de asignación utiliza el algoritmo [`MinFirstAllocationStrategy`](https://github.com/lidofinance/lido-dao/blob/master/contracts/common/lib/MinFirstAllocationStrategy.sol) para asignar nuevos depósitos entre diferentes módulos de staking.

Aquí se detalla el proceso:

1. La función toma como entrada `_depositsToAllocate`, que representa la cantidad de nuevos depósitos que deben asignarse entre los módulos de st

aking.

2. Comienza calculando el total de validadores activos en el sistema (`totalActiveValidators`) y carga el estado actual de los módulos de staking en una caché (`stakingModulesCache`).

3. Luego crea una matriz de `asignaciones` del mismo tamaño que el número de módulos de staking, donde cada índice en esta matriz representa la asignación actual de un módulo de staking (es decir, el número actual de validadores activos en ese módulo).

4. Si hay módulos de staking disponibles (`stakingModulesCount > 0`), la función procede con el proceso de asignación:

   a. Calcula un nuevo total estimado de validadores activos, sumando los nuevos depósitos al total de validadores activos (`totalActiveValidators += _depositsToAllocate`).

   b. Crea una matriz `capacities` del mismo tamaño que el número de módulos de staking. Cada entrada en esta matriz representa la capacidad máxima de un módulo de staking particular, es decir, el número máximo de validadores que puede tener ese módulo. Esto se calcula como el mínimo de:

   - El número objetivo de validadores para un módulo, que se basa en un share objetivo deseado (`stakingModulesCache[i].targetShare * totalActiveValidators / TOTAL_BASIS_POINTS`), o
   - La suma de los validadores activos actuales y los validadores disponibles en el módulo (`stakingModulesCache[i].activeValidatorsCount + stakingModulesCache[i].availableValidatorsCount`).

   c. Finalmente, llama a la función `allocate` de `MinFirstAllocationStrategy`, pasando las `asignaciones`, `capacidades` y `_depositsToAllocate`. La cantidad asignada correctamente se almacena en `allocated`.

En resumen, esta función utiliza el algoritmo `MinFirstAllocationStrategy` para distribuir nuevos depósitos (validadores) entre diferentes módulos de staking de manera que prioriza llenar los módulos menos poblados, teniendo en cuenta el share objetivo y la capacidad de cada módulo. Las asignaciones resultantes y la cantidad total asignada se devuelven luego para su uso adicional.

## Distribución de tarifas

La estructura de tarifas se establece de manera independiente en cada módulo. Hay dos componentes en la estructura de tarifas: la tarifa del módulo y la tarifa de tesorería, ambas especificadas como porcentajes (puntos base). Por ejemplo, una tarifa del 5% (500 puntos base) para el módulo dividida entre los operadores de nodo en el módulo y una tarifa de tesorería del 5% (500 puntos base) enviada a la tesorería. Además, `StakingRouter` utiliza un factor de precisión de 100 \* 10^18 para las tarifas que evita que las operaciones aritméticas truncen las tarifas de módulos pequeños.

Dado que el protocolo actualmente no tiene en cuenta el rendimiento por validador, la tarifa del protocolo se distribuye entre los módulos proporcionalmente a los validadores activos y la tarifa específica del módulo. Por ejemplo, un módulo con el 75% de todos los validadores en el protocolo y una tarifa del 5% recibirá el 3.75% de las recompensas totales en todo el protocolo. Esto significa que si las tarifas del módulo y de la tesorería no superan el 10%, la tarifa total del protocolo tampoco lo hará, sin importar cuántos módulos haya. También existe un caso especial en el que el módulo se detiene por emergencia mientras sus validadores siguen activos. En este caso, la tarifa del módulo se transferirá a la tesorería y una vez que el módulo vuelva en línea, las recompensas se devolverán al módulo desde la tesorería.

La función de distribución funciona de la siguiente manera:

1. La función primero carga el estado actual de los módulos de staking en una caché (`_loadStakingModulesCache`) y calcula el número de estos módulos (`stakingModulesCount`).

2. Si no hay módulos de staking o no hay validadores activos en el sistema, devuelve una respuesta vacía.

3. De lo contrario, inicializa matrices para almacenar los IDs de módulos (`stakingModuleIds`), las direcciones de los destinatarios de recompensas (`recipients`) y las tarifas de cada destinatario (`stakingModuleFees`). También establece `precisionPoints` en una constante `FEE_PRECISION_POINTS`, que representa el número de precisión base que constituye el 100% de la tarifa.

4. Luego recorre cada módulo de staking. Para cada módulo que tenga al menos un validador activo, hace lo siguiente:

   - Almacena el ID del módulo y la dirección del destinatario en las matrices respectivas.
   - Calcula `stakingModuleValidatorsShare`, que es la proporción de validadores activos totales que forman parte de este módulo de staking.
   - Calcula `stakingModuleFee` como el producto de `stakingModuleValidatorsShare` y la tarifa del módulo de staking dividido por `TOTAL_BASIS_POINTS` (es decir, la proporción de la tarifa del módulo de staking en relación con las tarifas posibles totales). Si el módulo no está detenido, esta tarifa se almacena en la matriz `stakingModuleFees`.
   - Añade a `totalFee` la suma de la tarifa del módulo de staking y una tarifa destinada a la tesorería (calculada de manera similar a `stakingModuleFee`), donde la tesorería es un fondo central de fondos.

5. Después de recorrer todos los módulos, hace una afirmación de que `totalFee` no excede el 100% (representado por `precisionPoints`).

6. Si hay módulos de staking sin validadores activos, reduce las matrices `stakingModuleIds`, `recipients` y `stakingModuleFees` para excluir esos módulos.

Finalmente, la función devuelve cinco matrices/valores: `recipients`, `stakingModuleIds`, `stakingModuleFees`, `totalFee` y `precisionPoints`. Estos proporcionan al llamante una visión general de cómo se distribuyen las recompensas entre los módulos de staking.

## Enlaces útiles

- [ADR: Staking Router](https://hackmd.io/f1wvHzpjTIq41-GCrdaMjw?view)
- [LIP: Staking Router](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-20.md)
- [Política de Salidas de Validadores de Lido en Ethereum](https://hackmd.io/zHYFZr4eRGm3Ju9_vkcSgQ?)

## Métodos de visualización

### `getLido`

Devuelve la dirección del contrato central `Lido`.

```solidity
function getLido() public view returns (address)
```

### `getStakingModules`

Devuelve la lista de estructuras de todos los módulos de staking registrados. Cada módulo de staking tiene una estructura de datos asociada.

```solidity
struct StakingModule {
	uint24 id;
	address stakingModuleAddress;
	uint16 stakingModuleFee;
	uint16 treasuryFee;
	uint16 targetShare;
	uint8 status;
	string name;
	uint64 lastDepositAt;
	uint256 lastDepositBlock;
	uint256 exitedValidatorsCount
}
```

```solidity
function getStakingModules() external view returns (StakingModule[] memory res)
```

**Devuelve:**

| Nombre | Tipo              | Descripción                                                      |
| ------ | ----------------- | ---------------------------------------------------------------- |
| `res`  | `StakingModule[]` | lista de estructuras de todos los módulos de staking registrados |

### `getStakingModuleIds`

Devuelve la lista de IDs de todos los módulos de staking registrados.

```solidity
function getStakingModuleIds() public view returns (uint256[] memory stakingModuleIds)
```

**Devuelve:**

| Nombre             | Tipo        | Descripción                                  |
| ------------------ | ----------- | -------------------------------------------- |
| `stakingModuleIds` | `uint256[]` | lista de IDs de todos los módulos de staking |

### `getStakingModule`

Devuelve la estructura del módulo de staking especificado por su ID.

```solidity
function getStakingModule(uint256 _stakingModuleId) public view returns(StakingModule memory)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo            | Descripción                       |
| ------ | --------------- | --------------------------------- |
|        | `StakingModule` | información del módulo de staking |

### `getStakingModulesCount`

Devuelve el número de módulos de staking registrados.

```solidity
function getStakingModulesCount() public view returns (uint256)
```

### `hasStakingModule`

Devuelve un valor booleano que indica si está registrado un módulo de staking con el ID especificado.

```solidity
function hasStakingModule(uint256 _stakingModuleId) external view returns (bool)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

### `getStakingModuleStatus`

Devuelve el estado del módulo de staking.

```solidity
function getStakingModuleStatus(uint256 _stakingModuleId) public view returns (StakingModuleStatus)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo                  | Descripción                  |
| ------ | --------------------- | ---------------------------- |
|        | `StakingModuleStatus` | Estado del módulo de staking |

### `getStakingModuleSummary`

Devuelve la estructura que contiene un resumen breve de los validadores en el módulo de staking especificado.

```solidity
struct StakingModuleSummary {
    uint256 totalExitedValidators;
    uint256 totalDepositedValidators;
    uint256 depositableValidatorsCount;
}

function getStakingModuleSummary(uint256 _stakingModuleId) public view returns (StakingModuleSummary)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo                   | Descripción                           |
| ------ | ---------------------- | ------------------------------------- |
|        | `StakingModuleSummary` | Resumen de los validadores del módulo |

### `getNodeOperatorSummary`

Devuelve el resumen de un operador de nodo desde el módulo de staking.

```solidity
struct NodeOperatorSummary {
    bool isTargetLimitActive;
    uint256 targetValidatorsCount;
    uint256 stuckValidatorsCount;
    uint256 refundedValidatorsCount;
    uint256 stuckPenaltyEndTimestamp;
    uint256 totalExitedValidators;
    uint256 totalDepositedValidators;
    uint256 depositableValidatorsCount;
}

function getNodeOperatorSummary(uint256 _stakingModuleId, uint256 _nodeOperatorId) public view returns (NodeOperatorSummary)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |
| `_nodeOperatorId`  | `uint256` | ID del operador de nodo  |

**Devuelve:**

| Nombre | Tipo                  | Descripción                  |
| ------ | --------------------- | ---------------------------- |
|        | `NodeOperatorSummary` | Resumen del operador de nodo |

### `getAllStakingModuleDigests`

Devuelve los resúmenes de todos los módulos de staking.

```solidity
struct StakingModuleDigest {
    uint256 nodeOperatorsCount;
    uint256 activeNodeOperatorsCount;
    StakingModule state;
    StakingModuleSummary summary;
}

function getAllStakingModuleDigests() external view returns (StakingModuleDigest[])
```

**Devuelve:**

| Nombre | Tipo                    | Descripción                              |
| ------ | ----------------------- | ---------------------------------------- |
|        | `StakingModuleDigest[]` | Array de resúmenes de módulos de staking |

### `getStakingModuleDigests`

Devuelve los resúmenes de los módulos de staking especificados.

```solidity
function getStakingModuleDigests(uint256[] memory _stakingModuleIds) public view returns (StakingModuleDigest[])
```

**Parámetros:**

| Nombre              | Tipo        | Descripción                        |
| ------------------- | ----------- | ---------------------------------- |
| `_stakingModuleIds` | `uint256[]` | Array de IDs de módulos de staking |

**Devuelve:**

| Nombre | Tipo                    | Descripción                              |
| ------ | ----------------------- | ---------------------------------------- |
|        | `StakingModuleDigest[]` | Array de resúmenes de módulos de staking |

### `getAllNodeOperatorDigests`

Devuelve los resúmenes de todos los operadores de nodo en el módulo de staking especificado.

```solidity
struct NodeOperatorDigest {
    uint256 id;
    bool isActive;
    NodeOperatorSummary summary;
}

function getAllNodeOperatorDigests(uint256 _stakingModuleId) external view returns (NodeOperatorDigest[])
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo                   | Descripción                              |
| ------ | ---------------------- | ---------------------------------------- |
|        | `NodeOperatorDigest[]` | Array de resúmenes de operadores de nodo |

### `getNodeOperatorDigests`

Devuelve los resúmenes de los operadores de nodo especificados en el módulo de staking.

```solidity
function getNodeOperatorDigests(uint256 _stakingModuleId, uint256[] memory _nodeOperatorIds) public view returns (NodeOperatorDigest[])
```

**Parámetros:**

| Nombre             | Tipo        | Descripción                        |
| ------------------ | ----------- | ---------------------------------- |
| `_stakingModuleId` | `uint256`   | ID del módulo de staking           |
| `_nodeOperatorIds` | `uint256[]` | Array de IDs de operadores de nodo |

**Devuelve:**

| Nombre | Tipo                   | Descripción                              |
| ------ | ---------------------- | ---------------------------------------- |
|        | `NodeOperatorDigest[]` | Array de resúmenes de operadores de nodo |

### `getStakingModuleIsStopped`

Devuelve un valor booleano que indica si el módulo de staking está detenido.

```solidity
function getStakingModuleIsStopped(uint256 _stakingModuleId) external view returns (bool)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo   | Descripción                                                         |
| ------ | ------ | ------------------------------------------------------------------- |
|        | `bool` | true si el módulo de staking está detenido, false en caso contrario |

### `getStakingModuleIsDepositsPaused`

Devuelve un valor booleano que indica si los depósitos están pausados para el módulo de staking.

```solidity
function getStakingModuleIsDepositsPaused(uint256 _stakingModuleId) external view returns (bool)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo   | Descripción                                                                             |
| ------ | ------ | --------------------------------------------------------------------------------------- |
|        | `bool` | true si los depósitos están pausados para el módulo de staking, false en caso contrario |

### `getStakingModuleIsActive`

Devuelve un valor booleano que indica si el módulo de staking está activo.

```solidity
function getStakingModuleIsActive(uint256 _stakingModuleId) external view returns (bool)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo   | Descripción                                                       |
| ------ | ------ | ----------------------------------------------------------------- |
|        | `bool` | true si el módulo de staking está activo, false en caso contrario |

### `getStakingModuleNonce`

Obtiene el nonce de un módulo de staking.

```solidity
function getStakingModuleNonce(uint256 _stakingModuleId) external view returns (uint256)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo      | Descripción                 |
| ------ | --------- | --------------------------- |
|        | `uint256` | nonce del módulo de staking |

### `getStakingModuleLastDepositBlock`

Obtiene el número de bloque del último depósito al módulo de staking.

```solidity
function getStakingModuleLastDepositBlock(uint256 _stakingModuleId) external view returns (uint256)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre | Tipo      | Descripción                          |
| ------ | --------- | ------------------------------------ |
|        | `uint256` | número de bloque del último depósito |

### `getStakingModuleActiveValidatorsCount`

Devuelve el número de validadores activos en el módulo de staking.

```solidity
function getStakingModuleActiveValidatorsCount(uint256 _stakingModuleId) external view returns (uint256 activeValidatorsCount)
```

**Parámetros:**

| Nombre             | Tipo      | Descripción              |
| ------------------ | --------- | ------------------------ |
| `_stakingModuleId` | `uint256` | ID del módulo de staking |

**Devuelve:**

| Nombre                  | Tipo      | Descripción                   |
| ----------------------- | --------- | ----------------------------- |
| `activeValidatorsCount` | `uint256` | número de validadores activos |

### `getStakingModuleMaxDepositsCount`

Calcula el número máximo de depósitos que puede manejar un módulo de staking basado en el valor de depósito disponible.

```solidity
function getStakingModuleMaxDepositsCount(uint256 _stakingModuleId, uint256 _maxDepositsValue) public view returns (uint256)
```

**Parámetros:**

| Nombre              | Tipo      | Descripción                                                |
| ------------------- | --------- | ---------------------------------------------------------- |
| `_stakingModuleId`  | `uint256` | ID del módulo de staking                                   |
| `_maxDepositsValue` | `uint256` | cantidad máxima de depósitos basada en el ether disponible |

**Devuelve:**

| Nombre | Tipo      | Descripción                                                                        |
| ------ | --------- | ---------------------------------------------------------------------------------- |
|        | `uint256` | número máximo de depósitos que se pueden realizar usando el módulo de staking dado |

### `getStakingFeeAggregateDistribution`

Devuelve la distribución total de tarifas.

```solidity
function getStakingFeeAggregateDistribution() public view returns (uint96 modulesFee, uint96 treasuryFee, uint256 basePrecision)
```

**Devuelve:**

| Nombre          | Tipo      | Descripción                                                             |
| --------------- | --------- | ----------------------------------------------------------------------- |
| `modulesFee`    | `uint96`  | tarifas totales para todos los módulos de staking                       |
| `treasuryFee`   | `uint96`  | tarifa total para el tesoro                                             |
| `basePrecision` | `uint256` | número de precisión base, un valor que corresponde a la tarifa completa |

### `getStakingRewardsDistribution`

Obtiene la tabla de distribución de las participaciones.

```solidity
function getStakingRewardsDistribution() public view returns (
    address[] memory recipients,
    uint256[] memory stakingModuleIds,
    uint96[] memory stakingModuleFees,
    uint96 totalFee,
    uint256 precisionPoints
)
```

**Devuelve:**

| Nombre              | Tipo        | Descripción                                                             |
| ------------------- | ----------- | ----------------------------------------------------------------------- |
| `recipients`        | `address[]` | direcciones totales de módulos de estaca                                |
| `stakingModuleIds`  | `uint256[]` | ids de módulos de estaca                                                |
| `stakingModuleFees` | `uint96[]`  | tarifas del módulo de estaca                                            |
| `totalFee`          | `uint96`    | tarifa total                                                            |
| `precisionPoints`   | `uint256`   | número de precisión base, un valor que corresponde a la tarifa completa |

### `getDepositsAllocation`

Calcula la asignación de depósitos después de la distribución del número especificado de depósitos utilizando el algoritmo Min-First.

```solidity
function getDepositsAllocation(uint256 _depositsCount) external view returns (uint256 allocated, uint256[] memory allocations)
```

**Parámetros:**

| Nombre           | Tipo      | Descripción                                    |
| ---------------- | --------- | ---------------------------------------------- |
| `_depositsCount` | `uint256` | depósitos para asignar entre módulos de estaca |

**Devuelve:**

| Nombre        | Tipo        | Descripción                                               |
| ------------- | ----------- | --------------------------------------------------------- |
| `allocated`   | `uint256`   | direcciones totales de módulos de estaca                  |
| `allocations` | `uint256[]` | array de nuevo total de depósitos entre módulos de estaca |

### `getWithdrawalCredentials`

Obtiene las credenciales de retiro.

```solidity
function getWithdrawalCredentials() public view returns (bytes32)
```

**Devuelve:**

| Nombre | Tipo      | Descripción            |
| ------ | --------- | ---------------------- |
|        | `bytes32` | credenciales de retiro |

## Métodos de escritura

### `addStakingModule`

Registra un módulo de staking.

```solidity
function addStakingModule(
    string calldata _name,
    address _stakingModuleAddress,
    uint256 _targetShare,
    uint256 _stakingModuleFee,
    uint256 _treasuryFee
) external;
```

**Parámetros:**

| Nombre                  | Tipo      | Descripción                       |
| ----------------------- | --------- | --------------------------------- |
| `_name`                 | `string`  | nombre legible del módulo         |
| `_stakingModuleAddress` | `address` | dirección del contrato del módulo |
| `_targetShare`          | `uin256`  | participación objetivo del módulo |
| `_stakingModuleFee`     | `uin256`  | tarifa del módulo                 |
| `_treasuryFee`          | `uint256` | tarifa del tesoro del módulo      |

### `updateStakingModule`

Actualiza un módulo de staking.

```solidity
function updateStakingModule(


    uint256 _stakingModuleId,
    uint256 _targetShare,
    uint256 _stakingModuleFee,
    uint256 _treasuryFee
) external;
```

**Parámetros:**

| Nombre              | Tipo      | Descripción                                           |
| ------------------- | --------- | ----------------------------------------------------- |
| `_stakingModuleId`  | `address` | id del módulo                                         |
| `_targetShare`      | `uin256`  | actualización de la participación objetivo del módulo |
| `_stakingModuleFee` | `uin256`  | actualización de la tarifa del módulo                 |
| `_treasuryFee`      | `uint256` | actualización de la tarifa del tesoro del módulo      |

### `updateTargetValidatorsLimits`

Actualiza el límite de los validadores que pueden ser utilizados para el depósito.

```solidity
function updateTargetValidatorsLimits(
    uint256 _stakingModuleId,
    uint256 _nodeOperatorId,
    bool _isTargetLimitActive,
    uint256 _targetLimit
) external;
```

### `updateRefundedValidatorsCount`

Actualiza el número de validadores reembolsados en el módulo de staking con el identificador del operador de nodo dado.

```solidity
function updateRefundedValidatorsCount(
	uint256 _stakingModuleId,
	uint256 _nodeOperatorId,
	uint256 _refundedValidatorsCount,
) external;
```

**Parámetros:**

| Nombre                     | Tipo      | Descripción                                                   |
| -------------------------- | --------- | ------------------------------------------------------------- |
| `_stakingModuleId`         | `uin256`  | id del módulo                                                 |
| `_nodeOperatorId`          | `uin256`  | id del operador de nodo                                       |
| `_refundedValidatorsCount` | `uint256` | nuevo número de validadores reembolsados del operador de nodo |

### `reportRewardsMinted`

Actualiza el número de validadores reembolsados en el módulo de staking con el identificador del operador de nodo dado.

```solidity
function reportRewardsMinted(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _totalShares,
) external;
```

**Parámetros:**

| Nombre              | Tipo       | Descripción                                                         |
| ------------------- | ---------- | ------------------------------------------------------------------- |
| `_stakingModuleIds` | `uin256[]` | lista de los ids reportados de los módulos de staking               |
| `_totalShares`      | `uin256[]` | total de participaciones emitidas para los módulos de staking dados |

### `updateExitedValidatorsCountByStakingModule`

Actualiza el número total de validadores salidos para los módulos de staking con los ids de módulo especificados.

```solidity
function reportRewardsMinted(
	uint256[] calldata _stakingModuleIds,
	uint256[] calldata _exitedValidatorsCounts,
) external;
```

**Parámetros:**

| Nombre                    | Tipo       | Descripción                                                                     |
| ------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `_stakingModuleIds`       | `uin256[]` | lista de los ids reportados de los módulos de staking                           |
| `_exitedValidatorsCounts` | `uin256[]` | nuevos conteos de validadores salidos para los módulos de staking especificados |

### `reportStakingModuleExitedValidatorsCountByNodeOperator`

Actualiza el conteo de validadores salidos por operador de nodo para el módulo de staking con el id especificado.

```solidity
function reportStakingModuleExitedValidatorsCountByNodeOperator(
	uint256 _stakingModuleId,
	bytes calldata _nodeOperatorIds,
	bytes calldata _exitedValidatorsCounts,
) external;
```

**Parámetros:**

| Nombre                    | Tipo     | Descripción                                                                     |
| ------------------------- | -------- | ------------------------------------------------------------------------------- |
| `_stakingModuleId`        | `uin256` | id del módulo de staking                                                        |
| `_nodeOperatorIds`        | `bytes`  | ids de los operadores de nodo                                                   |
| `_exitedValidatorsCounts` | `bytes`  | nuevos conteos de validadores salidos para los operadores de nodo especificados |

### `unsafeSetExitedValidatorsCount`

Establece el conteo de validadores salidos para el módulo y el operador de nodo dados en ese módulo sin realizar verificaciones críticas de seguridad, por ejemplo, que el conteo de validadores salidos no pueda disminuir.

```solidity
function unsafeSetExitedValidatorsCount(
	uint256 _stakingModuleId,
	bytes calldata _nodeOperatorIds,
	bool _triggerUpdateFinish,
	ValidatorsCountsCorrection memory _correction
) external;
```

donde `ValidatorsCountsCorrection` es una estructura como se muestra a continuación,

```solidity
struct ValidatorsCountsCorrection {
	/// @notice El número esperado actual de validadores salidos del módulo que se
	/// está corrigiendo.
	uint256 currentModuleExitedValidatorsCount;
	/// @notice El número esperado actual de validadores salidos del operador de nodo
	/// que se está corrigiendo.
	uint256 currentNodeOperatorExitedValidatorsCount;
	/// @notice El número esperado actual de validadores atascados del operador de nodo
	/// que se está corrigiendo.
	uint256 currentNodeOperatorStuckValidatorsCount;
	/// @notice El número corregido de validadores salidos del módulo.
	uint256 newModuleExitedValidatorsCount;
	/// @notice El número corregido de validadores salidos del operador de nodo.
	uint256 newNodeOperatorExitedValidatorsCount;
	/// @notice El número corregido de validadores atascados del operador de nodo.
	uint256 newNodeOperatorStuckValidatorsCount;
}
```

**Parámetros:**

| Nombre                 | Tipo                         | Descripción                                                                                                      |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `_stakingModuleId`     | `uin256`                     | id del módulo de staking                                                                                         |
| `_nodeOperatorIds`     | `bytes`                      | ids de los operadores de nodo                                                                                    |
| `_triggerUpdateFinish` | `bool`                       | bandera para llamar a `onExitedAndStuckValidatorsCountsUpdated` en el módulo después de aplicar las correcciones |
| `_correction`          | `ValidatorsCountsCorrection` | detalles de la corrección                                                                                        |

### `reportStakingModuleStuckValidatorsCountByNodeOperator`

Actualiza el conteo de validadores atascados por operador de nodo para el módulo de staking con el id especificado.

```solidity
function reportStakingModuleStuckValidatorsCountByNodeOperator(
	uint256 _stakingModuleId,
	bytes calldata _nodeOperatorIds,
	bytes calldata _stuckValidatorsCounts,
) external;
```

**Parámetros:**

| Nombre                   | Tipo     | Descripción                                                                       |
| ------------------------ | -------- | --------------------------------------------------------------------------------- |
| `_stakingModuleId`       | `uin256` | id del módulo de staking                                                          |
| `_nodeOperatorIds`       | `bytes`  | ids de los operadores de nodo                                                     |
| `_stuckValidatorsCounts` | `bytes`  | nuevos conteos de validadores atascados para los operadores de nodo especificados |

### `onValidatorsCountsByNodeOperatorReportingFinished`

Gancho posterior al reporte llamado por el oráculo cuando finaliza la segunda fase de reporte de datos, es decir, cuando el oráculo ha enviado los datos completos sobre los conteos de validadores atascados y salidos por operador de nodo para el marco de reporte actual.

```solidity
function onValidatorsCountsByNodeOperatorReportingFinished() external;
```
