# Salidas de Validadores
![exits-1](../../../static/img/csm/exits-1.png)

## Salidas voluntarias
Dada la naturaleza sin permisos de CSM, los Operadores de Nodo (ON) pueden salir voluntariamente de sus validadores en cualquier momento.

## Salidas iniciadas por el protocolo
Para mantener la consistencia con el protocolo central y otros módulos de participación, CSM utiliza [VEBO](../../contracts/validators-exit-bus-oracle) para solicitar o activar salidas (para implementarse después del hardfork Pectra que trae [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) a la vida) para los validadores.

:::info
Nota: La implementación real de las salidas activables aún no está definida. Podrían existir contratos adicionales para activar las salidas sobre [VEBO](../../contracts/validators-exit-bus-oracle).
:::

Desde el lado del protocolo central, la salida del validador puede ser solicitada para cubrir solicitudes de retiro de poseedores de stETH, o de acuerdo con la decisión de la DAO.

Desde el lado de CSM, las salidas de validadores pueden solicitarse para validadores no enlazados. Estas salidas se solicitan automáticamente utilizando el `forcedTargetLimit`.

:::info
El `forcedTargetLimit` está actualmente en desarrollo dentro de la versión actualizada de [Staking Router](https://hackmd.io/@lido/BJXRTxMRp#Forced-Exit-Requests1). En resumen, es similar al `targetLimit` existente, pero las salidas para los validadores por encima de `forcedTargetLimit` pueden solicitarse en el próximo informe de [VEBO](../../contracts/validators-exit-bus-oracle), incluso sin la necesidad de cumplir con las solicitudes de retiro de poseedores de stETH.
:::

Los Operadores de Nodo deben seguir los eventos de [VEBO](../../contracts/validators-exit-bus-oracle) (por ejemplo, utilizando el [Ejector](https://github.com/lidofinance/validator-ejector)) para asegurarse de que salgan de los validadores a tiempo. Se deben aplicar las siguientes penalizaciones y medidas limitantes si el Operador de Nodo se niega a salir de los validadores después de la solicitud del protocolo:
1. Excluir las claves del Operador de Nodo de la cola de depósitos de CSM y no volver a colocarlas hasta que `stuckKeysCount = 0`.
2. Excluir al Operador de Nodo del ciclo de asignación de recompensas de participación dentro del período de informe del Oráculo de Rendimiento si `stuckKeysCount` del Operador de Nodo fue > 0 durante el mismo.

Además, en casos excepcionales, la DAO de Lido puede activar las salidas de los validadores del Operador de Nodo (para implementarse después del hardfork Pectra que trae [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) a la vida).

## Bajo rendimiento durante mucho tiempo

:::info
Esta mecánica se implementará después del hardfork Pectra que trae [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) a la vida.
:::

Si un validador tiene un rendimiento por debajo del umbral de rendimiento durante 3 frames dentro de 6 frames, se considera un mal desempeño que viola la regla de buen rendimiento dentro del protocolo. Los validadores con 3 "strikes" (frames de bajo rendimiento) pueden ser solicitados para su expulsión del protocolo mediante un método sin permisos. También existe la opción de confiscar las ganancias perdidas por tales validadores del bono del Operador de Nodo. Sin embargo, esta opción aún está bajo consideración.

Para obtener más información sobre la expulsión de malos desempeñadores, consulte el [documento separado](https://hackmd.io/@lido/Sy0nRd36a).

## Reporte de saldo de retiro
Se requiere el saldo de retiro del validador para liberar el bono y calcular la penalización de salida, si la hubiera. Este saldo se informa sin permisos utilizando [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) por parte del bot de CSM o por el propio Operador de Nodo.

## Enlaces útiles

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)
- [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002)
- [Hardfork Pectra](https://eips.ethereum.org/EIPS/eip-7600)
