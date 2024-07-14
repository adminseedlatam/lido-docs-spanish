# Cómo transferir tokens a través de Jumpgate

Los Jumpgates son contratos que facilitan transferencias de tokens entre cadenas bajo operaciones DAO. Cada Jumpgate está configurado para trabajar con un token específico y un destinatario predefinido. A continuación se describe el procedimiento para transferir tokens utilizando un Jumpgate.

[**Ver tutorial en video**](https://youtu.be/IqphF28aTUU)

### 1. Verificar el Jumpgate

En este paso nos aseguraremos de que el Jumpgate esté configurado correctamente. Solo necesitarás hacer esto una vez, ya que los Jumpgates son contratos no actualizables.

- Ve a [Etherscan](https://etherscan.io/) y abre la página del Jumpgate. Haz clic en la pestaña "Contract" (Contrato). El tick verde confirma que el código fuente está verificado. Verifica los parámetros:
  - `arbiterFee` siempre es 0;
  - `bridge` es la dirección del puente. Actualmente, todos los Jumpgates utilizan el puente del Token Wormhole en [`0x3ee18B2214AFF97000D974cf647E7C347E8fa585`](https://etherscan.io/address/0x3ee18B2214AFF97000D974cf647E7C347E8fa585). Puedes verificar la dirección contra la [documentación de Wormhole](https://book.wormhole.com/reference/contracts.html);
  - `nonce` siempre es 0;
  - `owner` es el Agente de Aragon en [`0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c`](https://etherscan.io/address/0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c), verificable en [Contratos desplegados](/deployed-contracts/#dao-contracts);
  - `recipient` es la dirección del destinatario en formato hexadecimal. Para Solana, esto será una cuenta de token LDO codificada. Usa un [decodificador Base 58](https://appdevtools.com/base58-encoder-decoder) para decodificar esta secuencia hexadecimal al formato de dirección de Solana.
  - `recipientChain` es el identificador de la cadena de destino. Si el Jumpgate utiliza el puente Wormhole, puedes verificar el ID en la [documentación de Wormhole](https://book.wormhole.com/reference/contracts.html), el ID de Solana es 1;
  - `renounceOwnership` debería producir un error;
  - `token` es la dirección del token que se está transfiriendo, por ejemplo, LDO en [0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32](https://etherscan.io/address/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32). Verifica la dirección de LDO contra [Contratos desplegados](/deployed-contracts/#dao-contracts).

![](/img/jumpgates/read-contract.png)

### 2. Transferir tokens al Jumpgate

El Jumpgate es agnóstico respecto a cómo se recibieron los tokens. Puedes transferir los tokens directamente o en el contexto de operaciones DAO mediante una votación de Aragon o una moción de transferencia Easytrack.

### 3. Transferir tokens a través del puente

Ahora podemos enviar tokens a través del puente. No podemos ingresar la cantidad de tokens para transferir, el Jumpgate transferirá el saldo completo de sus tokens.

Abre la pestaña "Write contract" y conecta tu cartera haciendo clic en el botón "Connect to Web3". Ahora expandiremos la función `bridgeTokens` y haremos clic en "Write". Recuerda que esta función es sin permisos y puedes iniciar la transferencia desde cualquier cuenta siempre que tengas suficiente ether para la gasolina.

![](/img/jumpgates/write-contract.png)

### 4. Reclamar tokens

El proceso de reclamo puede variar según el puente, pero por ahora todos los Jumpgates solo admiten el puente del Token Wormhole. Utilizaremos el sitio web del Portal Bridge (anteriormente Wormhole) para reclamar tokens en Solana.

- Ve al sitio web de [Portal Bridge](https://www.portalbridge.com/#/redeem) en la página de Redención y conecta tu cartera Ethereum. Selecciona "Token" en el menú desplegable "Type" y "Ethereum" en "Source Chain". Pega el hash de la transacción `bridgeTokens`. Al principio, esto puede producir un error porque Portal Bridge tarda un tiempo en procesar la transacción del puente. Intenta este paso nuevamente en 10-20 minutos y haz clic en el botón "Recover".

![](/img/jumpgates/recover.png)

- "Recover" te redirigirá a la pestaña "Tokens", donde podrás confirmar la dirección del destinatario. Conecta tu cartera de Solana, haz clic en "Redeem". Se te pedirá que firmes algunas transacciones. Una vez confirmadas, podrás ver los tokens en el destinatario.

![](/img/jumpgates/redeem.png)