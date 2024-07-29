# Validator Ejector

## Introducción

Ejector es un servicio daemon que monitorea los eventos de [ValidatorsExitBusOracle](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol) y envía mensajes de salida almacenados cuando es necesario. Permite a los Node Operators generar y firmar mensajes de salida con anticipación, los cuales serán enviados por Ejector cuando el Protocolo solicite realizar una salida.

Al iniciar, carga los mensajes de salida desde una carpeta especificada en forma de archivos individuales `.json` y valida su formato, estructura y firma. Luego, carga eventos de una cantidad configurable de bloques finalizados más recientes, verifica si se deben realizar salidas y periódicamente obtiene eventos frescos.

## Requisitos

### Hardware

- CPU de 2 núcleos
- 1GB de RAM

### Nodos

- Nodo de Ejecución - [Se requiere un nodo completo](https://ethereum.org/en/developers/docs/nodes-and-clients/#node-types)
- Nodo de Consenso

### Software

#### Utilizando Docker:

Docker + docker-compose.

#### Ejecutando directamente o para encriptación de mensajes:

Node.js 16.

## Mensajes de Salida

Ejector carga y valida los mensajes de salida al inicio. Esto significa que cualquier cambio en la carpeta de mensajes (por ejemplo, nuevos mensajes de salida) requiere un reinicio de la aplicación para ser detectado.

Ejector acepta mensajes en tres formatos:

### Formato Genérico

```json
{
  "message": { "epoch": "123", "validator_index": "123" },
  "signature": "0x123"
}
```

### Formato de Salida de ethdo

```json
{
  "exit": {
    "message": { "epoch": "123", "validator_index": "123" },
    "signature": "0x123"
  },
  "fork_version": "0x123"
}
```

### Formato Encriptado

```json
{
  "version": 4,
  "uuid": "123abc-123abc-123abc",
  "path": "",
  "pubkey": "",
  "crypto": {
    "kdf": {
      "function": "pbkdf2",
      "params": {
        "dklen": 123,
        "c": 123,
        "prf": "hmac-sha256",
        "salt": "123abc"
      },
      "message": ""
    },
    "checksum": {
      "function": "sha256",
      "params": {},
      "message": "123abc"
    },
    "cipher": {
      "function": "aes-128-ctr",
      "params": { "iv": "123abc" },
      "message": "123abc"
    }
  }
}
```

## Encriptación de Mensajes

Se recomienda encarecidamente que después de generar y firmar los mensajes de salida, se encripten para la seguridad del almacenamiento. Ejector descifrará los archivos al inicio buscando la contraseña en la variable de entorno `MESSAGES_PASSWORD`.

Los mensajes de salida se encriptan y descifran siguiendo la especificación [EIP-2335](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2335.md).

Ejector incluye un pequeño y fácil de usar script de encriptación.

### Encriptación usando Ejector - Código Fuente

1. Clonar el repositorio:

```bash
git clone https://github.com/lidofinance/validator-ejector.git
cd validator-ejector
```

2. Crear el archivo `.env` con la contraseña de encriptación o pasarla antes del comando:

```
MESSAGES_PASSWORD=password
```

3. Copiar los archivos JSON de mensajes de salida a `encryptor/input`
4. Ejecutar `yarn & yarn encrypt`
5. Los archivos de mensajes de salida encriptados se guardarán en `encryptor/output`

### Encriptación usando Ejector - Docker

Ejector incluye un script de encriptación dentro, por lo que se puede ejecutar usando la misma imagen Docker:

```bash
docker run \
		-e MESSAGES_PASSWORD=secret \
		-v /full/path/to/input:/app/encryptor/input/ \
		-v /full/path/to/output:/app/encryptor/output/ \
		lidofinance/validator-ejector@sha256:<hash> \
		node /app/dist/encryptor/encrypt.js
```

Puedes encontrar el hash de la versión recomendada [aquí](/guías/tooling).

Para plataformas con una arquitectura diferente pero con soporte de emulación/transpilación como macOS en procesadores M, especifica adicionalmente:

```bash
--platform linux/amd64
```

## Variables de Entorno

### EXECUTION_NODE

Dirección del Nodo de Ejecución.

### CONSENSUS_NODE

Dirección del Nodo de Consenso.

### LOCATOR_ADDRESS

Dirección del contrato [LidoLocator](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/LidoLocator.sol): [Holešky](https://docs.lido.fi/deployed-contracts/holesky) / [Mainnet](https://docs.lido.fi/deployed-contracts/)

# STAKING_MODULE_ID

ID del contrato StakingRouter: [StakingRouter.sol](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol). Actualmente, solo tiene un módulo ([NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)), cuyo ID es `1`.

# OPERATOR_ID

Puedes encontrar este ID en el Panel de Operadores (`#123` en la tarjeta del operador): [Holešky](https://operators-holesky.testnet.fi) / [Mainnet](https://operators.lido.fi).

# MESSAGES_LOCATION

Ubicación desde la cual cargar los mensajes de salida en formato `.json`.

Cuando se establece, activa el modo de mensajes. No es necesario si estás utilizando Ejector en modo webhook.

Por ejemplo, `/messages` en Docker o simplemente `messages` si se ejecuta directamente para archivos locales.

También se admite la URL de un bucket de almacenamiento externo para AWS S3 y Google Cloud Storage:

- `s3://` para S3
- `gs://` para GCS

Configuración de autenticación: [GCS](https://cloud.google.com/docs/authentication/application-default-credentials#attached-sa), [S3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

# VALIDATOR_EXIT_WEBHOOK

Endpoint al cual hacer una solicitud cuando se requiere una salida. Permite implementar un enfoque Just-in-Time (JIT) descargando la lógica de salida a un servicio externo y utilizando Ejector como lector seguro de eventos de salida.

Cuando se establece, activa el modo webhook. No es necesario si estás utilizando Ejector en modo mensajes.

En el endpoint, se realizará un POST de JSON con la siguiente estructura:

```json
{
  "validatorIndex": "123",
  "validatorPubkey": "0x123"
}
```

Se considerará una salida exitosa si la respuesta es 200, y como fallida si no lo es.

# ORACLE_ADDRESSES_ALLOWLIST

Un array JSON de direcciones de oráculos de Lido, de las cuales solo se aceptarán transacciones de informe.

Puedes obtener una lista desde Etherscan en [Holešky](https://holesky.etherscan.io/address/0xa067FC95c22D51c3bC35fd4BE37414Ee8cc890d2#readContract#F16) o [Mainnet](https://etherscan.io/address/0xD624B08C83bAECF0807Dd2c6880C3154a5F0B288#readContract#F16).

Formato:

```json
["0x123", "0x123"]
```

# MESSAGES_PASSWORD

Contraseña para descifrar los mensajes de salida encriptados al inicio de la aplicación.

# MESSAGES_PASSWORD_FILE

Alternativa a `MESSAGES_PASSWORD`. Ruta a un archivo con la contraseña dentro para descifrar los mensajes de salida. Si se utiliza, `MESSAGES_PASSWORD` (no `MESSAGES_PASSWORD_FILE`) debe agregarse a `LOGGER_SECRETS` para que se oculte.

# BLOCKS_PRELOAD

Cantidad de bloques desde los cuales cargar eventos al iniciar.

Se sugiere incluirlo en tus variables de entorno, pero dejar el valor predeterminado de 50000 (~7 días de bloques).

En caso de una emergencia que requiera que Ejector esté inactivo, este valor puede ajustarse para permitir cargar una cantidad mayor de bloques al inicio.

# HTTP_PORT

Puerto para servir métricas y un punto de verificación de salud. El valor predeterminado es 8989.

# RUN_METRICS

Habilita con `true` para servir métricas de Prometheus: [lista completa](https://github.com/lidofinance/validator-ejector#metrics).

Se servirá en `HOST:$HTTP_PORT/metrics`.

Altamente recomendado para monitoreo y alertas.

# RUN_HEALTH_CHECK

Habilitado por defecto, deshabilitado con `false`. Altamente recomendado para monitorear este endpoint.

Se servirá en `HOST:$HTTP_PORT/health`.

# LOGGER_LEVEL

Recomendado establecerlo en `info` (predeterminado), puede cambiarse a `debug` en caso de problemas para facilitar la depuración.

# LOGGER_FORMAT

Formato de los logs, por defecto es `simple`, pero puede establecerse en `json` para que sea fácilmente interpretable por [Loki](https://github.com/grafana/loki), por ejemplo.

# LOGGER_SECRETS

Nombres de variables de entorno o valores exactos que deben reemplazarse en los logs, en formato de array JSON de cadenas.

Se recomienda incluir tu `MESSAGES_PASSWORD`, `EXECUTION_NODE`, y `CONSENSUS_NODE`:

```json
["MESSAGES_PASSWORD", "EXECUTION_NODE", "CONSENSUS_NODE"]
```

Asegúrate de copiar correctamente las comillas si copias este ejemplo.

# DRY_RUN

Permite probar la aplicación con `true` sin enviar realmente mensajes de salida.

¡Úsalo con precaución!

Asegúrate de establecerlo en `false` o de eliminarlo completamente en producción.

# Parámetros Avanzados

Por favor, no los utilices a menos que lo sugiera un contribuidor de Lido.

- BLOCKS_LOOP - 900 (3 horas de bloques) - Cantidad de bloques que Ejector observa en trabajos de sondeo al despertar.
- JOB_INTERVAL - 384000 (1 epoch) - Tiempo que Ejector duerme entre trabajos.
- DISABLE_SECURITY_DONT_USE_IN_PRODUCTION - false - Establecer en `true` para omitir controles de seguridad, por ejemplo, si el contrato de Consenso de Bus de Salida fue cambiado después de que Ejector no pudiera salir de los validadores, por ejemplo, si fue desactivado.

## Ejecución

### Código Fuente

1. Clona el repositorio:

```bash
git clone https://github.com/lidofinance/validator-ejector.git
cd validator-ejector
```

2. Crea una carpeta de mensajes de salida, por ejemplo, localmente `mkdir messages`.
3. Coloca los archivos de mensajes de salida en la carpeta de mensajes.
4. Copia el archivo de ejemplo de env: `cp sample.env .env`.
5. Llena las variables de entorno en el archivo `.env`.
6. Ejecuta:

```bash
yarn
yarn build
yarn start
```

### Docker con docker-compose

1. Crea una carpeta raíz para Ejector, y entra en esa carpeta.
2. Crea una carpeta de mensajes de salida `mkdir messages`.
3. Coloca los archivos de mensajes de salida en la carpeta de mensajes.
4. Copia el archivo de env: `cp sample.env .env`.
5. Crea un archivo `docker-compose.yml` utilizando la siguiente plantilla:

https://github.com/lidofinance/validator-ejector/blob/develop/docker-compose.yml

6. Ejecuta `docker-compose up` o `docker-compose up -d` para iniciar en modo desacoplado (en segundo plano).

## Verificación de que Ejector está funcionando

1. Asegúrate de que no haya errores en los logs y de que no haya reinicios.
2. Verifica que la configuración registrada al inicio sea correcta en los logs.
3. Si has colocado mensajes prefirmados en la carpeta de mensajes, asegúrate de que el recuento de mensajes cargados sea mayor que `0`.
4. Asegúrate de ver líneas como `Job started` y `Job finished` en los logs.

Ejemplo de logs de operación correcta:

```
info: Application started, version 1.0.0 {"EXECUTION_NODE":"<secret>","CONSENSUS_NODE":"<secret>","LOCATOR_ADDRESS":"0x123","STAKING_MODULE_ID":"1","OPERATOR_ID":"0","MESSAGES_LOCATION":"messages","ORACLE_ADDRESSES_ALLOWLIST":["0x123"],"MESSAGES_PASSWORD":"<secret>","BLOCKS_PRELOAD":190000,"BLOCKS_LOOP":64,"JOB_INTERVAL":384000,"HTTP_PORT":8989,"RUN_METRICS":true,"RUN_HEALTH_CHECK":true,"DRY_RUN":false}
info: Loading messages from messages
info: Loaded 123 messages
info: Validating messages
info: Starting, searching only for requests for operator 0
info: Loading initial events for 190000 last blocks
info: Job started {"operatorId":"0","stakingModuleId":"1","loadedMessages":123}
info: Resolved Exit Bus contract address using the Locator {"exitBusAddress":"0x123"}
info: Resolved Consensus contract address {"consensusAddress":"0x123"}
info: Fetched the latest block from EL {"latestBlock":12345}
info: Fetching request events from the Exit Bus {"eventsNumber":190000,"fromBlock":12345,"toBlock":12345}
info

: Loaded ValidatorExitRequest events {"amount":0}
info: Handling ejection requests {"amount":0}
info: Job finished
info: Starting 384 seconds polling for 64 last blocks
```

## ¿Qué hacer si algo está mal?

1. Asegúrate de que la configuración sea correcta.
2. Asegúrate de estar usando el hash SHA o la versión recomendada de la imagen Docker.
3. Verifica que los nodos estén sincronizados y funcionando correctamente.
4. Reinicia la aplicación.
5. Inicia la aplicación con la variable de entorno `LOGGER_LEVEL=debug` y contacta a los desarrolladores de Lido con los logs para investigar el problema.

## Recursos Adicionales

Repositorio GitHub de Validator Ejector (Open Source)
https://github.com/lidofinance/validator-ejector

Retiros de Lido: Automatización de Salidas de Validador - algunas partes pueden estar desactualizadas
https://hackmd.io/@lido/BkxRxAr-o

Especificación de la Lógica de Ejector - algunas partes pueden estar desactualizadas
https://hackmd.io/@lido/r1KZ4YNdj
