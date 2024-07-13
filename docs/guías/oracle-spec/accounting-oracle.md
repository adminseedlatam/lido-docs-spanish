# Oráculo contable

:::info
Se recomienda leer [¿Qué es el mecanismo de Oracle de Lido?](/guías/oracle-operator-manual#introducción) antes.
:::

## Etapa de retiros

Dado que los retiros en Ethereum se procesan de forma asincrónica, el protocolo Lido debe tener un proceso de solicitud-reclamación para los titulares de `stETH`. Para asegurar que las solicitudes se procesen en el orden en que se reciben, se introduce una cola FIFO en el protocolo. Aquí hay una descripción general del proceso de manejo de retiros:

1. **Solicitud:** Para retirar stETH y obtener ether, se envía la solicitud de retiro al contrato [`WithdrawalQueue`](/docs/contracts/withdrawal-queue-erc721.md), bloqueando la cantidad de `stETH` que se va a retirar.
2. **Cumplimiento:** El protocolo maneja las solicitudes una por una, en el orden de creación. Una vez que el protocolo tiene suficiente información para calcular la tasa de canje de `stETH:ETH` de la próxima solicitud y obtiene suficiente Ether para manejarla, la solicitud puede finalizarse: se reserva la cantidad requerida de Ether y se quema el stETH bloqueado.
3. **Reclamación:** El solicitante puede reclamar su Ether en cualquier momento en el futuro. La tasa de canje de `stETH:ETH` para cada solicitud se determina en el momento de su finalización y es el inverso de la tasa de participación de `ETH:stETH`.

:::note
Es importante tener en cuenta que la tasa de canje en el paso de finalización puede ser inferior a la tasa en el momento de la solicitud de retiro debido a cortes o sanciones que haya incurrido el protocolo. Esto significa que uno puede recibir menos Ether por su stETH de lo que esperaba cuando originalmente presentó la solicitud.
:::

Uno puede poner cualquier número de solicitudes de retiro en la cola. Aunque hay un límite superior en el tamaño de una solicitud particular, no hay un límite efectivo ya que el solicitante puede presentar múltiples solicitudes de retiro. También hay un umbral de tamaño mínimo de solicitud de `100 wei` debido a problemas de [error de redondeo](https://github.com/lidofinance/lido-dao/issues/442).

Una solicitud de retiro solo se puede finalizar cuando el protocolo tiene suficiente Ether para cumplirla completamente. No son posibles los cumplimientos parciales; sin embargo, se puede lograr un comportamiento similar dividiendo una solicitud más grande en varias más pequeñas.

Por razones de experiencia de usuario, la solicitud de retiro es transferible como un token no fungible compatible con [ERC-721](https://ethereum.org/ru/developers/docs/standards/tokens/erc-721/).

Es importante tener en cuenta dos restricciones adicionales relacionadas con las solicitudes de retiro. Ambas restricciones sirven para mitigar posibles vectores de ataque que permitirían a posibles atacantes reducir efectivamente el APR del protocolo y asumir menos riesgos de penalización/reducción que los titulares de `stETH` que permanecen en el protocolo.

1. **Las solicitudes de retiro no se pueden cancelar.** Para cumplir con una solicitud de retiro, el protocolo Lido potencialmente tiene que expulsar validadores. Un actor malintencionado podría enviar una solicitud de retiro a la cola, esperar hasta que el protocolo envíe solicitudes de expulsión a los operadores de nodos correspondientes y cancelar la solicitud después de eso. Al repetir este proceso, el atacante podría reducir efectivamente el APR del protocolo obligando a los validadores de Lido a pasar tiempo en la cola de activación sin acumular recompensas. Si la solicitud de retiro no se puede cancelar, esta vulnerabilidad se mitiga. Como se señaló anteriormente, hacer que la posición en la cola de retiros sea transferible puede proporcionar una "vía de salida rápida" para los participantes regulares a través de mercados secundarios externos.
2. **La tasa de canje a la que se cumple una solicitud no puede ser mejor que la tasa de canje en la creación de la solicitud.** De lo contrario, existe el incentivo de mantener siempre el stETH en la cola, depositando Ether nuevamente una vez que sea canjeable, ya que esto permite asumir menores riesgos de participación sin perder recompensas. Esto también permitiría a un actor malintencionado reducir efectivamente el APR del protocolo. Para evitar esto, las penalizaciones que conducen a una rebase negativa se contabilizan y socializan de manera uniforme entre los titulares de stETH y los retiradores. Las rebases positivas aún podrían afectar las solicitudes en la cola, pero solo hasta el punto en que las rebases compensen las penalizaciones previamente acumuladas y no empujen la tasa de canje más alta de lo que era en el momento de la creación de la solicitud de retiro.

### Finalización de solicitudes

En cada informe, el oráculo decide cuántas solicitudes finalizar y a qué tasa. Las solicitudes se finalizan en el orden en que se crearon, moviendo el cursor a la última solicitud finalizada. El oráculo debe tener en cuenta dos cosas:

1. Ether disponible y tasa de canje (también llamada 'tasa de participación')
2. Límite seguro de finalización de solicitudes

#### Ether disponible y tasa de participación

El informe del oráculo tiene dos partes: el informe del número de validadores y su saldo total y la finalización de solicitudes en el [`WithdrawalQueue`](/docs/contracts/withdrawal-queue-erc721.md). La finalización de solicitudes requiere datos de la primera parte del informe. Por lo tanto, para calcular esta parte, el informe del oráculo se simula mediante `eth_call` a `handleOracleReport` en el contrato de Lido, obteniendo la tasa de participación y la cantidad de Ether que se puede retirar de los cofres [Withdrawal](/docs/contracts/withdrawal-vault.md) y [Execution Layer Rewards](/docs/contracts/lido-execution-layer-rewards-vault.md) teniendo en cuenta los límites.

La estructura de los datos para la simulación:

- `reportTimestamp` - el momento del cálculo del informe del oráculo, calculado como `timestamp = genesis_time + ref_slot * seconds_per_slot`;
- `timeElapsed` - segundos transcurridos desde el último slot de referencia informado y el simulado
- `clValidators` - número de validadores de Lido en la capa de consenso de Ethereum
- `clBalance` - suma de todos los saldos de los validadores de Lido en la capa de consenso de Ethereum
- `withdrawalVaultBalance` - saldo del cofre de retiros en la capa de ejecución de Ethereum para el bloque informado
- `elRewardsVaultBalance` - saldo del cofre de recompensas de la capa de ejecución de Ethereum para el bloque informado. Establecido en "**0**" si se intenta simular un informe en modo búnker
- `sharesRequestedToBurn` - obtenido de `Burner.getSharesRequestedToBurn()`
- `withdrawalFinalizationBatches` - Establecido en "**[]**"
- `simulatedShareRate` - tasa de participación simulada por el oráculo cuando se crearon los datos del informe (`1e27` de precisión). Establecido en "**0**"

Estos datos se proporcionan para realizar la llamada a `Lido.handleOracleReport()` y se recopilan los siguientes valores obtenidos: `post_total_pooled_ether` y `post_total_shares`.

Por lo tanto, la `tasa de participación` para la finalización de la solicitud de retiro se puede calcular de la siguiente manera:

```!
share_rate = post_total_pooled_ether * 10**27 // post_total_shares
```

#### Límite seguro de finalización de solicitudes

Considerando los retiros, el protocolo Lido puede estar en dos estados: modos Turbo y Búnker. El modo turbo es un estado habitual en el que las solicitudes se finalizan lo más rápido posible, mientras que el modo búnker supone una finalización de solicitudes más sofisticada y se activa si es necesario socializar las penalizaciones y pérdidas. Más detalles en el documento [Withdrawals Landscape](https://hackmd.io/@lido/SyaJQsZoj).

**Modo Turbo**: solo hay un único límite seguro de finalización de solicitudes que no permite finalizar solicitudes creadas cerca del slot de referencia al que se realiza el informe del oráculo.

- Límite de nuevas solicitudes (~2 horas por defecto)

**Modo Búnker**: hay dos restricciones adicionales.

El protocolo tiene en cuenta el impacto de factores negativos que ocurrieron en un cierto período y finaliza solicitudes en las que los efectos negativos ya se han socializado.
El límite seguro de finalización de solicitudes se considera el más temprano de los siguientes:

- Límite de nuevas solicitudes
- Límite de reducción asociado
- Límite de rebase negativo

Antes de examinar cada límite, se necesitan algunas notaciones que se usan en los gráficos a continuación:

![Safe border 1](../../../static/img/oracle-spec/safe-border-1.png)

##### Límite de nuevas solicitudes

El límite es un intervalo constante cerca de la época de referencia en la que no se pueden finalizar solicitudes:

![Safe border 2](../../../static/img/oracle-spec/safe-border-2.png)

Entonces se puede calcular como: `ref_epoch - finalization_default_shift`, donde:

![Safe border 3](../../../static/img/oracle-spec/safe-border-3.png)

Y `SLOTS_PER_EPOCH = 32`, `SECONDS_PER_SLOT = 12`, `request_timestamp_margin` - se obtiene de `OracleReportSanityChecker.oracleReportLimits()`.

##### Límite de reducción asociado

El límite representa la última época antes del slot de referencia antes del cual no hay reducciones

 asociadas incompletas.

![Safe border 4](../../../static/img/oracle-spec/safe-border-4.png)

En la imagen anterior hay 4 reducciones en la línea de tiempo que comienzan con `slashed_epoch` y terminan con `withdrawable_epoch` y algunos puntos en el tiempo: una solicitud de retiro y la relación de época de referencia con las reducciones que deben analizarse.

###### Completado no asociado

![Safe border 5](../../../static/img/oracle-spec/safe-border-5.png)

La reducción no está asociada con la solicitud de retiro ya que comenzó y terminó antes de que se creara la solicitud. Está completado ya que `withdrawable_epoch` está antes de `reference_epoch`.

###### Completado asociado

![Safe border 6](../../../static/img/oracle-spec/safe-border-6.png)

La reducción está asociada con la solicitud de retiro, ya que la solicitud está dentro de sus límites. En este caso, la reducción está completada ya que `withdrawable_epoch` está antes de `reference_epoch`, por lo que todo el posible impacto de ella está contabilizado. Esta reducción no debería bloquear la finalización de esta solicitud.

###### Incompletado asociado

![Safe border 7](../../../static/img/oracle-spec/safe-border-7.png)

La reducción está asociada con la solicitud de retiro y aún está en curso. El impacto de ella aún está incompleto, por lo que dicha solicitud no puede finalizarse.

###### Incompletado no asociado

![Safe border 8](../../../static/img/oracle-spec/safe-border-8.png)

Las reducciones incompletas pero no asociadas no bloquean la finalización de la solicitud. El impacto de ellas aún está incompleto, sin embargo, se permite a los usuarios canjear.

###### Cálculo del límite

![Safe border 9](../../../static/img/oracle-spec/safe-border-9.png)

El límite se calcula como la primera `slashed_epoch` entre todas las reducciones incompletas en el punto de `reference_epoch` redondeado al inicio del marco de informe del oráculo más cercano menos `finalization_default_shift`.

[Investigación detallada de las reducciones asociadas](https://hackmd.io/@lido/r1Qkkiv3j)

##### Límite de rebase negativo

El modo Búnker se puede habilitar por una rebase negativa en caso de penalizaciones masivas de validadores. En este caso, el límite se considera el slot de referencia del informe del oráculo anterior desde el momento en que se activó el modo Búnker - `finalization_default_shift`.

![Safe border 10](../../../static/img/oracle-spec/safe-border-10.png)

![Safe border 11](../../../static/img/oracle-spec/safe-border-11.png)

Este límite tiene una longitud máxima igual a dos veces el tiempo de reacción de la gobernanza (donde el tiempo de reacción de la gobernanza es de 72 horas).

##### Unión de límites

El límite seguro se elige dependiendo del modo del protocolo y siempre es el más largo de todos.

![Safe border 12](../../../static/img/oracle-spec/safe-border-12.png)

```python
def get_safe_border_epoch(ref_epoch):
  is_bunker = detect_bunker_mode()

  if not is_bunker:
    return get_default_requests_border_epoch()

  negative_rebase_border_epoch = get_negative_rebase_border_epoch()
  associated_slashings_border_epoch = get_associated_slashings_border_epoch()

  return min(
    negative_rebase_border_epoch,
    associated_slashings_border_epoch,
  )
```
### Finalización de solicitudes de retiro

Con la cantidad de ETH disponible, la tasa de participación y el límite seguro, el oráculo llama al método `WithdrawalQueue.calculateFinalizationBatches` para obtener los lotes de finalización de retiros.

El valor de una solicitud después de la finalización puede ser:

- `nominal` (cuando la cantidad de ETH bloqueada para esta solicitud es igual al `stETH` de la solicitud)
- `descontado` (cuando la cantidad de ETH será menor, porque la tasa de participación del protocolo disminuyó antes de finalizar la solicitud, por lo que será igual a `las acciones de la solicitud` * `tasa de participación del protocolo`)

**Lotes**: array de ID de solicitud final. Cada lote consiste en solicitudes que todas tienen la tasa de participación por debajo del `_maxShareRate` o por encima de él (nominal o descontado).

Por ejemplo, a continuación se muestra cómo 14 solicitudes con diferentes tasas de participación se dividirán en 5 lotes:

```
|
|         • •
|       •    •   • • •
|----------------------•------ _maxShareRate
|   •          •        • • •
| •
+-------------------------------> requestId
| 1st|  2nd  |3| 4th | 5th  |
```

Entonces:

```
batches = [2, 6, 7, 10, 14]
```

Para iniciar el cálculo, el oráculo debe pasar las siguientes variables al método `WithdrawalQueue.calculateFinalizationBatches`:

- `maxShareRate`: calculado en el paso anterior como `simulatedShareRate`, la tasa de participación simulada por el oráculo cuando se crearon los datos del informe.
- `maxTimestamp`: tiempo máximo de la solicitud que puede ser finalizada.
- `maxRequestsPerCall`: número máximo de solicitudes que pueden ser procesadas por la llamada. Es mejor que sea el número máximo posible para que el nodo EL maneje antes de llegar a `out of gas`. Cuanto mayor sea este número, menos llamadas se necesitarán para calcular el resultado.
- `BatchesCalculationState`: estructura que acumula el estado a través de múltiples invocaciones para superar los límites de gas.

```solidity
struct BatchesCalculationState {
        /// @notice cantidad de ether disponible en el protocolo que se puede usar para finalizar solicitudes de retiro
        ///  Disminuirá en cada invocación y será igual al remanente cuando se termine el cálculo
        ///  Debe configurarse antes de la primera invocación
        uint256 remainingEthBudget;
        /// @notice indicador que es `true` si el estado devuelto es final y `false` si se requieren más invocaciones
        bool finished;
        /// @notice array estático para almacenar todos los ID de solicitud final de los lotes
        uint256[MAX_BATCHES_LENGTH] batches;
        /// @notice longitud de la parte llenada del array `batches`
        uint256 batchesLength;
    }
```

Para iniciar el cálculo del lote, el oráculo debe pasar `state.remainingEthBudget` y `state.finished == false` y luego invocar la función `calculateFinalizationBatches` nuevamente con el `state` devuelto hasta que devuelva un estado con el indicador `finished` establecido.

### Modo Búnker

El modo de retiros es un mecanismo para proteger a los usuarios que están retirando durante condiciones adversas raras pero potencialmente significativas en la red, como la reducción masiva. El mecanismo propuesto incluye un "modo turbo" para la operación normal o eventos de bajo a moderado impacto y un "modo búnker" para eventos de impacto significativo, que pausa las solicitudes de retiro hasta que se resuelvan las consecuencias negativas. La solución busca prevenir que los usuarios sofisticados salgan antes en previsión de un evento dramático a nivel de red o protocolo.

El "modo turbo/búnker" tiene como objetivo crear una situación en la que los usuarios que permanecen en el pool de staking, los usuarios que salen dentro del marco y los usuarios que salen dentro de los marcos más cercanos estén en casi las mismas condiciones. El "modo búnker" debe activarse cuando haya una rebase negativa en la capa de consenso o cuando se espere que ocurra en el futuro, ya que rompería el equilibrio entre los usuarios que salen ahora y aquellos que permanecen en el pool de staking o salen más tarde. Varios escenarios deben tenerse en cuenta, ya que pueden causar una rebase negativa en la capa de consenso, incluyendo eventos de reducción masiva, validadores de Lido fuera de línea durante varias horas/días y validadores no pertenecientes a Lido fuera de línea. El "modo búnker" se activa en situaciones como una nueva o continua reducción masiva que puede causar una rebase negativa en la capa de consenso durante el período de resolución de la reducción, rebase negativa en el marco actual y rebase inferior a la esperada en el marco actual y una rebase negativa al final del marco.

#### Activación del modo Búnker

El modo búnker se activa cuando se detecta una rebase negativa en la capa de consenso (una disminución en la cantidad total de tokens en staking) en el marco actual o se anticipa en el futuro. La rebase en la capa de consenso se utiliza como un indicador del rendimiento de los validadores, ya que proporciona una mejor estimación que el MEV recibido durante el marco. Las condiciones para activar el "modo búnker" se dividen en tres categorías.

#### Condición 1. Nueva o continua reducción masiva que puede causar una rebase negativa en la capa de consenso

La primera condición es cuando hay una nueva o continua reducción masiva que puede causar una rebase negativa en la capa de consenso. El modo se configura cuando hay tantos validadores reducidos como para causar una rebase negativa en la capa de consenso. El protocolo cambia de nuevo al "modo turbo" una vez que las penalizaciones actuales y futuras posibles de la reducción de Lido no pueden causar una rebase negativa en la capa de consenso.

#### Condición 2. Rebase negativa en la capa de consenso en el marco actual

La segunda condición es cuando se detecta una rebase negativa en la capa de consenso en el marco actual. Se activa el "modo búnker" y hay un límite en el tiempo máximo de finalización de solicitudes de retiro que se establece en 2 * tiempo_de_reacción_de_gobernanza (~6 días) si no hay reducciones asociadas.

#### Condición 3. Rebase en la capa de consenso inferior a la esperada en el marco actual y una rebase negativa al final del marco

La tercera condición es cuando hay una rebase en la capa de consenso inferior a la esperada en el marco actual y una rebase negativa al final del marco. El "modo búnker" se activa cuando el Oráculo detecta esta condición. El límite en el tiempo máximo de finalización de solicitudes de retiro se establece en 2 * tiempo_de_reacción_de_gobernanza + 1 (~7 días) si no hay reducciones asociadas.

Para más detalles, consulte [“Bunker mode”: what it is and how it works](https://docs.google.com/document/d/1NoJ3rbVZ1OJfByjibHPA91Ghqk487tT0djAf6PFu8s8/).