# Configuración y Configuración de Herramientas

## Keys API (KAPI)

[Guía de Configuración Dedicada](https://hackmd.io/@lido/S1Li-wXl3)

[Repositorio en GitHub](https://github.com/lidofinance/lido-keys-api)

## Validator Ejector (Ejector)

[Guía de Configuración Dedicada](https://hackmd.io/@lido/BJvy7eWln)

[Repositorio en GitHub](https://github.com/lidofinance/validator-ejector)

## Infraestructura Requerida para las Nuevas Herramientas

Para que las nuevas herramientas puedan leer contratos de Lido e información de validadores, se necesita acceso a un Nodo de Ejecución (exactamente un nodo completo) y un Nodo de Consenso.

Se recomienda una configuración dedicada de CL+EL.

:::info
Aunque el Ejector tiene [protecciones de seguridad](https://github.com/lidofinance/validator-ejector#safety-features), se desaconseja el uso de proveedores de RPC alojados (Infura, Alchemy, etc.).
:::

:::info
También se recomienda tener comunicación segura Ejector -> Nodos y KAPI -> Nodos, por ejemplo, a través de una red privada.
:::

## Opciones de Configuración Comunes

### ID del Operador

Puedes encontrarlo en el Dashboard de Operadores (`#123` en la tarjeta del operador): [Holešky](https://holesky-operators.testnet.fi), [Mainnet](https://operators.lido.fi)

### ID del Módulo de Enrutamiento de Staking:

ID del contrato [StakingRouter](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/StakingRouter.sol).

Actualmente, solo tiene un módulo ([NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol)), su ID es `1`.

### Lista Blanca del Oráculo

Los miembros del oráculo se pueden obtener del contrato HashConsensus (para el Oracle del Bus de Salida de Validadores) en cadena, directamente desde el contrato usando Etherscan.

| Red     | Llamada al Contrato                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------- |
| Mainnet | [getMembers()](https://etherscan.io/address/0x7FaDB6358950c5fAA66Cb5EB8eE5147De3df355a#readContract#F16)         |
| Holešky | [getMembers()](https://holesky.etherscan.io/address/0xe77Cf1A027d7C10Ee6bb7Ede5E922a181FF40E8f#readContract#F16) |

## Ejemplo de Configuración de Infraestructura

El equipo de Lido DevOps preparó una forma sencilla de configurar las herramientas recomendadas y sus dependencias utilizando [Ansible](https://github.com/ansible/ansible). Esta es una excelente manera de familiarizarse con las nuevas herramientas. Este es un ejemplo de implementación y aún requiere seguridad y endurecimiento por parte del NO; se puede encontrar en [GitHub](https://github.com/lidofinance/node-operators-setup).

Configura 3 hosts:

- Nodos de Capa de Ejecución + Capa de Consenso (Geth + Lighthouse)
- KAPI & Ejector
- Monitoreo

El monitoreo consta de:

- [Prometheus](https://github.com/prometheus/prometheus) para métricas
- [Alertmanager](https://github.com/prometheus/alertmanager) para alertas
- [Loki](https://github.com/grafana/loki) para logs
- [Grafana](https://github.com/grafana/grafana) para paneles
