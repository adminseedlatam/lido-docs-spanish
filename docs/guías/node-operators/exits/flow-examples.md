# Ejemplos de Flujo

## Con Herramientas de Lido (KAPI + Ejector)

[![](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)](https://hackmd.io/_uploads/Hkl5aS7x2.jpg)

Utilizando las herramientas recomendadas de Lido, el flujo es el siguiente:

1. Obtener una lista de validadores para los cuales generar y firmar mensajes de salida - KAPI.
2. Generar y firmar mensajes de salida:

- Keystores - ethdo
- Dirk - ethdo
- Web3Signer u otro firmador propietario - script/herramienta personalizada.

3. Encriptar los archivos de mensajes utilizando el script de encriptación del Ejector.
4. Agregar archivos al Ejector.
5. Esperar hasta que los mensajes válidos del Ejector se ejecuten.
6. Repetir el proceso según sea necesario.

## Solo con Ejector

[![](https://hackmd.io/_uploads/H1_Z4Creh.jpg)](https://hackmd.io/_uploads/H1_Z4Creh.jpg)

1. Obtener una lista de validadores para los cuales generar y firmar mensajes de salida:

- Seguir el orden en el que las claves están almacenadas (por ejemplo, elegir las más antiguas).
- Consultar el contrato [NodeOperatorsRegistry](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.4.24/nos/NodeOperatorsRegistry.sol) para obtener todas tus claves, ordenar por índice y comenzar con los índices más bajos. En cada lote, seguir el último índice pre-firmado o consultar el estado del validador en el Nodo de Consenso para ignorar los validadores que están saliendo o ya han salido.

2. Generar y firmar mensajes de salida:

- Keystores - ethdo
- Dirk - ethdo
- Web3Signer u otro firmador propietario - script/herramienta personalizada.

3. Encriptar los archivos de mensajes utilizando el script de encriptación del Ejector.
4. Agregar archivos al Ejector.
5. Esperar hasta que los mensajes válidos del Ejector se ejecuten.
6. Repetir el proceso según sea necesario.

## Sin Herramientas de Lido

[![](https://hackmd.io/_uploads/rJZ5TBme3.jpg)](https://hackmd.io/_uploads/rJZ5TBme3.jpg)

1. Monitorear eventos `ValidatorExitRequest` del [`ValidatorsExitBusOracle`](https://github.com/lidofinance/lido-dao/blob/feature/shapella-upgrade/contracts/0.8.9/oracle/ValidatorsExitBusOracle.sol).
2. Generar y firmar mensajes de salida:

- Keystores - ethdo
- Dirk - ethdo
- Web3Signer u otro firmador propietario - script/herramienta personalizada.

3. Enviar los mensajes:

- ethdo puede hacerlo directamente en el paso anterior omitiendo el argumento `--json`.
- Enviar manualmente al Nodo de Consenso: [Documentación de la API](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolVoluntaryExit)