# Comité de Seguridad de Depósitos: Manual

Esta instrucción ha sido preparada para los participantes del Comité de Seguridad de Depósitos y describe los puntos generales, los pasos de preparación para actuar como guardianes y los detalles del mecanismo de protección. El Comité de Seguridad de Depósitos es necesario para evitar la sustitución de credenciales de retiro con frontrunning por parte de los operadores de nodos. Cada miembro del comité debe realizar varias acciones para garantizar la seguridad de los depósitos realizados en Lido. Para participar en la validación, deberá desplegar un `lido-council-daemon` y preparar una clave privada para firmar mensajes sobre la corrección de datos o la necesidad de detener los depósitos en caso de ataque.

## TL;DR

Antes de ejecutar en la red principal, todos los pasos deben completarse en la red de prueba Holešky.

1. Prepare una cuenta EOA para firmar datos con una clave privada disponible (no en una billetera de hardware). Será una clave privada caliente moderadamente sensible. Use cuentas diferentes para la red de prueba y la red principal.
2. Envíe la dirección de la cuenta a Lido para que la incluya en el contrato inteligente.
3. Despliegue y ejecute `lido-council-daemon` con la clave privada de la cuenta EOA. Funcionará en modo de prueba hasta que su dirección esté incluida en el contrato inteligente.

## Descripción detallada

### La vulnerabilidad

Existe una vulnerabilidad que permite a un operador de nodo malicioso interceptar los fondos de los usuarios en los depósitos a la cadena Beacon en el protocolo Lido. La vulnerabilidad solo podría ser explotada si el operador de nodo realiza un frontrunning de la transacción `Lido.depositBufferedEther` con un depósito directo al Contrato de Depósitos de al menos 1 ETH con la misma clave pública del validador y credenciales de retiro diferentes a las de Lido, obteniendo efectivamente el control sobre 32 ETH de Lido. Para mitigar esto, los contratos de Lido deberían poder verificar que las claves de los operadores de nodos no se hayan utilizado para pre-depósitos maliciosos.

### El Comité de Seguridad de Depósitos

Proponemos establecer el Comité de Seguridad de Depósitos dedicado a garantizar la seguridad de los depósitos en la cadena Beacon:

- monitoreando el historial de depósitos y el conjunto de claves de Lido disponibles para el depósito, firmando y difundiendo mensajes que permitan los depósitos;
- firmando el mensaje especial que permite a cualquiera pausar los depósitos una vez detectados los pre-depósitos maliciosos del operador de nodo.

Para realizar un depósito, proponemos reunir un quórum de 2/3 de las firmas de los miembros del comité. Los miembros del comité pueden coludirse con los operadores de nodos y robar dinero firmando datos incorrectos que contengan pre-depósitos maliciosos. Para mitigar esto, proponemos permitir que un único miembro del comité detenga los depósitos y también imponer límites de espacio en el tiempo (por ejemplo, no más de 150 depósitos con 150 bloques entre ellos), para proporcionar a un único participante honesto la capacidad de detener futuros depósitos incluso si la mayoría supermayoritaria coludiera. La idea se delineó en el post del foro de investigación como la opción [d](https://research.lido.fi/t/mitigations-for-deposit-front-running-vulnerability/1239#d-approving-deposit-contract-merkle-root-7).

### Membresía del Comité

El primer conjunto de guardianes está compuesto por seis operadores de nodos (Stakefish, Skillz, Chorus one, Blockscape, Staking facilities, P2P) y el equipo de desarrollo de Lido. En el futuro, queremos involucrar a tantos operadores de nodos como sea posible, por lo que se espera que mientras los 7 guardianes comienzan, el resto de los operadores de nodos también puedan participar a través de la red de prueba y gradualmente ser incorporados en la red principal.

### Responsabilidades de los miembros

Cada miembro debe preparar una cuenta EOA para firmar el par `(depositRoot, keysOpIndex)` con su clave privada. Las direcciones de los miembros del comité se agregarán al contrato inteligente. Además, el miembro debe ejecutar `DSC Daemon` que monitorea las claves públicas de los validadores en `DepositContract` y `NodeOperatorRegistry`. El daemon debe tener acceso a la clave privada del miembro del comité para poder realizar la firma ECDSA.

El daemon vigila constantemente todas las actualizaciones en `DepositContract` y `NodeOperatorRegistry`:

- Si el estado es correcto, firma la estructura actual `to_sign` y la emite a una cola de mensajes fuera de cadena.
- Si el estado tiene pre-depósitos maliciosos, firma el mensaje de "algo está mal" en el bloque actual, lo emite a una cola de mensajes e intenta enviar la transacción `pauseDeposits()`.

## Pasos de preparación

Antes de ejecutar en la red principal, todos los pasos deben completarse en la red de prueba Holešky.

### Cuenta EOA

Puede ser cualquier cuenta EOA bajo el control del miembro. Envíe la dirección de su cuenta a Lido para incluirla en el contrato inteligente. Lido proporcionará ETH para realizar transacciones de detención si fuera necesario (lo cual no debería ocurrir). Tenga en cuenta que todas las acciones, excepto el envío del mensaje de detención, se realizarán fuera de la cadena.

### Ejecutar lido-council-daemon

Para iniciar la aplicación, consulte la documentación técnica en el [repositorio del proyecto](https://github.com/lidofinance/lido-council-daemon#table-of-contents).