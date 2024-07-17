# Introducción

:::info
Los términos "validator", "key", "validator key" y "deposit data" tienen el mismo significado dentro del documento.
:::

## ∑ TL;DR
El Módulo de Staking Comunitario (CSM) es un módulo de staking sin permisos diseñado para atraer a los stakers de la comunidad a participar en Lido en el protocolo Ethereum como Operadores de Nodo. El único requisito para unirse al CSM como Operador de Nodo es poder ejecutar validadores (según las políticas de Lido en Ethereum) y proporcionar un colateral. La participación se asigna a los validator keys en el orden en que se proporcionan las keys, siempre que sean válidas. El colateral no está directamente asociado con la participación real del validador, sino que se trata como una garantía de seguridad. El colateral es una característica de un Operador de Nodo; por lo tanto, es una garantía para todos los validadores del Operador de Nodo. Esto permite la reducción del colateral. Cuantos más validadores tenga el Operador de Nodo, menor será el colateral por cada validador. Los Operadores de Nodo obtienen sus recompensas del rebase del colateral y de la porción de recompensas de staking del Operador de Nodo. La porción de recompensas de staking del Operador de Nodo se socializa (promedia) si los validadores superan el umbral. Las penalizaciones acumuladas de la CL que resulten en una reducción del saldo por debajo del saldo de depósito y las recompensas de la EL robadas se confiscan del colateral del Operador de Nodo. Los Operadores de Nodo deben realizar salidas de validadores a solicitud del protocolo o pueden salir voluntariamente.

## 📓 Glosario
- The [**staking router**](../../contracts/staking-router.md) (SR) es un contrato inteligente dentro del protocolo Lido en Ethereum que facilita la asignación de participación y la distribución de recompensas a través de diferentes módulos;
- Un **staking module** (SM) es un contrato inteligente o un conjunto de contratos inteligentes conectados al enrutador de staking, que:
  - mantiene los conjuntos de operadores y validadores subyacentes,
  - es responsable de la incorporación y exclusión de operadores,
  - mantiene los depósitos, retiros y salidas de validadores,
  - mantiene la estructura de tarifas y la distribución para el módulo y los participantes, etc.,
  - se ajusta a la interfaz IStakingModule;
- **Bono** - una garantía de seguridad que los Operadores de Nodo deben presentar antes de cargar validator keys en el CSM. Esta garantía cubre posibles pérdidas causadas por acciones inapropiadas del lado del Operador de Nodo. Una vez que el validador sale de la cadena Beacon y se cubren todas las pérdidas ocurridas, la garantía puede ser reclamada o reutilizada para cargar nuevas validator keys.
- The **Lido DAO** es una Organización Autónoma Descentralizada que decide sobre los parámetros críticos de los protocolos de staking líquido controlados a través del poder de voto del token de gobernanza (LDO).
- Un **Node Operator** (NO) es una persona o entidad que ejecuta validadores;
- [`Lido`](../../contracts/lido.md) es un contrato central del protocolo Lido en Ethereum que almacena el estado del protocolo, acepta las presentaciones de usuarios e incluye el token stETH;
- **stETH** es un token ERC-20 creado por el contrato inteligente [`Lido`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) y representa una participación en el [`totalPooledEther`](../../contracts/lido.md#rebase);
- **Deposit data** se refiere a una estructura que consiste en la clave pública del validador y la firma de depósito enviada al `DepositContract`. Este término también puede referirse como `keys` en el texto. Las claves privadas del validador son creadas, almacenadas y gestionadas exclusivamente por los Node Operators;
- `DepositContract` es el contrato oficial de depósito de Ethereum para depósitos de validadores;
- `DepositSecurityModule` o [**DSM**](../../guías/deposit-security-manual.md) es un conjunto de contratos inteligentes y partes fuera de la cadena que mitigan la [vulnerabilidad de front-running en los depósitos](../../guías/deposit-security-manual.md#la-vulnerabilidad);
- Un validador se considera **"unbonded"** cuando el colateral actual del Node Operator no es suficiente para cubrir a este validador;
- Un validador se considera **"stuck"** si no ha salido a tiempo después de recibir una señal de salida del protocolo;
- El **Curated module** es el primer módulo de staking de Lido anteriormente conocido como [Node Operators Registry](../../contracts/node-operators-registry);
- **Easy Track** es un conjunto de contratos inteligentes y un modelo de votación basado en veto que agiliza las operaciones rutinarias de la DAO;
- [**Accounting Oracle**](../../contracts/accounting-oracle.md) es un contrato que recopila información enviada por oráculos fuera de la cadena sobre el estado de los validadores participantes en Lido y sus saldos, la cantidad de fondos acumulados en los almacenes del protocolo (por ejemplo, bóvedas de recompensas de capa de retiro y ejecución), el número de validadores salidos y atascados, el número de solicitudes de retiro que el protocolo puede procesar y distribuye recompensas a los node operators y realiza el rebase del token `stETH`;
- [**VEBO**](../../contracts/validators-exit-bus-oracle.md) o Validadores Exit Bus Oracle es un contrato que implementa un bus de mensajes "fuente de verdad" en la cadena entre el oráculo fuera de la cadena del protocolo y los observadores fuera de la cadena, con el objetivo principal de enviar solicitudes de salida de validadores a los Node Operators participantes en Lido.

## 🌎 Información general
CSM es un módulo de staking que ofrece entrada sin permisos con un colateral. Este módulo tiene como objetivo convertirse en un camino claro para que los stakers independientes de la comunidad (stakers solitarios o stakers domésticos) ingresen al conjunto de operadores de nodo de Lido en el protocolo Ethereum (LoE). El requisito de colateral es una herramienta esencial de seguridad y alineación que permite la entrada sin permisos sin comprometer la seguridad o la confiabilidad del protocolo subyacente de staking (LoE).

## 🤓 Especificaciones del módulo
Todos los módulos de staking deben cumplir con la misma [interfaz IStakingModule](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol). Esto inevitablemente resulta en que los módulos tengan muchos componentes y lógicas comunes o similares. CSM no es una excepción aquí. Por ejemplo, los componentes de almacenamiento de keys se basan en el módulo Curated existente. Sin embargo, hay varios aspectos diferentes que vale la pena mencionar por separado.

### Salidas y Retiros
El módulo Curated utiliza los estados "exited" del validador (tanto [Slashed y Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#44-Step-4-Slashed-and-Exited) y [Unslashed y Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#45-Step-5-Unslashed-and-Exited)) como el último estado significativo en la contabilidad, ya que después de este estado, el validador ya no es responsable de ningún deber en la cadena Beacon (excepto en casos raros de participación tardía en el comité de sincronización). CSM, por otro lado, necesita conocer el saldo exacto de retiro de cada validador para decidir sobre la penalización del colateral. Por lo tanto, el módulo utiliza el contador "exited" reportado por el oráculo de contabilidad solo para devolver un número correcto de keys "activas" al enrutador de staking e implementa métodos de reporte sin permisos para reportar el saldo de retiro del validador una vez que el validador ha sido [retirado](https://consensys.io/shanghai-capella-upgrade#:~:text=Finally%2C%20the%20withdrawable%20validator%20is%20subject%20to%20the%20same%2C%20automated%20%E2%80%9Csweep%E2%80%9D%20that%20processes%20partial%20withdrawals%2C%20and%20its%20balance%20is%20withdrawn).

### Cola de distribución de Stake
Un Node Operator debe proporcionar un colateral para cargar una nueva validator key en CSM. Es razonable asignar una participación en un orden similar al de la presentación del colateral. Con este propósito, se utiliza una cola de asignación de participación FIFO (primero en entrar, primero en salir) [stake allocation queue](join-csm.md#stake-allocation-queue). Una vez que el enrutador de staking solicita keys para hacer un depósito, se devuelven las próximas `X` keys de la cola, preservando el orden de presentación del colateral.

### Medidas alternativas para keys "stuck"
La presencia de keys "stuck" ("Delinquent" en los [términos originales](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330)) para el Node Operator indica la violación de la [política de salida de Lido](../../guías/node-operators/general-overview#política-de-salida-de-validadores-penalidades-y-recuperación). En este caso, un módulo debe aplicar medidas para el Node Operator que ha violado la política. CSM utiliza medidas que son diferentes de las del módulo Curated. Las medidas se describen en la sección correspondiente [validator-exits.md#protocol-initiated-exits](validator-exits.md#protocol-initiated-exits).

:::info
Nota: CSM no aplica medidas a validadores "Delayed".
:::

### Estructura del Node Operator
La estructura de datos del Node Operator en CSM es similar a la del [módulo Curated](../../contracts/node-operators-registry.md), con algunas diferencias menores:
- La propiedad `name` se omite por redundante para el módulo sin permisos;
- La propiedad `rewardAddress` se utiliza como destinatario de recompensas y reclamaciones de colaterales excedentes;
- Se introduce una nueva propiedad, `managerAddress`. El Node Operator debe realizar llamadas de método desde esta dirección;
- Se introduce una nueva propiedad, `totalWithdrawnKeys`, para contar el número total de keys retiradas por Node Operator;
- Se introduce una nueva propiedad, `depositableValidatorsCount`, para contar los datos de depósito actuales elegibles para depósitos;
- Se introduce una nueva propiedad, `enqueuedCount`, para realizar un seguimiento de las keys depositables que están en la cola. También es útil para determinar las keys depositables que no están en la cola en ese momento;

## Lecturas adicionales

- [Únete a CSM](join-csm.md)
- [Recompensas](rewards.md)
- [Penalizaciones](penalties.md)
- [Salidas de validadores](validator-exits.md)

