# Parámetros de Lido V2 en la red principal

## Configuración de prueba

La configuración de prueba se basa en los parámetros especificados en [este archivo de configuración](https://github.com/lidofinance/scripts/blob/shapella-upgrade/configs/config_mainnet.py). Este documento se puede utilizar para validar los valores.

## Direcciones en la red principal

Algunas de las direcciones propuestas se enumeran en esta sección, pero para ver la lista completa, consulte [este documento](/deployed-contracts/).

```python
LIDO_LOCATOR = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
LEGACY_ORACLE = 0x442af784A788A5bd6F42A01Ebe9F287a871243fb  # was `LidoOracle` before

# See https://docs.lido.fi/deployed-contracts/
# Old implementation was `Withdrawals Manager Stub`
# Represents an address on Execution Layer corresponding to the Lido 0x01-type withdrawal credentials (see below)
WITHDRAWAL_VAULT = 0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f

# Same as withdrawalsVault with 0x01 type prefix
# also see https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F23
WITHDRAWAL_CREDENTIALS = 0x010000000000000000000000b9d7934878b5fb9610b3fe8a5e441e8fad7e293f
```

## Lido

```python
# Good-old value, see https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract
# used in calculation of SIMULATED_SHARE_RATE_DEVIATION_BP_LIMIT
LIDO_MAX_STAKE_LIMIT_ETH = 150_000
```

## NodeOperatorsRegistry

Módulo de stakeo único llamado "Curated" añadido a StakingRouter. Para más detalles, consulta el [post del foro sobre LIP-20: Staking Router](https://research.lido.fi/t/lip-20-staking-router/3790).

```python
# See https://snapshot.org/#/lido. snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330 for "Their status shall revert to “In good standing” after **5 days** (i.e. provided any newly received validator exit requests are processed timely"
CURATED_STAKING_MODULE_STUCK_PENALTY_DELAY = 432000  # 5 days as seconds

# Share of this staking module among all staking modules (in basis points, 100% = 10000). This is a single module so all 100% goes to it
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol#L167-L175
# Currently have single Staking Module, so 100%
CURATED_STAKING_MODULE_TARGET_SHARE_BP = 10000  # 100%

# Shares of the rewards which goes to the curated set staking module and to the treasury (in basis points, 100% = 10000)
# see https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol#L167-L175
# same as it set currently, see https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F29
# https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84#readProxyContract#F46
# NB: that getFeeDistribution returns percent relative to the 10% returned by getFee
# for for curated staking module the value is set as percent relative to the entire rewards, so it 500 but 5000
CURATED_STAKING_MODULE_MODULE_FEE_BP = 500  # 5%
CURATED_STAKING_MODULE_TREASURY_FEE_BP = 500  # 5%

# Just a technically and semantically reasonable values of the first module introduced
CURATED_STAKING_MODULE_ID = 1
CURATED_STAKING_MODULE_NAME = "curated-onchain-v1"
CURATED_STAKING_MODULE_TYPE = 0x637572617465642d6f6e636861696e2d76310000000000000000000000000000  # bytes32("curated-onchain-v1")
```

## OracleDaemonConfig

```python
# Parameters related to "bunker mode"
# See https://research.lido.fi/t/withdrawals-for-lido-on-ethereum-bunker-mode-design-and-implementation/3890/4
# and https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330
# NB: BASE_REWARD_FACTOR: https://ethereum.github.io/consensus-specs/specs/phase0/beacon-chain/#rewards-and-penalties
NORMALIZED_CL_REWARD_PER_EPOCH=64
NORMALIZED_CL_REWARD_MISTAKE_RATE_BP=1000  # 10%
REBASE_CHECK_NEAREST_EPOCH_DISTANCE=1
REBASE_CHECK_DISTANT_EPOCH_DISTANCE=23  # 10% of AO 225 epochs frame
VALIDATOR_DELAYED_TIMEOUT_IN_SLOTS=7200  # 1 day

# See https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330 for "Requirement not be considered Delinquent"
VALIDATOR_DELINQUENT_TIMEOUT_IN_SLOTS=28800  # 4 days

# See "B.3.I" of https://snapshot.org/#/lido-snapshot.eth/proposal/0xa4eb1220a15d46a1825d5a0f44de1b34644d4aa6bb95f910b86b29bb7654e330
NODE_OPERATOR_NETWORK_PENETRATION_THRESHOLD_BP=100  # 1% network penetration for a single NO

# Time period of historical observations used for prediction of the rewards amount
# see https://research.lido.fi/t/withdrawals-for-lido-on-ethereum-bunker-mode-design-and-implementation/3890/4
PREDICTION_DURATION_IN_SLOTS=50400  # 7 days

# Max period of delay for requests finalization in case of bunker due to negative rebase
# twice min governance response time - 3 days voting duration
FINALIZATION_MAX_NEGATIVE_REBASE_EPOCH_SHIFT=1350  # 6 days
```

## OracleReportSanityChecker

```python
# Sanity limit on the number of deposits: not more than ~half of the current DSM deposits capacity (43200 it is)
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L221-L232
CHURN_VALIDATORS_PER_DAY_LIMIT = 20000

# Taken from current oracle limit https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F8
# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L47-L50
ONE_OFF_CL_BALANCE_DECREASE_BP_LIMIT = 500  # 5%

# See https://research.lido.fi/t/increasing-max-apr-sanity-check-for-oracle-lido-report/3205
# Related to Consensus Layer rewards only
ANNUAL_BALANCE_INCREASE_BP_LIMIT = 1000  # 10%

# According to https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L647-L672
# and assuming Staking rate limit = 150 000, TVL = 3 000 000
# SRL = 0.1
# L = (2 * SRL) * max(ONE_OFF_CL_BALANCE_DECREASE_BP_LIMIT, MAX_POSITIVE_TOKEN_REBASE)
# L = 50
SIMULATED_SHARE_RATE_DEVIATION_BP_LIMIT = 50  # 0.5%

# Same as the current churn limit in Ethereum (8 validators per epoch)
# used in ValidatorsExitBusOracle, which has reporting period 8 hours
# Formula for validator churn limit is https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/beacon-chain.md#get_validator_churn_limit
# currently we have ~562000 active validators, which gives 8 validators per epoch unless active validators grew up to `589824`
MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT = 600

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L65-L67
# Depends on the amount of staking modules and amount of data types. Have only one staking module at launch
# and two data types exited and stuck validators ( see https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/AccountingOracle.sol##L282-L319 )
# So need to deliver exited/delinquent sets of data: 1 x 2 = 2
MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT = 2

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L69-L71
# and https://github.com/lidofinance/lido-dao/blob/e45c4d6fb8120fd29426b8d969c19d8a798ca974/contracts/0.8.9/oracle/AccountingOracle.sol#L302-L306
# could have been 200, since NOR allows up to 200 node operators
# decided to halve it down since Lido has 29 node operators onboarded while have the margin for more node operators
MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT = 100

# See https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L73-L75
# and https://research.lido.fi/t/withdrawals-for-lido-on-ethereum-bunker-mode-design-and-implementation/3890/4
REQUEST_TIMESTAMP_MARGIN = 7680  # 2 hours rounded to epoch length

# 27% yearly, in 1e9 so that it multiplied on 365 (link to code)
# see https://research.lido.fi/t/increasing-max-apr-sanity-check-for-oracle-lido-report/3205
# and https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol#L77-L79
# the value might be re-considered once the stETH liquidity sources landscape changed
MAX_POSITIVE_TOKEN_REBASE = 750000
```

## Burner

```python
# See https://vote.lido.fi/vote/106
# and https://etherscan.io/address/0xB280E33812c0B09353180e92e27b8AD399B07f26#readContract#F7
TOTAL_NON_COVER_SHARES_BURNT = 32145684728326685744
TOTAL_COVER_SHARES_BURNT = 0

# See https://docs.lido.fi/deployed-contracts/
AGENT = 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c  # _admin and _treasury
LIDO = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84  # _stETH
```

## DepositSecurityModule

```python
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F10
DSM_MAX_DEPOSITS_PER_BLOCK = 150
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F11
DSM_MIN_DEPOSIT_BLOCK_DISTANCE = 25
# Same as at present https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F14
DSM_PAUSE_INTENT_VALIDITY_PERIOD_BLOCKS = 6646
```

## AccountingOracle

Y su correspondiente `HashConsensus`.

```python
# Once per day
# Same as for current Oracle see https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F30
AO_EPOCHS_PER_FRAME = 225  #
# So, the AccountingOracle expected report time would be ~12:00 UTC

# Number of slots dedicated for delay during oracles rotation including finalization time
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/HashConsensus.sol#L370-L398
# NB: min value is 64 as two epochs are required for the chain finality
AO_FAST_LANE_LENGTH_SLOTS = 100

# Technical value indicating consensus version of the contract. Can basically be any because there were no consensus versions before https://github.com/lidofinance/lido-dao/blob/e35435ad9b9473cb0f9b7b0e1e17f6bf9b96e000/contracts/0.8.9/oracle/BaseOracle.sol#L121-L126
AO_CONSENSUS_VERSION = 1

# See https://docs.lido.fi/deployed-contracts/
LIDO_LOCATOR = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
LIDO = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
LEGACY_ORACLE = 0x442af784A788A5bd6F42A01Ebe9F287a871243fb
```

## ValidatorsExitBusOracle

Y su correspondiente `HashConsensus`.

```python
# Thrice per day
# So, the ValidatorsExitBusOracle expected report time would be
# ~4:00 UTC, ~12:00 UTC, ~20:00 UTC
VEBO_EPOCHS_PER_FRAME = 75

# Number of slots dedicated for delay during oracles rotation including finalization time
# https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/HashConsensus.sol#L370-L398
# NB: min value is 64 as two epochs are required for finalization
VEBO_FAST_LANE_LENGTH_SLOTS = 100

# Technical value indicating consensus version of the contract. Can basically be any because there were no consensus versions before https://github.com/lidofinance/lido-dao/blob/e35435ad9b9473cb0f9b7b0e1e17f6bf9b96e000/contracts/0.8.9/oracle/BaseOracle.sol#L121-L126
VEBO_CONSENSUS_VERSION = 1

LIDO_LOCATOR = 0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb
```

## AccountingOracle and ValidatorsExitBusOracle

```python
# See https://ethereum.org/en/developers/docs/blocks/
CHAIN_SECONDS_PER_SLOT = 12

# See https://blog.ethereum.org/2020/11/27/eth2-quick-update-no-21
# Also its as it is in the current oracle https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F30
CHAIN_GENESIS_TIME = 1606824023
```

## WithdrawalQueueERC721

```python
WSTETH_TOKEN = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0  # _wstETH
WQ_ERC721_TOKEN_NAME = "Lido: stETH Withdrawal NFT"
WQ_ERC721_TOKEN_SYMBOL = "unstETH"

# Lido-maintained NFT-generator server
# see https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/WithdrawalQueueERC721.sol#L126-L129
WQ_ERC721_TOKEN_BASE_URI = "https://wq-api.lido.fi/v1/nft"
```

## WithdrawalsVault

```python
# See https://docs.lido.fi/deployed-contracts/
LIDO = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84  # _lido_
AGENT = 0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c  # _treasury
```

## EIP712StETH

```python
# See https://docs.lido.fi/deployed-contracts/
LIDO = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84  # _stETH
```

## StakingRouter

```python
# See https://ethereum.org/en/staking/deposit-contract/
CHAIN_DEPOSIT_CONTRACT = 0x00000000219ab540356cBB839Cbe05303d7705Fa
```

## GateSeal

```python
# 2 x governance response time - vote duration is 3 days
GATE_SEAL_PAUSE_DURATION = 518400  # 6 days as seconds
GATE_SEAL_EXPIRY_TIMESTAMP = 1714521600  # 2024-05-01 00:00 UTC
```

## Configuración de roles

Para la configuración de roles en las pruebas, consulte [la prueba de permisos](https://github.com/lidofinance/scripts/blob/shapella-upgrade/tests/regression/test_permissions.py).

Denotación de ACL de contratos:

- El marcado "_Aragon app_" significa que el contrato es una aplicación Aragon que utiliza el [modelo ACL de Aragon](https://hack.aragon.org/developers/tools/aragonos/reference-documentation).
- El marcado "_OZ_" significa que el contrato utiliza el [modelo ACL de OpenZeppelin](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/utils/access/AccessControlEnumerable.sol).
- El marcado "_Proxy_" significa que el contrato está desplegado detrás de un proxy y tiene un modelo adicional de [ACL relacionado con el proxy](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/proxy/OssifiableProxy.sol).
- El marcado "_Plain owner_" significa que tiene un modelo ACL simple personalizado con un único propietario y un setter para ello.
- El marcado "_No access control_" significa que no tiene ningún ACL.

### **Lido**

_Aragon app_

**New**

- `UNSAFE_CHANGE_DEPOSITED_VALIDATORS_ROLE`
  - None

**Kept**

- `PAUSE_ROLE`
  - Voting
- `RESUME_ROLE`
  - Voting
- `STAKING_PAUSE_ROLE`
  - Voting
- `STAKING_CONTROL_ROLE`
  - Voting

**Obsolete**
_Para ser revocado en una votación._

- `MANAGE_FEE`
  - revoke from Voting
- `MANAGE_WITHDRAWAL_KEY`
  - revoke from Voting
- `MANAGE_PROTOCOL_CONTRACTS_ROLE`
  - revoke from Voting
- `SET_EL_REWARDS_VAULT_ROLE`
  - revoke from Voting
- `SET_EL_REWARDS_WITHDRAWAL_LIMIT_ROLE`
  - revoke from Voting
- `DEPOSIT_ROLE`
  - revoke from [SelfOwnedStETHBurner](https://etherscan.io/address/0xB280E33812c0B09353180e92e27b8AD399B07f26) (obsolete contract)
- `BURN_ROLE`
  - revoke from [old DepositSecurityModule](https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd) (obsolete contract)

### **NodeOperatorsRegistry**

_Aragon app_

**New**

- `STAKING_ROUTER_ROLE`
  - StakingRouter (set in voting script)
    _To be granted at voting._
- `MANAGE_NODE_OPERATOR_ROLE`
  - None

**Kept**

- `MANAGE_SIGNING_KEYS`
  - Voting
- `SET_NODE_OPERATOR_LIMIT_ROLE`
  - Voting
  - Easytrack EVMScriptExecutor

**Obsolete**
_To be revoked at voting._

- `ADD_NODE_OPERATOR_ROLE`
- `SET_NODE_OPERATOR_ACTIVE_ROLE`
- `SET_NODE_OPERATOR_NAME_ROLE`
- `SET_NODE_OPERATOR_ADDRESS_ROLE`
- `REPORT_STOPPED_VALIDATORS_ROLE`

### **LegacyOracle (former LidoOracle)**

_Aragon app_

**New**
None

**Kept**
None

**Obsolete**
_To be revoked at voting._

- `MANAGE_MEMBERS`
- `MANAGE_QUORUM`
- `SET_BEACON_SPEC`
- `SET_REPORT_BOUNDARIES`
- `SET_BEACON_REPORT_RECEIVER`

### **AccountingOracle**

_OZ, Proxy_

- PROXY ADMIN
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Agent
- `SUBMIT_DATA_ROLE`
  - None
- `MANAGE_CONSENSUS_CONTRACT_ROLE`
  - None
- `MANAGE_CONSENSUS_VERSION_ROLE`
  - None

### **Burner**

_OZ, No Proxy_

- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `REQUEST_BURN_SHARES_ROLE`
  - Before vote start:
    - Lido (set in Burner constructor)
  - After enactment:
    - Lido (set in Burner constructor)
    - NodeOperatorsRegistry
- `REQUEST_BURN_MY_STETH_ROLE`
  - None

### **LidoLocator**

_OZ, Proxy_

- PROXY ADMIN
  - Before vote start:
    - Template
  - After enactment:
    - Agent

### **StakingRouter**

_OZ, Proxy_

- PROXY ADMIN
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Agent
- `MANAGE_WITHDRAWAL_CREDENTIALS_ROLE`
  - None
- `STAKING_MODULE_PAUSE_ROLE`
  - DepositSecurityModule
- `STAKING_MODULE_RESUME_ROLE`
  - DepositSecurityModule
- `STAKING_MODULE_MANAGE_ROLE`
  - None
- `REPORT_EXITED_VALIDATORS_ROLE`
  - AccountingOracle
- `UNSAFE_SET_EXITED_VALIDATORS_ROLE`
  - None
- `REPORT_REWARDS_MINTED_ROLE`
  - Lido

### **HashConsensus for AccountingOracle**

_OZ, No Proxy_

- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `MANAGE_MEMBERS_AND_QUORUM_ROLE`
  - None
- `DISABLE_CONSENSUS_ROLE`
  - None
- `MANAGE_FRAME_CONFIG_ROLE`
  - None
- `MANAGE_FAST_LANE_CONFIG_ROLE`
  - None
- `MANAGE_REPORT_PROCESSOR_ROLE`
  - None
- `address[] _memberAddresses`
  - Before vote start:
    - None
  - After enactment:
    - Current LidoOracle Committee
      See [0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28](https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28])

### **DepositSecurityModule**

_Este Plain Owner, No Proxy_

- owner
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- guardians
  - Before vote start:
    - None
  - After enactment:
    - Current DSM guardians committee
      See [0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F8](https://etherscan.io/address/0x710B3303fB508a84F10793c1106e32bE873C24cd#readContract#F8)

### **HashConsensus for ValidatorsExitBusOracle**

_OZ, Sin Proxy_

- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `MANAGE_MEMBERS_AND_QUORUM_ROLE`
  - None
- `DISABLE_CONSENSUS_ROLE`
  - None
- `MANAGE_FRAME_CONFIG_ROLE`
  - None
- `MANAGE_FAST_LANE_CONFIG_ROLE`
  - None
- `MANAGE_REPORT_PROCESSOR_ROLE`
  - None
- `address[] _memberAddresses`
  - Before vote start:
    - None
  - After enactment:
    - Current LidoOracle Committee
      See [0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28](https://etherscan.io/address/0x442af784A788A5bd6F42A01Ebe9F287a871243fb#readProxyContract#F28)

### **OracleDaemonConfig**

_OZ, Sin Proxy_

- `DEFAULT_ADMIN_ROLE`
  - Agent
- `CONFIG_MANAGER_ROLE`
  - None

### **OracleReportSanityChecker**

_OZ, Sin Proxy_

- `DEFAULT_ADMIN_ROLE` (set in constructor)
  - Agent
- `ALL_LIMITS_MANAGER_ROLE`
- `CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE`
- `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE`
- `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE`
- `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE`
- `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE`
- `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE`
- `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE`
- `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE`
- `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE`
  - None for all roles listed above

### **ValidatorsExitBusOracle**

_OZ, Proxy_

- PROXY ADMIN
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Agent
- `PAUSE_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Gate Seal
- `RESUME_ROLE`
  - None
- `SUBMIT_DATA_ROLE`
  - None
- `MANAGE_CONSENSUS_CONTRACT_ROLE`
  - None
- `MANAGE_CONSENSUS_VERSION_ROLE`
  - None

### **WithdrawalQueueERC721**

_OZ, Proxy_

- PROXY ADMIN
  - Before vote start:
    - Template
  - After enactment:
    - Agent
- `DEFAULT_ADMIN_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Agent
- `PAUSE_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Gate Seal
- `RESUME_ROLE`
  - None
- `FINALIZE_ROLE`
  - Before vote start:
    - None
  - After enactment:
    - Lido
- `ORACLE_ROLE`
  - Before vote start:
    - None
  - After enactment
    - AccountingOracle
- `MANAGE_TOKEN_URI_ROLE`
  - None

### **WithdrawalVault**

_Sin control de acceso, Proxy_

- PROXY ADMIN
  - Voting
