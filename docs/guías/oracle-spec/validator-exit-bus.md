## Autobús de Salida de Validadores: Explicación Detallada

El **Autobús de Salida de Validadores Oracle** es un mecanismo dentro del protocolo Lido responsable de solicitar la salida de validadores para cubrir los retiros de los usuarios cuando el protocolo necesita fondos adicionales. Este documento describe paso a paso el proceso para calcular y ejecutar las salidas de los validadores.

### Pasos para el Cálculo del Informe

1. **Calcular la cantidad de retiros a cubrir con ether.**
2. **Calcular la predicción de recompensas en ether por época.**
3. **Calcular la época de retiro para el próximo validador elegible para salir y cubrir las solicitudes de retiro si es necesario.**
4. **Preparar la cola de orden de salida de validadores.**
5. **Recorrer la cola hasta que los saldos de los validadores salientes cubran todas las solicitudes de retiro (considerando el saldo final predicho de cada validador).**

### Algoritmo para el Próximo Validador en Salir

El algoritmo para la salida de validadores se basa en el [algoritmo descrito en el foro de investigación](https://research.lido.fi/t/withdrawals-on-validator-exiting-order/3048#combined-approach-17).

El algoritmo supone corregir el número futuro de validadores para cada Operador de Nodo. Supongamos que los validadores y depósitos en proceso de uno de los Operadores de Nodo se representan de la siguiente manera, donde los validadores están ordenados por sus índices:

![VEBO 1](../../../static/img/oracle-spec/vebo-1.png)

El algoritmo asume que los validadores más antiguos salen primero. Por lo tanto, los validadores previamente solicitados se pueden separar para salir sabiendo el índice del último solicitado.

![VEBO 2](../../../static/img/oracle-spec/vebo-2.png)

Cabe destacar que cada validador tiene un estado. Algunos validadores pueden estar castigados o haber salido sin una solicitud del protocolo:

![VEBO 3](../../../static/img/oracle-spec/vebo-3.png)

Entre todos los validadores, los proyectados son el punto de interés. Incluyen todos los validadores activos y depósitos en proceso, pero excluyen los validadores cuyo `exit_epoch != FAR_FUTURE_EPOCH` y aquellos validadores que fueron solicitados para salir.

![VEBO 4](../../../static/img/oracle-spec/vebo-4.png)

Unas horas después, podría verse de la siguiente manera:
![VEBO 5](../../../static/img/oracle-spec/vebo-5.png)

Nota que el algoritmo descrito está buscando un validador para salir solo entre aquellos que pueden salir, mientras usa el número proyectado de validadores, que incluye validadores aún no existentes. Son solo ponderaciones, por lo que no hay malentendidos aquí.

### Secuencia de Predicados para el Orden de Salida

1. Validador cuyo operador tenga el menor número de validadores retrasados.
2. Validador cuyo operador tenga el mayor número de validadores objetivo para salir.
3. Validador cuyo operador tenga el mayor peso de participación.
4. Validador cuyo operador tenga el mayor número de validadores.
5. Validador con el índice más bajo.

### Obtener Información para Preparar la Cola Ordenada

Para preparar una cola de validadores para salir, se involucran las siguientes acciones y consideraciones:

- El número máximo de validadores que pueden ser solicitados para salir en un informe.
- Porcentaje de penetración en la red del operador: solo si la participación del operador es mayor al 1%.
- Validadores 'exiteables' de Lido.
- Obtener estadísticas de los operadores de nodos para ordenar los validadores exiteables.
- Total de validadores predecibles.
- Índices de los últimos validadores solicitados.

### Límites del Informe

- `maxValidatorExitRequestsPerReport`: número máximo de solicitudes de salida permitidas en el informe al `ValidatorsExitBusOracle` desde `OracleReportSanityChecker.getOracleReportLimits()`.
- `VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS`: un parámetro del contrato `OracleDaemonConfig` usado para calcular los validadores que van a salir.
- `NODE_OPERATOR_NETWORK_PENETRATION_THRESHOLD_BP`: un parámetro del `OracleDaemonConfig` que se tiene en cuenta al determinar la penetración del operador en la red.

### Obtener Validadores Exiteables

Un validador es 'exiteable' si NO se cumplen estrictamente dos condiciones:

- `validator.exit_epoch != FAR_FUTURE_EPOCH` y
- `validator.index <= last_requested_to_exit_index`.

### Estadísticas del Operador de Nodo

Estadísticas para cada operador de nodo, necesarias para ordenar sus validadores en orden de salida:

- Número de validadores que aún no están en CL.
- Validadores que están en CL y aún no han sido solicitados para salir y no están en salida.
- Validadores que están en CL y se han solicitado para salir pero no están en salida y no se han solicitado para salir recientemente.
- Número objetivo de validadores.
- Comprueba si la bandera de límite de objetivo está habilitada.

NB: Un validador no puede considerarse retrasado si se solicitó su salida en los últimos `VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS` slots.

### Índices de los Últimos Validadores Solicitados

El contrato [`ValidatorsExitBusOracle`](../../contracts/validators-exit-bus-oracle.md) almacena el índice del último validador que se solicitó para salir. Dado que los validadores se solicitan en un orden estricto desde el `validatorIndex` más bajo hasta el más alto, los índices ayudan a encontrar todos los validadores solicitados previamente sin necesidad de obtener todos los eventos.

Devuelve los índices de los últimos validadores que se solicitaron para salir para los `operator_indexes` dados en el `module` dado. Para los operadores de nodo que nunca solicitaron la salida de ningún validador, el índice se establece en `-1`.

```solidity
ValidatorsExitBusOracle.getLastRequestedValidatorIndices(
    uint256 moduleId,
    uint256[] nodeOpIds
): int256[]
```

### Recopilación de Estado

Para encontrar los próximos validadores que saldrán, el Autobús de Salida de Validadores Oracle recopila el siguiente estado tanto de las capas de Consenso de Ethereum como de Ejecución.

- Del contrato [OracleDaemonConfig](/contracts/oracle-daemon-config):
  - PREDICTION_DURATION_IN_SLOTS
  - VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS
- De la [Cola de Retiros](/contracts/withdrawal-queue-erc721):
  - Obtener la cantidad total de solicitudes de retiro no finalizadas
- Del contrato [Lido](/contracts/lido):
  - Balance reciente postCL/preCL y retiros de las recompensas de la Capa de Ejecución y de los cofres de retiro a través de eventos
- Del nodo de la Capa de Consenso:
  - Todos los validadores y sus estados en el slot de referencia
- Del [Staking Router](/contracts/staking-router):
  - Claves públicas de todos los validadores de Lido
  - Índices del último validador solicitado para salir para cada Operador de Nodo
  - Estadísticas de claves de validadores para cada Operador de Nodo
- Del contrato Oracle:
  - Número máximo de solicitudes de salida para el marco actual
  - Claves públicas solicitadas recientemente a través del Autobús de Salida

### Obtener Datos

#### Obtener la Cantidad de Solicitudes de Retiro de stETH No Cubiertas

Recopila la cantidad de stETH en la cola aún por finalizar de `WithdrawalQueue.unfinalizedStETH()`

#### Calcular la Velocidad Promedio de Recompensas por Época

Obtiene los eventos `ETHDistributed` y `TokenRebased` del contrato [`Lido`](../../contracts/lido) y calcula la cantidad promedio de recompensas por época. El período de predicción de recompensas se obtiene del contrato [OracleDaemonConfig](/contracts/oracle-daemon-config).

Para obtener eventos en el pasado, abordando los casos donde puede haber slots con bloque perdido, se introduce el siguiente esquema:

![VEBO 6](../../../static/img/oracle-spec/vebo-6.png)

- Obtener el valor `PREDICTION_DURATION_IN_SLOTS` del contrato [OracleDaemonConfig](/contracts/oracle-daemon-config).
- Obtener eventos `TokenRebased` de Lido.
- Obtener eventos `ETHDistributed` de Lido.
- Agrupar esos eventos por hash de transacción.
- Recopilar de los eventos:
  - `total_rewards` como `postCLBalance + withdrawalsWithdrawn - preCLBalance executionLayerRewardsWithdrawn`.
  - `time_spent` como suma de `timeElapsed` de cada evento.
- Calcular `rewards_speed_per_epoch` como `max(total_rewards * chain_configs.seconds_per_slot * chain_configs.slots_per_epoch // time_spent, 0)`.

#### Calcular las Épocas Necesarias para el Barrido

##### Predicción Promedio del Barrido

Predice las épocas promedio del ciclo de barrido. En la especificación: [get expected withdrawals](https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/beacon-chain.md#new-get_expected_withdrawals), [process withdrawals](https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/beacon-chain.md#new-process_withdrawals).

##### Validadores retirables

- Verifica si `validator` tiene las credenciales de retiro "eth1" con prefijo 0x01, y
- Verifica si `validator` es parcialmente retirable, o
- Verifica si `validator` es completamente retirable

#### Predicción del ether disponible antes del próximo retiro

Para estimar la cantidad necesaria para cubrir completamente las solicitudes de retiro no finalizadas, se calculan los siguientes valores:

- **Recompensas futuras**
- **Cantidad futura de retiros**
- **Saldo total disponible**
- **Suma acumulativa de los validadores a expulsar**
- **Balance que se va a retirar**

Para calcular las **recompensas futuras**, es necesario [predecir](https://github.com/lidofinance/lido-oracle/blob/master/src/modules/ejector/ejector.py#L244) un epoch en el cual todos los validadores en la cola y `validators_to_eject` serán retirados:

1. Calcula el número de epoch de salida más reciente y la cantidad de validadores que están saliendo en este epoch.
2. Si la cola está vacía, el epoch de salida se calculará como `epoch actual + MAX_SEED_LOOK AHEAD + 1`. La constante **MAX_SEED_LOOKAHEAD** ayuda a mitigar algunos ataques, más detalles [aquí](https://eth2book.info/bellatrix/part3/config/preset/#max_seed_lookahead).
3. Calcula el **límite de churn** - similar a un límite de velocidad en los cambios al conjunto de validadores. El mínimo es de 4 validadores por epoch y se recalcula cada `CHURN_LIMIT_QUOTIENT = 2**16`. Por ejemplo, cuando el número de validadores activos alcanza hasta 327,680, el límite de churn aumenta a 5, [especificación](https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/beacon-chain.md#get_validator_churn_limit).
4. Calcula la capacidad de slots para la salida:

```python
remain_exits_capacity_for_epoch = churn_limit - (cantidad de validadores que están saliendo en este epoch)
```

5. Calcula el epoch para retirar todos los `validators_to_eject_count`:

```python
epochs_required_to_exit_validators = (validators_to_eject_count - remain_exits_capacity_for_epoch) // churn_limit + 1
```

6. Entonces el epoch predecible para retirar:

```python
withdrawal_epoch = max_exit_epoch_number + epochs_required_to_exit_validators + MIN_VALIDATOR_WITHDRAWABILITY_DELAY
```

MIN_VALIDATOR_WITHDRAWABILITY_DELAY [aquí](https://eth2book.info/altair/part3/config/configuration#min_validator_withdrawability_delay)

Ahora podemos calcular la cantidad (y el número de validadores) necesarios para cubrir completamente la cantidad de solicitudes de retiro no finalizadas en la cola de retirada.

#### Calcular el saldo esperado a retirar

##### Recompensas futuras

```python
future_rewards = (withdrawal_epoch + epochs_to_sweep - blockstamp.ref_epoch) * rewards_speed_per_epoch
```

##### Cantidad futura de retiros

Obtener el saldo total de los validadores que pueden ser retirados completamente.

##### Saldo total disponible

Obtén el saldo total como suma de:

- `Lido.getBufferedEther()` +
- Saldo de `elRewardsVault` +
- Saldo de `withdrawalVault`

##### Suma acumulativa de los validadores a expulsar

Obtén el saldo del próximo validador en la cola de salida.

##### Validadores que van a salir

Recupera eventos `ValidatorExitRequest` emitidos recientemente del contrato `ValidatorsExitBusOracle` y extrae claves públicas de ellos. La configuración de timeout diferido se obtiene del contrato `OracleDaemonConfig`.

Validadores que han solicitado salir, pero no han enviado un mensaje de salida:

- Si el epoch de activación no es lo suficientemente antiguo para iniciar la salida.
- Si el operador del nodo no tuvo suficiente tiempo para enviar el mensaje de salida (VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS).

Para obtener los validadores, el oráculo calcula:

- `lido_validators_by_operator` - Recupera todas las claves Lido utilizadas desde [Keys API](https://github.com/lidofinance/lido-keys-api) + Recupera todos los validadores en el slot de referencia y los fusiona con las claves.
- `ejected_indexes` - Obtiene los operadores con los últimos índices de validadores que han salido de todos los módulos de estaca y operadores de nodos mediante `ValidatorsExitBusOracle.getLastRequestedValidatorIndices(module_id, uint256[] nodeOpIds)`.
- `recent_pubkeys` - Obtiene las últimas claves públicas solicitadas para salir del evento `ValidatorExitRequest`.

Para cada `lido_validators_by_operator`, el oráculo intenta encontrar **validadores no salidos**:

- Si no `validator_asked_to_exit` -> devuelve Falso.
- Si `is_on_exit` -> devuelve Falso.
- Si `validator_recently_asked_to_exit` -> devuelve **Verdadero**.
- Si no `validator_eligible_to_exit` -> devuelve **Verdadero**.
- De lo contrario, devuelve Falso.

El oráculo calcula `going_to_withdraw_balance` para todos los **validadores no salidos**.

##### Comparar saldo esperado vs. saldo a retirar

El saldo esperado es:

```
expected_balance = (
  future_withdrawals +  # Validadores que tienen epoch de retiro
  future_rewards +  # Recompensas que obtenemos hasta que se retire el último validador en validators_to_eject
  total_available_balance +  # Saldo actual de EL (el vault, wc vault, buffered eth)
  validator_to_eject_balance_sum +  # Validadores que esperamos que sean expulsados (solicitados para salir, no demorados)
  going_to_withdraw_balance  # Saldo de validadores_to_eject
)
```

Primero, se verifica sin sacar al validador si el protocolo ya tiene suficiente ether disponible para cubrir las solicitudes de retiro en la cola. Si es así, no es razonable expulsar validadores.

Si no hay suficiente, se considera sacar a un validador más y se vuelve a calcular el saldo esperado. El proceso continúa hasta que el saldo esperado sea mayor o igual a la cantidad de solicitudes de retiro no finalizadas.

## Enlaces útiles

- [Código fuente de Lido Oracle](https://github.com/lidofinance/lido-oracle)
