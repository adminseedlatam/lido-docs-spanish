# InsuranceFund

- [Código fuente](https://github.com/lidofinance/insurance-fund/blob/main/contracts/InsuranceFund.sol)
- [Contrato desplegado](https://etherscan.io/address/0x8B3f33234ABD88493c0Cd28De33D583B70beDe35)
- [LIP-18](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-18.md)

El Fondo de Seguros de Lido es un contrato bóveda que sirve como un almacenamiento transparente y simple para fondos asignados para fines de auto-seguro.

## Mecánica

El Insurance Fund es una bóveda simple que hereda de [Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/access/Ownable.sol) de OpenZeppelin y permite al propietario transferir ether, tokens ERC20, tokens ERC721, tokens ERC1155 desde el contrato. El propietario, que será el Agente del DAO de Lido, puede transferir la propiedad a otra entidad, con la excepción de la [dirección cero](https://etherscan.io/address/0x0000000000000000000000000000000000000000).

## Métodos de vista

### owner()

Devuelve el `owner` actual.

```solidity
function owner() public view returns (address);
```

### renounceOwnership()

Siempre revierte.

```solidity
function renounceOwnership() public pure override;
```

## Métodos

### transferERC1155()

Transfiere un único token ERC1155 con el ID especificado en la cantidad especificada a una entidad desde el saldo del contrato. El receptor del contrato debe implementar `ERC1155TokenReceiver` de acuerdo con [EIP-1155](https://eips.ethereum.org/EIPS/eip-1155) para recibir tokens de manera segura.
- revierte si `msg.sender` no es el `owner`;
- revierte si `_recipient` es la dirección cero;
- revierte si el saldo del contrato es insuficiente;
- emite `ERC721Transferred(address indexed _token, address indexed _recipient, uint256 _tokenId, bytes _data)`.

```solidity
function transferERC1155(address _token, address _recipient, uint256 _tokenId, uint256 _amount, bytes calldata _data) external;
```

#### Parámetros

| Nombre       | Tipo      | Descripción         |
| ------------ | --------- | ------------------- |
| `_token`     | `address` | token ERC1155       |
| `_recipient` | `address` | entidad receptora   |
| `_tokenId`   | `uint256` | identificador token |
| `_amount`    | `uint256` | cantidad a transferir |
| `_data`      | `bytes`   | secuencia de bytes para el gancho `onERC1155Received` |

:::info
Nota: `transferERC1155` no soporta transferencias en lote de múltiples tokens.
:::

### transferERC20()

Transfiere un token ERC20 a una entidad en la cantidad especificada desde el saldo del contrato.
- revierte si `msg.sender` no es el `owner`;
- revierte si `_recipient` es la dirección cero;
- revierte si el saldo del contrato es insuficiente;
- emite `ERC20Transferred(address indexed _token, address indexed _recipient, uint256 _amount)`.

```solidity
function transferERC20(address _token, address _recipient, uint256 _amount) external;
```

#### Parámetros

| Nombre       | Tipo      | Descripción         |
| ------------ | --------- | ------------------- |
| `_token`     | `address` | token ERC20         |
| `_recipient` | `address` | entidad receptora   |
| `_amount`    | `uint256` | cantidad a transferir |

### transferERC721()

Transfiere un único token ERC721 con el ID especificado a una entidad desde el saldo del contrato. El receptor del contrato debe implementar `ERC721TokenReceiver` de acuerdo con [EIP-721](https://eips.ethereum.org/EIPS/eip-721) para recibir tokens de manera segura.
- revierte si `msg.sender` no es el `owner`;
- revierte si `_recipient` es la dirección cero;
- emite `ERC721Transferred(address indexed _token, address indexed _recipient, uint256 _tokenId, bytes _data)`.

```solidity
function transferERC721(address _token, address _recipient, uint256 _tokenId, bytes memory _data) external;
```

#### Parámetros

| Nombre       | Tipo      | Descripción         |
| ------------ | --------- | ------------------- |
| `_token`     | `address` | token ERC721        |
| `_recipient` | `address` | entidad receptora   |
| `_tokenId`   | `uint256` | identificador token |
| `_data`      | `bytes`   | secuencia de bytes para el gancho `onERC721Received` |

### transferEther()

Transfiere ether a una entidad desde el saldo del contrato.
- revierte si `msg.sender` no es el `owner`;
- revierte si `_recipient` es la dirección cero;
- revierte si el saldo del contrato es insuficiente;
- revierte si la operación real de transferencia falla (por ejemplo, `_recipient` es un contrato sin fallback);
- emite `EtherTransferred(address indexed _recipient, uint256 _amount)`.

```solidity
function transferEther(address _recipient, uint256 _amount) external;
```

#### Parámetros

| Nombre       | Tipo      | Descripción         |
| ------------ | --------- | ------------------- |
| `_recipient` | `address` | entidad receptora   |
| `_amount`    | `uint256` | cantidad a transferir |

### transferOwnership()

Asigna `newOwner` como el nuevo `owner`.

- revierte si `msg.sender` no es el `owner`;
- revierte si `newOwner` es la dirección cero;
- emite `emit OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`.

```solidity
function transferOwnership(address newOwner) public;
```

#### Parámetros

| Nombre     | Tipo      | Descripción |
| ---------- | --------- | ----------- |
| `newOwner` | `address` | entidad que tendrá acceso a todas las operaciones mutables de estado |
