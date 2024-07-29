# API

:::info
Las API de Lido son estrictamente de solo lectura.
:::

Aquí puedes encontrar varias API de Lido que puedes integrar en tu aplicación o sitio web:

## Lido APR

La API proporciona el APR de Ethereum y Lido staking, que incluye:

### Promedio Móvil Simple del APR de Lido para los últimos 7 días:

Este valor de APR se basa en el Promedio Móvil Simple de los valores de APR durante un período de 7 días.

```
https://eth-api.lido.fi/v1/protocol/steth/apr/sma
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://eth-api.lido.fi/api/#/APR%20for%20Eth%20and%20stEth/ProtocolController_findSmaAPRforSTETH)

### Holesky

```
https://eth-api-holesky.testnet.fi/v1/protocol/steth/apr/sma
```

### Último APR de Lido para stETH

El valor más reciente de APR de staking. Para Lido V1, recolectamos valores de APR obteniendo periódicamente [eventos de informes de oráculo](/docs/contracts/legacy-oracle.md#posttotalshares). Para la versión V2, el valor se calcula en base a [eventos de rebase](https://github.com/lidofinance/lido-dao/blob/e45c4d6/contracts/0.4.24/Lido.sol#L232).

Cálculo del APR V2:

```
// Se emite cuando el token se reajusta (cambian el suministro total y/o las acciones totales)
event TokenRebased(
    uint256 indexed reportTimestamp,
    uint256 timeElapsed,
    uint256 preTotalShares,
    uint256 preTotalEther, /* preTotalPooledEther */
    uint256 postTotalShares,
    uint256 postTotalEther, /* postTotalPooledEther */
    uint256 sharesMintedAsFees /* parte de la tarifa incluida en `postTotalShares` */
);

preShareRate = preTotalEther * 1e27 / preTotalShares
postShareRate = postTotalEther * 1e27 / postTotalShares

userAPR =
    secondsInYear * (
        (postShareRate - preShareRate) / preShareRate
    ) / timeElapsed
```

```
https://eth-api.lido.fi/v1/protocol/steth/apr/last
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://eth-api.lido.fi/api/static/index.html#/APR%20for%20Eth%20and%20stEth/ProtocolController_findLastAPRforSTETH)

#### Holesky

```
https://eth-api-holesky.testnet.fi/v1/protocol/steth/apr/last
```

## Historial de Recompensas de Lido

El Backend de Historial de Recompensas proporciona una API que devuelve todas las interacciones de stETH por una dirección y calcula sus recompensas diarias de stETH.

Actualmente, solo hay un endpoint (`/`):

```
https://reward-history-backend.lido.fi/?address=0x12345
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://reward-history-backend.lido.fi/api)

### Parámetros

El único parámetro de consulta obligatorio es `address`.

Parámetros opcionales:

- `currency`: USD/EUR/GBP - Moneda fiduciaria en la que se mostrará stETH denominados en fiat. **USD** por defecto.
- `archiveRate`: true/false - Usar una tasa de cambio cercana al momento de la transacción al calcular los valores de la moneda en lugar de la actual. **true** por defecto.
- `onlyRewards`: true/false - Incluir solo recompensas sin transferencias ni staking. **false** por defecto.
- `sort`: asc/desc - Ordenar las transacciones por blockTime. **desc** por defecto.
- `skip`: número - Cantidad de elementos de datos a omitir.
- `limit`: número - Cantidad máxima de elementos de datos con los que responder.

Los parámetros `skip` y `limit` se usan para paginación, por ejemplo:

```
skip: 0, limit: 100 = 1 página
skip: 100, limit: 100 = 2 página
skip: 200, limit: 100 = 3 página
```

### Holesky

El Backend de Historial de Recompensas también está disponible en Holešky:

```
http://reward-history-backend-holesky.testnet.fi/?address=0x12345
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://reward-history-backend-holesky.testnet.fi/api)

## API de Retiros

El servicio de API de Retiros ofrece una utilidad para estimar el tiempo de espera para [retiros](https://docs.lido.fi/contracts/withdrawal-queue-erc721) dentro del protocolo de Lido en Ethereum.
El servicio es útil para los stakers, proporcionando información desde el momento de la solicitud de retiro hasta su finalización cuando la solicitud se vuelve reclamable.

Consulta la [explicación detallada](https://github.com/lidofinance/withdrawals-api/blob/develop/how-estimation-works.md).

### Casos de Uso

- Estimación antes de la solicitud: los usuarios pueden estimar el tiempo de espera antes de realizar una solicitud de retiro.
- Seguimiento de la solicitud existente: los usuarios pueden rastrear el tiempo de espera estimado para la solicitud ya realizada.

### Calcula el tiempo para las solicitudes de retiros:

```
https://wq-api.lido.fi/v2/request-time?ids=1&ids=2
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://wq-api.lido.fi/api#/Request%20Time/RequestTimeController_requestsTime)

### Calcular el tiempo para la cola de retiro actual:

```
https://wq-api.lido.fi/v2/request-time/calculate
```

### Calcula el tiempo para el retiro de la cantidad de stETH:

```
https://wq-api.lido.fi/v2/request-time/calculate?amount=32
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://wq-api.lido.fi/api#/Request%20Time/RequestTimeController_calculateTime)

### Holesky

```
https://wq-api-holesky.testnet.fi/v2/request-time?ids=1&ids=2
```

El esquema de respuesta y ejemplos están disponibles en la [documentación de la API de Swagger](https://wq-api-holesky.testnet.fi/api#/Request%20Time/RequestTimeController_requestsTime)
