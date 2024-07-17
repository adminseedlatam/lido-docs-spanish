# WithdrawalVault

- [Código Fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/WithdrawalVault.sol)
- [Contrato Desplegado](https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f)

## Qué es WithdrawalVault

Un contrato simple que acumula retiros parciales y totales que provienen de la Beacon Chain. Su dirección corresponde a las credenciales de retiro tipo-0x01 de Lido. Durante el informe del oráculo de contabilidad, Lido vacía la bóveda en el buffer interno; consulte [documentación del contrato Lido](lido.md#informe-de-oráculo) para más detalles.

La bóveda es recuperable, por lo que cualquier token ERC-20 y ERC-721 puede ser transferido al tesoro por DAO.

La versión actualmente desplegada es actualizable debido a los cambios anticipados en las mecánicas de retiro de Ethereum.

:::note
Se espera que el contrato se ossifique en algún momento después de que se implementen las salidas activables de las credenciales de retiro.
:::

## Métodos de Vista

### getContractVersion()

Devuelve la versión actual del contrato.

```sol
function getContractVersion() returns (uint256)
```

## Métodos

### withdrawWithdrawals()

Transfiere la cantidad `_amount` de retiros acumulados al contrato de Lido.

:::note
Solo puede ser llamado por el contrato [Lido](lido.md).
:::

```sol
function withdrawWithdrawals(uint256 _amount)
```

### recoverERC20()

Transfiere la cantidad dada del token ERC20 (definido por la dirección del contrato del token proporcionado) que actualmente pertenece a la dirección del contrato de la bóveda a la dirección del tesoro de Lido.

Emite un evento `ERC20Recovered`.

```sol
function recoverERC20(address _token, uint256 _amount) external
```

#### Parámetros:

| Nombre     | Tipo      | Descripción               |
| ---------- | --------- | ------------------------- |
| `_token`   | `address` | Token compatible con ERC20 |
| `_amount`  | `uint256` | Cantidad de tokens a recuperar |

### recoverERC721()

Transfiere el tokenId dado del NFT compatible con ERC721 (definido por la dirección del contrato del token proporcionado) que actualmente pertenece a la dirección del contrato de la bóveda a la dirección del tesoro de Lido.

Emite un evento `ERC721Recovered`.

```sol
function recoverERC721(address _token, uint256 _tokenId) external
```

#### Parámetros:

| Nombre     | Tipo      | Descripción               |
| ---------- | --------- | ------------------------- |
| `_token`   | `address` | Token compatible con ERC721 |
| `_tokenId` | `uint256` | ID del token acuñado      |