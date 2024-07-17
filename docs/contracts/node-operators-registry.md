# NodeOperatorsRegistry

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)
- [Contrato Desplegado](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5)

El contrato `NodeOperatorsRegistry` actúa como un registro de Operadores de Nodos seleccionados por Lido DAO.
Desde la [actualización Lido V2](https://blog.lido.fi/introducing-lido-v2/), el contrato `NodeOperatorsRegistry` se convirtió en un módulo de [`StakingRouter`](./staking-router.md) y recibió el segundo nombre **Módulo de Stakeo Curado** como parte de la infraestructura general de stakeo de Lido. Como módulo de stakeo, `NodeOperatorsRegistry` implementa la [interfaz StakingModule](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol).

`NodeOperatorsRegistry` mantiene diversos datos de los Operadores de Nodos, en particular límites del stake permitido, direcciones de recompensa, información de penalización, claves públicas de los validadores de los Operadores de Nodos. Define el orden en el que los Operadores de Nodos reciben el ether depositado y la distribución de recompensas entre los operadores de nodos.

Un operador de nodo curado está obligado por Lido DAO a retirar sus validadores puntualmente si así lo solicita el protocolo de Lido. La solicitud de salida se forma en cadena mediante el contrato [`ValidatorsExitBusOracle`](./validators-exit-bus-oracle.md). Si un Operador de Nodo no cumple con la solicitud a tiempo, podría ser penalizado. El estado penalizado se asigna automáticamente por el protocolo de Lido. Los Operadores de Nodo penalizados no reciben nuevo ether para nuevos depósitos y también reciben la mitad de sus recompensas hasta que se levante la penalización. La otra mitad de las recompensas del Operador de Nodo se distribuye entre todos los poseedores de stETH (técnicamente, se quema). Para levantar la penalización, el Operador de Nodo debe retirar los validadores bloqueados o reembolsar la cantidad de ether correspondiente y esperar `getStuckPenaltyDelay()` segundos después de eso.

Lido DAO también puede:

- establecer el límite objetivo como el número de validadores para el Operador de Nodo. Si el número actual de validadores activos es inferior al valor, se solicitará la salida de los excedentes de manera priorizada cuando sea necesario [finalizar las solicitudes de retiro](/docs/contracts/withdrawal-queue-erc721.md#finalization). La asignación de depósitos por encima del valor objetivo está prohibida.
- desactivar operadores mal comportados mediante `deactivateNodeOperator()`. Un operador de nodo desactivado no recibe recompensas ni nuevos depósitos.

## Glosario

:::note
En el contexto de estos términos, "clave de firma", "clave", "clave de validador", "validador" pueden usarse indistintamente.
:::

**clave de firma**. Clave pública BLS12-381 que será utilizada por el protocolo para realizar depósitos de Beacon para [ejecutar un validador](/docs/guías/node-operators/validator-keys.md#generación-de-claves-de-firma).

**verificado** (clave de firma). Aprobado por Lido DAO para recibir ether para el depósito.

**presentado** (clave de firma). Agregado al registro de operadores de nodo.

**depositable** (clave de firma). Apto para nuevos depósitos.

**depositado** (clave de firma). Recibió depósito en algún momento.

**no utilizado** (clave de firma). Presentado pero aún no depositado.

**salido** (clave de firma). Un validador que ha alcanzado el estado "Salido": ya sea por [salida voluntaria](https://lighthouse-book.sigmaprime.io/voluntary-exit.html) o como resultado de una sanción. [Este documento](https://www.attestant.io/posts/understanding-the-validator-lifecycle/) puede ser útil con respecto al ciclo de vida de los validadores.

**usado (activo)** (clave de firma). Depositado pero aún no salido.

**bloqueado** (validador). No salido a tiempo adecuadamente después de una solicitud de salida de [`ValidatorsExitBusOracle`](./validators-exit-bus-oracle.md) por parte del protocolo Lido.

**reembolsado** (validador bloqueado). Compensado por el Operador de Nodo por estar bloqueado. Para obtener más información sobre el manejo de mal comportamiento de los Operadores de Nodos, consulte [Política de Recompensas a Propositores de Bloques de Ethereum de Lido v1.0](https://snapshot.org/#/lido-snapshot.eth/proposal/0x3b1e5f9960e682abdc25c86624ad13acb88ee1cea18db9be99379b44750c7b36).

## Parámetros del Operador de Nodo

Para cada Operador de Nodo, el contrato mantiene al menos estos valores:

- `active: bool` estado activo/inactivo del Operador de Nodo. Un Operador de Nodo activo recibe recompensas y nuevos depósitos según su límite de stakeo. Los nuevos operadores de nodo se agregan en estado activo.
- `name: string` nombre legible por humanos del Operador de Nodo
- `rewardAddress: address` dónde enviar las recompensas de stETH (parte de la tarifa del protocolo)
- `totalVettedValidators: uint64` número máximo de claves de validadores aprobados para depósito por el DAO hasta ahora
- `totalExitedValidators: uint64` contador incremental de todos los validadores que han salido hasta ahora para el Operador de Nodo
- `totalAddedValidators: uint64` contador incremental de todos los validadores agregados al Operador de Nodo hasta ahora
- `totalDepositedValidators: uint64` contador incremental de todos los validadores depositados para el Operador de Nodo hasta ahora
- `targetValidatorsCount: uint256` valor objetivo para el número de validadores del Operador de Nodo. Si el número actual de validadores activos está por debajo del valor, se solicitará la salida de los excedentes. La asignación de depósitos por encima del valor objetivo está prohibida. La salida funciona solo si `isTargetLimitActive` es verdadero. El valor `0` causará solicitudes de salida para todos los validadores depositados del Operador de Nodo.
- `isTargetLimitActive: bool` indicador si el número de validadores del Operador de Nodo está limitado por objetivo (ver `targetValidatorsCount`)
- `stuckValidatorsCount: uint256` número de claves bloqueadas entregadas por el informe del oráculo
- `refundedValidatorsCount: uint256` número de validadores reembolsados
- `depositableValidatorsCount: uint256` número de validadores depositables

Los valores pueden ser vistos mediante `getNodeOperator()` y `getNodeOperatorSummary()`.

Excepto por las funciones listadas a continuación, el contrato tiene métodos accesibles solo por [`StakingRouter`](./staking-router.md)
(titular de `STAKING_ROUTER_ROLE`). Estas funciones son llamadas internamente durante el curso de
[Informe de AccountingOracle](./accounting-oracle.md).

## Métodos de Vista

### getRewardsDistribution()

Devuelve la distribución de recompensas proporcional al stake efectivo para cada operador de nodo

```sol
function getRewardsDistribution(uint256 _totalRewardShares) returns (
  address[] recipients,
  uint256[] shares,
  bool[] penalized
)
```

| Nombre                | Tipo      | Descripción                                 |
| --------------------- | --------- | ------------------------------------------- |
| `_totalRewardShares`  | `uint256` | Cantidad total de shares de recompensa para distribuir |

### getActiveNodeOperatorsCount()

Devuelve el número de operadores de nodo activos.

```sol
function getActiveNodeOperatorsCount() returns (uint256)
```

### getNodeOperator()

Devuelve el operador de nodo por su id.

```sol
function getNodeOperator(uint256 _nodeOperatorId, bool _fullInfo) returns (
    bool active,
    string name,
    address rewardAddress,
    uint64 totalVettedValidators,
    uint64 totalExitedValidators,
    uint64 totalAddedValidators,
    uint64 totalDepositedValidators
)
```

| Nombre               | Tipo      | Descripción                            |
| -------------------- | --------- | -------------------------------------- |
| `_nodeOperatorId`    | `uint256` | Id del operador de nodo                |
| `_fullInfo`          | `bool`    | Si es verdadero, también se devolverá el nombre |

### getTotalSigningKeyCount()

Devuelve el

 número total de claves de firma del operador de nodo.

```sol
function getTotalSigningKeyCount(uint256 _nodeOperatorId) returns (uint256)
```

| Nombre               | Tipo      | Descripción      |
| -------------------- | --------- | ---------------- |
| `_nodeOperatorId`    | `uint256` | Id del operador de nodo |

### getUnusedSigningKeyCount()

Devuelve el número de claves de firma utilizables del operador de nodo.

```sol
function getUnusedSigningKeyCount(uint256 _nodeOperatorId) returns (uint256)
```

| Nombre               | Tipo      | Descripción      |
| -------------------- | --------- | ---------------- |
| `_nodeOperatorId`    | `uint256` | Id del operador de nodo |

### getSigningKey()

Devuelve la n-ésima clave de firma del operador de nodo.

```sol
function getSigningKey(uint256 _nodeOperatorId, uint256 _index) returns (
    bytes key,
    bytes depositSignature,
    bool used
)
```

| Nombre               | Tipo      | Descripción                       |
| -------------------- | --------- | --------------------------------- |
| `_nodeOperatorId`    | `uint256` | Id del operador de nodo           |
| `_index`             | `uint256` | Índice de la clave, comenzando en 0 |

Devuelve:

| Nombre               | Tipo    | Descripción                                           |
| -------------------- | ------- | ----------------------------------------------------- |
| `key`                | `bytes` | Clave                                                 |
| `depositSignature`   | `bytes` | Firma necesaria para una llamada `depositContract.deposit` |
| `used`               | `bool`  | Indicación si la clave fue utilizada en el stakeo     |

### getSigningKeys()

Devuelve un subconjunto de las claves de firma del operador de nodo correspondiente al rango especificado `[ _offset, _offset + _limit)`.
Si el rango está fuera del límite `[0, <número total de claves>)` revierte con error `OUT_OF_RANGE`.

```sol
function getSigningKeys(uint256 _nodeOperatorId, uint256 _offset, uint256 _limit) returns (
    bytes memory pubkeys,
    bytes memory signatures,
    bool[] memory used
)
```

| Nombre               | Tipo      | Descripción                                                                                 |
| -------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `_nodeOperatorId`    | `uint256` | Id del operador de nodo                                                                      |
| `_offset`            | `uint256` | Desplazamiento de la clave en el conjunto de todas las claves del operador de nodo (`0` significa la primera clave, `1` la segunda, etc.) |
| `_limit`             | `uint256` | Número de claves a devolver                                                                  |

Devuelve:

| Nombre               | Tipo     | Descripción                                                                                                |
| -------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `pubkeys`            | `bytes`  | Claves concatenadas en el conjunto de bytes: `[ 48 bytes key \| 48 bytes key \| ... ]`                          |
| `signatures`         | `bytes`  | Firmas necesarias para una llamada `deposit_contract.deposit`, concatenadas como `[ 96 bytes \| 96 bytes \| ... ]` |
| `used`               | `bool[]` | Array de indicadores de si la clave fue utilizada en el stakeo                                                |

### getNodeOperatorsCount()

Devuelve el número total de operadores de nodo.

```sol
function getNodeOperatorsCount() returns (uint256)
```
### getNonce()

Devuelve un contador que se incrementa cada vez que cambia el conjunto de datos de depósito. Específicamente, se incrementa cada vez que para un operador de nodo:


- cambia el límite de participación;
- cambia el límite de validadores objetivo;
- cambia el número de validadores bloqueados;
- cambia el número de validadores que han salido;
- se añaden/eliminan claves de firma de validador;
- se elimina la penalización;
- se invalidan las claves listas para depositar (debido a un cambio en las credenciales de retiro o por invalidez manual mediante la llamada a `invalidateReadyToDepositKeysRange`);
- se deposita ether.

```sol
function getNonce() view returns (uint256)
```

### getType()

Devuelve el tipo del módulo de participación.

```sol
function getType() view returns (bytes32)
```

### getStakingModuleSummary()

Devuelve algunas estadísticas del módulo de participación.

```sol
function getStakingModuleSummary() view returns (
    uint256 totalExitedValidators,
    uint256 totalDepositedValidators,
    uint256 depositableValidatorsCount
)
```

| Nombre                        | Tipo      | Descripción                                         |
| ----------------------------- | --------- | --------------------------------------------------- |
| `totalExitedValidators`       | `uint256` | Número total de validadores que han salido          |
| `totalDepositedValidators`    | `uint256` | Número total de validadores depositados            |
| `depositableValidatorsCount`  | `uint256` | Número de validadores que pueden ser depositados   |

### getNodeOperatorIsActive()

Devuelve si el operador de nodo con el ID dado está activo.

```sol
function getNodeOperatorIsActive(uint256 _nodeOperatorId) view returns (bool)
```

| Nombre               | Tipo      | Descripción             |
| -------------------- | --------- | ----------------------- |
| `_nodeOperatorId`    | `uint256` | ID del operador de nodo |

### getNodeOperatorIds()

Devuelve hasta `_limit` IDs de operadores de nodo comenzando desde `_offset`.

```sol
function getNodeOperatorIds(uint256 _offset, uint256 _limit) view
    returns (uint256[] memory nodeOperatorIds)
```

| Nombre       | Tipo      | Descripción                              |
| ------------ | --------- | ---------------------------------------- |
| `_offset`    | `uint256` | Desplazamiento del primer elemento del rango |
| `_limit`     | `uint256` | Máximo número de IDs de operadores de nodo a devolver |

### getNodeOperatorSummary()

Devuelve algunas estadísticas del operador de nodo.

```sol
function getNodeOperatorSummary(uint256 _nodeOperatorId) view returns (
    bool isTargetLimitActive,
    uint256 targetValidatorsCount,
    uint256 stuckValidatorsCount,
    uint256 refundedValidatorsCount,
    uint256 stuckPenaltyEndTimestamp,
    uint256 totalExitedValidators,
    uint256 totalDepositedValidators,
    uint256 depositableValidatorsCount
)
```

| Nombre                        | Tipo      | Descripción                                                                                      |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `isTargetLimitActive`         | `bool`    | Indica si está activo el límite de validadores objetivo para el operador de nodo                 |
| `targetValidatorsCount`       | `uint256` | Número objetivo de validadores, para una descripción completa ver [sección de parámetros](#parámetros-del-operador-de-nodo) |
| `stuckValidatorsCount`        | `uint256` | Número de claves bloqueadas según el informe del oráculo                                            |
| `refundedValidatorsCount`     | `uint256` | Número de claves reembolsadas                                                                       |
| `stuckPenaltyEndTimestamp`    | `uint256` | Tiempo de penalización adicional después de que se reembolsen las claves bloqueadas                |
| `totalExitedValidators`       | `uint256` | Número de claves en estado `EXITED` del operador de nodo a lo largo del tiempo                       |
| `totalDepositedValidators`    | `uint256` | Número de claves del operador de nodo que estuvieron en estado `DEPOSITED` a lo largo del tiempo    |
| `depositableValidatorsCount`  | `uint256` | Número de validadores que pueden ser depositados                                                     |

### getStuckPenaltyDelay()

Devuelve el valor del retraso de penalización por bloqueo (en segundos). Este parámetro define cuánto tiempo permanece un operador de nodo penalizado en estado de penalización después de que se reembolsen las claves bloqueadas.

```sol
function getStuckPenaltyDelay() view returns (uint256)
```

### isOperatorPenalized()

Devuelve un indicador de si el operador de nodo está penalizado.

```sol
function isOperatorPenalized(uint256 _nodeOperatorId) view returns (bool)
```

### isOperatorPenaltyCleared()

Devuelve un indicador de si la penalización del operador de nodo ha sido eliminada.

```sol
function isOperatorPenaltyCleared(uint256 _nodeOperatorId) view returns (bool)
```

### getLocator()

Devuelve la dirección de [`LidoLocator`](./lido-locator.md).

```sol
function getLocator() view returns (ILidoLocator)
```

## Métodos

### addNodeOperator()

Agrega un operador de nodo llamado `_name` con la dirección de recompensas `_rewardAddress` y límite de participación = 0.

Ejecutado en nombre del poseedor del rol `MANAGE_NODE_OPERATOR_ROLE`.

```sol
function addNodeOperator(
  string _name,
  address _rewardAddress
) returns (uint256 id)
```

| Nombre             | Tipo      | Descripción                                            |
| ------------------ | --------- | ------------------------------------------------------ |
| `_name`            | `string`  | Nombre legible por humanos                             |
| `_rewardAddress`   | `address` | Dirección que recibe las recompensas de stETH para este operador |

Devuelve:

| Nombre | Tipo      | Descripción                        |
| ------ | --------- | ---------------------------------- |
| `id`   | `uint256` | Clave única del operador agregado  |

### activateNodeOperator()

Activa un operador de nodo desactivado con el ID dado.

Ejecutado en nombre del poseedor del rol `MANAGE_NODE_OPERATOR_ROLE`.

:::note
Incrementa el nonce de las claves de los validadores
:::

```sol
function activateNodeOperator(uint256 _nodeOperatorId)
```

| Nombre              | Tipo      | Descripción      |
| ------------------- | --------- | ---------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo |

### deactivateNodeOperator()

Desactiva un operador de nodo activo con el ID dado.

Ejecutado en nombre del poseedor del rol `MANAGE_NODE_OPERATOR_ROLE`.

:::note
Incrementa el nonce de las claves de los validadores
:::

```sol
function deactivateNodeOperator(uint256 _nodeOperatorId)
```

| Nombre              | Tipo      | Descripción      |
| ------------------- | --------- | ---------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo |

### setNodeOperatorName()

Cambia el nombre legible por humanos del operador de nodo con el ID proporcionado.

Ejecutado en nombre del titular del rol `MANAGE_NODE_OPERATOR_ROLE`.

```sol
function setNodeOperatorName(uint256 _nodeOperatorId, string _name)
```

| Nombre              | Tipo      | Descripción           |
| ------------------- | --------- | --------------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo |
| `_name`             | `string`  | Nombre legible por humanos |

### setNodeOperatorRewardAddress()

Cambia la dirección de recompensa del operador de nodo con el ID proporcionado.

Ejecutado en nombre del titular del rol `MANAGE_NODE_OPERATOR_ROLE`.

```sol
function setNodeOperatorRewardAddress(uint256 _nodeOperatorId, address _rewardAddress)
```

| Nombre              | Tipo      | Descripción         |
| ------------------- | --------- | ------------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo |
| `_rewardAddress`    | `address` | Nueva dirección de recompensa |

### setNodeOperatorStakingLimit()

Establece el número máximo de validadores para apostar para el operador de nodo con el ID proporcionado.

Ejecutado en nombre del titular del rol `SET_NODE_OPERATOR_LIMIT_ROLE`.

:::note
La implementación actual preserva la invariante:
`depositedSigningKeysCount <= vettedSigningKeysCount <= totalSigningKeysCount`.
Si `_vettedSigningKeysCount` está fuera del rango `[depositedSigningKeysCount, totalSigningKeysCount]`,
el nuevo valor de vettedSigningKeysCount se establecerá en el borde de rango más cercano.
:::

:::note
Incrementa el nonce de las claves de los validadores
:::

```sol
function setNodeOperatorStakingLimit(uint256 _nodeOperatorId, uint64 _vettedSigningKeysCount)
```

| Nombre                      | Tipo      | Descripción                               |
| --------------------------- | --------- | ----------------------------------------- |
| `_nodeOperatorId`           | `uint256` | ID del operador de nodo para establecer el límite de participación |
| `_vettedSigningKeysCount`   | `address` | Nuevo límite de participación del operador de nodo |

### addSigningKeys()

Añade `_keysCount` claves de firma de validadores a las claves del operador de nodo `_nodeOperatorId`.

Puede ser ejecutado para el operador de nodo dado si se llama desde la dirección de recompensa del operador de nodo o por el titular del rol `MANAGE_SIGNING_KEYS`.

:::note
Junto con cada clave `pubkey` deben proporcionarse las firmas para el mensaje `(pubkey, withdrawal_credentials, 32000000000)`. Para más detalles, consulta la [sección de claves en la guía de NO].

Dada esa información, el contrato podrá llamar a `deposit_contract.deposit` en cadena.
:::

:::note
Incrementa el nonce de las claves de los validadores
:::

```sol
function addSigningKeys(
  uint256 _nodeOperatorId,
  uint256 _keysCount,
  bytes _publicKeys,
  bytes _signatures
)
```

| Nombre              | Tipo      | Descripción                                                                                                                                    |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo                                                                                                                        |
| `_keysCount`        | `uint256` | Número de claves de firma proporcionadas                                                                                                        |
| `_publicKeys`       | `bytes`   | Varias claves públicas de firma de validadores concatenadas                                                                                     |
| `_signatures`       | `bytes`   | Varias firmas concatenadas para los mensajes del contrato de depósito, consulta la [sección de claves en la guía de NO] |

[sección de claves en la guía de NO]: /guías/node-operators/validator-keys.md#generación-de-claves-de-firma

### removeSigningKeys()

Elimina `_keysCount` claves de firma de validadores comenzando desde `_fromIndex` de las claves utilizables del operador `_nodeOperatorId`.

Puede ser ejecutado para el operador de nodo dado si se llama desde la dirección de recompensa del operador de nodo o por el titular del rol `MANAGE_SIGNING_KEYS`.

Las claves se eliminan desde el último índice al más alto, por lo que no saldremos del arreglo.

:::note
Incrementa el nonce de las claves de los validadores
:::

```sol
function removeSigningKeys(uint256 _nodeOperatorId, uint256 _fromIndex, uint256 _keysCount)
```

| Nombre              | Tipo      | Descripción                       |
| ------------------- | --------- | --------------------------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo          |
| `_fromIndex`        | `uint256` | Índice de la clave, comenzando desde 0 |
| `_keysCount`        | `uint256` | Número de claves a eliminar      |

### invalidateReadyToDepositKeysRange()

Invalida todas las claves de validadores no utilizadas para los operadores de nodo en el rango dado.
Ejecutado en nombre del titular del rol `MANAGE_NODE_OPERATOR_ROLE`.

```sol
function invalidateReadyToDepositKeysRange(uint256 _indexFrom, uint256 _indexTo)
```

| Nombre         | Tipo      | Descripción                                                  |
| -------------- | --------- | ------------------------------------------------------------ |
| `_indexFrom`   | `uint256` | Primer índice (inclusive) del NO para invalidar las claves    |
| `_indexTo`     | `uint256` | Último índice (inclusive) del NO para invalidar las claves    |

### clearNodeOperatorPenalty()

Elimina el estado de penalización para el operador de nodo si es adecuado para eliminarlo.
El estado de penalización se cambia automáticamente mediante el informe del oráculo si se cumplen las condiciones
(por ejemplo, si expiró el retraso de penalización), pero esta función permite que ocurra más rápido.
Puede ser llamado por cualquier persona.

```sol
function clearNodeOperatorPenalty(uint256 _nodeOperatorId) external returns (bool)
```

| Nombre              | Tipo      | Descripción         |
| ------------------- | --------- | ------------------- |
| `_nodeOperatorId`   | `uint256` | ID del operador de nodo |

### setStuckPenaltyDelay()

Establece el parámetro de retraso de penalización por bloqueo.

Agrega un operador de nodo con el nombre `_name`, la dirección de recompensa `_rewardAddress` y el límite de participación = 0.
Ejecutado en nombre del titular del rol `MANAGE_NODE_OPERATOR_ROLE`.

```sol
function setStuckPenaltyDelay(uint256 _delay)
```

| Nombre     | Tipo      | Descripción                    |
| ---------- | --------- | ------------------------------ |
| `_delay`   | `uint256` | Retraso de penalización por bloqueo en segundos |
