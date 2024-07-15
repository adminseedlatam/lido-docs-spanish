### Visión general

Los Operadores de Nodo gestionan una infraestructura segura y estable para ejecutar clientes validadores de Beacon en beneficio del protocolo. Son proveedores profesionales de participación que pueden garantizar la seguridad de los fondos pertenecientes a los usuarios del protocolo y la corrección de las operaciones del validador.

El flujo general es el siguiente:

1. **Expresión de interés y votación de la DAO:**
   - Un Operador de Nodo expresa su interés a los miembros de la DAO. Su dirección se propone para ser incluida en la lista de Operadores de Nodo de la DAO.
   - La dirección del Operador de Nodo debe ser suministrada al DAO con un límite de cero claves de firma.

2. **Votación de la DAO:**
   - la DAO vota para incluir al Operador en la lista de operadores activos. Después de una votación exitosa para la inclusión, el Operador de Nodo se vuelve activo.

3. **Generación y presentación de claves de firma:**
   - El Operador de Nodo genera y presenta un conjunto de claves públicas de firma y las firmas asociadas para futuros validadores que serán gestionados por el Operador.
   - Al generar las firmas, el Operador debe usar credenciales de retiro derivadas de la dirección de retiro proporcionada por la DAO.

4. **Verificación y aprobación de claves:**
   - Los miembros de la DAO verifican las claves presentadas para asegurar su corrección. Si todo está en orden, votan para aprobarlas.
   - Después de la aprobación exitosa, las claves se vuelven utilizables por el protocolo.

5. **Distribución de ether:**
   - El protocolo distribuye ether agrupado de manera uniforme entre todos los Operadores de Nodo activos en lotes de `32 ether`.
   - Al asignar el próximo depósito a un Operador de Nodo, se toma la primera clave de firma no utilizada, junto con la firma asociada, del conjunto utilizable del Operador de Nodo.
   - Se realiza un depósito en el `DepositContract` oficial, enviando los fondos agrupados en ese momento. En este punto, el Operador de Nodo debe tener el validador ya en funcionamiento y configurado con la clave pública utilizada.

6. **Responsabilidad del Operador de Nodo:**
   - A partir de este punto, el Operador de Nodo es responsable de mantener el validador asociado con la clave de firma operativo y en buen funcionamiento.

7. **Inclusión de Oráculos:**
   - El protocolo incluye Oráculos que periódicamente informan el saldo combinado de Beacon de todos los validadores lanzados por el protocolo.
   - Cuando el saldo aumenta debido a las recompensas de la cadena Beacon, se aplica una tarifa del monto de las recompensas (ver más abajo para los detalles sobre cómo se denomina la tarifa) y se distribuye entre los Operadores de Nodo activos.

8. **Solicitud de retiros:**
   - A medida que se solicitan los retiros, el protocolo publica solicitudes de salida y los Operadores de Nodo retiran los validadores solicitados.

## La tarifa

La tarifa se toma como un porcentaje de las recompensas de la cadena Beacon en el momento en que los Oráculos informan esas recompensas. Los Oráculos hacen esto de vez en cuando; el período exacto se decide mediante el proceso de votación de la DAO.

El porcentaje total de la tarifa, así como el porcentaje que va a todos los Operadores de Nodo, también se decide mediante votación de la DAO y puede cambiarse durante la vida útil de la DAO. La parte de los Operadores de Nodo de la tarifa se distribuye entre los Operadores de Nodo activos de manera proporcional al número de validadores que cada Operador de Nodo gestiona.

> Por ejemplo, si los Oráculos informan que el protocolo ha recibido 10 ether como recompensa, el porcentaje de tarifa que va a los Operadores es del `10%`, y hay dos Operadores de Nodo activos que gestionan `2` y `8` validadores, respectivamente, entonces el primer operador recibirá `0.2` stETH y el segundo `0.8` stETH.

La tarifa está nominada en stETH, una versión líquida de ETH congelado introducida por el protocolo Lido. Los tokens corresponden en una proporción de 1:1 al ether que el titular del token podría obtener quemando su stETH si las transferencias ya estuvieran habilitadas en la cadena Beacon. En cualquier punto temporal, la cantidad total de tokens stETH es igual a la cantidad total de ether controlado por el protocolo en las capas de Ejecución y Consenso.

Cuando un usuario envía ether al pool, recibe la misma cantidad de tokens stETH recién acuñados. Cuando se recibe una recompensa en la capa de Consenso, el saldo de cada titular de stETH aumenta en el mismo porcentaje que ha aumentado la cantidad total de ether controlada por el protocolo, ajustado por la tarifa del protocolo que se toma [acuñando nuevos tokens stETH] para los destinatarios de la tarifa.

> Por ejemplo, si la recompensa ha aumentado la cantidad total de ether controlado por el protocolo en un `10%`, y el porcentaje total de tarifa del protocolo es `10%`, entonces el saldo de cada titular de token aumentará aproximadamente en un `9.09%`, y el `10%` de la recompensa se enviará al tesoro, fondo de seguro y Operadores de Nodo.

Un efecto secundario de esto es que, como Operador de Nodo, seguirás recibiendo el porcentaje de las recompensas del protocolo incluso después de dejar de validar activamente, si decides mantener stETH recibido como tarifa.

[minting new steth tokens]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L576

## Expresando interés ante los titulares de la DAO

Para incluir a un Operador de Nodo en el protocolo, los titulares de la DAO deben realizar una votación. Un Operador de Nodo se define por una dirección que se utiliza para dos propósitos:

1. El protocolo paga la tarifa mediante la acuñación de tokens stETH en esta dirección.
2. El Operador de Nodo utiliza esta dirección para enviar claves de firma que serán utilizadas por el protocolo.

Pase esta dirección a los titulares de la DAO junto con otra información relevante.

## Política de Salida de Validadores, Penalidades y Recuperación

Según el documento [Lido on Ethereum Validator Exits Policy](https://github.com/lidofinance/documents-and-policies/blob/7595317b8fd2ee60ab25f5cac8eac2cc2cafa149/Lido%20on%20Ethereum%20-%20Validator%20Exits%20Policy.md), un Operador de Nodo que participe en el protocolo Lido en Ethereum es responsable de salir correctamente de los validadores dentro de un período especificado determinado por los requisitos del protocolo y las reglas establecidas por la DAO.

En resumen, si un Operador de Nodo no puede retirar un validador dentro del tiempo especificado por el parámetro `VALIDATOR_DELINQUENT_TIMEOUT_IN_SLOTS` en el contrato `OracleDaemonConfig`, el informe del oráculo contable para ese Operador de Nodo aumenta el campo `STUCKED` por el número de validadores retrasados.

Por lo tanto, un Operador de Nodo recibe una penalización si tiene más validadores `STUCKED` que `REFUNDED`. Mientras se cumpla esta condición, el Operador de Nodo recibe solo la mitad de las recompensas y no se le asignan nuevas asignaciones de participación.

Una vez que el Operador de Nodo logra retirar el número requerido de validadores o compensar los validadores perdidos y aumentar el recuento `REFUNDED` a través de la votación de la DAO, se considera que el Operador de Nodo está bajo penalización durante el período de `STUCK_PENALTY_DELAY` y luego regresa al estado normal. Las recompensas se restauran automáticamente a la normalidad, pero para comenzar a recibir una nueva participación, el Operador de Nodo (o cualquier otra persona) debe llamar al método sin permiso `clearNodeOperatorPenalty`.

Para eliminar la penalización, por favor envíe una transacción con el `_nodeOperatorId` deseado: [https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5#writeProxyContract#F2](https://etherscan.io/address/0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5#writeProxyContract%23F2)