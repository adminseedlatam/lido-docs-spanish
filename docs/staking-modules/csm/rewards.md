# Recompensas
![rewards-1](../../../static/img/csm/rewards-1.png)

Hay dos tipos de recompensas para los Operadores de Nodo de CSM:
- **Recompensas del Operador de Nodo;**
- **Recompensas de bono;**

![rewards-2](../../../static/img/csm/rewards-2.png)

Las recompensas del Operador de Nodo provienen de la parte del protocolo LoE de las recompensas de las capas de Consenso y Ejecución. Estas recompensas se calculan como un porcentaje de las recompensas de un validador completo de 32 ETH. Las recompensas del Operador de Nodo se distribuyen entre todos los módulos de participación de la misma [manera](../../contracts/staking-router#distribución-de-tarifas) (proporcionalmente basado en el número de validadores activos por módulo, donde `activo == depositado - salido`). Cada reporte del [Oráculo Contable](../../contracts/accounting-oracle.md) asigna una nueva porción de las recompensas de participación a CSM. Las recompensas asignadas se almacenan en el módulo. Luego, la asignación de las recompensas del Operador de Nodo para los Operadores de Nodo de CSM utilizando un árbol de Merkle es proporcionada por el Oráculo de Rendimiento de CSM una vez en un `marco`, haciendo una nueva porción de las recompensas disponible para reclamar.

La parte de las recompensas de bono (rebase) proviene de stETH siendo un token de rebase y el bono que se almacena en stETH. Después de cada reporte del Oráculo Contable, `shareRate` cambia (probablemente aumenta). Por lo tanto, la misma cantidad de acciones stETH ahora será igual a un mayor saldo de tokens stETH.

La ecuación general para las recompensas totales se ve así: `totalRewards = saldoEfectivoValidador * tarifaMódulo + montoBono * cambioTasaAcción`. Más detalles se publican en el [post complementario](https://research.lido.fi/t/bond-and-staking-fee-napkin-math/5999).

Una parte significativa de las recompensas totales proviene del rebase del bono. El bono y las recompensas del Operador de Nodo se combinan antes del reclamo. La cantidad final de recompensas disponibles para reclamar se calcula como `bono + recompensasOperadorNodo - bonoRequerido`. Este enfoque también asegura que cualquier bono faltante sea recuperado por el protocolo antes de un reclamo de recompensas.

![rewards-3](../../../static/img/csm/rewards-3.png)

Además, cualquier bono en exceso se tratará como una recompensa.

![rewards-4](../../../static/img/csm/rewards-4.png)

## Oráculo de Rendimiento
El Oráculo de Rendimiento crea un árbol de Merkle con la asignación de las recompensas de participación y entrega la raíz en la cadena. Para hacer que el árbol original esté disponible para los usuarios, se publica en [IPFS](https://ipfs.tech/) y [GitHub](https://github.com/). En lugar de almacenar múltiples raíces, cada nuevo árbol consta de todas las recompensas del Operador de Nodo adquiridas alguna vez por los Operadores de Nodo de CSM. Por lo tanto, solo se requiere el árbol más reciente para determinar la asignación de recompensas en cualquier momento. La cantidad de recompensas disponibles para reclamar se puede calcular como `recompensasAcumuladasTotales - recompensasReclamadas`.

El Oráculo de Rendimiento utiliza la tasa de attestations exitosas `attestacionesExitosas / totalAttestationsAsignadas` como un proxy para el rendimiento general de un validador. Se utiliza un umbral de rendimiento para determinar la asignación de las recompensas reales del Operador de Nodo. Los validadores con rendimiento por encima del umbral se incluyen en el grupo de asignación, mientras que los demás no lo son. Los eventos de activación y salida se tienen en cuenta durante el cálculo de la parte del Operador de Nodo. Una vez formado el grupo de asignación, a cada validador se le asigna una parte de las recompensas de participación de `recompensasTotalesAcumuladas / totalValidadoresEnGrupoDeAsignación`. Esto significa efectivamente que todas las recompensas adquiridas por el módulo se distribuirán entre los que tienen un buen desempeño. Luego, las acciones del validador se asignan a los Operadores de Nodo correspondientes, y cada Operador puede reclamar las recompensas de todos sus validadores de una sola vez.

![rewards-5](../../../static/img/csm/rewards-5.png)

Es crucial señalar que el Oráculo de Rendimiento gestiona solo parte de las recompensas totales. Incluso si el validador tiene un rendimiento por debajo del umbral dentro de un marco, las recompensas del bono (rebase) aún se adquirirán. Se puede encontrar un ejemplo del cálculo de recompensas [aquí](https://docs.google.com/spreadsheets/d/1hLvuOesPVOYHDqO373bdyiKn4_3UXQF1rATbgTrKhWc/edit?usp=sharing). **Ten en cuenta que incluso cuando el rendimiento es inferior al umbral, las recompensas por validador serán mayores que las del staking en solitario convencional.**

El `marco` para el reporte del Oráculo de Rendimiento está configurado en 28 días. Esto hace que el `marco` sea lo suficientemente largo como para tener en cuenta las interrupciones cortas de rendimiento (con un marco más pequeño, este efecto será menor y el umbral de rendimiento será menos útil). Hacer que el `marco` sea más grande que 28 días resultará en un retraso innecesario en la asignación de recompensas.

El umbral de rendimiento es relativo a la efectividad global de la attestation en la red para asegurar que los problemas de red fuera del control del Operador de Nodo no afecten la asignación de recompensas.

Si deseas obtener más información sobre el algoritmo real del Oráculo de Rendimiento, consulta este [documento detallado](https://hackmd.io/@lido/BJclaWbi6).

## Lecturas adicionales

- [Penalizaciones](penalties.md)
- [Salidas de validadores](validator-exits.md)