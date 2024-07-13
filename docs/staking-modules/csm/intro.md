# Introducción

:::info
Los terminos "validator", "key", "validator key", y "deposit data" tienen el mismo significado dentro del documento.
:::

## ∑ TL;DR
El Módulo de Staking Comunitario (CSM) es un módulo de staking sin permisos diseñado para atraer a los stakers de la comunidad a participar en Lido en el protocolo Ethereum como Operadores de Nodo. El único requisito para unirse al CSM como Operador de Nodo es poder ejecutar validadores (según las políticas de Lido en Ethereum) y proporcionar un bono. La participación se asigna a los validator keys en el orden en que se proporcionan las keys, siempre que sean válidas. El bono no está directamente asociado con la participación real del validador, sino que se trata como una garantía de seguridad. El bono es una característica de un Operador de Nodo; por lo tanto, es una garantía para todos los validadores del Operador de Nodo. Esto permite la reducción del bono. Cuantos más validadores tenga el Operador de Nodo, menor será el bono por cada validador. Los Operadores de Nodo obtienen sus recompensas del rebase del bono y de la porción de recompensas de staking del Operador de Nodo. La porción de recompensas de staking del Operador de Nodo se socializa (promedia) si los validadores superan el umbral. Las penalizaciones acumuladas de la CL que resulten en una reducción del saldo por debajo del saldo de depósito y las recompensas de la EL robadas se confiscan del bono del Operador de Nodo. Los Operadores de Nodo deben realizar salidas de validadores a solicitud del protocolo o pueden salir voluntariamente.

## 📓 Glosario
- The [**staking router**](../../contracts/staking-router.md) (SR) es un contrato inteligente dentro del protocolo Lido en Ethereum que facilita la asignación de participación y la distribución de recompensas a través de diferentes módulos;
- Un **staking module** (SM) es un contrato inteligente o un conjunto de contratos inteligentes conectados al enrutador de staking, que:
  - mantiene los conjuntos de operadores y validadores subyacentes,
  - es responsable de la incorporación y exclusión de operadores,
  - mantiene los depósitos, retiros y salidas de validadores,
  - mantiene la estructura de tarifas y la distribución para el módulo y los participantes, etc.,
  - se ajusta a la interfaz IStakingModule;
- **Bono** - una garantía de seguridad que los Operadores de Nodo deben presentar antes de cargar validator keys en el CSM. Esta garantía cubre posibles pérdidas causadas por acciones inapropiadas del lado del Operador de Nodo. Una vez que el validador sale de la cadena Beacon y se cubren todas las pérdidas ocurridas, la garantía puede ser reclamada o reutilizada para cargar nuevas validator keys.
- The **Lido DAO** is a Decentralized Autonomous Organization that decides on the critical parameters of controlled liquid staking protocols through the voting power of governance token (LDO).
- A **Node Operator** (NO) is a person or entity that runs validators;
- [`Lido`](../../contracts/lido.md) is a core contract of the Lido on Ethereum protocol that stores the protocol state, accepts user submissions, and includes the stETH token;
- **stETH** is an ERC-20 token minted by [`Lido`](https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84) smart contract and representing a share of the [`totalPooledEther`](../../contracts/lido.md#rebase);
- **Deposit data** refers to a structure consisting of the validator’s public key and deposit signature submitted to `DepositContract`. This term can also be referred to as `keys` in the text. Validator private keys are created, stored, and managed by Node Operators exclusively;
- `DepositContract` is the official Ethereum deposit contract for validator deposits;
- `DepositSecurityModule` or [**DSM**](../../guías/deposit-security-manual.md) is a set of smart contract and off-chain parts mitigating the [deposit front-run vulnerability](../../guías/deposit-security-manual.md#la-vulnerabilidad);
- A validator is considered to be [**“unbonded”**](join-csm.md#unbonded-validators) when the current Node Operator bond is not sufficient to cover this validator;
- A validator is considered to be ["**stuck**"](../../contracts/staking-router.md#exited-and-stuck-validators) if it has not been exited timely following an exit signal from the protocol;
- The **Curated module** is the first Lido staking module previously referred to as [Node Operators Registry](../../contracts/node-operators-registry);
- **Easy Track** is a suite of smart contracts and an alternative veto-based voting model that streamlines routine DAO operations;
- [**Accounting Oracle**](../../contracts/accounting-oracle.md) is a contract which collects information submitted by the off-chain oracles about state of the Lido-participating validators and their balances, the amount of funds accumulated on the protocol vaults (i.e., withdrawal and execution layer rewards vaults), the number of exited and stuck validators, the number of withdrawal requests the protocol can process and distributes node-operator rewards and performs `stETH` token rebase;
- [**VEBO**](../../contracts/validators-exit-bus-oracle.md) or Validators Exit Bus Oracle is a contract that implements an on-chain "source of truth" message bus between the protocol's off-chain oracle and off-chain observers, with the main goal of delivering validator exit requests to the Lido-participating Node Operators.

## 🌎 General info
CSM is a staking module offering permissionless entry with a bond. This module aims to become a clear pathway for independent [community stakers](https://research.lido.fi/t/lido-on-ethereum-community-validation-manifesto/3331#lido-on-ethereum-community-validation-manifesto-1) (solo stakers or home stakers) to enter the Lido on Ethereum protocol (LoE) node operator set. The bond requirement is an essential security and alignment tool that makes permissionless entry possible without compromising the security or reliability of the underlying staking protocol (LoE).

## 🤓 Module specifics
All staking modules should conform to the same [IStakingModule](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/interfaces/IStakingModule.sol) interface. That inevitably results in modules having a lot of common or similar components and logic. CSM is no exception here. For example, key storage components are based on the existing [Curated module](../../contracts/node-operators-registry.md). However, several aspects are different and worth a separate mention.

### Exited and Withdrawn
The [Curated module](../../contracts/node-operators-registry.md) uses the "exited" statuses of the validator (both [Slashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#44-Step-4-Slashed-and-Exited) and [Unslashed and Exited](https://notes.ethereum.org/7CFxjwMgQSWOHIxLgJP2Bw#45-Step-5-Unslashed-and-Exited)) as the last meaningful status in accounting since, after this status, the validator is no longer responsible for any duties on the Beacon chain (except for the rare cases of the delayed sync committee participation). CSM, in turn, needs to know about each validator's exact withdrawal balance to decide on bond penalization. Hence, the module uses the "exited" counter reported by the accounting oracle only to return a correct number of "active" keys to the staking router and implements permissionless reporting methods to report the validator's withdrawal balance once the validator is [withdrawn](https://consensys.io/shanghai-capella-upgrade#:~:text=Finally%2C%20the%20withdrawable%20validator%20is%20subject%20to%20the%20same%2C%20automated%20%E2%80%9Csweep%E2%80%9D%20that%20processes%20partial%20withdrawals%2C%20and%20its%20balance%20is%20withdrawn).

### Stake distribution queue
A Node Operator must supply a bond to upload a new validator key to CSM. It is reasonable to allocate a stake in an order similar to the bond submission order. For this purpose, a FIFO (first in, first out) [stake allocation queue](join-csm.md#stake-allocation-queue) is utilized. Once the Staking Router requests keys to make a deposit, the next `X` keys from the queue are returned, preserving the bond submit order.

### Alternative measures for "stuck" keys
The presence of "stuck" ("Delinquent" in the [original terms](https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330)) keys for the Node Operator indicates the [Lido exit policy](../../guías/node-operators/general-overview#política-de-salida-de-validadores-penalidades-y-recuperación) violation. In this case, a module should apply measures for the policy-violating Node Operator. CSM uses measures that are different from those of the curated module. The measures are described in the corresponding [section](validator-exits.md#protocol-initiated-exits).

:::info
Note: CSM does not apply any measures to "Delayed" validators.
:::

### Node Operator structure
The Node Operator data structure in CSM is similar to that of the [Curated module](../../contracts/node-operators-registry.md), with several minor differences:
- The `name` property is omitted as redundant for the permissionless module;
- The `rewardAddress` is used as a recipient of rewards and excess bond claims;
- A new property, `managerAddress`, is introduced. The Node Operator should perform method calls from this address;
- A new property, `totalWithdrawnKeys`, is introduced to count the total count of the withdrawn keys per Node Operator;
- A new property, `depositableValidatorsCount`, is introduced to count the current deposit data eligible for deposits;
- A new property, `enqueuedCount`, is introduced to keep track of the depositable keys that are in the queue. Also useful to determine depositable keys that are not in the queue at the moment;

## Further reading

- [Join CSM](join-csm.md)
- [Rewards](rewards.md)
- [Penalties](penalties.md)
- [Validator exits](validator-exits.md)
