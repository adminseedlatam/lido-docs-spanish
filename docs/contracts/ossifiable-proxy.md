# OssifiableProxy

- [Código fuente](https://github.com/lidofinance/lido-dao/blob/master/contracts/0.8.9/proxy/OssifiableProxy.sol)
- [Código fuente de `WithdrawalsManagerProxy`](https://github.com/lidofinance/withdrawals-manager-stub/blob/main/contracts/WithdrawalsManagerProxy.sol)

Instancias desplegadas:

- [LidoLocator](/contracts/lido-locator)
- [StakingRouter](/contracts/staking-router)
- [WithdrawalQueueERC721](/contracts/withdrawal-queue-erc721)
- [WithdrawalVault](/contracts/withdrawal-vault) (utiliza `WithdrawalsManagerProxy`)
- [AccountingOracle](/contracts/accounting-oracle)
- [ValidatorsExitBusOracle](/contracts/validators-exit-bus-oracle)

Un contrato proxy común utilizado para despliegues de contratos no actualizables de Lido fuera de Aragon.
Sigue el estándar de proxy [ERC1967](https://eips.ethereum.org/EIPS/eip-1967) y permite la osificación (ajuste del propietario del proxy a la dirección cero) para la versión final de implementación.
