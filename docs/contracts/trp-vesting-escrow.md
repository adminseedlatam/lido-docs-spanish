# TRP VestingEscrow

- [Código Fuente](https://github.com/lidofinance/lido-vesting-escrow/tree/main/contracts)
- Contratos Desplegados (mainnet)
  - [VestingEscrowFactory](https://etherscan.io/address/0xDA1DF6442aFD2EC36aBEa91029794B9b2156ADD0)
  - [VestingEscrowProto](https://etherscan.io/address/0x484FD04c598A095360DF89bF85AB34c37127AA39)
  - [VotingAdapter](https://etherscan.io/address/0xCFda8aB0AE5F4Fa33506F9C51650B890E4871Cc1)
- [Especificaciones detalladas de los contratos](https://hackmd.io/@lido/rkKpFX8So)

Los contratos de escrow de Token Reward Program (TRP) permiten la distribución y el vesting transparente en la cadena de recompensas de tokens para los contribuyentes de Lido DAO.

## VestingEscrowFactory

### Variables Públicas

- `voting_adapter: address` - dirección del VotingAdapter utilizado en los vestings
- `owner: address` - propietario de la fábrica y los vestings
- `manager: address` - gestor de los vestings

### Métodos de Vista

#### target()

Devuelve el valor inmutable `TARGET`

```vyper
@external
@view
def target() -> uint256
```

#### token()

Devuelve el valor inmutable `TOKEN`

```vyper
@external
@view
def token() -> uint256
```

### Métodos

#### deploy_vesting_contract()

:::note
Antes de llamar a `deploy_vesting_contract()`, el llamador debe tener suficientes tokens en el balance y llamar a `approve(vestingFactoryAddress, fundAmount)` en el contrato del token.
:::

Despliega y financia una nueva instancia de `VestingEscrow` para el `recipient` dado. Configura todos los parámetros para el escrow desplegado.
Devuelve la dirección del escrow desplegado.

```vyper
@external
def deploy_vesting_contract(
    amount: uint256,
    recipient: address,
    vesting_duration: uint256,
    vesting_start: uint256 = block.timestamp,
    cliff_length: uint256 = 0,
    is_fully_revokable: bool = False
) -> address
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                |
|------------------------|-----------------------------|------------------------------------------------------------|
| `amount`               | `uint256`                   | Cantidad de tokens a controlar por el vesting               |
| `recipient`            | `address`                   | Destinatario de los fondos vestidos                         |
| `vesting_duration`     | `uint256`                   | Duración del vesting en segundos                           |
| `vesting_start`        | `uint256`                   | Tiempo de inicio del vesting en segundos (tiempo Unix en segundos) |
| `cliff_length`         | `uint256`                   | Duración del cliff en segundos                             |
| `is_fully_revokable`   | `bool`                      | Bandera que habilita el método `revoke_all`                |

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- `vesting_duration <= 0`.
- `cliff_length >= vesting_duration`
- falla la transferencia de tokens del llamador a la fábrica
- falla la aprobación de los tokens al vesting actual
:::

#### recover_erc20()

Recupera tokens ERC20 desde el contrato hacia el `owner`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `token`          | `address`                   | Dirección del token ERC20 a recuperar                       |
| `amount`         | `uint256`                   | Cantidad de tokens a recuperar                             |

:::note
Revoca si:

- falla la transferencia de tokens al `owner`
:::

#### recover_ether()

Recupera todo el ether desde el contrato hacia el `owner`.

```vyper
@external
def recover_ether()
```

:::note
Revoca si:

- falla la transferencia de ether al `owner`
:::

#### update_voting_adapter()

Establece `self.voting_adapter` a `voting_adapter`.

```vyper
@external
def update_voting_adapter(
    voting_adapter: address
)
```

## VestingEscrow

### Variables Públicas

- `recipient: address` - dirección que puede reclamar tokens del escrow
- `token: ERC20` - dirección del token con vested
- `start_time: uint256` - tiempo de inicio del vesting (hora UTC en segundos UNIX)
- `end_time: uint256` - tiempo de finalización del vesting (hora UTC en segundos UNIX)
- `cliff_length: uint256` - duración del cliff en segundos
- `factory: IVestingEscrowFactory` - dirección de la fábrica principal
- `total_locked: uint256` - cantidad total de tokens a ser vested (no cambia después de los reclamos)
- `is_fully_revokable: bool` - indica si el escrow puede ser completamente revocado
- `total_claimed: uint256` - cantidad total de tokens reclamados
- `disabled_at: uint256` - tiempo efectivo de finalización del vesting (hora UTC en segundos UNIX). Puede diferir de `end_time` en caso de llamadas a los métodos `revoke_xxx`
- `initialized: bool` - indica si el escrow fue inicializado
- `is_fully_revoked: bool` - indica si el escrow fue completamente revocado y no hay más tokens

### Métodos de Vista

#### unclaimed()

Devuelve la cantidad actual de tokens disponibles para el reclamo.

```vyper
@external
@view
def unclaimed() -> uint256
```

#### locked()

Devuelve la cantidad actual de tokens bloqueados.

```vyper
@external
@view
def locked() -> uint256
```

### Métodos

#### claim()

Reclama tokens a la dirección del `beneficiary`. Si la cantidad solicitada es mayor que `unclaimed`, entonces se reclamará la cantidad `unclaimed`.

Devuelve la cantidad real de tokens reclamados.

```vyper
@external
def claim(
    beneficiary: address = msg.sender,
    amount: uint256 = max_value(uint256)
)
```

##### Parámetros

| Nombre         | Tipo        | Descripción                              |
|----------------|-------------|------------------------------------------|
| `beneficiary`  | `address`   | Dirección para reclamar los tokens       |
| `amount`       | `uint256`   | Cantidad de tokens a reclamar            |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
- falla la transferencia de tokens al `beneficiary`
:::

#### revoke_unvested()

Deshabilita el flujo futuro de tokens y revoca la parte no vested al propietario.

```vyper
@external
def revoke_unvested()
```

:::note
Revoca si:

- llamado por cualquier persona excepto el propietario o manager de `VestingEscrowFactory`
- falla la transferencia de tokens al propietario de `VestingEscrowFactory`
:::

#### revoke_all()

Deshabilita el flujo futuro de tokens y revoca todos los tokens al propietario.

```vyper
@external
def revoke_all()
```

:::note
Revoca si:

- el parámetro `is_fully_revocable` de `VestingEscrow` no es Verdadero
- llamado por cualquier persona excepto el propietario de `VestingEscrowFactory`
- falla la transferencia de tokens al propietario de `VestingEscrowFactory`
:::

#### recover_erc20()

Recupera tokens ERC20 desde el contrato hacia el `recipient`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parámetros

| Nombre         | Tipo        | Descripción                              |
|----------------|-------------|------------------------------------------|
| `token`        | `address`   | Dirección del token ERC20 a recuperar    |
| `amount`       | `uint256`   | Cantidad de tokens a recuperar           |

:::note
Revoca si:

- falla la transferencia de tokens al `recipient`
:::

#### recover_ether()

Collect all ether from the contract to the `recipient`.

```vyper
@external
def recover_ether()
```

:::note
Reverts if:

- Ether transfer to `recipient` fails
:::

#### aragon_vote()

Participa en la votación de Aragon utilizando todos los tokens disponibles en el balance del contrato. Utiliza `delegateCall` hacia `VotingAdapter`. La dirección de `VotingAdapter` se obtiene desde `self.factory`.

```vyper
@external
def aragon_vote(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                      |
|------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `vote`. Pueden ser compilados usando `VotingAdapter.encode_aragon_vote_calldata` |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
:::

#### snapshot_set_delegate()

Delega el poder de voto del Snapshot de todos los tokens disponibles en el balance del contrato a `delegate`. Utiliza `delegateCall` hacia `VotingAdapter`. La dirección de `VotingAdapter` se obtiene desde `self.factory`.

```vyper
@external
def snapshot_set_delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                                |
|------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `delegate`. Pueden ser compilados usando `VotingAdapter.encode_snapshot_set_delegate_calldata` |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
:::

#### delegate()

:::note
No implementado en el momento de la escritura
:::

Delega el poder de voto de todos los tokens disponibles en el balance del contrato a `delegate`. Utiliza `delegateCall` hacia `VotingAdapter`. La dirección de `VotingAdapter` se obtiene desde `self.factory`.

```vyper
@external
def delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                   |
|------------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `vote`. Pueden ser compilados usando `VotingAdapter.encode_delegate_calldata` |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
:::

## VotingAdapter

### Variables públicas

- `owner: address` - dueño del VotingAdapter

### Métodos de vista

#### encode_aragon_vote_calldata()

Devuelve los parámetros codificados ABI para la llamada `aragon_vote`.

```vyper
@external
@view
def encode_aragon_vote_calldata(
    voteId: uint256,
    supports: bool
) -> Bytes[1000]
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `voteId`         | `uint256`                   | ID de la votación en Aragon                                 |
| `supports`       | `bool`                      | Bandera de soporte. `True` - a favor, `False` - en contra   |

#### encode_snapshot_set_delegate_calldata()

Devuelve los parámetros codificados ABI para la llamada `snapshot_set_delegate`.

```vyper
@external
@view
def encode_snapshot_set_delegate_calldata(
    delegate: address
) -> Bytes[1000]
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `delegate`       | `address`                   | Dirección a la cual delegar el poder de voto snapshot      |

#### encode_delegate_calldata()

Devuelve los parámetros codificados en ABI para la llamada al método `delegate`.

```vyper
@external
@view
def encode_delegate_calldata(
    delegate: address
) -> Bytes[1000]
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `delegate`       | `address`                   | Dirección a la cual delegar el poder de voto               |

### Métodos

#### aragon_vote()

Participa en la votación de Aragon utilizando todos los tokens disponibles en el balance del contrato. Solo tiene sentido para `delegateCalls`, por lo que se utilizará el balance del llamante. Utiliza `VOTING_CONTRACT_ADDR` como la dirección del contrato de votación.

```vyper
@external
def aragon_vote(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                      |
|------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `vote`. Pueden ser compilados usando `VotingAdapter.encode_aragon_vote_calldata` |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
:::

#### snapshot_set_delegate()

Delega el poder de voto del Snapshot de todos los tokens disponibles. Solo tiene sentido para `delegateCalls`, por lo que se utilizará el balance del llamante. Utiliza `SNAPSHOT_DELEGATE_CONTRACT_ADDR` como la dirección del contrato de votación.

```vyper
@external
def snapshot_set_delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                                |
|------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `delegate`. Pueden ser compilados usando `VotingAdapter.encode_snapshot_set_delegate_calldata` |

:::note
Revoca si:

- llamado por cualquier persona excepto el `recipient` del vesting
:::

#### delegate()

:::note
Implementación futura
:::

Stub para la futura implementación del voto con delegación.

```vyper
@external
def delegate(
    abi_encoded_params: Bytes[1000]
)
```

##### Parámetros

| Nombre                 | Tipo                        | Descripción                                                                                                   |
|------------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------|
| `abi_encoded_params`   | `Bytes[1000]`               | Parámetros codificados en ABI para la llamada al método `vote`. Pueden ser compilados usando `VotingAdapter.encode_delegate_calldata` |

:::note
Siempre revoca
:::

#### recover_erc20()

Recupera tokens ERC20 desde el contrato hacia el `owner`.

```vyper
@external
def recover_erc20(
    token: address,
    amount: uint256
)
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `token`          | `address`                   | Dirección del token ERC20 a recuperar                       |
| `amount`         | `uint256`                   | Monto de tokens a recuperar                                |

:::note
Revoca si:

- falla la transferencia de tokens al `owner`
:::

#### recover_ether()

Recupera todo el ether del contrato hacia el `owner`.

```vyper
@external
def recover_ether()
```

:::note
Revoca si:

- falla la transferencia de ether al `owner`
:::

#### change_owner()

Establece `self.owner` a `owner`.

```vyper
@external
def change_owner(
    owner: address
)
```

##### Parámetros

| Nombre           | Tipo                        | Descripción                                                |
|------------------|-----------------------------|------------------------------------------------------------|
| `owner`          | `address`                   | Nueva dirección del `owner`                                |

:::note
Revoca si:

- llamado por cualquier persona excepto el `owner` de `VotingAdapter`
- el argumento `owner` es una dirección vacía
:::
