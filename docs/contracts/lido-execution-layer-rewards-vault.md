# LidoExecutionLayerRewardsVault

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/LidoExecutionLayerRewardsVault.sol)
- [Contrato Desplegado](https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297)

Un bóveda para el almacenamiento temporal de recompensas de capa de ejecución (EL) (MEV y tarifas de prioridad de transacción).
Consulta la propuesta de mejora de Lido [#12](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-12.md).

Tanto la tarifa de prioridad de transacción como las recompensas de MEV se recogen especificando la dirección del contrato como el `feeRecipient` (receptor de tarifa). Además, las recompensas de MEV también se extraen cuando los constructores de payloads incluyen una transacción explícita que transfiere partes de MEV al `feeRecipient` en el payload. Por lo tanto, el contrato cuenta con una función de recepción pagable que acepta ether entrante.

Solo el contrato [`Lido`](lido) puede retirar las recompensas acumuladas para distribuirlas entre los titulares de `stETH` como parte del informe del [`Oráculo de Contabilidad`](accounting-oracle).

NB: Cualquier ether enviado accidentalmente al contrato es irrecuperable y será distribuido por el protocolo como recompensas acumuladas.

## Métodos

### receive()

Permite que el contrato reciba ETH a través de transacciones.

Emite el evento `ETHReceived`.

```sol
receive() external payable;
```

### withdrawRewards()

Transfiere todas las recompensas acumuladas de EL al contrato Lido. Solo puede ser llamado por el contrato Lido.
Devuelve la cantidad de ether retirado.

```sol
function withdrawRewards(uint256 _maxAmount) external returns (uint256 amount)
```

#### Parámetros:

| Nombre       | Tipo      | Descripción                      |
| ------------ | --------- | -------------------------------- |
| `_maxAmount` | `uint256` | Cantidad máxima de ETH a retirar |

### recoverERC20()

Transfiere la cantidad dada del token ERC20 (definido por la dirección del contrato de token proporcionada)
actualmente perteneciente a la dirección del contrato de bóveda a la dirección del tesoro de Lido.

Emite el evento `ERC20Recovered`.

```sol
function recoverERC20(address _token, uint256 _amount) external
```

#### Parámetros:

| Nombre    | Tipo      | Descripción                    |
| --------- | --------- | ------------------------------ |
| `_token`  | `address` | Token compatible con ERC20     |
| `_amount` | `uint256` | Cantidad de tokens a recuperar |

### recoverERC721()

Transfiere el tokenId dado del NFT compatible con ERC721 (definido por la dirección del contrato de token proporcionada)
actualmente perteneciente a la dirección del contrato de bóveda a la dirección del tesoro de Lido.

Emite el evento `ERC721Recovered`.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

#### Parámetros:

| Nombre     | Tipo      | Descripción                 |
| ---------- | --------- | --------------------------- |
| `_token`   | `address` | Token compatible con ERC721 |
| `_tokenId` | `uint256` | ID del token minteado       |
