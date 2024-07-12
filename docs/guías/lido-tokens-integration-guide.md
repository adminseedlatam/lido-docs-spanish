# Guía de integración de tokens de Lido

Este documento está destinado a desarrolladores interesados en integrar los tokens stETH o wstETH de Lido en sus dApps o servicios, con un enfoque en mercados de dinero, DEXes y puentes blockchain.

:::info
La integración puede implementarse a nivel de contratos inteligentes (on-chain) o utilizando el [Lido Ethereum SDK](/docs/integrations/sdk.md#lido-ethereum-sdk) (off-chain).
:::

## Lido

Lido es una familia de protocolos de participación líquida en múltiples blockchains, con sede en Ethereum.
El término "líquido" se refiere a la capacidad del stake del usuario para convertirse en líquido. Al depositar, Lido emite el stToken, que representa los tokens depositados junto con todas las recompensas y penalizaciones acumuladas por el staking del depósito. A diferencia de los fondos congelados, este stToken es líquido: puede transferirse libremente entre partes, lo que lo hace utilizable en diferentes aplicaciones DeFi y aún así recibir recompensas de staking diarias. Es fundamental preservar esta propiedad al integrar stTokens en cualquier protocolo DeFi.

Esta guía se refiere a Lido en Ethereum (en adelante, Lido).

## Tokens de Lido

### stTokens: stETH y wstETH

Hacer staking de ether con Lido proporciona una cantidad equivalente de [stETH](#steth).
El balance de stETH del usuario representa la cantidad de ether que se puede retirar directamente del protocolo Lido.

Para integraciones DeFi más simples, `stETH` tiene un valor no rebaseable que aumenta (no rebaseable) llamado ['wrapped stETH'](#wsteth)
(o simplemente `wstETH`).

Los stTokens compatibles con ERC-20 de Lido son ampliamente adoptados en el ecosistema Ethereum:

- Los lugares de [liquidez más importantes on-chain](https://dune.com/lido/wsteth-liquidity) incluyen:
  - [Pool de liquidez stETH/ETH en Curve](https://curve.fi/#/ethereum/pools/steth)
  - [Pool wstETH/ETH en Uniswap V3](https://app.uniswap.org/explore/pools/ethereum/0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa)
  - [Pool estable componible wstETH/ETH en Balancer v2](https://app.balancer.fi/#/ethereum/pool/0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2)
- wstETH está listado como token colateral en los siguientes mercados de AAVE v3:
  - [Mainnet de Ethereum](https://app.aave.com/reserve-overview/?underlyingAsset=0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0&marketName=proto_mainnet_v3)
  - [Arbitrum](https://app.aave.com/reserve-overview/?underlyingAsset=0x5979d7b546e38e414f7e9822514be443a4800529&marketName=proto_arbitrum_v3)
  - [Scroll](https://app.aave.com/reserve-overview/?underlyingAsset=0xf610a9dfb7c89644979b4a0f27063e9e7d7cda32&marketName=proto_scroll_v3)
  - [Base](https://app.aave.com/reserve-overview/?underlyingAsset=0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452&marketName=proto_base_v3)
  - [Optimism](https://app.aave.com/reserve-overview/?underlyingAsset=0x1f32b1c2345538c0c6f582fcb022739c4a194ebb&marketName=proto_optimism_v3)
  - [Polygon PoS](https://app.aave.com/reserve-overview/?underlyingAsset=0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd&marketName=proto_polygon_v3)
- wstETH está [listado como token colateral en Maker](https://daistats.com/#/collateral)
- hay varios proyectos [Mellow LRT](https://app.mellow.finance/restake) construidos sobre (w)stETH
- stETH está listado como token colateral en el mercado AAVE v2 [Mainnet de Ethereum](https://app.aave.com/reserve-overview/?underlyingAsset=0xae7ab96520de3a18e5e111b5eaab095312d7fe84&marketName=proto_mainnet)
- steCRV (el token LP de Curve stETH/ETH) está [listado como token colateral en Maker](https://daistats.com/#/collateral)
- Blast L2 integró [stETH](https://docs.blastfutures.com/get-started/introduction/what-is-blast#how-blast-works) como ether rebaseable (siendo stakeado implícitamente como parte del flujo de puenteo de ether de L1 a L2)
- existen múltiples estrategias de liquidez construidas sobre los stTokens de Lido, incluyendo [Yearn](https://yearn.fi/vaults/1/0xdCD90C7f6324cfa40d7169ef80b12031770B4325) y [Harvest Finance](https://harvest.finance/)

#### Utilidades de integración: Feeds de tasa y precio

El sentimiento actual para los mercados de dinero e integraciones DeFi en general es considerar que los Tokens de Stake Líquido están respaldados por sus tasas de cambio nativas frente a ETH.
Este enfoque implica un invariante de precios de 1 stETH = 1 ETH que se debe utilizar.

Las aplicaciones del mundo real incluyen [AAVE v3](https://github.com/bgd-labs/aave-proposals/blob/main/src/AaveV2-V3PriceFeedsUpdate_20230613/PRICE-FEEDS-UPDATE-20230613.md#motivation)
y enfoques de precios [Mellow LRT](https://etherscan.io/address/0x1Dc89c28e59d142688D65Bd7b22C4Fd40C2cC06d).

Hay feeds de tasa `wstETH/stETH` disponibles para usar en conjunto con (w)stETH:

- [Ethereum Mainnet](https://etherscan.io/address/0x94336dF517036f2Bf5c620a1BC75a73A37b7bb16#readContract)
- [Arbitrum](https://data.chain.link/feeds/arbitrum/mainnet/wsteth-steth%20exchangerate)
- [Optimism](https://data.chain.link/feeds/optimism/mainnet/wsteth-steth%20exchangerate)
- [Scroll](https://data.chain.link/feeds/scroll/mainnet/wsteth-steth%20exchangerate)
- [Base](https://data.chain.link/feeds/base/base/wsteth-steth%20exchangerate)
- [Polygon PoS](https://data.chain.link/feeds/polygon/mainnet/wsteth-steth)
- [Era ZKSync](https://data.chain.link/feeds/zksync/zksync/wsteth-steth%20exchangerate)
:::note
El feed compatible con Chainlink en Ethereum Mainnet está desplegado y es utilizado por los vaults de Mellow LRT, siendo un envoltorio para `wstETH.getStETHByWstETH(10 ** decimals)`
:::

Estos feeds pueden utilizarse para componer un feed objetivo, por ejemplo, para el par `wstETH/USD`, consulte los ejemplos de los mercados AAVE v3:

- [Ethereum Mainnet `WstETHSynchronicityPriceAdapter`](https://etherscan.io/address/0x8b6851156023f4f5a66f68bea80851c3d905ac93#code)
- [Optimism `CLSynchronicityPriceAdapterPegToBase`](https://optimistic.etherscan.io/address/0x80f2c02224a2e548fc67c0bf705ebfa825dd5439)
- [Arbitrum `CLSynchronicityPriceAdapterPegToBase`](https://arbiscan.io/address/0x945fd405773973d286de54e44649cc0d9e264f78)

### LDO

[LDO](#ldo-1) es un token ERC-20 de gobernanza de Lido derivado del [MiniMe Token](https://github.com/Giveth/minime).
Por lo tanto, los saldos de los titulares de LDO son consultables para cualquier número de bloque, una característica de seguridad esencial para los mecanismos de votación de Lido.

### unstETH

Un token no fungible (NFT) se utiliza para representar una posición de solicitud de retiro [en la cola de retiros a nivel de protocolo](/contracts/withdrawal-queue-erc721) cuando un titular de stToken decide canjearlo por ether a través del protocolo.

:::note
A diferencia de los otros tokens de Lido (`stETH`, `wstETH` y `LDO`), [unstETH](#withdrawals-unsteth) es no fungible y utiliza el estándar de token ERC-721 en lugar del ERC-20.
:::

## stETH vs. wstETH

Existen dos versiones de los tokens stTokens de Lido, llamados stETH y wstETH.
Ambos son tokens fungibles pero reflejan las recompensas de staking acumuladas de manera diferente. stETH implementa una mecánica de rebase, lo que significa que el saldo de stETH se actualiza regularmente. Por el contrario, el saldo de wstETH no cambia por sí solo, sino que aumenta su valor frente a stETH.

:::info
En cualquier momento, cualquier cantidad de stETH se puede convertir en wstETH y viceversa mediante un wrapper sin confianza, por lo que los tokens comparten efectivamente liquidez.
:::

Por ejemplo, las posiciones de wstETH subcolateralizadas en Maker pueden ser liquidadas desenrollando wstETH e intercambiándolas por ether en Curve.

## stETH

### ¿Qué es stETH?

stETH es un token ERC-20 rebaseable que representa ether con stake en Lido. A diferencia del ether con stake, es líquido y puede transferirse, negociarse o utilizarse en aplicaciones DeFi. El suministro total de stETH refleja la cantidad de ether depositado en el protocolo combinado con las recompensas de staking, menos posibles penalizaciones de validadores. Los tokens stETH se emiten al depositar ether en una proporción de 1:1. Desde que se introdujeron los retiros de la capa de consenso, también es posible canjear ether quemando stETH en la misma proporción de 1:1 (aunque en casos raros no preservará la proporción 1:1).

Ten en cuenta que Lido ha implementado límites de tasa de staking para reducir el impacto del aumento de staking posterior a la fusión en la cola de staking y el modelo de distribución de recompensas socializadas de Lido. Lee más al respecto [aquí](#staking-rate-limits).

stETH es un token ERC-20 rebaseable. Normalmente, los saldos de tokens stETH se recalculan diariamente cuando el oráculo de Lido informa la actualización del saldo de ether de la capa de consenso. La actualización del saldo de stETH ocurre automáticamente en todas las direcciones que poseen stETH en el momento del rebase. La mecánica de rebase se ha implementado mediante shares (ver [shares](#steth-internals-share-mechanics)).

### Nota sobre la conformidad ERC-20

stETH no cumple estrictamente con ERC-20. La única excepción es que no emite `Transfer()` en el rebase como lo requiere el estándar [ERC-20](https://eips.ethereum.org/EIPS/eip-20#events).

### Oráculo de contabilidad

Normalmente, los rebases de stETH ocurren diariamente cuando el oráculo de Lido informa la actualización del saldo de ether de la capa de consenso. El rebase puede ser positivo o negativo, según el desempeño de los validadores. En caso de que los validadores de Lido sean castigados o penalizados, los saldos de stETH pueden disminuir según el tamaño de las penalizaciones. Sin embargo, hasta la fecha de escritura, los rebases diarios nunca han sido negativos.

El oráculo de contabilidad tiene controles de integridad tanto en el APR máximo reportado (el APR no puede exceder el 27%, lo que significa que un rebase diario está limitado a `(27/365)%`) como en la disminución del monto total stakeado (la disminución de ether stakeado reportada no puede exceder el 5%).

Actualmente, la red de oráculos incluye 9 oráculos independientes, demonios de oráculo alojados por operadores de nodos establecidos seleccionados por el DAO.
Tan pronto como cinco de los nueve demonios de oráculo informen los mismos datos, alcanzando el consenso, el informe se envía al contrato inteligente de Lido y ocurre el rebase.

#### Casos especiales del oráculo

- En caso de que los demonios del oráculo no informen la actualización del saldo de la capa de consenso o no alcancen el quórum, el oráculo no envía el informe diario y el rebase diario no ocurre hasta que se alcance el quórum.
- El informe del oráculo puede retrasarse, pero incluirá valores actuales para el refSlot de informe. Así que, incluso si se informa 2 horas tarde, solo incluirá los valores de rebase para el período original.
- En caso de que no se alcance el quórum, los demonios del oráculo pueden omitir el informe diario. El informe se realizará tan pronto como se alcance el quórum para uno de los siguientes períodos, e incluirá la actualización incremental del saldo para todos los períodos desde el último informe exitoso del oráculo.
- Los demonios del oráculo solo informan los epochs finalizados. En caso de falta de finalidad en la capa de consenso, los demonios no enviarán sus informes y el rebase diario no ocurrirá.
- En caso de que fallen los controles de integridad del APR máximo o la disminución del monto total stakeado, el informe del oráculo no puede finalizarse y el rebase no puede ocurrir.

### Internos de stETH: Mecánica de shares

Los rebases diarios resultan en cambios en los saldos de tokens stETH. Este mecanismo se implementa mediante shares.
El `share` es una unidad básica que representa la participación del titular de stETH en la cantidad total de ether controlado por el protocolo. Cuando ocurre un nuevo depósito, se emiten nuevos shares para reflejar qué parte del ether controlado por el protocolo se ha agregado al pool. Cuando llega el informe del oráculo de la capa de consenso, se recalcula el precio de 1 share en stETH. Los shares no están normalizados, por lo que el contrato también almacena la suma de todos los shares para calcular el saldo de tokens de cada cuenta.
El saldo de shares por saldo de stETH se puede calcular mediante esta fórmula:

```js
shares[account] = balanceOf(account) * totalShares / totalPooledEther
```

#### Caso especial de 1-2 wei

El cálculo del saldo de stETH incluye división entera, y hay un caso común en el que todo el saldo de stETH no se puede transferir de la cuenta mientras se deja los últimos 1-2 wei en la cuenta del remitente. Lo mismo puede ocurrir en cualquier transacción de transferencia o depósito. En el futuro, cuando la tasa stETH/share sea mayor, el error puede ser un poco mayor. Para evitarlo, se puede usar `transferShares` para ser preciso.

Ejemplo:

1. El usuario A transfiere 1 stETH al usuario B.
2. Bajo el capó, el saldo de stETH se convierte en shares, se aplica la división entera y se redondea hacia abajo.
3. La cantidad correspondiente de shares se transfiere de A a B.
4. El saldo de shares se convierte en saldo de stETH para B.
5. En muchos casos, la cantidad realmente transferida es 1-2 wei menos de lo esperado.

El problema está documentado aquí: [lido-dao/issues/442](https://github.com/lidofinance/lido-dao/issues/442)
### Bookkeeping shares

Aunque es amigable para el usuario, los rebases de stETH añaden un nivel completo de complejidad a la integración de stETH en otras dApps y protocolos. Cuando se integra stETH como un token en cualquier dApp, se recomienda encarecidamente almacenar y operar con shares en lugar de los saldos públicos de stETH directamente, porque los saldos de stETH cambian tanto en las transferencias, mint/burns y rebases, mientras que los saldos de shares solo pueden cambiar en las transferencias y mint/burns.

Para calcular el saldo de shares, se puede usar la función `getSharesByPooledEth(uint256)`. Devuelve el valor que no se ve afectado por los futuros rebases y se puede convertir de vuelta a stETH llamando a la función `getPooledEthByShares`.

> Consulta todos los métodos disponibles de stETH [aquí](https://github.com/lidofinance/docs/blob/main/docs/contracts/lido.md#view-methods).

Cualquier operación en stETH se puede realizar directamente en shares, sin diferencia entre share y stETH.

La forma preferida de operar con stETH debería ser:

1) Obtener el saldo del token stETH;
2) Convertir el saldo de stETH en saldo de shares y usarlo como unidad de saldo principal en tu dApp;
3) Cuando se realice cualquier operación en el saldo, hazlo en el saldo de shares;
4) Cuando los usuarios interactúen con stETH, convierte el saldo de shares de vuelta al saldo del token stETH.

Ten en cuenta que un APR del 10% en el saldo de shares y un APR del 10% en el saldo del token stETH darán como resultado valores de salida diferentes con el tiempo, porque el saldo de shares es estable, mientras que el saldo del token stETH cambia eventualmente.

Hay dos métodos de conveniencia disponibles para trabajar con shares en el token stETH:

- `transferShares` (cuando `msg.sender` gasta su propio saldo)
- `transferSharesFrom` (cuando `msg.sender` gasta la asignación aprobada)

Si el uso del token stETH rebaseable no es una opción para tu integración, se recomienda usar wstETH en lugar de stETH. Mira cómo funciona [aquí](#wsteth).

### Función de transferencia de shares para stETH

El [LIP-11](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-11.md) introdujo la función `transferShares` que permite transferir stETH de manera "agnóstica al rebase": transferir en términos de cantidad de [shares](#steth-internals-share-mechanics).

Normalmente, uno transfiere stETH utilizando las funciones ERC-20 `transfer` y `transferFrom`, que aceptan como entrada la cantidad de stETH, no la cantidad de shares subyacentes. A veces es mejor operar directamente con shares para evitar posibles problemas de redondeo. Los problemas de redondeo generalmente podrían aparecer después de un rebase del token.
Esta característica está destinada a proporcionar un nivel adicional de precisión al operar con stETH.
Lee más sobre la función en el [LIP-11](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-11.md).

Además, la actualización V2 introdujo `transferSharesFrom` para que coincida completamente con el conjunto de métodos de transferencia ERC-20.

### Tarifas

Lido recoge un porcentaje de las recompensas de staking como tarifa del protocolo. El tamaño exacto de la tarifa lo define el DAO y puede cambiarse en el futuro mediante votación del DAO. Para recoger la tarifa, el protocolo emite nuevos shares del token stETH y los asigna a los destinatarios de la tarifa. Actualmente, la tarifa recolectada por el protocolo Lido es del 10% de las recompensas de staking, con la mitad destinada a los operadores de nodos y la otra mitad al tesoro del protocolo.

Dado que el total de ether de Lido en el pool tiende a aumentar, el valor combinado de todos los shares de los titulares denominados en stETH aumenta respectivamente. Por lo tanto, las recompensas se distribuyen efectivamente entre cada titular de token en proporción a su participación en el TVL del protocolo. Así, Lido emite nuevos shares al destinatario de la tarifa de manera que el costo total de los shares recién emitidos corresponda exactamente a la tarifa tomada (calculada en puntos básicos):

```
shares2mint * newShareCost = (_totalRewards * feeBasis) / 10000
newShareCost = newTotalPooledEther / (prevTotalShares + shares2mint)
```

lo que sigue:

```
                        _totalRewards * feeBasis * prevTotalShares
shares2mint = --------------------------------------------------------------
                (newTotalPooledEther * 10000) - (feeBasis * _totalRewards)
```

### ¿Cómo obtener el APR?

Consulta [esta página](https://docs.lido.fi/integrations/api/#last-lido-apr-for-steth) para la correcta calculación del APR de Lido V2.

Es importante señalar que con los retiros habilitados, el método de cálculo del APR para Lido ha cambiado significativamente. Cuando el protocolo Lido V2 finaliza las solicitudes de retiro, el contrato Lido excluye fondos del TVL y asigna para quemar shares de stETH bloqueados en retorno. En otras palabras, la finalización del retiro disminuye tanto el TVL como los shares totales.
La fórmula antigua de V1 ya no es adecuada porque captura los cambios del TVL, pero no los cambios en los shares totales.

### ¿Los premios de stETH se componen?

Sí, los premios de stETH se componen.

Todos los premios que se retiran de la Capa de Consenso o se reciben como tarifas MEV o EL de prioridad (que no se utilizan para cumplir solicitudes de retiro) se reestacan finalmente para configurar nuevos validadores y recibir más premios al final. Por lo tanto, podemos decir que stETH se convierte completamente en auto-compound después del lanzamiento de V2.

## wstETH

Debido a la naturaleza de rebasing de stETH, el saldo de stETH en la dirección del titular no es constante, cambia diariamente a medida que llega el informe del oráculo.
Aunque los tokens rebaseables están siendo comunes en DeFi recientemente, muchas dApps no admiten tokens rebaseables. Por ejemplo, Maker, UniSwap y SushiSwap no están diseñados para tokens rebaseables. Listar stETH en estas aplicaciones puede resultar en que los titulares no reciban sus recompensas diarias de staking, lo que efectivamente anula los beneficios del staking líquido. Para integrarse con estas dApps, existe otra forma de stTokens de Lido llamada wstETH (ether con stake envuelto).
### ¿Qué es wstETH?

wstETH es un token ERC20 que representa la participación de una cuenta en el suministro total de stETH (envoltura de token stETH con saldos estáticos). Para wstETH, 1 wei en [participaciones](#steth-internals-share-mechanics) es equivalente a 1 wei en saldo. El saldo de wstETH solo puede modificarse mediante transferencias, creación y quema de tokens. El saldo de wstETH no se rebasea; en cambio, el precio de wstETH denominado en stETH cambia.

En cualquier momento, cualquier persona que posea wstETH puede convertir cualquier cantidad de este a stETH a una tasa fija, y viceversa. La tasa es la misma para todos en cualquier momento dado. Normalmente, la tasa se actualiza una vez al día, cuando stETH experimenta un rebase. La tasa actual se puede obtener llamando a `wstETH.stEthPerToken()` o `wstETH.getStETHByWstETH(10 ** decimals)`.

### Envolver y Desenvolver

Cuando se envuelve stETH a wstETH, la cantidad deseada de stETH se bloquea en el saldo del contrato WstETH, y se emite wstETH según la fórmula de [contabilidad de participaciones](#bookkeeping-shares).

Al desenvolver, se quema wstETH y se desbloquea la cantidad correspondiente de stETH. Por lo tanto, la cantidad de stETH desbloqueada al desenvolver puede diferir de la cantidad inicialmente envuelta (dado que ocurrió un rebase entre el envoltorio y desenvoltorio de stETH).

#### Atajo wstETH

Es importante notar que el contrato WstETH incluye un atajo para convertir ether a wstETH automáticamente, lo cual permite saltarse efectivamente el paso de envoltura y apostar ether directamente por wstETH. Ten en cuenta que al usar este atajo, [los límites de tasa de apostado](#staking-rate-limits) aún se aplican.

### Contabilidad de Recompensas

Dado que wstETH representa la participación del titular en la cantidad total de ether controlado por Lido, los rebases no afectan los saldos de wstETH pero sí cambian el precio de wstETH denominado en stETH.

**Ejemplo básico**:

1. Un usuario envuelve 1 stETH y recibe 0.9803 wstETH (1 stETH = 0.9803 wstETH).
2. Ocurre un rebase, el precio de wstETH aumenta un 5%.
3. El usuario desenvuelve 0.9803 wstETH y recibe 1.0499 stETH (1 stETH = 0.9337 wstETH).

### wstETH en las Redes L2

Actualmente, el token wstETH está [presente en](/docs/deployed-contracts/index.md#lido-on-l2):

- [Arbitrum](https://arbiscan.io/address/0x5979D7b546E38E414F7E9822514be443A4800529)
- [Optimism](https://optimistic.etherscan.io/address/0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb)
- [Scroll](https://scrollscan.com/address/0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32)
- [Base](https://basescan.org/address/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452)
- [Linea](https://lineascan.build/address/0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F)
- [ZKSync Era](https://docs.lido.fi/deployed-contracts/#zksync-era)
- [Mantle](https://explorer.mantle.xyz/address/0x458ed78EB972a369799fb278c0243b25e5242A83)
- [Polygon PoS](https://polygonscan.com/token/0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd)

con puentes implementados a través del [enfoque recomendado de puentes canónicos](/docs/guías-token/wsteth-bridging-guide.md).

:::info
A diferencia de la red principal de Ethereum, en las redes L2, wstETH es simplemente un token ERC-20 y no puede desenvolverse para desbloquear stETH en la red L2 correspondiente hasta ahora.
:::

Sin la contabilidad de participaciones, el token no puede proporcionar la tasa `wstETH/stETH` ni las recompensas acumuladas en cadena. Utiliza los [feeds de tasas y precios](./lido-tokens-integration-guide.md#integration-utilities-rate-and-price-feeds) de wstETH/stETH listados arriba.

## LDO

### ¿Qué es LDO?

LDO es un token de gobernanza utilizado para el proceso de votación del DAO de Lido ([tanto fuera de cadena como en cadena](https://lido.fi/governance#regular-process)). El token está ampliamente disponible en los ecosistemas DeFi y CeFi.

LDO tiene mecanismos internos de instantáneas de saldo ([`balanceOfAt`](https://etherscan.io/address/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32#readContract#F5) y [`totalSupplyAt`](https://etherscan.io/address/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32#readContract#F10)) para permitir que el poder de voto no sea manipulado durante el tiempo de la votación en curso.

### Nota sobre la conformidad con ERC-20

Aunque LDO cumple completamente con ERC-20, es importante destacar que el token no revierte una transacción en todos los caminos de fallo dentro de los métodos `transfer` y `transferFrom`, devolviendo en su lugar el estado `false`.

:::info
Es crítico verificar el estado de retorno para integraciones externas, ya que el estándar de token ERC-20 [requiere](https://eips.ethereum.org/EIPS/eip-20#methods) prevenir varios vectores de ataque (por ejemplo, depósitos de tokens en bóvedas):

> Los llamadores DEBEN manejar `false` de los `returns (bool success)`. ¡Los llamadores NO DEBEN asumir que `false` nunca se devuelve!
:::

## ERC20Permit

Los tokens wstETH y stETH en la red principal de Ethereum implementan la extensión ERC20 Permit que permite realizar aprobaciones mediante firmas, como se define en [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612). stETH también es compatible con firmas de contratos inteligentes, implementando [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) que se utiliza como parte de la Abstracción de Cuenta.

El método `permit` permite a los usuarios modificar la asignación utilizando un mensaje firmado, en lugar de a través de `msg.sender`. Al no depender del método `approve`, puedes construir interfaces que aprueben y utilicen wstETH en una sola transacción.

## Límites de Tasa de Apostado

Para manejar la afluencia de apostado en caso de algunas condiciones de mercado imprevistas, el protocolo Lido implementó límites de tasa de apostado destinados a reducir el impacto de la afluencia en la cola de apostado y en el modelo de distribución de recompensas socializadas de Lido.

Existe un límite de ventana deslizante parametrizado con `_maxStakingLimit` y `_stakeLimitIncreasePerBlock`. Esto significa que solo es posible enviar esta cantidad de ether a los contratos de apostado de Lido dentro de un marco de tiempo de 24 horas. Actualmente, el límite diario de apostado está establecido en 150,000 ether.

Puedes imaginar esto como una esfera de salud de Diablo 2 con un máximo de `_maxStakingLimit` y regenerando a una velocidad constante por bloque. Cuando depositas ether en el protocolo, el nivel de salud se reduce por su cantidad y el límite actual se vuelve cada vez más pequeño. Cuando llega a cero, la transacción se revierte.

Para evitar esto, debes verificar si `getCurrentStakeLimit() >= amountToStake`, y si no es así, puedes optar por una ruta alternativa. Los límites de tasa de apostado están denominados en ether, por lo que no importa si el apostado se realiza para stETH o utilizando [el atajo wstETH](#wst

eth-shortcut), los límites se aplican en ambos casos.

### Rutas Alternativas

1. Espera a que los límites de apostado se regeneren a valores más altos y vuelve a intentar depositar ether en Lido más tarde.
2. Considera intercambiar ETH por stETH en DEXes como Curve o Balancer. En condiciones de mercado específicas, stETH puede adquirirse efectivamente allí con un descuento debido a las fluctuaciones en el precio de stETH.

## Retiros (unstETH)

Lido V2 introdujo la posibilidad de retirar ETH del protocolo Lido en Ethereum (es decir, mercado primario).

:::info
Dado que los retiros en el protocolo tienen una naturaleza asincrónica y un flujo de ejecución sofisticado, en general, utilizar mercados secundarios (intercambios y agregadores de swaps) podría ser una opción más amigable y conveniente desde el punto de vista de la experiencia de usuario para las integraciones.
:::

Puedes encontrar una visión general de la actualización en [la publicación del blog](https://blog.lido.fi/introducing-lido-v2/). El flujo de retiros está organizado como una cola FIFO que acepta las solicitudes con stETH adjunto y estas solicitudes se finalizan con informes de oráculo tan pronto como el ether para cumplir con la solicitud esté disponible.

Para obtener ether del protocolo, debes seguir estos pasos:

- Solicitar el retiro, bloqueando tu stETH en la cola y recibiendo un NFT que representa tu posición en la cola.
- Esperar a que la solicitud se finalice mediante el informe del oráculo y se pueda reclamar.
- Reclamar tu ether, quemando el NFT.

El tamaño de la solicitud debe ser al menos **100 wei** (en stETH) y como máximo **1000 stETH**. Cantidades mayores deben retirarse en varias solicitudes, que pueden agruparse a través de la API en protocolo. Una vez solicitado, el retiro no se puede cancelar. El NFT de retiro se puede transferir a una dirección diferente, y el nuevo propietario podrá reclamar el retiro solicitado una vez que se finalice.

La cantidad de ETH reclamable se determina una vez que se finaliza la solicitud de retiro. La tasa stETH/ETH de la finalización de la solicitud no puede ser más alta que la que estaba en el momento de la creación de la solicitud. El usuario podrá reclamar:

- Normalmente: la cantidad de ETH correspondiente a la cantidad de stETH en el momento de la colocación de la solicitud.

**O**

- Con descuento: cantidad de ETH reducida correspondiente a la tasa informada por el oráculo en caso de que el protocolo haya sufrido pérdidas significativas (multas y penalizaciones).

La segunda opción es poco probable, y hasta ahora no hemos visto las condiciones para ello en la red principal.

El contrato de usuario final para manejar los retiros es `WithdrawalQueueERC721.sol`, que implementa el estándar ERC721. El NFT representa la posición en la cola de retiros y puede ser reclamado después de que se finalice la solicitud.

### Solicitar retiro y emitir NFT

Tienes varias opciones para solicitar retiros, las cuales requieren que tengas stETH o wstETH en tu dirección:

#### stETH

- Llama a `requestWithdrawalsWithPermit(uint256[] _amounts, address _owner, PermitInput _permit)` y obtén los IDs de las posiciones creadas, donde `msg.sender` se usará para transferir tokens y `_owner` será la dirección que puede reclamar o transferir el NFT (predeterminadamente `msg.sender` si no se proporciona).
- Alternativamente, puedes aprobar el contrato `WithdrawalQueueERC721.sol` para stETH en una transacción separada (`stETH.approve(withdrawalQueueERC721.address, allowance)`) y luego llamar al método `requestWithdrawals(uint256[] _amounts, address _owner)`.

#### wstETH

- Llama a `requestWithdrawalsWstETHWithPermit(uint256[] _amounts, address _owner, PermitInput _permit)` y obtén los IDs de las posiciones creadas, donde `msg.sender` se usará para transferir tokens y `_owner` será la dirección que puede reclamar o transferir el NFT (predeterminadamente `msg.sender` si no se proporciona).
- Alternativamente, puedes aprobar el contrato `WithdrawalQueueERC721.sol` para wstETH en una transacción separada (`wstETH.approve(withdrawalQueueERC721.address, allowance)`) y luego llamar al método `requestWithdrawalsWstETH(uint256[] _amounts, address _owner)`.

La estructura `PermitInput` está definida de la siguiente manera:

```solidity
struct PermitInput {
    uint256 value;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
}
```

Después de la solicitud, se emite un NFT [ERC721](https://eips.ethereum.org/EIPS/eip-721) a la dirección `_owner` y puede transferirse al otro propietario, quien tendrá todos los derechos para reclamar el retiro.

Además, este NFT implementa el estándar [ERC4906](https://eips.ethereum.org/EIPS/eip-4906) y se recomienda utilizar

```solidity
event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
```

para actualizar los metadatos del NFT si se integra en algún lugar donde deba mostrarse correctamente.

:::info
Las transacciones de retiro realizadas con `requestWithdrawalsWithPermit` o `requestWithdrawalsWstETHWithPermit` pueden fallar debido a ser "front-run" al robar la firma proporcionada por el usuario para ejecutar el método `token.permit`. Esto no impone riesgos de pérdida de fondos ni bloquea la capacidad de retirar, pero afecta la experiencia del usuario. Para más detalles, consulta [este problema](https://github.com/lidofinance/lido-dao/issues/803).

Se recomienda mitigar el problema, por ejemplo, utilizando el enfoque utilizado en el [widget de apuestas de Lido](https://github.com/lidofinance/ethereum-staking-widget). En resumen, si la transacción inicial `...WithPermit` falla, reenvía inmediatamente la solicitud pero a través del método `requestWithdrawals/requestWithdrawalsWstETH`, utilizando sin problemas la asignación ya proporcionada como resultado de la transacción de "griefing".
Para el ejemplo específico, consulta [el siguiente código](https://github.com/lidofinance/ethereum-staking-widget/blob/ba65f2180ad0ab43b5f3bdcfeee118e6ceeabe7f/features/withdrawals/hooks/contract/useRequest.ts#L319C6-L319C6).

También se pueden usar otros enfoques viables para la mitigación. Como otro ejemplo, despliega un contrato inteligente envolvente que intente `requestWithdrawalsWithPermit/requestWithdrawalsWithPermitWstETH` y, si [captura](https://docs.soliditylang.org/en/latest/control-structures.html#try-catch) el error de revertir, continúa con `requestWithdrawals/requestWithdrawalsWstETH`, verificando que la asignación sea suficiente.
:::

### Verificación del estado del retiro

- Puedes verificar todas las solicitudes de retiro para el propietario llamando a `getWithdrawalRequests(address _owner)`, que devuelve una matriz de IDs de NFT.
- Para verificar el estado de NFTs particulares, puedes llamar a `getWithdrawalStatus(uint256[] _requestIds)`, que devuelve una matriz de la estructura [`WithdrawalRequestStatus`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/WithdrawalQueueBase.sol#L67-L81).

```solidity
struct WithdrawalRequestStatus {
    /// @notice Cantidad de stETH bloqueada en la cola de retiros para esta solicitud
    uint256 amountOfStETH;
    /// @notice Cantidad de acciones stETH bloqueadas en la cola de retiros para esta solicitud
    uint256 amountOfShares;
    /// @notice Dirección que puede reclamar o transferir esta solicitud
    address owner;
    /// @notice Marca de tiempo de cuando se creó la solicitud, en segundos
    uint256 timestamp;
    /// @notice Verdadero, si la solicitud está finalizada
    bool isFinalized;
    /// @notice Verdadero, si la solicitud está reclamada. La solicitud es reclamable si (isFinalized && !isClaimed)
    bool isClaimed;
}
```

>NOTA: Dado que stETH es un token esencial si el usuario solicita un retiro usando wstETH directamente, la cantidad se designará en stETH en la creación de la solicitud.

Puedes llamar a `getClaimableEther(uint256[] _requestIds, uint256[] _hints)` para obtener la cantidad exacta de ether reservado para las solicitudes, donde `_hints` se puede encontrar llamando a `findCheckpointHints(__requestIds, 1, getLastCheckpointIndex())`. Devolverá un valor distinto de cero solo si la solicitud es reclamable (`isFinalized && !isClaimed`).

### Reclamación

Para reclamar ether, debes llamar a:

- `claimWithdrawal(uint256 _requestId)` con el ID del NFT en nombre del propietario del NFT.
- `claimWithdrawals(uint256[] _requestIDs, uint256[] _hints)` si deseas reclamar múltiples retiros en lotes u optimizar en la búsqueda de pistas
  - `hints = findCheckpointHints(uint256[] calldata _requestIDs, 1, lastCheckpoint)`
  - `lastCheckpoint = getLastCheckpointIndex()`

## Ejemplos de integración general

### stETH/wstETH como garantía

stETH/wstETH como garantía DeFi es beneficioso por varias razones:

- stETH/wstETH es casi tan seguro como ether, en términos de precio: excepto en escenarios catastróficos, su valor tiende a mantenerse bien respecto a ETH 1:1.
- stETH/wstETH es un token productivo: obtener recompensas por la garantía efectivamente reduce el costo de endeudamiento.
- stETH/wstETH es un token muy líquido con miles de millones de liquidez bloqueada en pools de liquidez (ver [arriba](#sttokens-steth-and-wsteth)).

Los tokens staked de Lido se han listado en importantes protocolos de liquidez:

- En Maker, [colateral de wstETH (desplácese hacia abajo a la sección Dai de la sección WSTETH-A)](https://daistats.com/#/collateral) se puede usar para emitir la moneda estable DAI. Consulta la [publicación en el blog de Lido](https://blog.lido.fi/makerdao-integrates-lidos-staked-eth-steth-as-collateral-asset/) para más detalles.
- En AAVE v3, se pueden pedir prestados varios tokens contra wstETH en varias cadenas (ver la lista de [mercados](#sttokens-steth-and-wsteth))

Se requieren fuentes de precios sólidas para listar en la mayoría de los mercados de dinero, siendo los feeds de precios de ChainLink el estándar de la industria.
La opción predeterminada es utilizar los [feeds de tasas de cambio](./lido-tokens-integration-guide.md#sttokens-steth-and-wsteth) con la opción de componer feeds arbitrarios:

```python
'wstETH/X price feed' = 'wstETH/stETH rate feed' × 'ETH/X price feed'
```

### Integraciones de billetera

Los servicios de participación en Ethereum de Lido se han integrado con éxito en las billeteras DeFi más populares, incluyendo Ledger, Metamask, MyEtherWallet, ImToken y otras.
Tener integrado stETH puede proporcionar a los usuarios de billeteras una gran experiencia de usuario para participar directamente desde la interfaz de usuario de la b

illetera.

Al agregar soporte para stETH a una billetera DeFi, es importante preservar la naturaleza de rebasing de stETH.
Ten en cuenta que el saldo de stETH cambia en cada rebase sin transferencias entrantes o salientes del usuario y no emite eventos de transferencia ERC-20.
Como consecuencia, evita almacenar el saldo en caché de stETH durante períodos prolongados (más de 24 horas).

La integración se puede implementar utilizando el [Lido en Ethereum SDK](/docs/integrations/sdk.md#lido-ethereum-sdk).

### Puenteado entre cadenas

El wstETH de Lido se puentea a varios L2 y sidechains.
El proceso de adopción de una nueva red de manera resistente al futuro se describe como parte de la [guía de puenteado separada](/docs/guías-token/wsteth-bridging-guide.md).

La mayoría de los puentes de tokens entre cadenas no tienen mecanismos para manejar rebases.
Esto significa que el puenteo de stETH a otras cadenas impedirá que los validadores recojan sus recompensas de participación.

:::warning
En el caso más común, las recompensas irán naturalmente al contrato inteligente del puente y quedarán bloqueadas allí, sin llegar a los validadores.
:::

Mientras se trabaja en soluciones completas de puenteado, los contribuyentes de Lido alientan a los usuarios a puentear solo la representación no rebaseable del ether con stake, es decir, wstETH.

## Riesgos

Existen varios riesgos potenciales al participar en protocolos de participación líquida.

### Seguridad del contrato inteligente

Existe el riesgo inherente de que Lido pueda contener una vulnerabilidad o error en el contrato inteligente. El código de Lido es de código abierto, auditado y está cubierto por un extenso programa de recompensas por errores para minimizar este riesgo. Para mitigar los riesgos de los contratos inteligentes, todos los contratos centrales de Lido están auditados. Los informes de auditoría se pueden encontrar aquí. Además, Lido está cubierto con un extenso programa de recompensas por errores de Immunefi.

### Riesgo de sanción

Los validadores corren el riesgo de sufrir penalizaciones por participación, con hasta el 100% de los fondos participados en riesgo si los validadores fallan. Para minimizar este riesgo, Lido participa en múltiples operadores de nodos profesionales y reputados con configuraciones heterogéneas, con cobertura adicional en forma de auto-cobertura.

### Riesgo de precio de stToken

Los usuarios corren el riesgo de un precio de stTokens en el intercambio que sea inferior al valor inherente debido a restricciones de retiro en Lido, lo que hace imposible el arbitraje y la creación de mercado sin riesgo. La DAO de Lido se esfuerza por mitigar los riesgos mencionados en la medida de lo posible. Sin embargo, estos pueden existir y, como tal, es nuestro deber comunicarlos.

La DAO de Lido se esfuerza por mitigar los riesgos mencionados en la medida de lo posible. Sin embargo, estos pueden existir.