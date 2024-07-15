# Votación en la DAO con Etherscan

Así es como se vota en el Aragon DAO de Lido utilizando la interfaz de Etherscan.

## Guía en video

<div style={{position:'relative',width:'100%',paddingBottom:'62.5%',height:0}}>
   <iframe style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} src="https://www.youtube.com/embed/5YTJgudYHs8" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
</div>

## Preparación

Obtén la dirección del contrato de votación Aragon la DAO de Lido desde la página [Contratos Desplegados](/deployed-contracts/#dao-contracts). Debería ser: [0x2e59A20f205bB85a89C53f1936454680651E618e].

Obtén el ID del voto, ya sea desde [la interfaz de votación]:

![](/img/etherscan-voting/voting_ui.png)

o desde [Etherscan]:

![](/img/etherscan-voting/etherscan_vote_address.png)

1. Abre la pestaña "[Contrato / Leer como Proxy]".
2. Obtén el número total de votos desde el método `votesLength` (número 21 en [la página de Etherscan]).

![](/img/etherscan-voting/votes-length.png)

3. Si deseas votar en el último voto, toma `votesLength - 1` como ID. Si `votesLength` es `89`, el último voto tendría el ID `88`.
4. Puedes verificar los datos del voto con el método `getVote` (número 6 en [la página de Etherscan]).

![](/img/etherscan-voting/get-vote.png)

[la interfaz de votación]: https://vote.lido.fi
[Etherscan]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract
[Contrato / Leer como Proxy]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract
[la página de Etherscan]: https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract

## Votación

1. Abre la pestaña "[Contrato / Escribir como Proxy](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#writeProxyContract)" en Etherscan.
2. Conecta la interfaz de Etherscan a Web3 con MetaMask o WalletConnect.

![](/img/etherscan-voting/connect-wallet.png)

3. Utiliza el método `vote` (número 6 en [la página de Etherscan](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#writeProxyContract)).

![](/img/etherscan-voting/vote-1.png)

- `_voteId` es el ID del voto obtenido en el punto 2.
- `_supports` es la bandera que indica si estás votando a favor (`true`) o en contra (`false`) del voto.
- `_executesIfDecided` es la bandera para ejecutar el voto si se decide inmediatamente en la transacción, `true` o `false`. Según experiencias previas de votos, puedes dejar esto como `false`.

4. Completa los parámetros `_voteId`, `_supports` y `_executesIsDecided`, y envía la transacción.

![](/img/etherscan-voting/vote-2.png)

5. Firma la transacción.

![](/img/etherscan-voting/sign-transaction.png)

¡Eso es todo! 🎉