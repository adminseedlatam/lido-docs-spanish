# GateSeal

- [Código fuente](https://github.com/lidofinance/gate-seals/blob/main/contracts/GateSeal.vy)
- [Código fuente de la fábrica](https://github.com/lidofinance/gate-seals/blob/main/contracts/GateSealFactory.vy)
- [Contrato desplegado](https://etherscan.io/address/0x1ad5cb2955940f998081c1ef5f5f00875431aa90)
- [Contrato de fábrica desplegado](https://etherscan.io/address/0x6c82877cac5a7a739f16ca0a89c0a328b8764a24)
- [Contrato de blueprint desplegado](https://etherscan.io/address/0xEe06EA501f7d9DC6F4200385A8D910182D155d3e)

Un botón de pánico de un solo uso para contratos pausables.

## ¿Qué es un GateSeal?

Un GateSeal es un contrato que permite a una cuenta designada poner instantáneamente en pausa (es decir, sellar) un conjunto de contratos por un tiempo limitado. Los GateSeals están diseñados para ser utilizados como un botón de pánico para contratos cruciales en caso de emergencia. Cada GateSeal es de un solo uso y se vuelve inutilizable de inmediato una vez activado. Si el sellado nunca se activa, el GateSeal eventualmente expirará después de un periodo establecido.

## ¿Por qué usar un GateSeal?

Para poner en pausa componentes tan cruciales del protocolo Lido como `WithdrawalQueue` y `ValidatorsExitBusOracle`, el DAO debe llevar a cabo una votación que puede tardar varios días en aprobarse. Los GateSeals proporcionan una forma de pausar temporalmente estos contratos de inmediato si la emergencia requiere una respuesta más rápida. Esto dará al DAO de Lido el tiempo necesario para encontrar una solución, llevar a cabo una votación, implementar cambios, etc.

Cada GateSeal es operado por un comité, esencialmente una cuenta multisig responsable de activar el sellado en caso de problemas. Sin embargo, autorizar a un comité para pausar/reanudar los retiros del protocolo sería completamente imprudente, razón por la cual los GateSeals tienen varias protecciones implementadas:

- cada GateSeal solo puede ser activado una vez y se vuelve inutilizable inmediatamente después,
- cada GateSeal solo puede ser activado dentro de su periodo de validez máximo de 1 año y se vuelve inutilizable después de su marca de tiempo de caducidad incluso si nunca se activó,
- la duración de la pausa establecida en el momento de la construcción está limitada a 14 días.

Por lo tanto, el mayor daño que un multisig de GateSeal comprometido puede infligir es pausar los retiros durante 14 días, siempre y cuando el DAO no reanude los retiros antes a través de una votación de gobernanza.

A pesar de todo esto, sigue siendo indeseable que un protocolo descentralizado dependa de un multisig en cualquier capacidad, razón por la cual los GateSeals son solo una solución temporal; su diseño de uso único y vida útil limitada actúa también como una especie de "bomba de inconveniencia", ya que una vez expirado, el GateSeal debe ser reemplazado y configurado nuevamente.

## ¿Cómo funciona?

La idea de los GateSeals se basa en gran medida en los contratos `PausableUntil`, que implementan tanto `WithdrawalQueue` como `ValidatorsExitBusOracle`. Estos contratos `PausableUntil` son similares a los contratos `Pausable` con una diferencia importante: el estado pausado no es simplemente un valor booleano, sino un timestamp desde el cual el contrato se reanuda (o se despausa). Esto permite al usuario pausar el contrato por un período determinado, tras el cual el contrato se reanudará sin una llamada explícita. Así, el patrón PausableUntil en conjunto con un GateSeal proporciona una forma de detener el protocolo en una situación crítica.

Un GateSeal se configura con una configuración inmutable en el momento de la construcción:

- el comité de sellado, una cuenta responsable de activar el sellado,
- la duración del sellado, un período durante el cual los contratos estarán sellados,
- los contratos a sellar,
- el período de expiración, un período después del cual el GateSeal se vuelve inutilizable.

Es importante destacar que los GateSeals no evitan las configuraciones de control de acceso para contratos pausables, razón por la cual los GateSeals deben recibir los permisos apropiados de antemano. Cuando surge una emergencia, el comité de sellado simplemente llama a la función de sellado y pone los contratos en pausa durante la duración establecida.

## ¿Cómo se crean los GateSeals?

Los GateSeals se crean utilizando el [GateSealFactory](https://github.com/lidofinance/gate-seals/blob/main/contracts/GateSealFactory.vy). La fábrica utiliza el patrón de blueprint mediante el cual se despliegan nuevos GateSeals utilizando el initcode (blueprint) almacenado en la cadena. El blueprint es esencialmente un GateSeal defectuoso que solo se puede usar para crear nuevos GateSeals.

Aunque Vyper ofrece otras formas de crear nuevos contratos, optamos por usar el patrón blueprint porque crea un contrato completamente autónomo sin dependencias. A diferencia de otras funciones que crean contratos, [`create_from_blueprint`](https://docs.vyperlang.org/en/stable/built-in-functions.html#chain-interaction) invoca el constructor del contrato, lo que ayuda a evitar problemas de inicialización.

El blueprint sigue el formato [EIP-5202](https://eips.ethereum.org/EIPS/eip-5202), que incluye un encabezado que hace que el contrato no sea invocable y especifica la versión.
