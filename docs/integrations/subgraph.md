# Subgraph

## Introducción

Lido tiene un Subgraph desplegado en [The Graph Decentralized Network](https://thegraph.com/docs/about/introduction#what-the-graph-is) que indexa y organiza datos de los eventos de los contratos inteligentes de Lido, exponiendo un endpoint GraphQL para consultas. Los datos del Subgraph son indexados y servidos por Indexers independientes en la red.

## Esquema de GraphQL

El esquema de las entidades GraphQL disponibles está definido en [`/schema.graphql`](https://github.com/lidofinance/lido-subgraph/blob/master/schema.graphql).

## Enlaces

- [Página del Explorador](https://thegraph.com/explorer/subgraph?id=Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ&view=Overview)
- Endpoint GraphQL: `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ`
- [Repositorio de Código](https://github.com/lidofinance/lido-subgraph/)

## Ejemplos de Consultas

A continuación se presentan algunas consultas de ejemplo que puedes usar para obtener información de los contratos de Lido.

Puedes construir tus propias consultas utilizando [GraphQL Explorer](https://graphiql-online.com) para probar y consultar exactamente lo que necesitas.

### Distribución de Recompensas

Datos diarios de recompensas de staking con APR calculado y distribución de tarifas.

```graphql
{
  totalRewards(first: 100, orderBy: block, orderDirection: desc) {
    id
    totalRewards
    totalRewardsWithFees
    insuranceFee
    treasuryFee
    totalFee
    dust
    nodeOperatorFees {
      address
      fee
    }
    nodeOperatorsShares {
      address
      shares
    }
    shares2mint
    sharesToInsuranceFund
    sharesToOperators
    sharesToTreasury
    totalPooledEtherBefore
    totalPooledEtherAfter
    totalSharesBefore
    totalSharesAfter
    apr
    aprBeforeFees
    aprRaw
    preTotalPooledEther
    postTotalPooledEther
    timeElapsed
    block
    blockTime
    transactionIndex
  }
}
```

### Informes de Oracle

Informes diarios completados por el oracle.

```graphql
{
  oracleCompleteds(first: 500, orderBy: blockTime, orderDirection: desc) {
    epochId
    beaconBalance
    beaconValidators
    block
    blockTime
  }
}
```

### Transferencias

Transferencias de stETH entre direcciones.

```graphql
{
  lidoTransfers(first: 50) {
    from
    to
    value
    block
    blockTime
    transactionHash
  }
}
```

### Envios

Eventos de staking de stETH.

```graphql
{
  lidoSubmissions(first: 50) {
    sender
    amount
    block
    blockTime
    transactionHash
  }
}
```

### Claves de Operadores de Nodo

Obtener claves de validadores de un operador de nodo.

```graphql
{
  nodeOperatorSigningKeys(where: { operatorId: 0 }) {
    pubkey
  }
}
```

## Enlaces Útiles

[Video Tutorial para Crear una Clave API](https://www.youtube.com/watch?v=UrfIpm-Vlgs)

[Gestionar tu Clave API y Configurar tus Preferencias de Indexer](https://thegraph.com/docs/en/studio/managing-api-keys/)

[Consulta desde una Aplicación](https://thegraph.com/docs/en/developer/querying-from-your-app/)
