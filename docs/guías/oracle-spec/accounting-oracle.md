# Oráculo de contabilidad

:::info
Se recomienda leer [What is Lido Oracle mechanism](/guías/oracle-operator-manual#intro) antes
:::

## Etapa de retiro

Dado que los retiros en Ethereum se procesan de manera asincrónica, el protocolo de Lido debe tener un proceso de solicitud-reclamo para los `stETH` holders. Para asegurar que las solicitudes se procesen en el orden en que se reciben, se introduce la cola FIFO en el protocolo. A continuación se presenta una descripción general del proceso de manejo de retiros:
1. **Solicitud:** Para retirar stETH a ether, se envía la solicitud de retiro al contrato [`WithdrawalQueue`](/docs/contracts/withdrawal-queue-erc721.md) , bloqueando la cantidad de `stETH` ue se va a retirar.
2. **Cumplimiento:** El protocolo maneja las solicitudes una por una, en el orden de creación. Una vez que el protocolo tiene suficiente información para calcular la tasa de redención `stETH:ETH` de la siguiente solicitud y obtiene suficiente Ether para manejarla, la solicitud puede ser finalizada: se reserva la cantidad requerida de ether y se quema el stETH bloqueado.
3. **Reclamo:** El solicitante puede reclamar su ether en cualquier momento en el futuro. La tasa de redención `stETH:ETH` para cada solicitud se determina en el momento de su finalización y es la inversa de la tasa de staking `ETH:stETH` 

:::note
Es importante notar que la tasa de redención en el paso de finalización puede ser menor que la tasa en el momento de la solicitud de retiro debido a recortes o penalizaciones que ha incurrido el protocolo. Esto significa que uno puede recibir menos Ether por su stETH de lo que esperaba cuando originalmente presentó la solicitud.
:::

Es importante notar que la tasa de redención en el paso de finalización puede ser menor que la tasa en el momento de la solicitud de retiro debido a recortes o penalizaciones que ha incurrido el protocolo. Esto significa que uno puede recibir menos Ether por su stETH de lo que esperaba cuando originalmente presentó la solicitud.`100 wei` requerido debido a [rounding error issues](https://github.com/lidofinance/lido-dao/issues/442).

Una solicitud de retiro solo puede finalizarse cuando el protocolo tiene suficiente ether para cumplirla completamente. No es posible realizar cumplimientos parciales, sin embargo, uno puede lograr un comportamiento similar dividiendo una solicitud más grande en unas pocas más pequeñas.

Por razones de experiencia de usuario, la solicitud de retiro es transferible siendo un token no fungible compatible con [ERC-721](https://ethereum.org/ru/developers/docs/standards/tokens/erc-721/) 

Es importante notar dos restricciones adicionales relacionadas con las solicitudes de retiro. Ambas restricciones sirven para mitigar posibles vectores de ataque que permitirían a los posibles atacantes reducir efectivamente el APR del protocolo y llevar menos penalizaciones/riesgo de recorte que los poseedores de `stETH` que permanecen en el protocolo.

1. **Las solicitudes de retiro no pueden cancelarse.** Para cumplir una solicitud de retiro, el protocolo de Lido potencialmente tiene que expulsar validadores. Un actor malicioso podría enviar una solicitud de retiro a la cola, esperar hasta que el protocolo envíe solicitudes de expulsión a los Operadores de Nodo correspondientes, y cancelar la solicitud después de eso. Repitiendo este proceso, el atacante podría reducir efectivamente el APR del protocolo al obligar a los validadores de Lido a pasar tiempo en la cola de activación sin acumular recompensas. Si la solicitud de retiro no se puede cancelar, esta vulnerabilidad se mitiga. Como se mencionó anteriormente, hacer que la posición en la cola de retiro sea transferible puede proporcionar una "vía de salida rápida" para los apostadores regulares a través de mercados secundarios externos.
2. **La tasa de redención a la que se cumple una solicitud no puede ser mejor que la tasa de redención en la creación de la solicitud.** De lo contrario, existe un incentivo para mantener siempre el stETH en la cola, depositando ether nuevamente una vez que sea canjeable, ya que esto permite llevar menores riesgos de staking sin perder recompensas. Esto también permitiría a un actor malicioso reducir efectivamente el APR del protocolo. Para evitar esto, las penalizaciones que llevan a una rebase negativa se contabilizan y socializan de manera uniforme entre los poseedores de stETH y los que retiran. Las rebases positivas aún podrían afectar las solicitudes en la cola, pero solo hasta el punto donde las rebases compensen las penalizaciones acumuladas anteriormente y no empujen la tasa de redención más alta de lo que era en el momento de la creación de la solicitud de retiro.

### Finalización de solicitud

En cada informe, el oráculo decide cuántas solicitudes finalizar y a qué tasa. Las solicitudes se finalizan en el orden en que fueron creadas moviendo el cursor a la última solicitud finalizada. El oráculo debe tener en cuenta dos cosas:

1. Ether disponible y tasa de redención (también llamada 'tasa de participación')
2. Frontera segura de finalización de solicitudes

#### Ether disponible y tasa de participación

El informe del oráculo tiene dos partes: el informe del número de validadores y su balance total, y la finalización de solicitudes en el [`WithdrawalQueue`](/docs/contracts/withdrawal-queue-erc721.md). La finalización de solicitudes requiere datos de la primera parte del informe. Por lo tanto, para calcular esta parte, el informe del oráculo se simula mediante `eth_call` to `handleOracleReport` en el contrato de Lido, obteniendo la tasa de participación y la cantidad de ether que se puede retirar de los [Withdrawal](/docs/contracts/withdrawal-vault.md) y [Execution Layer Rewards](/docs/contracts/lido-execution-layer-rewards-vault.md) Vaults teniendo en cuenta los límites.

La estructura de los datos para la simulación:

- `reportTimestamp` - el momento del cálculo del informe del oráculo, calculado como `timestamp = genesis_time + ref_slot * seconds_per_slot`;
- `timeElapsed` - segundos transcurridos desde la ranura de referencia informada anterior y la simulada
- `clValidators` - número de validadores de Lido en la Capa de Consenso de Ethereum
- `clBalance` - suma de todos los balances de validadores de Lido en la Capa de Consenso de Ethereum
- `withdrawalVaultBalance` - balance del vault de retiros en la Capa de Ejecución de Ethereum para el bloque informado
- `elRewardsVaultBalance` - balance del vault de elRewards en la Capa de Ejecución de Ethereum para el bloque informado. Establecido en "**0**" si intenta simular el informe en modo bunker
- `sharesRequestedToBurn` - obtenido de `Burner.getSharesRequestedToBurn()`
- `withdrawalFinalizationBatches` - Establecido en "**[]**"
- `simulatedShareRate` - asa de participación que fue simulada por el oráculo cuando se creó el informe de datos (`1e27` precision). Establecido en "**0**"

This data is provided to make the call to `Lido.handleOracleReport()` and the following retrieved values are gathered: `post_total_pooled_ether` and `post_total_shares`.

Therefore, `share_rate` for the withdrawal request finalization can be calculated as follows:

```!
share_rate = post_total_pooled_ether * 10**27 // post_total_shares
```

#### Safe requests finalization border

Considering withdrawals, the Lido protocol can be in two states: Turbo and Bunker modes. The turbo mode is a usual state when requests are finalized as fast as possible, while the bunker mode assumes a more sophisticated requests finalization and activated if it's necessary to socialize the penalties and losses. More details in the [Withdrawals Landscape](https://hackmd.io/@lido/SyaJQsZoj) doc.

**Turbo mode**: there is only a single safe requests finalization border that does not allow to finalize requests created close to the reference slot to which the oracle report is performed.

- New requests border (~2 hours by default)

**Bunker mode**: there are two additional constraints.

The protocol takes into account the impact of negative factors that occurred in a certain period and finalizes requests on which the negative effects have already been socialized.
The safe request finalization border is considered to be the earliest of of the following:

- New requests border
- Associated slashing border
- Negative rebase border

Before examining each border, some notations needed for introduction that are used in the graphs below:

![Safe border 1](../../../static/img/oracle-spec/safe-border-1.png)

##### New requests border

The border is a constant interval near the reference epoch in which no requests can be finalized:

![Safe border 2](../../../static/img/oracle-spec/safe-border-2.png)

So can be calculated as: `ref_epoch - finalization_default_shift` , where:

![Safe border 3](../../../static/img/oracle-spec/safe-border-3.png)

And `SLOTS_PER_EPOCH = 32`, `SECONDS_PER_SLOT = 12`, `request_timestamp_margin` - gets from `OracleReportSanityChecker.oracleReportLimits()`.

##### Associated slashing border

The border represents the latest epoch before the reference slot before which there are no incompleted associated slashings.

![Safe border 4](../../../static/img/oracle-spec/safe-border-4.png)

In the image above there are 4 slashings on the timeline that start with `slashed_epoch` and end with `withdrawable_epoch` and some points in time: a withrawal request and reference epoch relationship of the slashnings with which to be analyzed.

###### Completed non-associated

![Safe border 5](../../../static/img/oracle-spec/safe-border-5.png)

The slashing is non-associated with the withdrawal request since it started and ended before the request was created. It's completed since `withdrawable_epoch` is before `reference_epoch`.

###### Completed associated

![Safe border 6](../../../static/img/oracle-spec/safe-border-6.png)

The slashing is associated with withdrawal request, since the request is in its boundaries. In this case the slashing is completed since `withdrawable_epoch` is before `reference_epoch`, so all possible impact from it is accounted. This slashing should not block the finalization of this request.

###### Incompleted associated

![Safe border 7](../../../static/img/oracle-spec/safe-border-7.png)

Slashing is associated with the withdrawal request and is still going on. The impact from it is still incomplete, so such a request cannot be finalized.

###### Incompleted non-associated

![Safe border 8](../../../static/img/oracle-spec/safe-border-8.png)

Incompleted but non-associated slashing do not block finalization of the request. The impact of it is still incomplete, nevertheless users are allowed to redeem.

###### Computation of the border

![Safe border 9](../../../static/img/oracle-spec/safe-border-9.png)

The border is calculated as the earliest `slashed_epoch` among all incompleted slashings at the point of `reference_epoch` rounded to the start of the closest oracle report frame minus `finalization_default_shift`.

[Detailed research of associated slashings](https://hackmd.io/@lido/r1Qkkiv3j)

##### Negative rebase border

Bunker mode can be enabled by a negative rebase in case of mass validator penalties. In this case the border is considered the reference slot of the previous oracle report from the moment the Bunker mode was activated - `finalization_default_shift`.

![Safe border 10](../../../static/img/oracle-spec/safe-border-10.png)

![Safe border 11](../../../static/img/oracle-spec/safe-border-11.png)

This border has a maximum length equal to two times the governance reaction time (where governance reaction time is 72 hours).

##### Border union

The safe border is chosen depending on the protocol mode and is always the longest of all.

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

#### Finalization

With the amount of available ETH, share rate and safe border, the oracle calls `WithdrawalQueue.calculateFinalizationBatches` method to get withdrawal finalization batches.

The value of a request after finalization can be:

- `nominal` (when the amount of eth locked for this request are equal to the request's stETH)
- `discounted` (when the amount of eth will be lower, because the protocol share rate dropped before request is finalized, so it will be equal to `request's shares` * `protocol share rate`)

**Batches** - array of ending request id. Each batch consist of the requests that all have the share rate below the `_maxShareRate` or above it (nominal or discounted).

For example, below an example how 14 requests with different share rates will be split into 5 batches by:

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

so:

```
batches = [2, 6 ,7, 10, 14]
```

To start calculation oracle should pass next variables to `WithdrawalQueue.calculateFinalizationBatches` method:

- `maxShareRate` - calculated on previous step as simulatedShareRate, share rate that was simulated by oracle when the report data created
- `maxTimestamp` - max timestamp of the request that can be finalized
- `maxRequestsPerCall` - max request number that can be processed by the call. Better to be max possible number for EL node to handle before hitting `out of gas`. More this number is less calls it will require to calculate the result
- `BatchesCalculationState` - structure that accumulates the state across multiple invokations to overcome gas limits.

```solidity
struct BatchesCalculationState {
        /// @notice amount of ether available in the protocol that can be used to finalize withdrawal requests
        ///  Will decrease on each invokation and will be equal to the remainder when calculation is finished
        ///  Should be set before the first invokation
        uint256 remainingEthBudget;
        /// @notice flag that is `true` if returned state is final and `false` if more invokations required
        bool finished;
        /// @notice static array to store all the batches ending request id
        uint256[MAX_BATCHES_LENGTH] batches;
        /// @notice length of the filled part of `batches` array
        uint256 batchesLength;
    }
```

To start batch calculation oracle should pass `state.remainingEthBudget` and `state.finished == false` and then invoke the function `calculateFinalizationBatches` again with returned `state` until it returns a state with `finished` flag set.

### Bunker mode

The withdrawals mode a mechanism to protect users who are withdrawing during rare but potentially adverse network conditions, such as mass slashing. The proposed mechanism includes a “turbo mode” for normal operation or low to moderate impact events and a “bunker mode” for significant impact events, which pauses withdrawal requests until the negative consequences are resolved. The solution aims to prevent sophisticated users from exiting earlier in anticipation of a dramatic network- or protocol-wide event.

The “turbo/bunker mode” aims to create a situation where users who remain in the staking pool, users who exit within the frame, and users who exit within the nearest frames are in nearly the same conditions. The “bunker mode” should activate when there is a negative consensus layer rebase or when one is expected to happen in the future, as it would break the balance between users exiting now and those who remain in the staking pool or exit later. Several scenarios should be taken into consideration as they may cause a negative CL rebase, including mass slashing events, Lido validators being offline for several hours/days, and non-Lido validators being offline. The “bunker mode” is entered in situations such as new or ongoing mass slashing that can cause a negative CL rebase during the slashing resolution period, negative CL rebase in the current frame, and lower than expected CL rebase in the current frame and a negative CL rebase in the end of the frame.

#### Bunker mode activation

The bunker mode is activated when a negative CL rebase (a decrease in the total amount of staked tokens) is detected in the current frame or is anticipated in the future. CL rebase is used as an indicator of validators' performance, as it provides a better estimate than MEV received during the frame. The conditions for triggering the "bunker mode" are divided into three categories.

#### Condition 1. New or ongoing mass slashing that can cause a negative CL rebase

The first condition is when there is a new or ongoing mass slashing that may cause a negative CL rebase. The mode is set up when there are as many slashed validators as can cause a negative CL rebase. The protocol switches back to "turbo mode" once the current and future possible penalties from the Lido slashing cannot cause a negative CL rebase.

#### Condition 2. Negative CL rebase in the current frame

The second condition is when a negative CL rebase is detected in the current frame. The "bunker mode" is activated, and there is a limit on the maximum delay for withdrawal requests finalization that is set to 2 * gov_reaction_time (~6 days) if there are no associated slashings.

#### Condition 3. Lower than expected CL rebase in the current frame and a negative CL rebase at the end of the frame

The third condition is when there is a lower-than-expected CL rebase in the current frame and a negative CL rebase at the end of the frame. The "bunker mode" is activated when the Oracle detects this condition. The limit on the maximum delay for withdrawal requests finalization is set to 2 * gov_reaction_time + 1 (~7 days) if there are no associated slashings.

For more details, see [“Bunker mode”: what it is and how it works](https://docs.google.com/document/d/1NoJ3rbVZ1OJfByjibHPA91Ghqk487tT0djAf6PFu8s8/)
