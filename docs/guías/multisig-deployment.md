# Despliegue de Multisig

:::warning
Esta página está muy desactualizada con el último lanzamiento de [Lido V2](https://github.com/lidofinance/lido-dao/releases/tag/v2.0.0).
:::

Este tutorial describe el despliegue de la DAO utilizando un firmante multisig/airgapped, paso a paso.

## Preparación

Clone el repositorio e instale las dependencias:

```text
$ git clone git@github.com:lidofinance/lido-dao.git
$ cd lido-dao
$ yarn
```

Ejecutar los scripts de despliegue requiere una conexión RPC a un cliente Ethereum, que puede configurarse
editando el archivo `hardhat.config.js`. Ya está preconfigurado para utilizar el proveedor Infura,
simplemente copie `accounts.sample.json` a `accounts.json` y edite la clave `infura`:

```json
{
  "eth": {},
  "infura": {
    "projectId": "COLOQUE_SU_ID_DE_PROYECTO_AQUÍ"
  }
}
```

Algunos pasos de despliegue (en particular, el despliegue de contratos) no pueden realizarse desde algunos
proveedores de multisig y por lo tanto requieren enviar las transacciones desde una dirección normal.
El repositorio proporciona una herramienta para hacerlo; si planea usarla, edite `accounts.json` y coloque
su configuración de cuentas bajo la clave `eth.<nombre-de-red>`. Si su cliente RPC proporciona una cuenta
desbloqueada, use `remote` como valor (aquí y más adelante asumimos que la red de destino se llama `mainnet`):

```json
{
  "eth": {
    "mainnet": "remote"
  },
  "infura": {
    "projectId": "COLOQUE_SU_ID_DE_PROYECTO_AQUÍ"
  }
}
```

Si planea usar una frase mnemotécnica BIP-44 en su lugar, use la siguiente forma de configuración:

```json
{
  "eth": {
    "mainnet": {
      "mnemonic": "SU_FRASE_MNEMOTÉCNICA_AQUÍ",
      "path": "m/44'/60'/0'/0",
      "initialIndex": 0,
      "count": 1
    }
  },
  "infura": {
    "projectId": "COLOQUE_SU_ID_DE_PROYECTO_AQUÍ"
  }
}
```

Puede verificar la corrección de la configuración listando las cuentas y sus saldos:

```text
$ yarn hardhat --network mainnet list-accts
```

## Pasos de despliegue

El proceso de despliegue consta de varios pasos. Generalmente, después de cada paso se genera un conjunto de archivos de transacción. Estas transacciones deben ejecutarse en orden secuencial: solo envíe la siguiente transacción después de que la anterior se haya incluido en un bloque. Después de que la última transacción de un paso en particular se incluya en un bloque, proceda al siguiente paso.

También hay algunos pasos que no generan transacciones pero verifican la corrección de los pasos anteriores.

## 1. Despliegue de las implementaciones base y la plantilla

Lido utiliza contratos proxy actualizables como almacenamiento para el estado. Cada contrato proxy apunta a un contrato de implementación que proporciona el código que lee y modifica el estado del proxy. Los contratos de implementación pueden actualizarse mediante votación en la DAO. Las implementaciones son inmutables, solo se les permite modificar el estado del contrato llamante (es decir, el proxy).

Para configurar el protocolo, es necesario desplegar versiones iniciales de las implementaciones. Algunos vaults multisig populares, como Gnosis Safe, no admiten desplegar nuevos contratos, por lo que esto debe hacerse desde una dirección normal.

Parte de la lógica de despliegue del protocolo está incorporada en un contrato llamado `LidoTemplate.sol`, que también debe desplegarse antes de ejecutar los pasos siguientes.

### Preparar el archivo de estado de la red

Los scripts de despliegue utilizan un archivo JSON llamado `deployed-<nombre_de_red>.json` para leer el entorno inicial y la configuración del protocolo, y para almacenar datos que deben persistir entre los pasos de despliegue. Si un paso de despliegue requiere algo más que el endpoint RPC y las cuentas ETH, debe especificarse en el archivo de estado de la red. Estos archivos están destinados a ser agregados bajo el control de origen. Si falta algún dato en el archivo, el paso de despliegue fallará con un error que indicará exactamente qué falta.

El primer paso requiere los siguientes valores:

- `networkId`: identificación de la red
- `ensAddress`: dirección del registro ENS
- `daoFactoryAddress`: dirección del contrato `DAOFactory` de Aragon
- `apmRegistryFactoryAddress`: dirección de `APMRegistryFactory` de Aragon
- `miniMeTokenFactoryAddress`: dirección de `MiniMeTokenFactory` de Aragon
- `aragonIDAddress`: dirección de `FIFSResolvingRegistrar` de aragonID
- `multisigAddress`: la dirección del contrato multisig que se utilizará en los pasos siguientes para realizar el despliegue adicional

Por ejemplo, un archivo de estado de red para `mainnet` se llamará `deployed-mainnet.json` y inicialmente se verá así:

```json
{
  "networkId": 1,
  "ensAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  "daoFactoryAddress": "0x7378ad1ba8f3c8e64bbb2a04473edd35846360f1",
  "apmRegistryFactoryAddress": "0xa0BC4B67F5FacDE4E50EAFF48691Cfc43F4E280A",
  "miniMeTokenFactoryAddress": "0x909d05f384d0663ed4be59863815ab43b4f347ec",
  "aragonIDAddress": "0x546aa2eae2514494eeadb7bbb35243348983c59d",
  "multisigAddress": "SU_DIRECCIÓN_DE_CONTRATO_MULTISIG"
}
```

Es importante destacar que configurar `multisigAddress` correctamente es crucial: esta dirección será la propietaria del contrato de plantilla desplegado, y solo esta dirección podrá realizar los pasos de despliegue a partir del despliegue del APM de Lido (paso 5).

### Generar archivos de datos de transacción

Después de preparar los valores en el archivo de estado de la red, genere un conjunto de archivos JSON con datos de transacción:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/01-deploy-lido-template-and-bases.js
====================
ID de Red: 1
Leyendo estado de red desde /Users/me/lido-dao/deployed-mainnet.json...
====================
Guardando datos de TX de despliegue para LidoTemplate en tx-01-1-deploy-template.json
Guardando datos de TX de despliegue para Lido en tx-01-2-deploy-lido-base.json
Guardando datos de TX de despliegue para LidoOracle en tx-01-3-deploy-oracle-base.json
Guardando datos de TX de despliegue para NodeOperatorsRegistry en tx-01-4-deploy-nops-base.json
====================
Antes de continuar con el despliegue, por favor envíe todas las transacciones de creación de contratos
que pueda encontrar en los archivos mencionados anteriormente. Puede usar una dirección multisig
si admite desplegar nuevas instancias de contrato.
====================
Escribiendo estado de red en /Users/me/lido-dao/deployed-mainnet.json...
¡Todo listo!
```

### Envío de las transacciones

Puede utilizar el ayudante `tx` para enviar las transacciones desde los archivos. Admite las siguientes banderas:

- `--from` la dirección del remitente
- `--file` el archivo TX que puede contener los siguientes campos: `to`, `value`, `data`, `gas`, `from`
- `--gas-price` precio del gas en wei (opcional)
- `--nonce` nonce del remitente (opcional)
- `--wait` el número de segundos para esperar antes de enviar la transacción (opcional, por defecto 5)

Ejecute lo siguiente para desplegar las implementaciones y la plantilla:

```text
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-01-1-deploy-template.json
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-01-2-deploy-lido-base.json
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-01-3-deploy-oracle-base.json
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-01-4-deploy-nops-base.json
```

No es obligatorio utilizar este ayudante para enviar las transacciones definidas en los archivos generados; está allí solo por conveniencia.

> Este paso es una excepción a la regla de "transacciones secuenciales": puede enviar las cuatro transacciones en paralelo desde direcciones diferentes.

### Actualización del archivo de estado de la red

Después de que las cuatro transacciones se incluyan en la cadena de bloques, actualice el archivo de estado de la red con los siguientes valores:

- `daoTemplateDeployTx`: hash de la transacción enviada desde el archivo `tx-01-1-deploy-template.json`
- `lidoBaseDeployTx`: hash de la transacción enviada desde el archivo `tx-01-2-deploy-lido-base.json`
- `oracleBaseDeployTx`: hash de la transacción enviada desde el archivo `tx-01-3-deploy-oracle-base.json`
- `nodeOperatorsRegistryBaseDeployTx`: hash de la transacción enviada desde el archivo `tx-01-4-deploy-nops-base.json`

## 2. Verificación de los contratos desplegados

Ejecute lo siguiente:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/02-obtain-deployed-instances.js
```

Este paso verificará los contratos desplegados y agregará los siguientes campos al archivo de estado de la red:

- `daoTemplateAddress`: dirección del contrato `LidoTemplate`
- `app:lido.baseAddress`: dirección del contrato de implementación `Lido`
- `app:oracle.baseAddress`: dirección del contrato de implementación `LidoOracle`
- `app:node-operators-registry.baseAddress`: dirección del contrato de implementación `NodeOperatorsRegistry`

## 3. Registro de un dominio ENS para Lido APM

Este dominio ENS es necesario para el Administrador de Paquetes de Aragon (APM) que el protocolo utilizará para los mecanismos de actualización. Antes de ejecutar este paso, agregue las siguientes claves al archivo de estado de la red:

- `lidoApmEnsName`: el nombre ENS de segundo nivel que APM usará para registrar paquetes
- `lidoApmEnsRegDurationSec`: la duración del arrendamiento del dominio en segundos

Luego, ejecute:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/03-register-ens-domain.js
...
====================
Guardando datos para la transacción de confirmación en tx-02-1-commit-ens-registration.json (uso de gas proyectado es 53667)
Guardando datos para la transacción de registro en tx-02-2-make-ens-registration.json
====================
Antes de continuar con el despliegue, por favor envíe todas las transacciones listadas arriba.

Asegúrese de enviar la segunda transacción al menos 60 segundos después de que
la primera sea incluida en un bloque, pero no más de 86400 segundos después de eso.
====================
```

Este paso generará dos archivos de transacción. Deberá enviar estas transacciones una después de otra, esperando al menos un minuto entre ellas:

```text
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-02-1-commit-ens-registration.json
$ sleep 60
$ yarn hardhat --network mainnet tx --from $DEPLOYER --file tx-02-2-make-ens-registration.json
```

## 4. Despliegue de aplicaciones frontend de Lido

la DAO de Lido incluye aplicaciones frontend para la gobernanza de la DAO y la gestión del protocolo. Estas aplicaciones se despliegan en IPFS, por lo que necesitará especificar la clave `ipfsAPI` en el archivo de estado de la red apuntando a un endpoint de API de cliente IPFS, por ejemplo, `"ipfsAPI": "http://localhost:5001/api/v0"`. Luego, ejecute lo siguiente:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/04-publish-app-frontends.js
```

Asegúrese de que el nodo IPFS que esté utilizando esté permanentemente activo y disponible públicamente, o que el contenido cargado esté anclado (pinned) a algún otro nodo público permanente.

Este paso agregará subclaves `ipfsCid` y `contentURI` para las tres aplicaciones de Lido (`app:lido`, `app:oracle`, `app:node-operators-registry`) en el archivo de estado de la red. La primera clave es el identificador IPFS para la entrada raíz del frontend de la aplicación, y `contentURI` es la misma clave codificada en un formato específico de Aragon.

## 5. Despliegue de Lido APM

Ejecute lo siguiente:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/05-deploy-apm.js
...
====================
Dominio padre: eth 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae
Etiqueta del subdominio: lidopm-pre 0x1353eb779a45ed66bdb49e45e006df81a69d9f73067e846003b5bb00984191d4
====================
Guardando datos para la transacción de despliegue de APM en tx-03-deploy-apm.json (uso de gas proyectado es 6263517)
====================
```

Este paso generará un archivo de transacción; deberá enviar esta transacción desde el contrato en `multisigAddress`. Después de que la transacción se incluya en un bloque, pase al siguiente paso.

### Usando Gnosis Safe

Si está utilizando Gnosis Safe, puede hacer esto eligiendo `Nueva Transacción > Interacción con Contrato` y habilitando la opción `Usar datos personalizados (codificados en hexadecimal)` en el cuadro de diálogo que aparece. Luego, copie el contenido del campo `to` del archivo JSON de transacción al campo `Destinatario*`, el contenido del campo `value` al campo `Valor*` (ingrese `0` si no hay una clave `value` en el archivo de transacción), y el contenido del campo `data` al campo `Datos (codificados en hexadecimal)*`.

Asegúrese de verificar el límite de gas de la transacción: Gnosis Safe a menudo lo establece demasiado bajo. Como regla general, configúrelo al valor del campo `gas` en el archivo JSON de transacción más `1500000` (el gas adicional se usa para manejar la lógica multisig).

## 6. Verificación del APM desplegado

Ejecute lo siguiente:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/06-obtain-deployed-apm.js
```

Asegúrese de que finalice sin errores y pase al siguiente paso. Se agregará el siguiente campo al archivo de estado de la red:

- `lidoApmAddress`: la dirección del APM de Lido que controla el dominio ENS `lidoApmEnsName`.

## 7. Crear repositorios de aplicaciones APM

Ejecute lo siguiente:

```text
yarn hardhat --network mainnet run ./scripts/multisig/07-create-app-repos.js
...
====================
Guardando datos para la transacción createRepos en tx-04-create-app-repos.json (uso de gas proyectado es 7160587)
====================
```

Este paso generará un archivo de transacción; deberá enviar esta transacción desde el contrato en `multisigAddress`. Después de que la transacción se incluya en un bloque, pase al siguiente paso.

## 8. Desplegar DAO y su token de gobernanza

Este paso desplegará las instancias de la DAO y del token de gobernanza. Deberá agregar un campo llamado `daoInitialSettings` al archivo de estado de la red antes de ejecutar el paso:

```js
  // ...
  "daoInitialSettings": {
    // Nombre/símbolo del token de gobernanza; no se puede cambiar después del despliegue
    "token": {
      "name": "Lido DAO Token",
      "symbol": "LDO"
    },
    // Especificación de la cadena de beacons; puede cambiarse mediante votación en la DAO
    "beaconSpec": {
      "depositContractAddress": "0x00000000219ab540356cBB839Cbe05303d7705Fa",
      "slotsPerEpoch": 32,
      "secondsPerSlot": 12,
      "genesisTime": 1606824023,
      "epochsPerFrame": 225 // Los oráculos de Lido reportan una vez por cada epochsPerFrame epochs
    },
    // Configuración de votación de la DAO (app Aragon Voting)
    "voting": {
      "minSupportRequired": "500000000000000000", // 1e18 === 100%
      "minAcceptanceQuorum": "50000000000000000", // 1e18 === 100%
      "voteDuration": 172800 // en segundos
    },
    // Configuración de tarifas del protocolo; puede cambiarse mediante votación en la DAO
    "fee": {
      "totalPercent": 10,
      "treasuryPercent": 0,
      "insurancePercent": 50,
      "nodeOperatorsPercent": 50
    }
  }
  // ...
```

Luego, ejecute lo siguiente:

```text
$ yarn hardhat --network mainnet run ./scripts/multisig/08-deploy-dao.js
...
Guardando datos para la transacción newDAO en tx-05-deploy-dao.json (uso de gas proyectado es 7118882)
```

Envíe la transacción generada desde el contrato en `multisigAddress`. Después de que la transacción se incluya en un bloque, pase al siguiente paso.

## 9. Verificar la DAO desplegado

Ejecute lo siguiente:

```text
yarn hardhat --network mainnet run ./scripts/multisig/09-obtain-deployed-dao.js
```

Asegúrese de que finalice sin errores y pase al siguiente paso. Los siguientes campos se agregarán al archivo de estado de la red:

- `daoAddress`: la dirección de la instancia de la DAO;
- `daoTokenAddress`: la dirección del token de gobernanza de la DAO;
- `proxyAddress`: claves bajo las claves `app:*`: direcciones de las instancias de las aplicaciones.

## 10. Emitir tokens de gobernanza de la DAO

Agregue la clave `vestingParams` al archivo de estado de la red que contenga lo siguiente:

```js
  // ...
  "vestingParams": {
    // Tokens no vestidos serán retenidos en la aplicación DAO Agent
    "unvestedTokensAmount": "10000000000000000000000",
    // Direcciones de los titulares de tokens y sus respectivas cantidades
    "holders": {
      "0xaabbcc0000000000000000000000000000000000": "100000000000000000000",
      // ...
    },
    // Fecha de inicio del vesting
    "start": 1608213253,
    // Fecha del umbral del vesting
    "cliff": 1608213253,
    // Fecha de finalización del vesting
    "end": 1608501253,
    // Si los vestings pueden ser revocados por la DAO
    "revokable": false
    // Ver https://github.com/aragon/aragon-apps/blob/master/apps/token-manager/contracts/TokenManager.sol
  }
  // ...
```

Luego, ejecute lo siguiente:

```text
yarn hardhat --network mainnet run ./scripts/multisig/10-issue-tokens.js
...
====================
Total de lotes: 2
Guardando datos para la transacción issueTokens (lote 1) en tx-06-1-issue-tokens.json (uso de gas proyectado es 6478755)
Guardando datos para la transacción issueTokens (lote 2) en tx-06-2-issue-tokens.json
```

Envíe las transacciones generadas secuencialmente desde el contrato en `multisigAddress`, esperando a que la primera sea incluida en un bloque antes de enviar la segunda. Después de que la segunda transacción se incluya en un bloque, pase al siguiente paso.

## 11. Finalizar la DAO

Agregue la clave `daoAragonId` al archivo de estado de la red, estableciéndola como un nombre bajo el cual la DAO será registrado en aragonID, es decir, `<daoAragonId>.aragonid.eth` resolverá a `daoAddress`. Luego, ejecute lo siguiente:

```text
yarn hardhat --network mainnet run ./scripts/multisig/11-finalize-dao.js
...
====================
Guardando datos para la transacción finalizeDAO en tx-07-finalize-dao.json (uso de gas proyectado es 5011582)
```

Envíe la transacción generada desde el contrato en `multisigAddress`. Después de que la transacción se incluya en un bloque, pase al siguiente paso.

## 12. Realizar las verificaciones finales

En este punto, la DAO está completamente desplegado. Ejecute lo siguiente para verificar la corrección de la configuración y la configuración de permisos:

```text
yarn hardhat --network mainnet run ./scripts/multisig/12-check-dao.js
```

Si hay algún error, se imprimirá y se cancelarán las verificaciones adicionales. Este paso solo requiere que los siguientes campos estén definidos en el archivo de estado de la red:

- `ensAddress`
- `lidoApmEnsName`
- `daoAragonId`
- `vestingParams`
- `daoInitialSettings`
- `daoTemplateAddress`
