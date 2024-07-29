# Generación y Firma de Mensajes de Salida

## Almacenamiento de Claves o Dirk

Si tus claves de firma de validador están en [keystores](https://eips.ethereum.org/EIPS/eip-2335) o en un gestor de claves remoto como [Dirk](https://github.com/attestantio/dirk), el método más sencillo es utilizar [ethdo](https://github.com/wealdtech/ethdo).

### Para Keystores:

1. Crear una billetera ethdo
2. Importar keystores
3. Generar un retiro
4. Borrar la billetera si ya no es necesaria

Crear una nueva billetera:

```bash
./ethdo --base-dir=./temp wallet create --wallet=wallet
```

Agregar una clave desde un keystore:

```bash
./ethdo --base-dir=./temp account import --account=wallet/account --keystore=./ethdo/keystore.json --keystore-passphrase=12345678 --passphrase=pass
```

Generar y firmar un mensaje de salida:

```bash
./ethdo --base-dir=./temp validator exit --account=wallet/account --passphrase=pass --json --connection=http://consensus_node:5052
```

ethdo imprimirá el mensaje de salida en la salida estándar. Puedes guardar el archivo `ethdo ... > 0x123.json`.

Una vez finalizado, borrar la billetera:

```bash
./ethdo --base-dir=./temp wallet delete --wallet=wallet
```

Si buscas automatizar el proceso, revisa [este ejemplo](https://gist.github.com/kolyasapphire/d2bafce3cdd04305bc109cbd49728ffe).

:::info
Aunque los keystores están encriptados, se recomienda interactuar con ellos en un entorno seguro sin acceso a internet.
:::

ethdo te permite preparar todo lo necesario para la generación offline de mensajes de salida en un archivo conveniente. Para ello, en una máquina con acceso a un Nodo de Consenso ejecuta:

```bash
./ethdo validator exit --prepare-offline --connection=http://consensus_node:5052 --timeout=300s
```

Este comando obtendrá la información de los validadores, versiones de forks, epoch actual y otros datos de la cadena para la generación offline de mensajes de salida, guardando todo en `offline-preparation.json` en el directorio `ethdo`.

Este archivo puede ser transferido luego a una máquina segura junto con el binario de `ethdo`, por ejemplo en una unidad USB encriptada.

En la máquina segura, coloca `offline-preparation.json` en el directorio desde donde se ejecuta `ethdo`, utiliza el argumento `--offline` para el comando `validator exit` y elimina `--connection`:

```bash
./ethdo --base-dir=./temp validator exit --account=wallet/account --passphrase=pass --json --offline
```

### Para Dirk:

```bash
./ethdo --remote=server.example.com:9091 --client-cert=client.crt --client-key=client.key --server-ca-cert=dirk_authority.crt validator exit --account=Validators/1 --json --connection=http://127.0.0.1:5051
```

[ethdo](https://github.com/wealdtech/ethdo)
[Documentación de ethdo](https://github.com/wealdtech/ethdo/blob/master/docs/usage.md#exit)

## Para Web3Signer u Otros Firmadores Propietarios

Si estás utilizando el endpoint `/api/v1/modules/{module_id}/validators/generate-unsigned-exit-messages/{operator_id}` de KAPI, puedes omitir obtener el epoch y construir un mensaje de salida no firmado en el siguiente ejemplo.

Obtener el epoch actual:

```javascript
const blockReq = await fetch(CONSENSUS_BLOCK_ENDPOINT)
const blockRes = await blockReq.json()
const blockNumber = blockRes.data.message.slot
const currentEpoch = Math.floor(blockNumber / 32)
```

Obtener parámetros del fork:

```javascript
const forkReq = await fetch(CONSENSUS_FORK_ENDPOINT)
const forkRes = await forkReq.json()
const fork = forkRes.data
```

Obtener parámetros de genesis:

```javascript
const genesisReq = await fetch(CONSENSUS_GENESIS_ENDPOINT)
const genesisRes = await genesisReq.json()
const genesis_validators_root = genesisRes.data.genesis_validators_root
```

Construir un mensaje de salida:

```javascript
const voluntaryExit = {
  epoch: String(currentEpoch),
  validator_index: String(VALIDATOR_INDEX),
}
```

Preparar una solicitud de firma:

```javascript
const body = {
  type: 'VOLUNTARY_EXIT',
  fork_info: {
    fork,
    genesis_validators_root,
  },
  voluntary_exit: voluntaryExit,
}
```

Enviar la solicitud:

```javascript
const signerReq = await fetch(WEB3SIGNER_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify(body),
})
const signature = await signerReq.text()
```

Finalmente, construir un mensaje de salida firmado:

```javascript
const signedMessage = {
  message: voluntaryExit,
  signature,
}
```

[Ejemplo Completo](https://gist.github.com/kolyasapphire/53dbdab35f1a033b0d37ddf582dce414)

:::info
Se recomienda preparar todos los parámetros necesarios (forks, epoch, etc.) con anticipación y comunicarse con Web3Signer de manera segura, por ejemplo, a través de una red segura sin otro acceso a internet.
:::

[Documentación de la API de Web3Signer](https://consensys.github.io/web3signer/web3signer-eth2.html#tag/Signing)
