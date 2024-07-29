# Guía para Easy Track

Este documento está destinado a:

- Los Operadores de Nodos de Lido que desean aumentar sus límites de staking dentro del protocolo Lido;
- Los miembros de la Organización de Subvenciones del Ecosistema Lido que desean asignar fondos al programa LEGO;
- Los miembros del Laboratorio de Observación de Liquidez de Lido que desean asignar fondos a programas de recompensas en curso, agregar un nuevo programa de recompensas a la lista de programas de recompensas activos, o eliminar un programa de recompensas de la lista de programas de recompensas activos.

La guía consta de dos secciones: [Visión general](#visión-general) y [Cómo operar](#cómo-operar). Si estás aquí por los detalles técnicos sobre cómo interactuar con Easy Track, siéntete libre de saltar a la última sección.

## Visión general

### ¿Qué es Easy Track Motion?

Easy Track Motion es un proceso de votación ligero que se considera aprobado si no se alcanza el umbral mínimo de objeciones. A diferencia de la votación regular de Aragon, las mociones de Easy Track son más rentables (ya que los poseedores de tokens solo necesitan votar "en contra" si tienen objeciones, en lugar de votar "a favor") y más fáciles de gestionar (eliminando la necesidad de votaciones amplias de la comunidad DAO en propuestas que no generan un debate significativo).
Para implementar una moción de Easy Track, el umbral mínimo de objeciones no debe alcanzarse dentro de las 72 horas posteriores a la iniciación de la moción. El umbral requiere el apoyo de al menos el 0.5% del suministro total de LDO para rechazar la moción.

Para prevenir el spam de mociones, solo pueden existir hasta 20 mociones activas simultáneamente.

### Motivación detrás de Easy Track

Inicialmente, la gobernanza de Lido DAO solía depender del modelo de votación de Aragon. La DAO aprobaba o rechazaba propuestas mediante votación directa de los tokens de gobernanza. Aunque transparente y confiable, no es una forma conveniente de tomar decisiones que solo afectan a pequeños grupos de miembros de Lido DAO. Además, la votación directa de tokens no reflejaba exactamente todos los procesos de toma de decisiones dentro de Lido DAO y a menudo se utilizaba solo para adoptar un consenso existente. Las votaciones sobre tales decisiones a menudo luchaban por atraer la atención más amplia de la DAO y, por lo tanto, para aprobarse.
Easy Track se ha desarrollado como una solución al problema de la fatiga de gobernanza de la DAO.

### Casos de uso de Easy Track

Hay tres tipos de votaciones que se realizan periódicamente por la DAO de Lido envueltas en las mociones de Easy Track:

- Operadores de nodos aumentando los límites de staking
- Fondos asignados al programa LEGO
- Fondos asignados a programas de recompensas

### Enlaces

Puedes leer más sobre la funcionalidad de Easy Track en el [LIP-3](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-3.md).
Para una descripción técnica más detallada, por favor lee la [especificación](https://github.com/lidofinance/easy-track/blob/master/specification.md) completa del proyecto.

## Cómo operar

- [Guía para operadores de nodos sobre Easy Track](#guía-para-operadores-de-nodos-sobre-easy-track)
- [Guía para LEGO sobre Easy Track](#guía-para-lego-sobre-easy-track)
- [Guía para el Laboratorio de Observación de Liquidez sobre Easy Track](#guía-del-laboratorio-de-observación-de-liquidez-para-easy-track)

## Guía para operadores de nodos sobre Easy Track

Antes de iniciar una moción de Easy Track para aumentar los límites de staking, hay varias características clave a tener en cuenta:

1. **Los operadores de nodos solo pueden aumentar los límites de staking para ellos mismos.** Antes de iniciar una moción, asegúrate de tener acceso a la dirección asociada con el operador de nodo correcto en el Registro de Operadores de Nodos de Lido. Puedes encontrar la dirección correcta en el Panel de Operadores de Nodos en [Holešky](https://operators-holesky.testnet.fi/) o [mainnet](https://operators.lido.fi/)).
2. **Una sola moción solo puede abordar el límite de staking de un solo operador de nodo.** No es posible aumentar los límites para múltiples operadores de nodos en una sola moción.
3. **La cantidad total de claves de firma de un operador de nodo debe ser mayor o igual al nuevo límite de staking.** Asegúrate de haber enviado suficientes claves de firma válidas antes de iniciar una moción.

### Realizar una moción de Easy Track

Para iniciar una moción de Easy Track para el límite de staking, sigue estos pasos:

1. Dirígete a la interfaz de Easy Track ([Holešky testnet](https://easytrack-holesky.testnet.fi/), [mainnet](https://easytrack.lido.fi/))
2. Conecta tu billetera utilizando el botón 'Conectar billetera' en la esquina superior derecha. Por favor usa la dirección especificada como tu dirección de recompensas en el Registro de Operadores de Nodos.
3. En el menú de encabezado, haz clic en el botón 'Iniciar moción'. Serás dirigido a la interfaz de creación de mociones. Busca el tipo de moción 'Aumentar límite de staking del operador de nodo'.
4. Completa todos los campos en el formulario. Tu ID de operador de nodo se puede encontrar en el Panel de Operadores de Nodos en [Holešky](https://operators-holesky.testnet.fi/) o [mainnet](https://operators.lido.fi/) — es el número que se muestra a la derecha de tu nombre de operador de nodo con el prefijo `#`.
5. Ingresa el valor del límite de staking deseado en el campo 'Nuevo límite', presiona el botón 'Enviar' debajo del formulario y firma la transacción (aplican costos de gas).

Tan pronto como la transacción se confirme, la moción habrá comenzado y podrás verla en la página de 'Mociones activas' de la interfaz de Easy Track. Se enviarán notificaciones para informar a la DAO sobre la moción. A partir de este momento, los poseedores de tokens LDO tendrán 72 horas para presentar sus objeciones si tienen alguna. Ten en cuenta que la duración de la moción puede ser diferente para la implementación en testnet.

### Resultados posibles de la moción

Una moción puede tener tres resultados posibles:

1. **Moción aprobada.**
   En caso de que no se haya alcanzado el umbral mínimo de objeciones del 0.5% del suministro total de LDO, se considera que la moción ha sido aprobada y puede ser implementada. Esta operación es sin permisos, lo que significa que cualquiera puede implementar una moción aprobada. Ten en cuenta que todavía es posible objetar una moción no implementada incluso después del bloqueo de tiempo de 72 horas. La moción implementada se desactivará automáticamente y se colocará en el archivo de mociones disponible en la sección 'Mociones archivadas' de la interfaz de Easy Track.
2. **Moción rechazada.**
   En caso de que se haya alcanzado el umbral mínimo de objeciones del 0.5% del suministro total de LDO, se considera que la moción ha sido rechazada. Se desactivará automáticamente y se colocará en el archivo de mociones disponible en la sección 'Mociones archivadas' de la interfaz de Easy Track.
3. **Moción cancelada.**
   En caso de que descubras que cometiste un error al iniciar la moción (por ejemplo, no quieres aumentar tus límites de staking aún o hiciste un clic incorrecto al especificar el nuevo valor del límite, etc.), puedes cancelar la moción en cualquier momento antes de que se haya implementado. Para hacerlo, haz clic en la moción para ver la vista detallada de la moción y presiona el botón 'Cancelar' en la esquina superior derecha. Ten en cuenta que esta es una acción en cadena y deberás firmar una transacción para completarla (aplican costos de gas).

## Guía para LEGO sobre Easy Track

Hay varias características de las mociones de Easy Track de LEGO que debes tener en cuenta antes de iniciar una:

1. **Solo un miembro del comité de LEGO puede iniciar una moción para asignar fondos al programa LEGO.** Antes de iniciar una moción, asegúrate de tener acceso a [la billetera multi-sig de LEGO Committee Gnosis safe](https://gnosis-safe.io/app/#/safes/0x12a43b049A7D330cB8aEAB5113032D18AE9a9030).
2. **Las mociones de Easy Track de LEGO admiten la asignación de fondos en una o múltiples de tres criptomonedas: ETH, stETH y LDO.**

### Realizar una moción de Easy Track

Para iniciar una moción de Easy Track de LEGO, dirígete a la [interfaz de Easy Track](https://easytrack.lido.fi/) y haz clic en el botón 'Conectar' en la esquina superior derecha.
Elige la opción 'Wallet Connect', verás el código QR. Cópialo haciendo clic en el botón 'Copiar al portapapeles' debajo del código.
A continuación, dirígete a [la billetera multi-sig de LEGO Committee Gnosis safe](https://gnosis-safe.io/app/#/safes

/0x12a43b049A7D330cB8aEAB5113032D18AE9a9030) y conecta tu billetera haciendo clic en el botón 'Conectar tu billetera' en la esquina superior derecha.
Abre la sección 'APPS' en el menú lateral y encuentra la aplicación Wallet Connect Safe en la lista.
Pega el código en el campo a la izquierda. Ahora la multi-sig de LEGO Committee Gnosis está conectada a la aplicación Easy Track.

> Debes mantener la pestaña de la aplicación Wallet Connect Safe abierta en tu navegador para que las solicitudes de transacción aparezcan. No recibirás solicitudes de transacción si no la tienes abierta.

En el menú de encabezado de la interfaz de Easy Track, haz clic en el botón 'Iniciar moción'. Verás la interfaz de creación de mociones. El tipo de moción que buscas es 'Top up LEGO'.
Completa el formulario (todos los campos son obligatorios).
Elige el token con el que deseas aumentar el programa LEGO.
Especifica la cantidad de tokens con la que deseas aumentar el programa LEGO.

> Puedes agregar múltiples asignaciones de tokens en una sola moción haciendo clic en 'Un token más' debajo del formulario.

Presiona el botón 'Enviar' debajo del formulario y firma la transacción en la página de la aplicación Wallet Connect safe (aplican costos de gas).
A continuación, necesitarás que otro propietario de la multi-sig de LEGO Committee Gnosis confirme la transacción en Gnosis Safe.
Tan pronto como la transacción se confirme, la moción habrá comenzado y podrás verla en la página de 'Mociones activas' de la interfaz de Easy Track. Se enviarán notificaciones para informar a la DAO sobre la moción. A partir de este momento, los poseedores de tokens LDO tendrán 72 horas para presentar sus objeciones si tienen alguna.

### Resultados posibles de la moción

Una moción puede tener tres resultados posibles:

1. **Moción aprobada.**
   En caso de que no se haya alcanzado el umbral mínimo de objeciones del 0.5% del suministro total de LDO, se considera que la moción ha sido aprobada y puede ser implementada. Esta operación es sin permisos, lo que significa que cualquiera puede implementar una moción aprobada. Ten en cuenta que todavía es posible objetar una moción no implementada incluso después del bloqueo de tiempo de 72 horas. La moción implementada se desactivará automáticamente y se colocará en el archivo de mociones disponible en la sección 'Mociones archivadas' de la interfaz de Easy Track.
2. **Moción rechazada.**
   En caso de que se haya alcanzado el umbral mínimo de objeciones del 0.5% del suministro total de LDO, se considera que la moción ha sido rechazada. Se desactivará automáticamente y se colocará en el archivo de mociones disponible en la sección 'Mociones archivadas' de la interfaz de Easy Track.
3. **Moción cancelada.**
   En caso de que descubras que cometiste un error al iniciar la moción (por ejemplo, no quieres aumentar el programa LEGO aún o hiciste un clic incorrecto al especificar la cantidad de tokens a transferir, etc.), puedes cancelar la moción en cualquier momento antes de que se haya implementado. Para hacerlo, haz clic en la moción para ver la vista detallada de la moción y presiona el botón 'Cancelar' en la esquina superior derecha. Ten en cuenta que esta es una acción en cadena y deberás firmar una transacción en Gnosis safe para completarla (aplican costos de gas).

## Guía del Laboratorio de Observación de Liquidez para Easy Track

Hay varias características de las mociones de Easy Track del Laboratorio de Observación de Liquidez que debe tener en cuenta antes de iniciar una:

1. **Solo un miembro del Laboratorio de Observación de Liquidez de Lido puede iniciar una moción para asignar fondos a programas de recompensas.** Antes de iniciar una moción, asegúrese de tener acceso a [la multi-sig del Laboratorio de Observación de Liquidez en Gnosis Safe](https://gnosis-safe.io/app/eth:0x87D93d9B2C672bf9c9642d853a8682546a5012B5/balances).
2. **Las mociones de Easy Track del Laboratorio de Observación de Liquidez solo admiten la asignación de fondos en stETH y LDO.**
3. **Easy Track del Equipo de Finanzas admite la recarga de múltiples programas de recompensas en una sola moción.** Sin embargo, tenga cuidado, la falta de consenso en un programa de recompensas impedirá que la moción completa sea aprobada.
4. **Para recargar un programa de recompensas a través de una moción de Easy Track, primero debe agregarse a la lista de programas de recompensas activos.** Esta acción requiere una moción separada de Easy Track para completarse.
5. **Cuando ya no esté activo, el programa de recompensas debe eliminarse de la lista de programas de recompensas activos.** Esta acción requiere una moción separada de Easy Track para completarse.

### Realización de una moción Easy Track

Para iniciar una moción Easy Track de LEGO, proceda a la [Interfaz de Easy Track](https://easytrack.lido.fi/) y haga clic en el botón 'Connect' en la parte superior derecha.
Elija la opción 'Wallet Connect', verá el código QR. Cópielo haciendo clic en el botón 'Copy to clipboard' debajo del código.
A continuación, diríjase a [la multi-sig del Laboratorio de Observación de Liquidez en Gnosis Safe](https://gnosis-safe.io/app/eth:0x87D93d9B2C672bf9c9642d853a8682546a5012B5/balances) y conecte su billetera haciendo clic en el botón 'Connect your wallet' en la parte superior derecha.
Abra la sección APPS en el menú del cajón a la izquierda y encuentre la aplicación Wallet Connect Safe en la lista.
Pegue el código en el campo de la izquierda. Ahora la multi-sig del Laboratorio de Observación de Liquidez en Gnosis está conectada a la aplicación Easy Track.

> Necesita mantener la pestaña de la aplicación Wallet Connect Safe abierta en su navegador para que las transacciones aparezcan. No recibirá solicitudes de transacción si no la tiene abierta.

En el menú superior de la interfaz de Easy Track, haga clic en el botón 'Start motion'. Verá la interfaz de creación de mociones. El tipo de moción que busca es 'Add reward program'.
Complete el formulario (todos los campos son obligatorios).
El título debe ser una descripción legible del programa de recompensas (por ejemplo, 'Curve ETH:stETH LP incentives').
Ingrese la dirección de Ethereum del programa de recompensas (podría ser un contrato de recompensas o un contrato de gestión de recompensas dependiendo del programa) en el campo 'Address'.

> Al crear una moción para eliminar un programa de recompensas de la lista o para recargar un programa previamente agregado, podrá elegir un programa por el título del programa, en lugar de pegar la dirección de Ethereum.
> La interfaz para recargar el programa de recompensas toma tokens completos como entrada (por lo tanto, las cantidades están en X LDOs, no en X\*1e18 LDO Weis).

Presione el botón 'Submit' debajo del formulario y firme la transacción en la página de la aplicación Wallet Connect Safe (se aplican costos de gas).
A continuación, necesitará que otro propietario de la multi-sig del Laboratorio de Observación de Liquidez en Gnosis confirme la transacción en Gnosis Safe.
Tan pronto como se confirme la transacción, la moción se habrá iniciado y podrá verla en la página 'Active motions' de la interfaz de Easy Track. Se enviarán notificaciones para informar a la DAO sobre la moción. A partir de este momento, los titulares de tokens LDO tendrán 72 horas para presentar sus objeciones si las tienen.

### Posibles resultados de la moción

Una moción puede tener tres posibles resultados:

1. **Moción aprobada.**
   En caso de que no se alcance el umbral mínimo de objeciones del 0.5% del suministro total de LDO, se considera que la moción ha sido aprobada y puede ser implementada. Esta operación es sin permiso, lo que significa que cualquiera puede implementar una moción aprobada. Tenga en cuenta que todavía es posible objetar una moción no implementada incluso después del período de bloqueo de 72 horas. La moción implementada se desactivará automáticamente y se archivará en la sección 'Archive motions' de la interfaz de Easy Track.
2. **Moción rechazada.**
   En caso de que se alcance el umbral mínimo de objeciones del 0.5% del suministro total de LDO, la moción se considera rechazada. Se desactivará automáticamente y se archivará en la sección 'Archive motions' de la interfaz de Easy Track.
3. **Moción cancelada.**
   En caso de que descubra que ha cometido un error al iniciar la moción (por ejemplo, ha agregado la dirección incorrecta para el nuevo programa de recompensas o ha hecho clic por error al especificar la cantidad de tokens a asignar, etc.), puede cancelar la moción en cualquier momento antes de que se haya implementado. Para hacerlo, haga clic en la moción para ver la vista detallada de la moción y presione el botón 'Cancel' en la parte superior derecha. Tenga en cuenta que esta es una acción en la cadena y deberá firmar una transacción a través de la aplicación Wallet Connect Safe, así como una confirmación de otro propietario de la multi-sig del equipo de finanzas para completarla (se aplican costos de gas).

### Verificación de los detalles de la moción desde la interfaz Multisig de Gnosis

Las transacciones de inicio de moción son creadas por uno de los firmantes de multisig, y los demás deben verificar las direcciones y datos de la transacción que se les pide firmar.

1. Verifique la dirección a la que se envía la transacción — debe ser el contrato `Easy Track` listado en la [página de Contratos Implementados](/deployed-contracts/#easy-track).
2. Los parámetros de la llamada `createMotion` son la dirección `_evmScriptFactory` y la cadena de bytes `_evmScriptCallData`.
   1. La dirección `_evmScriptFactory` debe estar listada en la [página de Contratos Implementados](/deployed-contracts/#easy-track) y coincidir con el tipo de moción que está a punto de iniciarse.
   2. Para verificar `_evmScriptCallData`, abra el contrato `_evmScriptFactory` en etherscan y llame a `decodeEVMScriptCallData` con la cadena desde la interfaz de Gnosis Safe para ver los parámetros de la moción.
