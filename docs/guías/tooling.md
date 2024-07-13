# Resumen de Herramientas

Este es un resumen de las herramientas utilizadas en Lido V2, que incluye el Oracle, Validator Ejector, Council Daemon y Keys API.

## Oracle

El Oracle es un daemon para el servicio descentralizado de staking de Lido.

- **Versión**: 3.0.0
- **Imagen Docker**: [lidofinance/oracle@sha256-d2ee5ecc78f8b991fcd2327e1d1bc84b8015aa7b8fde73e5ec0e702e6bec6c86](https://hub.docker.com/layers/lidofinance/oracle/3.0.0/images/sha256-d2ee5ecc78f8b991fcd2327e1d1bc84b8015aa7b8fde73e5ec0e702e6bec6c86?context=explore)
- **Hash del Commit**: [lidofinance/lido-oracle@4467895](https://github.com/lidofinance/lido-oracle/tree/44678954915b8291c949904c63de5e4e4983b427)
- **Fecha de última actualización**: 17 de mayo de 2023
- [**Repositorio**](https://github.com/lidofinance/lido-oracle/tree/3.0.0)
- [**Documentación**](/guías/oracle-operator-manual)

## Validator Ejector

El Validator Ejector es un servicio daemon que carga eventos del Lido Oracle para la salida de validadores y envía mensajes de salida cuando es necesario.

- **Versión**: 1.6.0
- **Imagen Docker**: [lidofinance/validator-ejector@sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e](https://hub.docker.com/layers/lidofinance/validator-ejector/1.6.0/images/sha256-6d80a57895e0a4d577dc78b187d2bbc62742259ccc1efcadff16685bda7a817e)
- **Hash del Commit**: [lidofinance/validator-ejector@cae145c](https://github.com/lidofinance/validator-ejector/commit/cae145cde6e0c41726335dcbb761395fd54c26de)
- **Fecha de última actualización**: 17 de abril de 2024
- [**Repositorio**](https://github.com/lidofinance/validator-ejector/tree/1.6.0#readme)
- [**Documentación**](/guías/validator-ejector-guide)

## Council Daemon

El Council Daemon de Lido monitorea las claves del contrato de depósito.

- **Versión**: 2.1.2
- **Imagen Docker**: [lidofinance/lido-council-daemon@sha256-a8fe22fdb9d6c51422f12b99cdd920150d9039127758490294b6a60641aa5eeb](https://hub.docker.com/layers/lidofinance/lido-council-daemon/2.1.2/images/sha256-a8fe22fdb9d6c51422f12b99cdd920150d9039127758490294b6a60641aa5eeb)
- **Hash del Commit**: [lidofinance/lido-council-daemon@e675a48](https://github.com/lidofinance/lido-council-daemon/commit/e675a4856502b9f67e606f0c5f07d712288d5945)
- **Fecha de última actualización**: 30 de marzo de 2024
- [**Repositorio**](https://github.com/lidofinance/lido-council-daemon/tree/2.1.2)
- [**Documentación**](/guías/deposit-security-manual)

## Keys API

La Keys API de Lido es una API HTTP para claves.

- **Versión**: 1.0.2
- **Imagen Docker**: [lidofinance/lido-keys-api@sha256-1031ae9696c0cba41c32ca9496935be459a69ccbd18079631faa0413afd3ac4f](https://hub.docker.com/layers/lidofinance/lido-keys-api/1.0.2/images/sha256-1031ae9696c0cba41c32ca9496935be459a69ccbd18079631faa0413afd3ac4f)
- **Hash del Commit**: [lidofinance/lido-keys-api@33141b1](https://github.com/lidofinance/lido-keys-api/commit/33141b195563769151f3d1054acdf785d92db381)
- **Fecha de última actualización**: 28 de febrero de 2024
- [**Repositorio**](https://github.com/lidofinance/lido-keys-api/tree/1.0.2)
- [**Documentación**](/guías/kapi-guide)