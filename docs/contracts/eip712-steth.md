# EIP712StETH

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/EIP712StETH.sol)
- [Contrato desplegado](https://etherscan.io/address/0x8F73e4C2A6D852bb4ab2A45E6a9CF5715b3228B7)

`EIP712StETH` sirve como un contrato auxiliar dedicado para `stETH`, crucial para el soporte completo de las [aprobaciones firmadas compatibles con ERC-2612](https://eips.ethereum.org/EIPS/eip-2612).

## Por qué se necesita este auxiliar

El contrato original [`Lido/StETH`](/contracts/lido) está implementado en Solidity `0.4.24`, mientras que este auxiliar está implementado en Solidity `0.8.9`. La versión más nueva del compilador permite acceder al `chain id` actual de la red a través de la variable globalmente disponible [`block.chainid`](https://docs.soliditylang.org/en/v0.8.9/units-and-global-variables.html#block-and-transaction-properties). El `chain id` es obligatorio para incluir en la firma según [EIP-155](https://eips.ethereum.org/EIPS/eip-155) para prevenir ataques de repetición, donde un atacante intercepta una transmisión válida de red y luego la retransmite en otro fork de la red. Por lo tanto, el cumplimiento de `EIP-155` es crucial para asegurar las aprobaciones firmadas de [`ERC-2612`](https://eips.ethereum.org/EIPS/eip-2612).

## Métodos de vista

### domainSeparatorV4()

Este método devuelve el [separador de dominio](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator) hash compatible con `EIP712`, que es válido para las firmas de permisos del token `stETH`. El separador de dominio es esencial para evitar que una firma destinada a una dApp funcione en otra (evitando así colisiones de firma en un sentido más amplio).

```sol
function domainSeparatorV4(address _stETH) returns (bytes32)
```

También considera el método [`eip712Domain()`](/contracts/eip712-steth#eip712domain) que puede construir un separador de dominio a partir de campos específicos de `StETH` en el lado del cliente, como dentro de una dApp o una cartera. Por ejemplo, Metamask utiliza [`eth_signTypedData_v4`](https://docs.metamask.io/wallet/how-to/sign-data/#use-eth_signtypeddata_v4), que requiere que se proporcione un separador de dominio no hash.

### hashTypedDataV4()

Este método devuelve el hash de un mensaje totalmente codificado compatible con `EIP712` para este dominio. El método puede validar los datos de entrada contra los componentes `v, r, s` secp256k1 proporcionados.

```sol
function hashTypedDataV4(address _stETH, bytes32 _structHash) returns (bytes32)
```

#### Parámetros

| Nombre         | Tipo      | Descripción                           |
| -------------- | --------- | ------------------------------------- |
| `_stETH`       | `address` | Dirección del token `stETH` desplegado |
| `_structHash`  | `bytes32` | Hash de la estructura de datos         |

Para un caso de uso específico, consulta la implementación de [StETHPermit.permit()](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/StETHPermit.sol#L99-L112).

### eip712Domain()

Este método devuelve los campos y valores necesarios para construir un separador de dominio en el lado del cliente. El método se asemeja al propuesto en [ERC-5267](https://eips.ethereum.org/EIPS/eip-5267), con la única diferencia de que no devuelve campos no utilizados.

```sol
function eip712Domain(address _stETH) returns (
    string memory name,
    string memory version,
    uint256 chainId,
    address verifyingContract
)
```

#### Parámetros

| Nombre     | Tipo      | Descripción                           |
| ---------- | --------- | ------------------------------------- |
| `_stETH`   | `address` | Dirección del token `stETH` desplegado |

#### Devoluciones

| Nombre             | Tipo       | Descripción                   |
| ------------------ | ---------- | ----------------------------- |
| `name`             | `string`   | Nombre del token              |
| `version`          | `string`   | Versión del token             |
| `chainId`          | `uint256`  | Identificador de la cadena    |
| `verifyingContract`| `address`  | Dirección del contrato del token |

:::note
Dada la dirección `_stETH` [desplegada](/deployed-contracts) correcta, devuelve:

- ("Liquid staked Ether 2.0", "2", 1, 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) para Mainnet.
- ("Liquid staked Ether 2.0", "2", 5, 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F) para Görli.
:::

Este método facilita la construcción del separador de dominio en el lado del cliente, como en una cartera o widget:

```js
function makeDomainSeparator(name, version, chainId, verifyingContract) {
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        web3.utils.keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
        web3.utils.keccak256(name),
        web3.utils.keccak256(version),
        chainId,
        verifyingContract,
      ]
    )
  )
}
```

## Enlaces Externos Útiles

- [La magia de las firmas digitales en Ethereum](https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7)
- [ERC-2612: La guía definitiva para aprobaciones ERC-20 sin gas](https://medium.com/frak-defi/erc-2612-the-ultimate-guide-to-gasless-erc-20-approvals-2cd32ddee534)
- [Metamask sign-data](https://docs.metamask.io/wallet/how-to/sign-data/#use-eth_signtypeddata_v4)

