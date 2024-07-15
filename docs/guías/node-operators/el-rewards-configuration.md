# Configuración de Recompensas de Capa de Ejecución

Los Operadores de Nodo que ejecutan validadores para Lido deben configurar el receptor de tarifas para los validadores relevantes al [`LidoExecutionLayerRewardsVault`](/contracts/lido-execution-layer-rewards-vault) gestionado por el protocolo, que administra las [Recompensas de Capa de Ejecución](/contracts/lido#gettotalelrewardscollected). Esta dirección de contrato inteligente varía según la red (Mainnet, testnet, etc.) y **no** es la misma que la dirección de [Credenciales de Retiro](/contracts/staking-router#getwithdrawalcredentials).

Esta dirección de contrato inteligente también se puede obtener consultando el método [`elRewardsVault()`](/contracts/lido-locator#elrewardsvault) en el contrato `LidoLocator`.

También puede encontrar la dirección en la página de [Contratos Desplegados], etiquetada como `Execution Layer Rewards Vault`.

[contratos desplegados]: /deployed-contracts

## Opciones de receptor de tarifas para varios clientes de Beacon Chain

Los clientes de Beacon Chain ofrecen una variedad de métodos para configurar el receptor de tarifas. Algunos clientes permiten configurar el receptor de tarifas a nivel de clave por validador (por ejemplo, para Teku esto se puede lograr a través de [la configuración del proponedor](https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-config)). Consulte la documentación para cada cliente para obtener instrucciones específicas.

| Cliente de Consenso | Opción CLI                                               | Página de referencia CLI                |
| ------------------- | --------------------------------------------------------- | --------------------------------------- |
| Teku                | `--validators-proposer-default-fee-recipient=<DIRECCIÓN>` | [Opciones CLI de Teku]                  |
| Lighthouse          | `--suggested-fee-recipient=<DIRECCIÓN>`                   | [Configuración de Receptor de Tarifas de Lighthouse] |
| Nimbus              | `--suggested-fee-recipient=<DIRECCIÓN>`                   | [Información de Receptor de Tarifas de Nimbus] |
| Prysm               | `--suggested-fee-recipient=<DIRECCIÓN>`                   | [Opciones CLI de Prysm]                 |
| Lodestar            | `--chain.defaultFeeRecipient=<DIRECCIÓN>`                 | [Opciones CLI de Lodestar]              |

[opciones cli de teku]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#validators-proposer-default-fee-recipient
[información de receptor de tarifas de nimbus]: https://nimbus.guide/suggested-fee-recipient.html
[configuración de receptor de tarifas de lighthouse]: https://lighthouse-book.sigmaprime.io/suggested-fee-recipient.html?highlight=fee%20recipient#suggested-fee-recipient
[opciones cli de lodestar]: https://chainsafe.github.io/lodestar/reference/cli/
[opciones cli de prysm]: https://docs.prylabs.network/docs/execution-node/fee-recipient

## Opciones relacionadas con MEV-Boost para varios clientes de Beacon Chain

| Cliente de Consenso | Opción CLI                                           | Página de referencia CLI           |
| ------------------- | ---------------------------------------------------- | ---------------------------------- |
| Teku                | `--builder-endpoint=<URL>`                           | [Integración MEV de Teku]          |
| Lighthouse          | BN: `--builder=<URL>` VC: `--builder-proposals`      | [Integración MEV de Lighthouse]    |
| Nimbus              | `--payload-builder=true --payload-builder-url=<URL>` | [Integración MEV de Nimbus]        |
| Prysm               | `--http-mev-relay=<URL>`                             | [Integración MEV de Prysm]         |
| Lodestar            | BN: `--builder --builder.urls=<URL>` VC: `--builder` | [Integración MEV de Lodestar]      |

[integración mev de teku]: https://docs.teku.consensys.net/en/latest/Reference/CLI/CLI-Syntax/#builder-endpoint
[integración mev de nimbus]: https://nimbus.guide/external-block-builder.html
[integración mev de lighthouse]: https://lighthouse-book.sigmaprime.io/builders.html
[integración mev de lodestar]: https://chainsafe.github.io/lodestar/usage/mev-integration/
[integración mev de prysm]: https://docs.prylabs.network/docs/prysm-usage/parameters

## Relés y opciones de MEV-Boost

La lista de relés aprobados por la DAO se puede obtener consultando el método [`get_relays()`](/contracts/mev-boost-relays-allowed-list#get_relays) en el contrato `MevBoostRelayAllowedList`.

### Mainnet

```shell
./mev-boost -mainnet -relay-check -relay <urls de relé separados por comas>
```

### Holešky

```shell
./mev-boost -holesky -relay-check -relay <urls de relé separados por comas>
```

Puede encontrar la lista completa de opciones del CLI MEV-Boost [aquí](https://github.com/flashbots/mev-boost#mev-boost-cli-arguments).