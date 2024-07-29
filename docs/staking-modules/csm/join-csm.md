# Unirse a CSM

![join-csm-1](../../../static/img/csm/join-csm-1.png)

## Creación de Operador de Nodo

Para convertirse en Operador de Nodo en CSM o registrar nuevos validadores para un Operador de Nodo existente, se debe proporcionar al menos una `clave pública del validador`, la firma de depósito correspondiente [`signature`](https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata), y el monto de colateral correspondiente.

## Preparación y carga de datos de depósito

CSM acepta datos de depósito en el mismo [formato](../../contracts/node-operators-registry#addsigningkeys) (`clave pública del validador` + `firma de depósito`) que el [módulo Curated](../../contracts/node-operators-registry.md), con la principal diferencia de que se requiere presentar el colateral antes o junto con la carga de datos de depósito.

[`signature`](https://github.com/ethereum/consensus-specs/blob/v1.4.0/specs/phase0/beacon-chain.md#signingdata) **debe** firmar la raíz del `(mensaje de depósito, dominio)`. Donde `dominio` se utiliza para identificar la cadena, y `mensaje de depósito` tiene la forma de la siguiente tupla:

- `clave pública del validador`;
- `credenciales de retiro` con la dirección real del [`Contrato de Bóveda de Retiro de Lido`](../../contracts/withdrawal-vault). Debe recuperarse del [Enrutador de Staking](../../contracts/staking-router.md#getwithdrawalcredentials);
- `cantidad de 32 ETH`;

## Colateral

:::info
Aquí y después, el término 'colateral' tiene el siguiente significado:

**Colateral** - una garantía de seguridad que los Operadores de Nodo deben presentar antes de cargar las claves de validador en CSM. Esta garantía cubre posibles pérdidas causadas por acciones inapropiadas del lado del Operador de Nodo. Una vez que el validador sale de la cadena Beacon y todas las pérdidas que ocurrieron están cubiertas, la garantía se puede reclamar o reutilizar para cargar nuevas claves de validador.
:::

El colateral es una propiedad de un Operador de Nodo, no de un validador. El colateral se almacena en forma de stETH. Los Operadores de Nodo pueden presentar tokens de colateral en ETH, stETH y wstETH. Si se proporciona ETH, se apuesta, y se desempaqueta wstETH durante la presentación para garantizar que stETH sea la única forma de colateral.

El monto total del colateral requerido depende del número total de validadores del Operador de Nodo y tiene la forma de una curva (ver [`getBondAmountByKeysCount(keysCount)`](https://github.com/lidofinance/community-staking-module/blob/main/src/abstract/CSBondCurve.sol#L92))

![join-csm-2](../../../static/img/csm/join-csm-2.png)

El gráfico anterior se puede volver a dibujar para la conveniencia del lector con respecto al número de validadores, no a los validadores totales.

![join-csm-3](../../../static/img/csm/join-csm-3.png)

Puede haber varias curvas de colateral (implementaciones de la función `getBondAmountByKeysCount`). Se asigna una curva predeterminada a todos los Operadores de Nodo al crearlos. Más tarde, se puede establecer una curva personalizada para el Operador de Nodo.

Los Operadores de Nodo existentes pueden aumentar el colateral sin cargar datos de depósito para compensar las penalizaciones o para tener fondos de colateral cargados por adelantado.

### Validadores no garantizados

El término "no garantizado" se introduce para referirse a los validadores para los cuales el colateral no cubre completamente a este validador. Teniendo en cuenta el enfoque cuando el colateral es común para todos los validadores del Operador de Nodo, los validadores no garantizados se pueden determinar de la manera ilustrada a continuación. En el ejemplo, el validador N+1 no está garantizado.

![join-csm-4](../../../static/img/csm/join-csm-4.png)

### Posibles consecuencias negativas del rebase de stETH

Con el colateral almacenado en stETH, existe el riesgo de una reducción en el monto del colateral debido a un rebase negativo de stETH. Esto podría resultar en que algunos Operadores de Nodo no puedan reclamar recompensas (debido a que el colateral real es menor de lo requerido) o incluso en que los validadores se vuelvan no garantizados. Este problema se describe en detalle en [Mecánica del Bono en Lido ADR](https://hackmd.io/@lido/BJqWx7P0p). Para este documento, vale la pena mencionar que CSM no requiere acciones adicionales debido a la baja probabilidad de rebase negativo de stETH y a un [fondo de seguro](/contracts/insurance) dedicado a disposición de Lido DAO para su posible uso como cobertura.

## Validación y anulación de datos de depósito (aka aprobación y desaprobación)

Dado el próximo [DSM](https://hackmd.io/@lido/rJrTnEc2a) mejora, CSM utilizará un enfoque [optimista de aprobación](https://hackmd.io/@lido/ryw2Qo5ia). Los datos de depósito cargados se tratarán como válidos a menos que DSM informe lo contrario. En caso de detección de datos de depósito inválidos, DSM llama a [`decreaseVettedSigningKeysCount`](https://github.com/lidofinance/community-staking-module/blob/main/src/CSModule.sol#L861) para establecer el puntero `vettedKeys` a los datos de depósito antes del primer dato de depósito inválido. En este caso, un Operador de Nodo debe eliminar las claves inválidas para reanudar la asignación de participación a las claves válidas no depositadas.

## Claves depositables

Varios factores determinan si el depósito se puede realizar utilizando los datos de depósito correspondientes. Esta información se refleja en la propiedad `depositableKeys` del Operador de Nodo. Esta propiedad indica el número de registros de datos de depósito extraídos secuencialmente a partir del último registro de depósito disponible en el almacenamiento de claves del Operador de Nodo para depósitos por el enrutador de staking. Este número se determina de la siguiente manera:

- `targetLimit` no está establecido -> `vettedKeys - depositedKeys - unbondedKeys`
- `targetLimit` está establecido -> `mínimo(vettedKeys, targetLimit) - depositedKeys - unbondedKeys`
- Operador de Nodo tiene `stuckKeys != 0` sin importar el `targetLimit` -> `0`.

## Cola de asignación de Stake

La cola de asignación de stake en CSM es una cola [FIFO](<https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)>) (primero en entrar, primero en salir) tradicional. Los Operadores de Nodo ocupan lugares en la cola con los lotes `{noId, keysCount}` y esperan su turno.

![join-csm-5](../../../static/img/csm/join-csm-5.png)

Una vez que la cola alcanza el lote del Operador de Nodo, CSM verifica cuántas claves del lote se pueden depositar utilizando la fórmula: `mín(depositableKeys, keysInBatch)`.

![join-csm-6](../../../static/img/csm/join-csm-6.png)

Puede darse el caso de que un Operador de Nodo tenga claves que no están en la cola porque se omitieron durante las iteraciones de la cola al no ser depositables en ese momento. El método `normalizeQueue` permite a los Operadores de Nodo colocar todas las claves depositables de nuevo en la cola.

Hay varios punteros con respecto al almacenamiento de datos de depósito en CSM. Entre otros, hay punteros `totalAddedKeys` y `totalVettedKeys`. Con el enfoque optimista de aprobación, estos dos punteros deberían estar sincronizados la mayor parte del tiempo (`totalAddedKeys == totalVettedKeys`), dado que no hay informes sobre la presencia de datos de depósito inválidos. Por lo tanto, hay dos formas en que los datos de depósito se pueden colocar en la cola:

- Una vez que se cargan los datos de depósito, si `totalAddedKeys == totalVettedKeys`;
- Después de llamar al método [`normalizeQueue`](https://github.com/lidofinance/community-staking-module/blob/main/src/CSModule.sol#L978), en caso de

que algunas claves no se colocaran en la cola al cargarse (`totalAddedKeys != totalVettedKeys` en el momento de la carga) o se omitieran durante las iteraciones de la cola;

Existe un método para verificar los próximos `X` elementos y eliminar aquellos que no contienen claves depositables. Este método es necesario para garantizar el funcionamiento de la cola incluso en escenarios catastróficos que resulten en una significativa "contaminación" de la cola con claves no depositables.

## Eliminación de datos de depósito

El Operador de Nodo puede eliminar voluntariamente los datos de depósito cargados si aún no se han depositado. El `removalCharge` se confisca del colateral del Operador de Nodo en cada clave eliminada para cubrir los costos operativos máximos posibles asociados con el procesamiento de la cola. Los datos de depósito se pueden eliminar en lotes continuos (por ejemplo, desde el índice 5 hasta el 10).

Si el protocolo ya ha depositado el validador relacionado con los datos de depósito, el Operador de Nodo no puede eliminar los datos de depósito. La única forma de detener los deberes de validación es salir del validador en el CL. Una vez que el validador se retire completamente, el Operador de Nodo puede reclamar el exceso de colateral.

## Período de Adopción Temprana

Uno de los desafíos con la entrada sin permisos para los Operadores de Nodo con condiciones atractivas es la posibilidad de que un actor importante ocupe todos los asientos en el módulo de participación. Para superar esto, se propone un Período de Adopción Temprana como la primera etapa del ciclo de vida principal de CSM. Se requiere una prueba de Merkle como boleto de entrada al CSM en la mainnet para unirse durante el Período de Adopción Temprana. Además de la capacidad para unirse, tales Operadores de Nodo serán elegibles para el "descuento de colateral para el primer validador". Esto asegurará que durante el Período de Adopción Temprana, [validadores solitarios probados](https://github.com/lidofinance/community-staking-module/tree/main/artifacts/holesky/early-adoption) podrán unirse con un pequeño beneficio.

Consulte el [documento detallado](https://hackmd.io/@lido/HyKgaBMj6) para obtener más información sobre los mecanismos del Período de Adopción Temprana.

## Lecturas adicionales

- [Recompensas](rewards.md)
- [Penalizaciones](penalties.md)
- [Salidas de validadores](validator-exits.md)
