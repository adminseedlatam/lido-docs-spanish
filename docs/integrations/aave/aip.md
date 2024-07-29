| título                 | estado    | autor               | descripción breve                                                    | discusión                                                                                                | creado     |
| ---------------------- | --------- | ------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| Añadir stETH a AAVE v2 | Propuesta | @jbeezy @grstepanov | Propuesta de gobernanza de AAVE para habilitar stETH como token base | [arc-add-support-for-steth-lido/5793](https://governance.aave.com/t/arc-add-support-for-steth-lido/5793) | 2022-04-02 |

### Resumen Simple

Lido permite a los usuarios obtener recompensas de staking en la cadena de Ethereum sin bloquear ether ni mantener infraestructura de staking. Esto se logra mediante el token stETH. Los tokens stETH representan un depósito tokenizado de staking con recompensas de staking y penalizaciones por slashing aplicadas. stETH puede ser retenido, negociado o vendido.
Proponemos incluir stETH en el mercado AAVE v2. Esto permitiría a los usuarios pedir prestado utilizando stETH como garantía.

### Referencias

- Sitio web: [lido.fi](https://lido.fi/)
- [Portal de documentos](https://docs.lido.fi/)
- [Código fuente para los sistemas que interactúan con el token propuesto](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.4.24/Lido.sol)
- [Contratos de direcciones Ethereum](/deployed-contracts)
- [ChainLink Oracle](https://etherscan.io/address/0x86392dC19c0b719886221c78AB11eb8Cf5c52812)
- [Auditorías](https://github.com/lidofinance/audits)
- Comunidad
  - [Foro de gobernanza](https://research.lido.fi/)
  - [Twitter](https://twitter.com/lidofinance)
  - [Discord](https://discord.gg/vgdPfhZ)
  - [Telegram](https://t.me/lidofinance)
  - [Reddit](https://www.reddit.com/r/LidoFinance)

### Resumen

El objetivo de listar stETH en el mercado AAVE v2 es permitir depositar stETH en AAVE y utilizarlo como garantía. No hay intención de permitir el préstamo de stETH en el mercado AAVE v2.

### Motivación

Listar stETH en AAVE puede atraer a una audiencia más amplia tanto a AAVE como a Lido. Más ETH estacado con Lido beneficiaría la descentralización y la seguridad de la red Ethereum, en beneficio de toda la comunidad. stETH probablemente generaría nueva demanda de préstamos en AAVE, ya que los participantes del mercado buscarían pedir prestado contra stETH.

stETH es un colateral perfecto para DeFi y es beneficioso por varias razones que se detallan en la sección de Especificaciones de este AIP.

### Especificaciones

1. **¿Cuál es la relación entre el autor del AIP y el token?**

- Jacob (jbeezy) es un miembro a tiempo completo de la DAO que trabaja para facilitar integraciones para st-tokens en DeFi en protocolos como Aave, entre otros.
- Gregory (GrStepanov) es un contribuyente a tiempo completo del protocolo que trabaja en integraciones técnicas.

2. **Proporcione un resumen breve de alto nivel del proyecto y del token.**

#### Antecedentes de Lido

El Protocolo Lido, construido en la cadena de beacon de Ethereum inicialmente, permite a los usuarios obtener recompensas de staking en la cadena de beacon sin hacer que sus tokens sean ilíquidos ni mantener infraestructura de staking.

Lido fue [anunciado](https://blog.lido.fi/how-lido-works/) en noviembre de 2020. La red de prueba se lanzó a finales de noviembre.

Lido hoy tiene 2 productos (stETH, stSOL) administrados por equipos en organizaciones separadas. Entre estos productos hay un TVL de miles de millones de dólares y ha llevado a Lido al puesto #6 en [DeFi Llama rankings](https://defillama.com/protocol/lido). stETH también ha sido aceptado como parte del tesoro de Nexus Mutual como parte de su [estrategia de gestión de riesgos](https://forum.nexusmutual.io/t/proposal-increase-the-allocation-of-the-capital-pool-to-steth/641).

Lido ha comenzado el proceso para pasar a una solución completamente no custodial. Los detalles se pueden encontrar aquí: [Credenciales de retiro en Lido](https://blog.lido.fi/withdrawal-credentials-in-lido/).

la DAO de Lido administra el protocolo de staking líquido decidiendo sobre parámetros clave (por ejemplo, estableciendo tarifas, asignando operadores de nodos y oráculos) mediante el poder de voto de los titulares de tokens de gobernanza.

Lido ha sido auditado por Sigma Prime, Quantstamp y MixBytes.

#### Antecedentes de stETH

Lido permite a los usuarios depositar ETH y recibir stETH. El ETH depositado se agrupa y se apuesta con operadores de nodos seleccionados por la DAO de Lido. stETH representa el saldo de ETH con stake del usuario en la cadena de beacon junto con las recompensas de staking acumuladas o las penalizaciones infligidas a los validadores en la cadena de beacon. Cuando se habilitan los retiros en la cadena de beacon, stETH se puede canjear por ETH desestacado y recompensas acumuladas.

A diferencia del ETH de la cadena de beacon, stETH se puede transferir y comerciar libremente. Integrar stETH en Aave permitiría a los usuarios pedir prestado contra stETH.

El saldo de stETH se basa en la cantidad total de ETH apostado más las recompensas totales de staking menos el slashing aplicado a los validadores. stETH se reajusta diariamente.
El suministro de stETH es de 1,697,460 - valorado en $5.4BN utilizando los precios actuales de stETH.

3. **Explique la posición del token en el ecosistema AAVE. ¿Por qué sería un buen token para préstamos o como colateral?**

stETH como colateral DeFi es beneficioso por varias razones.

- stETH es casi tan seguro como ETH en términos de precio: excepto en escenarios catastróficos, su valor tiende a mantener bien el anclaje a ETH.
- stETH es un token productivo. Obtener recompensas sobre el colateral efectivamente reduce el costo del préstamo. Esto podría hacer que el préstamo sea más atractivo en Aave y ayudaría a aumentar la utilización del mercado (y por lo tanto los ingresos del protocolo Aave provenientes de factores de reserva de monedas).
- stETH es un token muy líquido con más de $5 mil millones en liquidez utilizada en [múltiples proyectos DeFi](https://dune.xyz/LidoAnalytical/Integration-monitor-dashboard). El pool de liquidez stETH:ETH en Curve es el LP más profundo en DeFi con un TVL de $3.8 mil millones.

4. **Proporcione un breve historial del proyecto y de los diferentes componentes: DAO (¿está activo?), productos (¿están activos?). ¿Cómo superó algunos de los desafíos que enfrentó?**

El antecedente del protocolo Lido se enumera en la Pregunta #2.

Hay un DAO y está activo. la DAO de Lido está compuesto, entre otros, por Semantic VC, ParaFi Capital, Libertus Capital, Bitscale Capital, StakeFish, StakingFacilities, Chorus, P2P Capital y KR1, Stani Kulechov de Aave, Banteg de Yearn, Will Harborne de Deversifi, Julien Bouteloup de Stake Capital y Kain Warwick de Synthetix.

El tesoro de Lido se ha diversificado y los miembros de la DAO ahora incluyen a Paradigm, Three Arrows Capital, DeFiance Capital, Jump Trading, Alameda Research, iFinex, Dragonfly Capital, Delphi Digital, Robot Ventures, Coinbase Ventures, Digital Currency Group, The LAO y [angels](https://research.lido.fi/t/proposal-ldo-treasury-diversification-part-2/506).

La suite de productos de Lido consiste en st-tokens que representan el colateral staked subyacente en varios protocolos. Actualmente, estos son stETH y stSOL y son administrados por equipos en organizaciones separadas para mitigar aún más el riesgo de centralización.

Se han superado desafíos iniciales con el apoyo de los miembros de la DAO, la velocidad de ejecución y la utilidad de los st-tokens. Esta última es especialmente crítica para el éxito de cualquier producto líquido.

5. **¿Cómo se usa actualmente el token?**

stETH se utiliza de varias maneras.

- un token productivo (por ejemplo, en la estrategia de gestión de riesgos del tesoro de Nexus Mutual);
- estrategias de recompensas compuestas en DeFi (AMM, autofarms) (por ejemplo, Convex, Yearn, Harvest);
- colateral multicadena (por ejemplo, wstETH en Ethereum en Maker).

6. **Programa de emisión**

No hay un programa de emisión. Al igual que DAI, stETH se crea bajo demanda cuando los usuarios bloquean ETH en el protocolo.

7. **Permisos del Token (& Protocolo) (minting) y capacidad de actualización. ¿Hay un multisig? ¿Qué puede hacer? ¿Quiénes son los firmantes?**

El contrato de stETH es actualizable y se encuentra detrás del proxy `AppProxyUpgradeable` en [`0xae7ab96520de3a18e5e111b5eaab095312d7fe84`](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84). LA DAO de Lido puede cambiar la implementación con una votación exitosa de la DAO.

Los roles y direcciones se enumeran en un [informe independiente](https://github.com/lidofinance/audits/?tab=readme-ov-file#10-2023-statemind-lido-roles-analysis) a fines de 2023.

Para mitigar los riesgos de retiro, el staking de Lido se activó el 18 de diciembre de 2020 a través de una [ceremonia de clave de retiro](https://blog.lido.fi/lido-withdrawal-key-ceremony/). Chorus One, Staking Facilities, Certus One, Argent, Banteg (yearn.finance), Alex Svanevik (Nansen), Anton Bukov (1inch), Michael Egorov (Curve/Nucypher), Rune Christensen (MakerDAO), Will Harborne (DeversiFi), y Mustafa Al-Bassam (LazyLedger) se reunieron durante cuatro días para generar firmas de umbral para las claves de retiro de Lido en un entorno seguro en máquinas sin conexión a internet.

Lido ya ha migrado a una solución completamente no custodial y más del 60% de todo el stETH ya utiliza esta solución. Los detalles se pueden encontrar aquí: [Credenciales de Retiro en Lido](https://blog.lido.fi/withdrawal-credentials-in-lido/).

8. **Datos del Mercado (Capitalización de Mercado, Volumen 24h, Volatilidad, Exchanges, Madurez)**

**Capitalización de Mercado:** $5.5B

**Volatilidad:** Durante el último año, stETH ha demostrado mantener muy bien el anclaje a través de diversas condiciones del mercado. Los datos del balance stETH:ETH para el pool de Curve se pueden encontrar [aquí](https://dune.xyz/queries/36557/72603).

**Volúmenes y DEXes**

**[Balancer (wstETH/WETH)](https://app.balancer.fi/#/pool/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080)**

- Liquidez: $409.3M
- Volumen (24h): $509,3
- [Consulta en Dune](https://dune.xyz/embeds/153863/304423/684fdf22-161c-4352-a41d-81ce8a705c01)

**[SushiSwap (wstETH/DAI)](https://analytics.sushi.com/pairs/0xc5578194d457dcce3f272538d1ad52c68d1ce849)**

- Liquidez: $32.2M
- Volumen (24h): $756,211
- [Consulta en Dune](https://dune.xyz/embeds/153729/304165/5c53e046-47ef-485d-9767-6ec188a5629e)

**[Curve (stETH/ETH)](https://curve.fi/steth)**

- Liquidez: $3,75B
- Volumen (24h): $5,7M
- [Consulta en Dune](https://dune.xyz/embeds/153374/303383/9c8cb193-4538-497e-a774-c33e78bcd34d)

9. **Datos de Canales Sociales**

[Discord](https://discord.gg/vgdPfhZ) - 7400 miembros
[Twitter](https://twitter.com/LidoFinance) - 60K seguidores
[GitHub](https://github.com/lidofinance) - Activo y gestionado

10. **Fecha de Despliegue de Contratos, Número de Transacciones, Número de Titulares de Tokens**

Fecha de Despliegue: 18 de diciembre de 2020
Número de Transacciones (stETH): [146,000+](https://etherscan.io/token/0xae7ab96520de3a18e5e111b5eaab095312d7fe84)
Titulares Únicos: [42,000+](https://etherscan.io/token/0xae7ab96520de3a18e5e111b5eaab095312d7fe84)

11. **Depositantes Únicos**

Depositantes Únicos: [36,000+](https://dune.xyz/queries/20029/41160)

### Especificación Técnica

stETH representa el saldo de ETH con stake del usuario en la cadena de beacon junto con las recompensas de staking acumuladas o las penalizaciones infligidas a los validadores en la cadena de beacon. Esto se implementa mediante un mecanismo de rebase.

Debido a la naturaleza de rebase de stETH, la implementación propuesta implica pocos cambios al aToken genérico de AAVE.
El aToken propuesto utiliza acciones subyacentes de stETH para almacenar saldos e implementar la capacidad de rebase. Por lo tanto, tiene 2 saldos privados y 1 saldo público.

1. El saldo interno (de suministro fijo) y el suministro total se utilizan para contabilidad. El saldo depositado se almacena en acciones de stETH y se convierte en la cantidad de tokens con funciones de stETH. Los saldos de los usuarios se llevan contablemente con el token ERC20 subyacente.
2. El saldo interno (de suministro elástico) y el suministro total corresponden al saldo depositado sin interés acumulado. El rebase de aSTETH según stETH ocurre en esta capa.
3. El saldo externo (de suministro elástico) y el suministro total corresponden al saldo depositado con interés.

Externamente, aSTETH se comporta de manera similar a cualquier otro aToken. Siempre mantiene un anclaje 1:1 con el stETH subyacente.

La implementación actual no admite préstamos, ni con tasas de interés variables ni estables. Los contratos stableDebtSTETH y variableDebtSTETH extienden los contratos predeterminados stableDebtToken y variableDebtToken respectivamente para hacer imposible el uso de préstamos con aSTETH, ya que los tokens de deuda predeterminados no son compatibles con el contrato AStETH.

#### Código

- [AStETH](https://etherscan.io/address/0xbd233D4ffdAA9B7d1d3E6b18CCcb8D091142893a)
- [variableDebtSTETH](https://etherscan.io/address/0xde2c414b671d2db93617d1592f0490c13674de24)
- [stableDebtSTETH](https://etherscan.io/address/0x8180949ac41ef18e844ff8dafe604a195d86aea9)
- [DefaultReserveInterestRateStrategy](https://etherscan.io/address/0xff04ed5f7a6C3a0F1e5Ea20617F8C6f513D5A77c)
  Pasos que la propuesta ejecutará: iniciar una votación para agregar stETH como nuevo token.

### Consideraciones de Seguridad

Se aplican los riesgos técnicos estándar de los contratos inteligentes a la implementación de AToken. La implementación ha sido auditada por MixBytes() y se considera segura. Puede leer el informe completo desde [aquí](https://github.com/lidofinance/audits/blob/main/MixBytes%20AAVE%20stETH%20integration%20Security%20Audit%20Report%2002-22.pdf).

### Parámetros de Riesgo Propuestos

- **LTV (Loan-to-Value):** 70%
- **Umbral de Liquidación:** 75%
- **Bono de Liquidación:** 7.5%
- **Factor de Reserva:** 10%

**Modelo de Tasa de Interés:**

- UÓptimo: 60%
- Base: 0%
- Pendiente 1: 8%
- Pendiente 2: 200%

Dado que stETH es más adecuado como garantía en lugar de un token para préstamos, proponemos listar stETH en el mercado AAVE v2 con la función de préstamos deshabilitada.

### Evaluación de Riesgos (al momento del ARC)

**Riesgos de Contratos Inteligentes**

Lido enfrenta riesgos de contratos inteligentes. Para mitigar estos riesgos, Lido ha sido auditado varias veces, incluyendo auditorías por Quantstamp, Sigma Prime y MixBytes (ver [Audits](https://github.com/lidofinance/audits)), sin encontrar problemas críticos.

**Riesgos de Contraparte**

Lido es una DAO. Las decisiones en la DAO de Lido se toman a través de propuestas y votaciones; los miembros de la comunidad gestionan los parámetros del protocolo, los operadores de nodos, los miembros del oráculo y más. La infraestructura de staking de Lido para stETH consta de 22 operadores de nodos, con un enfoque en la descentralización. Lido depende de un conjunto de oráculos para informar las recompensas de staking a los contratos inteligentes. El impacto máximo posible de los oráculos está limitado por la [actualización reciente](https://github.com/lidofinance/lido-improvement-proposals/blob/develop/LIPS/lip-2.md#sanity-checks-the-oracles-reports-by-configurable-values) (cambio máximo de 10% APR en informes de oráculos de aumento y 5% de disminución en stake), y los operadores de oráculos son entidades bien conocidas como Stakefish, Certus One, Chorus One, Staking Facilities, DSRV, Blockscape, Everstake, SkillZ, RockX, Allnodes, P2P Validator, entre otros. Lea más en la [documentación de Lido](https://docs.lido.fi/gu/steth-superuser-functions/).

**Riesgos de Mercado**

Durante el último año, stETH demostró mantener el anclaje ETH 1:1 de manera estable. Cuatro pools de liquidez en diferentes DEX están incentivados con recompensas significativas de LDO. El pool de Curve stETH:ETH se ha convertido en el pool más profundo en DeFi, lo que lo hace extremadamente resistente a cualquier intento de mover el anclaje.

**Riesgos de Staking**

stETH enfrenta riesgos de staking, específicamente riesgos de validadores incluyendo penalizaciones y riesgos de rehenes. Para mitigar estos riesgos, Lido trabaja solo con validadores de primer nivel con un historial exitoso. Además, hay una [discusión en curso en la comunidad](https://research.lido.fi/t/lip-6-in-protocol-coverage-proposal/1468) sobre opciones de cobertura en el protocolo para mitigar riesgos de penalización.

**Riesgos de Feed de Precios**

El feed de precios de ChainLink para stETH se basa en pools con liquidez extremadamente profunda. Esto hace que el precio de stETH sea muy estable y resistente. Manipular el precio de stETH en este punto requeriría una cantidad considerable de recursos y podría hacer que este tipo de ataque sea poco razonable.
