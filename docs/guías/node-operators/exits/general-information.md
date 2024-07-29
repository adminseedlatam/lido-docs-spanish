# Información General

## ¿Qué son los Mensajes de Salida?

Para iniciar un retiro de validador, es necesario generar, firmar y enviar un [mensaje de salida](https://github.com/ethereum/consensus-specs/blob/v1.0.1/specs/phase0/beacon-chain.md#voluntaryexit) a un Nodo de Consenso.

Tiene el siguiente formato:

```json
{
  "message": { "epoch": "123", "validator_index": "123" },
  "signature": "0x123"
}
```

Una vez generado, se firma utilizando la clave BLS del validador que necesita ser retirado y se forma un [mensaje de salida firmado](https://github.com/ethereum/consensus-specs/blob/v1.0.1/specs/phase0/beacon-chain.md#signedvoluntaryexit).

## Pre-firmar o No Pre-firmar

En resumen, es una solución bien equilibrada que permite lograr una automatización significativa sin sacrificar la seguridad o la descentralización.

Puedes encontrar la razón detrás del enfoque sugerido en el [RFC de Automatización de Retiros de Validadores de Lido](https://hackmd.io/@lido/BkxRxAr-o).

Sin embargo, si ya tienes herramientas establecidas para crear y enviar mensajes de salida, puedes utilizar el modo webhook del Ejector, el cual llama a un punto final para iniciar un retiro de validador.

En el punto final, se enviará un JSON con la siguiente estructura:

```json
{
  "validatorIndex": "123",
  "validatorPubkey": "0x123"
}
```

Una respuesta 200 se contará como un retiro exitoso, y cualquier otra respuesta se considerará un fallo.

Si esto no es suficiente, deberás bifurcar el Ejector o monitorear los eventos `ValidatorExitRequest` del [`ValidatorsExitBusOracle`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol) en tus herramientas.

[Ejemplo en el Ejector](https://github.com/lidofinance/validator-ejector/blob/d72cac9767a57936f29c5b54e7de4f74344342de/src/services/execution-api/service.ts#L160-L203)

## ¿Cuántas Claves Pre-firmar?

Los Operadores de Nodo deben pre-firmar una cantidad o porcentaje de validadores con los que se sientan cómodos gestionando. Cantidades más pequeñas significan recargas más frecuentes y viceversa.

Para preparativos de Retiros, por ejemplo, se sugiere pre-firmar retiros para el 10% de los validadores. Después de eso, dependerá de la demanda de Retiros y de las preferencias del Operador de Nodo.

## Cómo Entender Qué Claves Pre-firmar

### Usando KAPI (recomendado)

El primer endpoint devuelve una lista de validadores para un Operador de Nodo específico, para los cuales generar y firmar mensajes de salida a continuación:

`/v1/modules/{module_id}/validators/validator-exits-to-prepare/{operator_id}`

Devuelve datos:

```json
[
  {
    "validatorIndex": 123,
    "key": "0x123"
  }
]
```

Además, también hay un segundo endpoint que calcula los mismos datos, pero devuelve mensajes de salida listos para firmar:

`/v1/modules/{module_id}/validators/generate-unsigned-exit-messages/{operator_id}`

:::danger
Asegúrate de inspeccionar visualmente los datos devueltos como precaución, ya que los firmarás.
Puedes encontrar el formato esperado en la sección [¿Qué son los Mensajes de Salida?](#qué-son-los-mensajes-de-salida).
:::

Devuelve datos:

```json
[
  {
    "validator_index": "123",
    "epoch": "123"
  }
]
```

Además, ambos endpoints permiten configuración adicional a través de parámetros de consulta:

- `percent` - Porcentaje de validadores para devolver datos. El valor predeterminado es 10.
- `max_amount` - Número máximo de validadores para devolver datos. Si el número de validadores es menor que la cantidad especificada, se devuelven todos los validadores.

:::info
Nota: Solo un parámetro está activo a la vez. Si se proporcionan ambos, `percent` tiene prioridad.
:::

KAPI filtrará automáticamente los validadores que ya están retirados o que están en proceso de retiro, por lo que solo se necesita una llamada a KAPI.

### Manualmente

Si tus claves de firmado de validador se almacenan en orden de generación, simplemente puedes comenzar la generación y firma de salidas desde las claves más antiguas, ya que el algoritmo de salida es determinista y elegirá las claves más antiguas primero para cada Operador de Nodo.

Sin embargo, para cada lote, deberás realizar un seguimiento del último mensaje de salida generado o consultar los estados de los validadores en el Nodo de Consenso para entender dónde comenzar después.

## Almacenamiento de Mensajes de Salida Firmados

Se desaconseja almacenar los mensajes de salida firmados tal como están. Si un atacante obtiene acceso a ellos, simplemente los enviará, lo que hará que se retiren todos los validadores para los cuales tenías mensajes de salida.

Se recomienda cifrar los mensajes, por ejemplo, utilizando el script de cifrado proporcionado con el Ejector.

[Cómo Usar el Encriptador del Ejector](https://hackmd.io/@lido/BJvy7eWln#Encrypting-Messages)

También puedes revisar el [código fuente](https://github.com/lidofinance/validator-ejector/blob/develop/encryptor/encrypt.ts) e integrarlo en tus propias herramientas si es necesario.

El Ejector descifra automáticamente los archivos cifrados con [EIP-2335](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2335.md) al iniciar la aplicación.

## Cómo Iniciar un Retiro de Validador

Los mensajes firmados se envían a un Nodo de Consenso a través del endpoint `/eth/v1/beacon/pool/voluntary_exits` para iniciar un retiro.

El Ejector hará esto automáticamente cuando sea necesario.

Si no ejecutas el Ejector, deberás hacerlo manualmente o desarrollar tus propias herramientas.
Si tus mensajes de salida están cifrados, deberás descifrarlos primero.
