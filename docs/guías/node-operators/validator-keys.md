# Claves del Validador

Las claves del validador se agregan en varios pasos secuenciales. Estos pasos son similares cada vez que se añaden nuevas claves.

## Generación de Claves de Firma

Una vez incluido en el protocolo, un Operador de Nodo debe generar y enviar un conjunto de claves públicas [BLS12-381]. Estas claves serán utilizadas por el protocolo para depositar ether en el [DepositContract de Ethereum](https://etherscan.io/address/0x00000000219ab540356cBB839Cbe05303d7705Fa). Junto con las claves, el Operador de Nodo envía un conjunto de firmas correspondientes [como se define en la especificación]. El `DepositMessage` utilizado para generar la firma debe cumplir con los siguientes parámetros:

- `pubkey`: Derivado de la clave privada utilizada para firmar el mensaje.
- `amount`: Debe ser igual a 32 ether.
- `withdrawal_credentials`: Debe coincidir con las credenciales de retiro establecidas por la DAO.

### Credenciales de Retiro

Asegúrese de obtener la dirección de retiro correcta encontrándola dentro de las credenciales de retiro activas utilizando [`StakingRouter.getWithdrawalCredentials()`](/contracts/staking-router.md#getwithdrawalcredentials).

Por ejemplo, las credenciales de retiro `0x010000000000000000000000b9d7934878b5fb9610b3fe8a5e441e8fad7e293f` significan que la dirección de retiro es `0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f`. Para Mainnet, verifique siempre que la dirección sea correcta utilizando un [explorador] - verá que fue desplegada desde el desplegador de Lido.

[bls12-381]: https://ethresear.ch/t/pragmatic-signature-aggregation-with-bls/2105
[como se define en la especificación]: https://github.com/ethereum/annotated-spec/blob/master/phase0/beacon-chain.md#depositmessage
[explorador]: https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f

### Uso de staking-deposit-cli

Utilice la última versión de [`staking-deposit-cli`].

Ejemplo de uso del comando:

```sh
./deposit new-mnemonic --folder . --num_validators 123 --mnemonic_language english --chain mainnet --eth1_withdrawal_address 0x123
```

Aquí, `chain` es uno de los nombres de cadena disponibles (ejecute el comando con la bandera `--help` para ver los valores posibles: `./deposit new-mnemonic --help`) y `eth1_withdrawal_address` es la dirección de retiro según la documentación del protocolo.

Como resultado de ejecutar esto, se creará el directorio `validator_keys` en el directorio de trabajo actual. Contendrá un archivo de datos de depósito llamado `deposit-data-*.json` y una serie de almacenes de claves privadas llamados `keystore-*.json`, estos últimos encriptados con la contraseña solicitada al ejecutar el comando.

Si opta por utilizar la interfaz de usuario para enviar las claves, deberá pasar los datos JSON encontrados en el archivo de datos de depósito al protocolo (ver la siguiente sección). Si lo desea, puede eliminar cualquier otro campo excepto `pubkey` y `signature` de los elementos del array.

Nunca comparta la mnemotécnica generada ni sus claves privadas con nadie, incluidos los miembros del protocolo y los titulares de la DAO.

[`staking-deposit-cli`]: https://github.com/ethereum/staking-deposit-cli/releases

## Validación de las Claves

Por favor, asegúrese de verificar la validez de las claves antes de enviarlas a la cadena.

El subidor de Lido tiene funcionalidad de validación incorporada; las claves se verificarán antes de enviarlas.

Si va a enviar claves manualmente a través del contrato de Lido, puede utilizar Lido CLI. Es un paquete Python que puede instalar con pip:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_file_keys --file keys.json
```

Necesitará un punto final RPC: un nodo local / proveedor de RPC (por ejemplo, Alchemy/Infura).

## Envío de las Claves

> Tenga en cuenta que la dirección de retiro debe agregarse al Registro de Operadores de Nodo de Lido antes de poder enviar las claves de firma. Agregar una dirección al Registro de Operadores de Nodo sucede a través de votación de la DAO. Al proporcionar la dirección de retiro para que se agregue al Registro de Operadores de Nodo, tenga en cuenta lo siguiente:
>
> - Es la dirección que recibirá las recompensas.
> - Es la dirección que utilizará para enviar claves a Lido.
> - Debe poder acceder a ella en cualquier momento en caso de emergencia.
> - Puede usar multi-firma si lo desea.
> - No podrá reemplazarla por otra dirección/multi-firma más tarde.

Después de generar las claves, un Operador de Nodo las envía al protocolo. Para hacer esto, envían una transacción desde la dirección de retiro del Operador de Nodo al contrato `NodeOperatorsRegistry`, llamando a la función [`addSigningKeys`] con los siguientes argumentos:

```
* `uint256 _nodeOperatorId`: el número de secuencia basado en cero del operador en la lista;
* `uint256 _keysCount`: el número de claves que se envían;
* `bytes _publicKeys`: las claves concatenadas;
* `bytes _signatures`: las firmas concatenadas.
```

Puede obtener la dirección del contrato `NodeOperatorsRegistry` llamando a la función [`getOperators()`] en la instancia del contrato `Lido`. El ABI del contrato `NodeOperatorsRegistry` se puede encontrar en la página correspondiente del contrato en Etherscan o en `***-abi.zip` de la última versión en la [página de lanzamientos de lido-dao en GitHub](https://github.com/lidofinance/lido-dao/releases).

El identificador del operador para una dirección de recompensa dada se puede obtener llamando sucesivamente a [`NodeOperatorsRegistry.getNodeOperator`] con el argumento `_id` creciente hasta que se obtenga el operador con la dirección de recompensa coincidente.

Páginas de Etherscan para los contratos Holešky:

- [`Lido`](https://holesky.etherscan.io/address/0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034#readProxyContract)
- [`NodeOperatorsRegistry`](https://holesky.etherscan.io/address/0x595F64Ddc3856a3b5Ff4f4CC1d1fb4B46cFd2bAC)

Páginas de Etherscan para los contratos de Mainnet:

- [`Lido`](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84#readProxyContract)
- [`NodeOperatorsRegistry`](https://etherscan.io/address/0x55032650b14df07b85bf18a3a3ec8e0af2e028d5#readProxyContract)

[`getoperators()`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/Lido.sol#L361
[`nodeoperatorsregistry.getnodeoperator`]: https://github.com/lidofinance/lido-dao/blob/971ac8f/contracts/0.4.24/nos/NodeOperatorsRegistry.sol#L335

### Uso de la Interfaz de Usuario para enviar múltiples claves

Lido proporciona interfaces de usuario para la presentación de claves: [Interfaz web de Mainnet para enviar claves] y [Interfaz web de Testnet para enviar claves].

![Subidor](/img/node-operators-manual/submitter.png)

Si ha utilizado `staking-deposit-cli`, puede pegar el contenido del archivo generado `deposit-data-*.json` tal cual.

De lo contrario, prepare un JSON con la siguiente estructura y péguelo en el área de texto que aparecerá en el centro de la pantalla:

```json
[
  {
    "pubkey": "PUBLIC_KEY_1",
    "withdrawal_credentials": "WITHDRAWAL_CREDENTIALS_1",
    "amount": 32000000000,
    "signature": "SIGNATURE_1",
    "fork_version": "FORK_VERSION_1",
    "eth2_network_name": "ETH2_NETWORK_NAME_1",
    "deposit_message_root": "DEPOSIT_MESSAGE_ROOT_1",
    "deposit_data_root": "DEPOSIT_DATA_ROOT_1"
  },
  {
    "pubkey": "PUBLIC_KEY_2",
    "withdrawal_credentials": "WITHDRAWAL_CREDENTIALS_2",
    "amount": 32000000000,
    "signature": "SIGNATURE_2",
    "fork_version": "FORK_VERSION_2",
    "eth2_network_name": "ETH2_NETWORK_NAME_2",
    "deposit_message_root": "DEPOSIT_MESSAGE_ROOT_2",
    "deposit_data_root": "DEPOSIT_DATA_ROOT_2"
  }
]
```

````

Esta herramienta dividirá automáticamente las claves en fragmentos y enviará las transacciones a su billetera para su aprobación. Las transacciones vendrán una por una para ser firmadas. Desafortunadamente, no podemos enviar un gran número de claves en una sola transacción. Actualmente, el tamaño del fragmento es de 50 claves, cerca del límite de gas por bloque.

Conecte su billetera, haga clic en el botón `Validar`, la interfaz realizará las comprobaciones requeridas. Luego, haga clic en el botón `Enviar claves`.

Actualmente, admitimos los siguientes conectores:

- MetaMask y billeteras inyectadas similares
- Wallet Connect
- Gnosis Safe
- Ledger HQ

Si desea usar Gnosis, hay dos formas de conectar:

- Agregue esta aplicación como una [aplicación personalizada] en su caja fuerte.
- [Use WalletConnect] para conectarse a su caja fuerte.

Al enviar un formulario, las claves se guardan en su navegador. Esta herramienta verifica los nuevos envíos de claves contra la lista previamente guardada para evitar duplicaciones. Por lo tanto, es importante usar un solo navegador para enviar.

[interfaz web de mainnet para enviar claves]: https://operators.lido.fi/submitter
[interfaz web de testnet para enviar claves]: https://operators.testnet.fi/submitter
[aplicación personalizada]: https://help.gnosis-safe.io/en/articles/4022030-add-a-custom-safe-app
[use walletconnect]: https://help.gnosis-safe.io/en/articles/4356253-walletconnect-safe-app

## Importación de las Claves a un Cliente Validador de Lighthouse

Si ha utilizado `staking-deposit-cli` bifurcado para generar las claves, puede importarlas a un cliente validador de Lighthouse ejecutando este comando:

```sh
docker run --rm -it \
 --name validator_keys_import \
 -v "$KEYS_DIR":/root/validator_keys \
 -v "$DATA_DIR":/root/.lighthouse \
 sigp/lighthouse \
 lighthouse account validator import \
 --reuse-password \
 --network "$TESTNET_NAME" \
 --datadir /root/.lighthouse/data \
 --directory /root/validator_keys
````

## Verificación de las Claves de Todos los Operadores de Nodo de Lido

La verificación de claves funciona con datos en cadena. Asegúrese de que las transacciones de envío de claves se confirmen antes de verificar las claves.

Nunca vote por aumentar los límites de claves de los Operadores de Nodo antes de verificar que las claves nuevas estén presentes y sean válidas.

### Lido CLI

Asegúrese de que Python con pip esté instalado y luego ejecute:

```sh
pip install lido-cli
lido-cli --rpc http://1.2.3.4:8545 validate_network_keys --details
```

Esta operación verifica todas las claves de Lido para su validez. Este es un proceso intensivo en CPU; por ejemplo, un escritorio moderno con 6 núcleos, 12 hilos y un buen sistema de enfriamiento procesa 1,000 claves en 1-2 segundos.

Necesitará un punto final RPC: un nodo local / proveedor de RPC (por ejemplo, Alchemy/Infura).

### Panel de Operadores de Nodo de Lido

También puede verificar las claves cargadas en el [Panel de Operadores de Nodo de Lido de Mainnet] o en el [Panel de Operadores de Nodo de Lido de Testnet].

Esta interfaz muestra el número de claves enviadas, aprobadas y válidas para cada Operador de Nodo, junto con todas las claves inválidas en caso de haber alguna.

Se actualiza cada 30 minutos mediante cron, pero el período de actualización puede cambiar en el futuro.

[panel de operadores de nodo de lido de mainnet]: https://operators.lido.fi
[panel de operadores de nodo de lido de testnet]: https://operators.testnet.fi

### Resultados

#### No se ven claves inválidas

Si las nuevas claves están presentes y son válidas, los Operadores de Nodo pueden votar para aumentar el límite de claves para el Operador de Nodo.

#### Se detectan claves inválidas

Es urgente notificar al equipo de Lido y a otros Operadores de Nodo lo antes posible. Por ejemplo, en el chat grupal.

## Aumento de los Límites de Staking con una Propuesta de Easy Track

Una vez que las nuevas claves estén presentes y sean válidas, se puede proponer una moción para aumentar el límite de staking para el Operador de Nodo.

[Guía de Operadores de Nodo para Easy Track](https://docs.lido.fi/guides/easy-track-guide#node-operators-guide-to-easy-track)
