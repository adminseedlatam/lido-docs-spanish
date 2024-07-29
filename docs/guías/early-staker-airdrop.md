# Cómo reclamar el airdrop para los primeros stakers de Lido (LDO)

Este es el proceso para reclamar el airdrop para los primeros stakers de Lido utilizando la interfaz de Etherscan.

El airdrop LDO puede ser reclamado por los primeros stakers de Lido. Puedes verificar si eres elegible y reclamar tu airdrop siguiendo estos pasos:

## Introducción

### ¿Quién es elegible para reclamar el airdrop para los primeros stakers de Lido?

El airdrop LDO puede ser reclamado por los primeros stakers de Lido. Puedes encontrar una lista de direcciones elegibles [aquí](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv).

### ¿Cómo averiguar el volumen del airdrop disponible?

Puedes ver la cantidad de LDO de tu airdrop disponible [aquí](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv). La fórmula detallada se encuentra en la [propuesta](https://research.lido.fi/t/proposal-16-retroactive-airdrop-0-5-ldo-to-early-steth-users/69/18).

## Reclamación del airdrop

### 1. Verifica si eres elegible para reclamar el airdrop

Encuentra tu dirección [aquí](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv) y obtén tu índice.

Si tu dirección no aparece [aquí](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv), no eres elegible para reclamar el airdrop.

### 2. Verifica si no has reclamado tu airdrop anteriormente

2.1 Ve a [Etherscan](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b) (dirección del contrato: [0x4b3EDb22952Fb4A70140E39FB1adD05A6B49622B](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b))

2.2 Pega tu índice en el método `isClaimed` (primera fila en la pestaña [“Contract/Read contract”](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b#readContract))

2.3 Presiona el botón “Query”

2.4 Asegúrate de que el resultado del método sea `false`

:::note
Si obtienes `true` como resultado de este paso, significa que este airdrop ya fue reclamado anteriormente y no puedes reclamarlo nuevamente.
:::

### 3. Reclama tu airdrop LDO

3.1 Abre la pestaña [“Contract/Write contract”](https://etherscan.io/address/0x4b3edb22952fb4a70140e39fb1add05a6b49622b#writeContract) en Etherscan

3.2 Conecta tu cartera a Etherscan con MetaMask o WalletConnect

3.3 Completa los campos del método `Claim` con los datos de [aquí](https://github.com/lidofinance/airdrop-data/blob/main/early_stakers_airdrop.csv)

- índice (uint256)
- cuenta (address)
- cantidad (uint256)
- merkleProof (bytes32[])

  3.4 Presiona el botón “Write” y confirma la transacción en tu cartera

  3.5 Espera a que la transacción sea exitosa

:::note
En caso de que la entrada sea inválida, la transacción puede revertirse.
:::

¡Eso es todo! 💪🎉🏝
