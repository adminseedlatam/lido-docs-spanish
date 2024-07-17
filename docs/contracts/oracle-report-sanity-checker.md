# OracleReportSanityChecker

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/sanity_checks/OracleReportSanityChecker.sol)
- [Contrato desplegado](https://etherscan.io/address/0x9305c1Dbfe22c12c66339184C0025d7006f0f1cC)

Algunos datos vitales para el protocolo Lido se recopilan fuera de la cadena y se entregan en cadena a través de contratos oráculo:
[`AccountingOracle`](./accounting-oracle.md), [`ValidatorsExitBusOracle`](./validators-exit-bus-oracle.md).
Debido al alto impacto de los datos proporcionados por los oráculos en el estado del protocolo, cada informe del oráculo
pasa por un conjunto de [comprobaciones de integridad](https://en.wikipedia.org/wiki/Sanity_check) en cadena.
Para simplificar los contratos responsables del manejo de los informes del oráculo, todas las comprobaciones de integridad se recopilaron en el
contrato independiente `OracleReportSanityChecker`.

Además de los métodos de validación, el contrato `OracleReportSanityChecker` contiene un [conjunto de límites y restricciones ajustables](#lista-de-límites)
utilizados durante el proceso de validación de los informes.
Para configurar los valores de los límites, el contrato proporciona métodos de ajuste descritos en la [sección independiente](#métodos-de-palanca).
El acceso a los métodos de ajuste está restringido utilizando la funcionalidad del
contrato [AccessControlEnumerable](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/utils/access/AccessControlEnumerable.sol)
y un conjunto de [roles granulares](#permisos).

## Lista de Límites

`OracleReportSanityChecker` introduce un nuevo tipo `LimitsList` que contiene todos los límites utilizados por el contrato.

```solidity
struct LimitsList {
    uint256 churnValidatorsPerDayLimit;
    uint256 oneOffCLBalanceDecreaseBPLimit;
    uint256 annualBalanceIncreaseBPLimit;
    uint256 simulatedShareRateDeviationBPLimit;
    uint256 maxValidatorExitRequestsPerReport;
    uint256 maxAccountingExtraDataListItemsCount;
    uint256 maxNodeOperatorsPerExtraDataItemCount;
    uint256 requestTimestampMargin;
    uint256 maxPositiveTokenRebase;
}
```

- **`churnValidatorsPerDayLimit` ∈ [0, 65535]** — el número máximo posible de validadores que podrían haber sido reportados como _**aparecidos**_
  o _**salidos**_ durante un solo día. [`AccountingOracle`](./accounting-oracle.md) reporta validadores como _**aparecidos**_ una vez que se convierten en
  _**pendientes**_ (podrían no estar aún _**activados**_). Por lo tanto, este límite debe ser lo suficientemente alto para tales casos porque la Capa de Consenso no tiene
  un límite intrínseco de cambio para la cantidad de validadores _**pendientes**_ (solo para los _**activados**_ en su lugar).
  Para Lido, está limitado por los depósitos diarios máximos a través de [`DepositSecurityModule`](./deposit-security-module.md). En contraste, los _**salidos**_ se reportan según el
  [límite de cambio de la Capa de Consenso](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#get_validator_churn_limit).
- **`oneOffCLBalanceDecreaseBPLimit` ∈ [0, 10000]** — la disminución máxima de los saldos totales de los validadores en la Capa de Consenso desde
  el informe anterior del oráculo. Representado en [puntos base](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`annualBalanceIncreaseBPLimit` ∈ [0, 10000]** — el aumento máximo anual de los saldos totales de los validadores en la Capa de Consenso
  desde el informe anterior del oráculo. Representado en [puntos base](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`simulatedShareRateDeviationBPLimit` ∈ [0, 10000]** — la desviación máxima entre la `simulatedShareRate` proporcionada y la real dentro del
  informe de oráculo que se está procesando actualmente. Representado en [puntos base](https://en.wikipedia.org/wiki/Basis_point) (100% == 10000).
- **`maxValidatorExitRequestsPerReport` ∈ [0, 65535]** — el número máximo de solicitudes de salida permitidas en un informe
  a [ValidatorsExitBusOracle](./validators-exit-bus-oracle.md)
- **`maxAccountingExtraDataListItemsCount` ∈ [0, 65535]** — el número máximo de elementos de lista de datos adicionales reportados al oráculo de contabilidad en datos adicionales
- **`maxNodeOperatorsPerExtraDataItemCount` ∈ [0, 65535]** — el número máximo de operadores de nodo reportados por elemento de lista de datos adicionales
- **`requestTimestampMargin` ∈ [0, type(uint64).max]** — el tiempo mínimo requerido que debe pasar desde la creación de la solicitud hasta que se finalice hasta el momento del informe del oráculo
- **`maxPositiveTokenRebase` ∈ [1, type(uint64).max]** — el rebase máximo de tokens positivos permitido por un solo informe de oráculo. El rebase de tokens ocurre en el ajuste del suministro total, un rebase positivo enorme puede causar el apilamiento de informes de oráculo.
  Utiliza una precisión de 1e9, por ejemplo: `1e6` — 0.1%; `1e9` — 100%; `type(uint64).max` — rebase ilimitado.

## Comprobaciones de Integridad

### checkAccountingOracleReport()

Aplica comprobaciones de integridad a los parámetros de contabilidad del informe del Oráculo de Lido.

:::note
A continuación se muestra la lista de restricciones verificadas por la ejecución del método:

- Revertir con el error `IncorrectWithdrawalsVaultBalance(uint256 actualWithdrawalVaultBalance)` cuando el saldo del depósito reportado
  sea **mayor que** el saldo real del depósito de retiros.
- Revertir con el error `IncorrectELRewardsVaultBalance(uint256 actualELRewardsVaultBalance)` cuando el saldo del depósito de recompensas EL
  sea **mayor que** el saldo real del depósito de recompensas EL.
- Revertir con el error `IncorrectSharesRequestedToBurn(uint256 actualSharesToBurn)` cuando la cantidad de acciones de stETH solicitadas
  quemar **excede** el número de acciones marcadas para quemar en el contrato Burner.
- Revertir con el error `IncorrectCLBalanceDecrease(uint256 oneOffCLBalanceDecreaseBP)` cuando la disminución del saldo único en la Capa de Consenso
  en puntos base **exceda** el límite permitido `LimitsList.oneOffCLBalanceDecreaseBPLimit`.
- Revertir con el error `IncorrectCLBalanceIncrease(uint256 annualBalanceDiff)` cuando el aumento anual del saldo en la Capa de Consenso
  expresado en puntos base **exceda** el límite permitido `LimitsList.annualBalanceIncreaseBPLimit`.
- Revertir con el error `IncorrectAppearedValidators(uint256 churnLimit)` cuando el número de validadores que aparecieron **excede**
  el límite establecido por `LimitsList.churnValidatorsPerDayLimit`.

:::

```solidity
function checkAccountingOracleReport(
    uint256 _timeElapsed,
    uint256 _preCLBalance,
    uint256 _postCLBalance,
    uint256 _withdrawalVaultBalance,
    uint256 _elRewardsVaultBalance,
    uint256 _sharesRequestedToBurn,
    uint256 _preCLValidators,
    uint256 _postCLValidators
)
```

#### Argumentos

- **`_timeElapsed`** — tiempo transcurrido desde el informe anterior del oráculo, medido en **segundos**
- **`_preCLBalance`** — suma de todos los saldos de los validadores de Lido en la Capa de Consenso antes del informe actual del oráculo
  (NB: incluye también el saldo inicial de los validadores recién aparecidos)
- **`_postCLBalance`** — suma de todos los saldos de los validadores de Lido en la Capa de Consenso después del informe actual del oráculo
- **`_withdrawalVaultBalance`** — saldo del depósito de retiros en la Capa de Ejecución para el slot de referencia del informe
- **`_elRewardsVaultBalance`** — saldo

 del depósito de recompensas EL en la Capa de Ejecución para el slot de referencia del informe
- **`_sharesRequestedToBurn`** — acciones solicitadas para quemar para el slot de referencia del informe
- **`_preCLValidators`** — validadores participantes de Lido en el lado de la CL antes del informe actual del oráculo
- **`_postCLValidators`** — validadores participantes de Lido en el lado de la CL después del informe actual del oráculo

### checkExitBusOracleReport()

Valida que el número de solicitudes de salida no exceda el límite establecido por `LimitsList.maxValidatorExitRequestsPerReport`.

:::note
Revierte con el error `IncorrectNumberOfExitRequestsPerReport(uint256 maxRequestsCount)` cuando la verificación falla.
:::

```solidity
function checkExitBusOracleReport(uint256 _exitRequestsCount)
```

#### Argumentos

- **`_exitRequestsCount`** — número de solicitudes de salida de validadores proporcionadas por informe de oráculo

### checkExitedValidatorsRatePerDay()

Valida que el número de validadores que han salido no exceda el límite establecido por `LimitsList.churnValidatorsPerDayLimit`.

:::note
Revirtirá con el error `ExitedValidatorsLimitExceeded(uint256 limitPerDay, uint256 exitedPerDay)` cuando la verificación falle.
:::

```solidity
function checkExitedValidatorsRatePerDay(uint256 _exitedValidatorsCount)
```

#### Argumentos

- **`_exitedValidatorsCount`** — número de solicitudes de salida de validadores proporcionadas por informe de oráculo

### checkNodeOperatorsPerExtraDataItemCount()

Valida que el número de operadores de nodo reportados por elemento de datos adicionales no exceda el límite
establecido por `LimitsList.maxNodeOperatorsPerExtraDataItemCount`.

:::note
Revirtirá con el error `TooManyNodeOpsPerExtraDataItem(uint256 itemIndex, uint256 nodeOpsCount)` cuando la verificación falle.
:::

```solidity
function checkNodeOperatorsPerExtraDataItemCount(
    uint256 _itemIndex,
    uint256 _nodeOperatorsCount
)
```

#### Argumentos

- **`_itemIndex`** — índice del elemento en datos adicionales
- **`_nodeOperatorsCount`** — número de operadores de nodo proporcionados por informe de oráculo

### checkAccountingExtraDataListItemsCount()

Valida que el número de elementos de lista de datos adicionales en el informe no exceda el límite
establecido por `LimitsList.maxAccountingExtraDataListItemsCount`.

:::note
Revirtirá con el error `MaxAccountingExtraDataItemsCountExceeded(uint256 maxItemsCount, uint256 receivedItemsCount)` cuando la verificación falle.
:::

```solidity
function checkAccountingExtraDataListItemsCount(uint256 _extraDataListItemsCount)
```

#### Argumentos

- **`_extraDataListItemsCount`** — número de elementos de lista de datos adicionales proporcionados por informe de oráculo

### checkWithdrawalQueueOracleReport()

Valida que la solicitud de retiro con `_lastFinalizableRequestId` pasado fue creada hace más
de `LimitsList.requestTimestampMargin` segundos.

:::note
Revirtirá con el error `IncorrectRequestFinalization(uint256 requestCreationBlock)` cuando la verificación falle.
:::

```solidity
function checkWithdrawalQueueOracleReport(
    uint256 _lastFinalizableRequestId,
    uint256 _reportTimestamp
)
```

#### Argumentos

- **`_lastFinalizableRequestId`** — ID de la última solicitud de retiro finalizable
- **`_reportTimestamp`** — marca de tiempo en la que se presentó el informe de oráculo original

### checkSimulatedShareRate()

Aplica comprobaciones de integridad a la tasa de participación simulada para la finalización de solicitudes de retiro.

:::note
Revirtirá con el error `IncorrectSimulatedShareRate(uint256 simulatedShareRate, uint256 actualShareRate)` cuando la desviación de la tasa de participación simulada exceda el límite establecido por `LimitsList.simulatedShareRateDeviationBPLimit`.
:::

```solidity
function checkSimulatedShareRate(
    uint256 _postTotalPooledEther,
    uint256 _postTotalShares,
    uint256 _etherLockedOnWithdrawalQueue,
    uint256 _sharesBurntDueToWithdrawals,
    uint256 _simulatedShareRate
)
```

#### Argumentos

- **`_postTotalPooledEther`** — ether total acumulado después de aplicar el informe
- **`_postTotalShares`** — total de acciones después de aplicar el informe
- **`_etherLockedOnWithdrawalQueue`** — ether bloqueado en la cola de retiro para el informe de oráculo actual
- **`_sharesBurntDueToWithdrawals`** — acciones quemadas debido a la finalización de retiros
- **`_simulatedShareRate`** — tasa de participación proporcionada con el informe de oráculo (simulada mediante "eth_call" fuera de la cadena)

## Métodos de Vista

### getLidoLocator()

Devuelve la dirección de la instancia a nivel de protocolo de [LidoLocator](./lido-locator.md).

```solidity
function getLidoLocator() returns (address)
```

### getOracleReportLimits()

Devuelve la lista de límites utilizada para las comprobaciones de integridad como tipo [`LimitsList`](#lista-de-límites).

```solidity
function getOracleReportLimits() returns (LimitsList memory)
```

```markdown
### getMaxPositiveTokenRebase()

Devuelve el valor máximo de rebase positivo de tokens con precisión de 1e9 (por ejemplo, `1e6` — 0.1%; `1e9` — 100%):

:::note
Valores especiales:

- `0` (valor cero) significa no inicializado
- `type(uint64).max` significa ilimitado, es decir, no aplicado

:::

Obtiene el máximo rebase positivo permitido por informe de oráculo único. El rebase de tokens ocurre en el ajuste total del suministro y/o acciones totales, mientras que un rebase positivo enorme puede implicar el "oracle report sandwiching" y afectar las recompensas de los poseedores de stETH.

```solidity
function getMaxPositiveTokenRebase() returns (uint256)
```

### smoothenTokenRebase()

Evalúa las siguientes cantidades durante el procesamiento del informe de oráculo de Lido:

- la cantidad permitida de ETH que se puede tomar del vault de retiros y del vault de recompensas EL
- la cantidad permitida de acciones stETH que se pueden quemar

```solidity
function smoothenTokenRebase(
    uint256 _preTotalPooledEther,
    uint256 _preTotalShares,
    uint256 _preCLBalance,
    uint256 _postCLBalance,
    uint256 _withdrawalVaultBalance,
    uint256 _elRewardsVaultBalance,
    uint256 _sharesRequestedToBurn,
    uint256 _etherToLockForWithdrawals,
    uint256 _newSharesToBurnForWithdrawals
) returns (
    uint256 withdrawals,
    uint256 elRewards,
    uint256 simulatedSharesToBurn,
    uint256 sharesToBurn
)
```

#### Argumentos

- **`_preTotalPooledEther`** — cantidad total de ETH controlada por el protocolo
- **`_preTotalShares`** — cantidad total de acciones stETH emitidas
- **`_preCLBalance`** — suma de todos los saldos de validadores de Lido en la Capa de Consenso antes del informe de oráculo actual
- **`_postCLBalance`** — suma de todos los saldos de validadores de Lido en la Capa de Consenso después del informe de oráculo actual
- **`_withdrawalVaultBalance`** — saldo del vault de retiros en la Capa de Ejecución para el momento del cálculo del informe
- **`_elRewardsVaultBalance`** — saldo del vault de recompensas EL en la Capa de Ejecución para el momento del cálculo del informe
- **`_sharesRequestedToBurn`** — acciones solicitadas para quemar a través de Burner para el momento del cálculo del informe
- **`_etherToLockForWithdrawals`** — ether para bloquear en el contrato de cola de retiros
- **`_newSharesToBurnForWithdrawals`** — nuevas acciones a quemar debido a las solicitudes de retiro finalizadas

#### Devoluciones

- **`withdrawals`** — cantidad de ETH permitida para ser tomada del vault de retiros
- **`elRewards`** — cantidad de ETH permitida para ser tomada del vault de recompensas EL
- **`simulatedSharesToBurn`** — cantidad simulada de acciones a quemar (si no hay ether bloqueado en retiros)
- **`sharesToBurn`** — cantidad de acciones a quemar (considerando la finalización de retiros)

## Métodos de Palanca

### setOracleReportLimits()

Establece los nuevos valores para la lista de límites.

:::note

- Requiere que se otorgue el rol `ALL_LIMITS_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue(uint256 value, uint256 minAllowedValue, uint256 maxAllowedValue)` cuando algún valor en los datos pasados esté fuera del rango permitido.
  Consulta los detalles de los límites permitidos en la sección [Limits List](#lista-de-límites).

:::

```solidity
function setOracleReportLimits(LimitsList memory _limitsList)
```

#### Argumentos

- **`_limitsList`** — nuevos valores de la lista de límites

### setChurnValidatorsPerDayLimit()

Establece el nuevo valor para `LimitsList.churnValidatorsPerDayLimit`.
El límite se aplica a los validadores _**appeared**_ y _**exited**_.

:::note

- Requiere que se otorgue el rol `CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setChurnValidatorsPerDayLimit(uint256 _churnValidatorsPerDayLimit)
```

#### Argumentos

- **`_churnValidatorsPerDayLimit`** — nuevo valor para `LimitsList.churnValidatorsPerDayLimit`

### setOneOffCLBalanceDecreaseBPLimit()

Establece el nuevo valor para la variable `LimitsList.oneOffCLBalanceDecreaseBPLimit`.

:::note

- Requiere que se otorgue el rol `ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setOneOffCLBalanceDecreaseBPLimit(uint256 _oneOffCLBalanceDecreaseBPLimit)
```

#### Argumentos

- **`_oneOffCLBalanceDecreaseBPLimit`** — nuevo valor para `LimitsList.oneOffCLBalanceDecreaseBPLimit`

### setAnnualBalanceIncreaseBPLimit()

Establece el nuevo valor para la variable `LimitsList.annualBalanceIncreaseBPLimit`.

:::note

- Requiere que se otorgue el rol `ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setAnnualBalanceIncreaseBPLimit(uint256 _annualBalanceIncreaseBPLimit)
```

### setSimulatedShareRateDeviationBPLimit()

Establece el nuevo valor para la variable `LimitsList.simulatedShareRateDeviationBPLimit`.

:::note

- Requiere que se otorgue el rol `SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setSimulatedShareRateDeviationBPLimit(uint256 _simulatedShareRateDeviationBPLimit)
```

#### Argumentos

- **`_simulatedShareRateDeviationBPLimit`** — nuevo valor para `LimitsList.simulatedShareRateDeviationBPLimit`

### setMaxExitRequestsPerOracleReport()

Establece el nuevo valor para la variable `LimitsList.maxValidatorExitRequestsPerReport`.

:::note

- Requiere que se otorgue el rol `MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setMaxExitRequestsPerOracleReport(uint256 _maxValidatorExitRequestsPerReport)
```

#### Argumentos

- **`_maxValidatorExitRequestsPerReport`** — nuevo valor para `LimitsList.maxValidatorExitRequestsPerReport`

### setRequestTimestampMargin()

Establece el nuevo valor para la variable `LimitsList.requestTimestampMargin`.

:::note

- Requiere que se otorgue el rol `REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setRequestTimestampMargin(uint256 _requestTimestampMargin)
```

#### Argumentos

- **`_requestTimestampMargin`** — nuevo valor para `LimitsList.requestTimestampMargin`

### setMaxPositiveTokenRebase()

Establece el nuevo valor para la variable `LimitsList.maxPositiveTokenRebase`.

:::note

- Requiere que se otorgue el rol `MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setMaxPositiveTokenRebase(uint256 _maxPositiveTokenRebase)
```

#### Argumentos

- **`_maxPositiveTokenRebase`** — nuevo valor para `LimitsList.maxPositiveTokenRebase`

### setMaxAccountingExtraDataListItemsCount()

Establece el nuevo valor para la variable `LimitsList.maxAccountingExtraDataListItemsCount`.

:::note

- Requiere que se otorgue el rol `MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setMaxAccountingExtraDataListItemsCount(uint256 _maxAccountingExtraDataListItemsCount)
```

#### Argumentos

- **`_maxAccountingExtraDataListItemsCount`** — nuevo valor para `LimitsList.maxAccountingExtraDataListItemsCount`

### setMaxNodeOperatorsPerExtraDataItemCount()

Establece el nuevo valor para la variable `LimitsList.maxNodeOperatorsPerExtraDataItemCount`.

:::note

- Requiere que se otorgue el rol `MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE` al llamante.
- Revirtirá con el error `IncorrectLimitValue()` cuando el valor pasado esté fuera del rango permitido.
  Consulta la sección [Limits List](#lista-de-límites) para más detalles.

:::

```solidity
function setMaxNodeOperatorsPerExtraDataItemCount(uint256 _maxNodeOperatorsPerExtraDataItemCount)
```

#### Argumentos

- **`_maxNodeOperatorsPerExtraDataItemCount`** — nuevo valor para `LimitsList.maxNodeOperatorsPerExtraDataItemCount`

## Permisos

### ALL_LIMITS_MANAGER_ROLE()

```solidity
bytes32 public constant ALL_LIMITS_MANAGER_ROLE = keccak256("ALL_LIMITS_MANAGER_ROLE")
```

Conceder este rol permite actualizar **CUALQUIER** valor de la lista de límites.
Consulta el método [`setOracleReportLimits()`](#setoraclereportlimits).

**Concede este rol con precaución y da preferencia a los roles granulares descritos a continuación.**

### CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `churnValidatorsPerDayLimit` de la [lista de límites](#lista-de-límites).
Consulta el método [`setChurnValidatorsPerDayLimit()`](#setchurnvalidatorsperdaylimit).

```solidity
bytes32 public constant CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE =
    keccak256("CHURN_VALIDATORS_PER_DAY_LIMIT_MANAGER_ROLE")
```

### ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `oneOffCLBalanceDecreaseBPLimit` de la [lista de límites](#lista-de-límites).
Consulta el método [`setOneOffCLBalanceDecreaseBPLimit()`](#setoneoffclbalancedecreasebplimit).

```solidity
bytes32 public constant ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE =
    keccak256("ONE_OFF_CL_BALANCE_DECREASE_LIMIT_MANAGER_ROLE")
```

### ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `annualBalanceIncreaseBPLimit` de la [lista de límites](#lista-de-límites).
Consulta el método [`setAnnualBalanceIncreaseBPLimit()`](#setannualbalanceincreasebplimit).

```solidity
bytes32 public constant ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE =
    keccak256("ANNUAL_BALANCE_INCREASE_LIMIT_MANAGER_ROLE")
```

### SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `simulatedShareRateDeviationBPLimit` de la [lista de límites](#lista-de-límites).
Consulta el método [`setSimulatedShareRateDeviationBPLimit()`](#setsimulatedshareratedeviationbplimit).

```solidity
bytes32 public constant SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE =
    keccak256("SHARE_RATE_DEVIATION_LIMIT_MANAGER_ROLE")
```

### MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE()

Conceder este rol permite actualizar el valor `maxValidatorExitRequestsPerReport` de la [lista de límites](#lista-de-límites).
Consulta el método [`setMaxExitRequestsPerOracleReport()`](#setmaxexitrequestsperoraclereport).

```solidity
bytes32 public constant MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE =
    keccak256("MAX_VALIDATOR_EXIT_REQUESTS_PER_REPORT_ROLE")
```

### MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE()

Conceder este rol permite actualizar el valor `maxAccountingExtraDataListItemsCount` de la [lista de límites](#lista-de-límites).
Consulta el método [`setMaxAccountingExtraDataListItemsCount()`](#setmaxaccountingextradatalistitemscount).

```solidity
bytes32 public constant MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE =
    keccak256("MAX_ACCOUNTING_EXTRA_DATA_LIST_ITEMS_COUNT_ROLE")
```

### MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE()

Conceder este rol permite actualizar el valor `maxNodeOperatorsPerExtraDataItemCount` de la [lista de límites](#lista-de-límites).
Consulta el método [`setMaxNodeOperatorsPerExtraDataItemCount()`](#setmaxnodeoperatorsperextradataitemcount).

```solidity
bytes32 public constant MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE =
    keccak256("MAX_NODE_OPERATORS_PER_EXTRA_DATA_ITEM_COUNT_ROLE")
```

### REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `requestTimestampMargin` de la [lista de límites](#lista-de-límites).
Consulta el método [`setRequestTimestampMargin()`](#setrequesttimestampmargin).

```solidity
bytes32 public constant REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE
    = keccak256("REQUEST_TIMESTAMP_MARGIN_MANAGER_ROLE")
```

### MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE()

Conceder este rol permite actualizar el valor `maxPositiveTokenRebase` de la [lista de límites](#lista-de-límites).
Consulta el método [`setMaxPositiveTokenRebase()`](#setmaxpositivetokenrebase).

```solidity
bytes32 public constant MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE =
    keccak256("MAX_POSITIVE_TOKEN_REBASE_MANAGER_ROLE")
```

## Eventos

### ChurnValidatorsPerDayLimitSet()

Se emite cada vez que se cambia el valor de `LimitsList.churnValidatorsPerDayLimit`.

```solidity
event ChurnValidatorsPerDayLimitSet(uint256 churnValidatorsPerDayLimit);
```

#### Argumentos

- **`churnValidatorsPerDayLimit`** — nuevo valor de `LimitsList.churnValidatorsPerDayLimit`

### OneOffCLBalanceDecreaseBPLimitSet()

Se emite cada vez que se cambia el valor de `LimitsList.oneOffCLBalanceDecreaseBPLimit`.

```solidity
event OneOffCLBalanceDecreaseBPLimitSet(uint256 oneOffCLBalanceDecreaseBPLimit);
```

#### Argumentos

- **`oneOffCLBalanceDecreaseBPLimit`** — nuevo valor de `LimitsList.oneOffCLBalanceDecreaseBPLimit`

### AnnualBalanceIncreaseBPLimitSet()

Se emite cada vez que se cambia el valor de `LimitsList.annualBalanceIncreaseBPLimit`.

```solidity
event AnnualBalanceIncreaseBPLimitSet(uint256 annualBalanceIncreaseBPLimit);
```

#### Argumentos

- **`annualBalanceIncreaseBPLimit`** — nuevo valor de `LimitsList.annualBalanceIncreaseBPLimit`

### SimulatedShareRateDeviationBPLimitSet()

Se emite cada vez que se cambia el valor de `LimitsList.simulatedShareRateDeviationBPLimit`.

```solidity
event SimulatedShareRateDeviationBPLimitSet(uint256 simulatedShareRateDeviationBPLimit);
```

#### Argumentos

- **`annualBalanceIncreaseBPLimit`** — nuevo valor de `LimitsList.simulatedShareRateDeviationBPLimit`

### MaxPositiveTokenRebaseSet()

Se emite cada vez que se cambia el valor de `LimitsList.maxPositiveTokenRebase`.

```solidity
event MaxPositiveTokenRebaseSet(uint256 maxPositiveTokenRebase);
```

#### Argumentos

- **`annualBalanceIncreaseBPLimit`** — nuevo valor de `LimitsList.maxPositiveTokenRebase`

### MaxValidatorExitRequestsPerReportSet()

Se emite cada vez que se cambia el valor de `LimitsList.maxValidatorExitRequestsPerReport`.

```solidity
event MaxValidatorExitRequestsPerReportSet(uint256 maxValidatorExitRequestsPerReport);
```

#### Argumentos

- **`maxValidatorExitRequestsPerReport`** — nuevo valor de `LimitsList.maxValidatorExitRequestsPerReport`

### MaxAccountingExtraDataListItemsCountSet()

Se emite cada vez que se cambia el valor de `LimitsList.maxAccountingExtraDataListItemsCount`.

```solidity
event MaxAccountingExtraDataListItemsCountSet(uint256 maxAccountingExtraDataListItemsCount);
```

#### Argumentos

- **`maxAccountingExtraDataListItemsCount`** — nuevo valor de `LimitsList.maxAccountingExtraDataListItemsCount`

### MaxNodeOperatorsPerExtraDataItemCountSet()

Se emite cada vez que se cambia el valor de `LimitsList.maxNodeOperatorsPerExtraDataItemCount`.

```solidity
event MaxNodeOperatorsPerExtraDataItemCountSet(uint256 maxNodeOperatorsPerExtraDataItemCount);
```

#### Argumentos

- **`maxNodeOperatorsPerExtraDataItemCount`** — nuevo valor de `LimitsList.maxNodeOperatorsPerExtraDataItemCount`

### RequestTimestampMarginSet()

Se emite cada vez que se cambia el valor de `LimitsList.requestTimestampMargin`.

```solidity
event RequestTimestampMarginSet(uint256 requestTimestampMargin);
```

#### Argumentos

- **`requestTimestampMargin`** — nuevo valor de `LimitsList.requestTimestampMargin`
