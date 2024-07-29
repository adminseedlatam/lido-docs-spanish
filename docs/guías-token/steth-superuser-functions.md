# Funciones de superusuario de stETH

<!--  -->

## Privilegios de superusuario y cuentas

El token StETH es el contrato actualizable detrás del proxy `AppProxyUpgradeable` en [https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84). La DAO de Lido puede cambiar la implementación con una votación exitosa de la DAO.

StETH puede ser detenido mediante votación de la DAO. Ninguna operación que cambie los balances de stETH se puede realizar en el contrato detenido:

1. La llamada `transfer` revertirá.
2. No se pueden realizar mint o burn de tokens stETH. Es importante destacar que el contrato de StETH solo puede hacer mint de stETH en dos casos: cuando un usuario deposita (los tokens se emiten a la dirección del depositante) o en la distribución de tarifas (donde se emiten tokens de acuerdo con los cálculos de tarifas a las direcciones establecidas en el contrato: tesorería de la DAO, fondo de seguros y direcciones de recompensa del operador del nodo).
3. Los usuarios no pueden enviar su ETH a Lido.
4. El Oracle no puede actualizar el estado de staking en la capa de consenso.
5. No se puede enviar ETH almacenado en Lido al contrato de depósito de Ethereum.
6. No se pueden realizar retiros de staking.

## Roles de superusuario

TODO: Rol `BURN_ROLE` desactualizado

El contrato de StETH espscdecifica el `PAUSE_ROLE` (dirección que puede pausar el protocolo) y el `BURN_ROLE` (dirección que puede quemar tokens stETH):

- El `PAUSE_ROLE` está asignado únicamente al contrato de Votación de la DAO [https://etherscan.io/address/0x2e59a20f205bb85a89c53f1936454680651e618e](https://etherscan.io/address/0x2e59a20f205bb85a89c53f1936454680651e618e).
- El `BURN_ROLE` está asignado al contrato [`Burner`](/contracts/burner), con parámetros ACL adicionales que permiten quemar tokens stETH solo desde el balance propio del contrato. Los tokens solo pueden ser quemados por solicitud directa de la DAO.

Es importante destacar que hay otros roles para la gestión de la DAO, pero no afectan las acciones del token. Estos roles son `MANAGE_FEE` (establecer la cantidad de tarifa de staking), `MANAGE_WITHDRAWAL_KEY` (establecer credenciales de retiro del protocolo), y `MANAGE_PROTOCOL_CONTRACTS_ROLE` (establecer dirección del contrato del Oracle, dirección de tesorería de DAO para enviar tarifas, dirección de seguro de DAO para enviar tarifas). Los roles y direcciones se detallan en el siguiente [informe](https://github.com/lidofinance/audits/?tab=readme-ov-file#10-2023-statemind-lido-roles-analysis) independiente a finales de 2023.

## Informes de rebase del Oracle

StETH es un token rebaseable. Recibe informes del contrato de Oracle (`handleOracleReport` método) con el estado de los balances de los validadores de la capa de consenso del protocolo, y actualiza todos los balances de los tenedores de stETH distribuyendo las recompensas totales de staking del protocolo y las penalizaciones. El protocolo emplea reportes distribuidos del Oracle: hay cinco demonios Oracle ejecutados por los operadores de nodo de Lido, y el contrato de Oracle formatea el informe del beacon sobre el consenso de tres de los cinco reportes de demonios. Además de los mecanismos de consenso, existen verificaciones de cordura para reportes con caídas repentinas en el balance total de la capa de consenso o recompensas con APY más altos de lo posible. El contrato de Oracle actual es [https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb](https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb). Tenga en cuenta que: 1) La DAO puede establecer otra dirección para el contrato de Oracle mediante votación; 2) La implementación de Oracle puede cambiar mediante votación.

## Descentralización de los privilegios de superusuario

Los privilegios de superusuario son gestionados por el sistema de gobernanza de la DAO de Lido. Para realizar cualquier cambio, la DAO debe tener una votación exitosa.

Los Oracles son: 1) limitados en impacto 2) distribuidos - hay cinco de ellos, todos operadores de nodo profesionales de alto nivel.

## Umbrales de acciones de superusuario

Las "acciones de superusuario" con el token StETH se realizan mediante votaciones de la DAO. Las votaciones son gestionadas por el sistema de votación Aragon. El poder de voto es proporcional al saldo de tokens LDO de las direcciones. Para que la votación sea exitosa, debe: 1) obtener al menos un 5% del total de LDO para ser emitido "a favor" de la votación; 2) obtener al menos el 50% de los votos emitidos "a favor" de la votación. La duración de la votación es de 72 horas.

Hay cinco demonios Oracle ejecutados por los operadores de nodo de Lido, con 3 de 5 necesarios para estar de acuerdo en los datos que proporcionan. Además de los mecanismos de consenso, existen verificaciones de cordura para reportes con caídas repentinas en el balance total de la capa de consenso o recompensas con APY más altos de lo posible.

## Gestión de claves de superusuario

Los roles de gestión de tokens pertenecen a contratos inteligentes, y cualquier cambio en los roles debe pasar por una votación exitosa de la DAO.

Los operadores de Oracle son: Stakefish, Certus One, Chorus One, Staking Facilities, P2P Validator.

## Procedimiento de generación de claves de superusuario

No hubo una ceremonia especial de generación de claves, ya que los permisos son gestionados por contratos inteligentes. Las votaciones pueden ser emitidas por EOAs y contratos inteligentes con el poder de voto proporcional al saldo de LDO de las direcciones.
