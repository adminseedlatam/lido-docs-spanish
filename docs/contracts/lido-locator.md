# LidoLocator

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/LidoLocator.sol)
- [Contrato desplegado](https://etherscan.io/address/0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb)

LidoLocator es el libro de direcciones universal para el protocolo Lido.
Sigue el conocido patrón [service locator](https://en.wikipedia.org/wiki/Service_locator_pattern).

## Actualización

El contrato utiliza [OssifiableProxy](./ossifiable-proxy.md) para la actualización y
no utiliza almacenamiento para el libro de direcciones. En su lugar, todas las direcciones están incrustadas en el bytecode de la implementación como inmutables para eficiencia de gas, permitiendo actualizarlas junto con una implementación de proxy.

## Métodos

### accountingOracle()

Devuelve la dirección del contrato [AccountingOracle](./accounting-oracle.md)

```sol
function accountingOracle() view returns(address);
```

### depositSecurityModule()

Devuelve la dirección del contrato [DepositSecurityModule](./deposit-security-module.md)

```sol
function depositSecurityModule() view returns(address)
```

### elRewardsVault()

Devuelve la dirección del contrato [LidoExecutionLayerRewardsVault](./lido-execution-layer-rewards-vault.md)

```sol
function elRewardsVault() view returns(address)
```

### legacyOracle()

Devuelve la dirección del contrato [LegacyOracle](./legacy-oracle.md)

```sol
function legacyOracle() external view returns(address)
```

### lido()

Devuelve la dirección del contrato [Lido](./lido.md)

```sol
function lido() external view returns(address)
```

### oracleReportSanityChecker()

Devuelve la dirección del contrato [OracleReportSanityChecker](./oracle-report-sanity-checker.md)

```sol
function oracleReportSanityChecker() view returns(address)
```

### burner()

Devuelve la dirección del contrato [Burner](./burner.md)

```sol
function burner() view returns(address)
```

### stakingRouter()

Devuelve la dirección del contrato [StakingRouter](./staking-router.md)

```sol
function stakingRouter() view returns(address)
```

### treasury()

Devuelve la dirección de la tesorería

```sol
function treasury() view returns(address)
```

### validatorsExitBusOracle()

Devuelve la dirección del contrato [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md)

```sol
function validatorsExitBusOracle() external view returns(address)
```

### withdrawalQueue()

Devuelve la dirección del contrato [WithdrawalQueueERC721](./withdrawal-queue-erc721.md)

```sol
function withdrawalQueue() view returns(address)
```

### withdrawalVault()

Devuelve la dirección del contrato [WithdrawalVault](./withdrawal-vault.md)

```sol
function withdrawalVault() view returns(address)
```

### postTokenRebaseReceiver()

Devuelve la dirección del contrato que sigue la interfaz [`IPostTokenRebaseReceiver`](https://github.com/lidofinance/lido-dao/blob/cadffa46a2b8ed6cfa1127fca2468bae1a82d6bf/contracts/0.4.24/Lido.sol#L20-L30) descrita dentro de `Lido`.
Actualmente devuelve la dirección del contrato [LegacyOracle](./legacy-oracle.md).

```sol
function postTokenRebaseReceiver() view returns(address);
```

### oracleDaemonConfig()

Devuelve la dirección del contrato [OracleDaemonConfig](./oracle-daemon-config.md)

```sol
function oracleDaemonConfig() view returns(address)
```

### coreComponents()

Devuelve un conjunto de direcciones de componentes principales de una sola vez.
Es simplemente una forma más eficiente en términos de gas de llamar varios getters públicos a la vez.

```sol
function coreComponents() view returns(
    address elRewardsVault,
    address oracleReportSanityChecker,
    address stakingRouter,
    address treasury,
    address withdrawalQueue,
    address withdrawalVault
)
```

### oracleReportComponentsForLido()

Devuelve un conjunto de direcciones usado específicamente durante el manejo de informes de oráculos en el contrato Lido.
Es simplemente una forma más eficiente en términos de gas de llamar varios getters públicos a la vez.

```sol
function oracleReportComponentsForLido() view returns(
    address accountingOracle,
    address elRewardsVault,
    address oracleReportSanityChecker,
    address burner,
    address withdrawalQueue,
    address withdrawalVault,
    address postTokenRebaseReceiver
)
```

