# Penalizaciones

## Razones
Existen tres razones principales por las cuales se puede penalizar el bono del Operador de Nodo de CSM:

1. **El validador ha sido penalizado.** En este caso, se confisca la [penalización inicial (mínima) por penalización](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/beacon-chain.md#modified-slash_validator). Monto de la penalización = `1 ETH`;
   
2. **El operador ha robado recompensas EL (MEV).** Monto de la penalización = `cantidad robada + multa fija por robo` (puede aplicarse a través de múltiples validadores de ON);
   
3. **El saldo de retiro del validador es menor que `DEPOSIT_AMOUNT` (32 ETH).** Monto de la penalización = `DEPOSIT_AMOUNT - saldo de retiro del validador`;

La primera penalización se informa de manera permisiva utilizando [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788) para demostrar el hecho del penalización. Esta penalización se aplica inmediatamente dentro de la transacción de informe.

La segunda penalización tiene la forma de una penalización retrasada con un período de desafío. Un comité dedicado (reportero) detecta el robo de MEV (violación de la [Política de Recompensas de Propositor de Bloques Lido en Ethereum](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)) y reporta este hecho en cadena, bloqueando los fondos del bono. La resolución sobre la propuesta de EasyTrack (asentador) asegura la alineación entre la DAO y el comité de detección. Una vez que se resuelve la penalización (confirmada), todos los beneficios del Operador de Nodo se restablecen debido a la violación de las reglas del protocolo. Si la penalización no se resuelve dentro del `periodo_retención`, el bono bloqueado se desbloquea automáticamente.

El tercer tipo de penalización se calcula utilizando el saldo de retiro del validador (el informe actual se describe en la sección siguiente). Esta penalización se aplica inmediatamente dentro de la transacción de informe. Si se aplica la penalización inicial por penalización (primer tipo de penalización), se contabilizará para evitar la doble penalización.

## Inmediata y con período de desafío
Se introducen los siguientes esquemas de penalización:

1. **Penalización inmediata** (para penalizaciones que son inequívocas y pueden evaluarse mediante pruebas sin confianza);
   
2. **Penalización retrasada con período de desafío** (para casos donde pueden ocurrir falsos positivos o se necesita investigación);

El período de desafío para las penalizaciones retrasadas se implementa separando dos roles involucrados en la aplicación de la penalización.

El primer rol es el "reportero". Los miembros de este rol pueden informar inicialmente sobre un hecho que debería resultar en una penalización. Los fondos del bono se bloquearán pero no se quemarán ni confiscarán en esta etapa. Los "reporteros" también pueden revocar el informe inicial en caso de que se resuelva el desafío a favor del Operador de Nodo.

El segundo rol se llama "asentador". Los miembros de este rol pueden finalizar (resolver) penalidades informadas previamente.

La separación de estos dos roles asegura que una penalización solo se pueda aplicar cuando dos actores independientes estén de acuerdo.

## Mecánicas
Hay dos mecánicas relacionadas con la penalización del bono del Operador de Nodo.

La primera es la quema de acciones stETH utilizando el [Quemador](../../contracts/burner). Una vez que se queman las acciones confiscadas, la cantidad total de acciones stETH disminuye. Por lo tanto, `shareRate` aumenta, distribuyendo efectivamente todo el valor stETH quemado entre otros tenedores de stETH.

La segunda mecánica es transferir stETH confiscado al [Tesoro de la DAO de Lido](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c). Este enfoque se aplica a las penalizaciones que se utilizan para cubrir los costos operativos del protocolo (por ejemplo, `removalCharge`).

Los fondos penalizados se queman por todas las razones descritas en la sección anterior. Actualmente, la única penalización transferida al Tesoro es el `removalCharge`.

## Escasez de bonos
Si, después de aplicar las penalizaciones, el bono de un Operador de Nodo es menor que el requerido para cubrir los validadores actuales del Operador de Nodo, todas las nuevas recompensas se utilizarán para reponer el bono de ON hasta que vuelva al nivel requerido. Los Operadores de Nodo también pueden "recargar" el bono ellos mismos (mediante la presentación de la diferencia requerida) para poder reclamar nuevas recompensas.

Si la cantidad de la penalización supera el monto del bono del Operador de Nodo disponible, todos los fondos disponibles se queman.

## Restablecimiento de beneficios
Una curva de bono diferente de la predeterminada puede tratarse como un beneficio para el Operador de Nodo. Es crucial asegurar un restablecimiento de los beneficios en caso de rendimiento inapropiado o violaciones de reglas. Hay 4 casos en los que los beneficios pueden restablecerse para el Operador de Nodo en CSM:
- Se detecta y confirma el robo de recompensas EL;
- Se informa sobre un corte para uno de los validadores de ON;
- Uno de los validadores de ON es expulsado debido a un saldo de CL insuficiente (para implementarse después del hardfork de Pectra que trae [EIP-7002](https://eips.ethereum.org/EIPS/eip-7002) a la vida);
- Basado en la decisión de la DAO;

Si el Operador de Nodo sale voluntariamente de todos los validadores y reclama todo el bono, los beneficios no se restablecen ya que no hubo acciones maliciosas o ilegales por parte del Operador de Nodo.

Se presenta una investigación detallada sobre este tema en un [documento separado](https://hackmd.io/@lido/SygBLW5ja).

## Lecturas adicionales

- [Salidas de validadores](validator-exits.md)

## Enlaces útiles

- [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788)
- [Política de Recompensas de Propositor de Bloques Lido en Ethereum](https://snapshot.org/#/lido-snapshot.eth/proposal/0x7ac2431dc0eddcad4a02ba220a19f451ab6b064a0eaef961ed386dc573722a7f)
