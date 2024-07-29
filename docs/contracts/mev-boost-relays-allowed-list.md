# MevBoostRelayAllowedList

- [Código Fuente](https://github.com/lidofinance/mev-boost-relay-allowed-list/blob/main/contracts/MEVBoostRelayAllowedList.vy)
- [Contrato Desplegado (mainnet)](https://etherscan.io/address/0xf95f069f9ad107938f6ba802a3da87892298610e)
- [Contrato Desplegado (holešky)](https://holesky.etherscan.io/address/0x2d86C5855581194a386941806E38cA119E50aEA3)

La lista permitida de relés de MEV-Boost es un contrato simple que almacena una lista de relés aprobados por DAO para su uso en configuraciones de [MEV-Boost](https://github.com/flashbots/mev-boost). Los datos del contrato se utilizan para generar un archivo de configuración que contiene una lista de relés a los cuales los Operadores de Nodo deberían conectarse al participar en Lido.

## Métodos de Vista

### get_owner()

Recupera al propietario actual del contrato.

```vyper
@view
@external
def get_owner() -> address
```

### get_manager()

Recupera la entidad de gestión actual (devuelve dirección cero si no hay ninguna entidad asignada).

```vyper
@view
@external
def get_manager() -> address
```

### get_relays_amount()

Recupera el número total actual de relés permitidos.

```vyper
@view
@external
def get_relays_amount() -> uint256
```

### get_relays()

Recupera todos los relés permitidos actualmente.

```vyper
@view
@external
def get_relays() -> DynArray[Relay, MAX_NUM_RELAYS]
```

### get_relay_by_uri()

Recupera el relé con el URI proporcionado.

```vyper
@view
@external
def get_relay_by_uri(relay_uri: String[MAX_STRING_LENGTH]) -> bool
```

#### Parámetros:

| Nombre      | Tipo                        | Descripción  |
| ----------- | --------------------------- | ------------ |
| `relay_uri` | `String[MAX_STRING_LENGTH]` | URI del relé |

:::note
Revoca si no se encuentra ningún relé.
:::

### get_allowed_list_version()

Recupera la versión actual de la lista de relés permitidos.

```vyper
@view
@external
def get_allowed_list_version() -> uint256
```

## Métodos

### add_relay()

Añade un relé a la lista permitida.
Incrementa la versión de la lista permitida.

```vyper
@external
def add_relay(
    uri: String[MAX_STRING_LENGTH],
    operator: String[MAX_STRING_LENGTH],
    is_mandatory: bool,
    description: String[MAX_STRING_LENGTH]
)
```

#### Parámetros:

| Nombre         | Tipo                        | Descripción                                                                  |
| -------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `uri`          | `String[MAX_STRING_LENGTH]` | URI del relé                                                                 |
| `operator`     | `String[MAX_STRING_LENGTH]` | Nombre del operador del relé                                                 |
| `is_mandatory` | `bool`                      | Si el relé es obligatorio para el uso por parte del Operador de Nodo de Lido |
| `description`  | `String[MAX_STRING_LENGTH]` | Descripción del relé en formato libre                                        |

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario o el gestor
- el relé con el URI proporcionado ya está permitido
- el URI está vacío
  :::

### remove_relay()

Elimina el relé previamente permitido del conjunto.
Incrementa la versión de la lista permitida.

```vyper
@external
def remove_relay(uri: String[MAX_STRING_LENGTH])
```

#### Parámetros:

| Nombre | Tipo                        | Descripción  |
| ------ | --------------------------- | ------------ |
| `uri`  | `String[MAX_STRING_LENGTH]` | URI del relé |

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario o el gestor
- el relé con el URI proporcionado no está permitido
- el URI está vacío
  :::

### change_owner()

Cambia el propietario actual por uno nuevo.

```vyper
@external
def change_owner(owner: address)
```

#### Parámetros:

| Nombre  | Tipo      | Descripción                     |
| ------- | --------- | ------------------------------- |
| `owner` | `address` | Dirección del nuevo propietario |

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario actual
- `owner` es el propietario actual
- `owner` es una dirección cero
  :::

### set_manager()

Establece `manager` como la entidad de gestión actual.

```vyper
@external
def set_manager(manager: address)
```

#### Parámetros:

| Nombre    | Tipo      | Descripción                |
| --------- | --------- | -------------------------- |
| `manager` | `address` | Dirección del nuevo gestor |

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario actual
- `manager` es igual al valor establecido previamente
- `manager` es una dirección cero
  :::

### dismiss_manager()

Descarta la entidad de gestión actual.

```vyper
@external
def dismiss_manager()
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario actual
- no se había establecido ningún `manager` previamente
  :::

### recover_erc20()

Transfiere tokens ERC20 del balance del contrato al `recipient`.

```vyper
@external
def recover_erc20(token: address, amount: uint256, recipient: address)
```

:::note
Revoca si alguna de las siguientes condiciones es verdadera:

- llamado por cualquier persona que no sea el propietario
- la transferencia ERC20 revierte
- `recipient` es una dirección cero
  :::
