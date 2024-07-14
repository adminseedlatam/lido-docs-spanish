# Cómo reclamar recompensas del pool 1inch stETH/LDO
Este es el proceso para reclamar recompensas del pool 1inch stETH/LDO utilizando la interfaz de Etherscan.

Las recompensas se distribuyen a los LP (Proveedores de Liquidez) en el [pool 1inch stETH/LDO](https://etherscan.io/address/0x1f629794b34ffb3b29ff206be5478a52678b47ae) proporcionalmente a la cantidad de liquidez y al tiempo que se haya proporcionado, según se describe en la [propuesta](https://research.lido.fi/t/proposal-ldo-incentives-to-liquidity-providers-on-ldo-steth-pair-on-1inch-exchange/274).

## Reclamo de recompensas

### 1. Verifica si eres elegible para reclamar la recompensa

Encuentra tu dirección [aquí](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv) y obtén tu índice.

Si tu dirección no aparece [aquí](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv), no eres elegible para reclamar la recompensa.

### 2. Verifica si no has reclamado tu recompensa anteriormente
2.1 Ve a [Etherscan](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296) (dirección del contrato: [0xdB46C277dA1599390eAb394327602889E9546296](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296))

2.2 Pega tu índice en el método `isClaimed` (primera fila en la pestaña [“Contract/Read contract”](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296#readContract))

2.3 Presiona el botón “Query”

2.4 Asegúrate de que el resultado del método sea `false`

:::note
Si obtienes `true` como resultado de este paso, significa que esta recompensa ya fue reclamada anteriormente y no puedes reclamarla nuevamente.
:::

### 3. Reclama tu recompensa

3.1 Abre la pestaña [“Contract/Write contract”](https://etherscan.io/address/0xdB46C277dA1599390eAb394327602889E9546296#writeContract) en Etherscan

3.2 Conecta tu cartera a Etherscan con MetaMask o WalletConnect

3.3 Llena los campos del método `Claim` con los datos de [aquí](https://github.com/lidofinance/airdrop-data/blob/main/oneinch_lido_airdrop.csv)
- índice (uint256)
- cuenta (address)
- cantidad (uint256)
- merkleProof (bytes32[])

3.4 Presiona el botón “Write” y confirma la transacción en tu cartera

3.5 Espera a que la transacción sea exitosa

:::not3
En caso de que la entrada sea inválida, la transacción puede revertirse.
:::

¡Eso es todo! 💪🎉🏝