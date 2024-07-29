# Introducción

La actualización del protocolo [Lido V2](https://blog.lido.fi/introducing-lido-v2/) añade soporte para [Retiros de Ethereum](https://ethereum.org/en/staking/withdrawals/) e introduce responsabilidades adicionales para los Operadores de Nodo de Lido.

Los retiros de Lido ocurren en cuatro etapas:

1. Los poseedores de stETH solicitan un retiro.
2. Los Oráculos de Lido deciden qué validadores de Lido deben ser retirados para cumplir con la solicitud y publican la lista en la cadena.
3. Los Operadores de Nodo de Lido retiran estos validadores.
4. Los poseedores de stETH reclaman su ETH.

Esto significa que los Operadores de Nodo necesitan una manera de reaccionar rápidamente a las solicitudes del protocolo.

El método sugerido es generar y firmar mensajes de salida anticipadamente, los cuales serán enviados cuando sea necesario por un nuevo daemon especial llamado "Validator Ejector".

Para entender para qué validadores generar y firmar mensajes de salida, se introduce otra nueva aplicación llamada "Keys API".

## Requisitos

¿Es necesario ejecutar herramientas de Lido?

No es necesario utilizar las herramientas de Lido, pero se recomienda hacerlo.

El único requisito para los Operadores de Nodo es retirar sus validadores a tiempo después de que lo solicite el protocolo.

Para más detalles, consulta la [Política de Salida de Validadores](https://hackmd.io/@lido/HJYFjmf6s) y la [Discusión del Foro de Investigación](https://research.lido.fi/t/lido-validator-exits-policy-draft-for-discussion).

## Herramientas de Lido

### Keys API (KAPI)

KAPI es un servicio que almacena y proporciona información actualizada sobre los validadores de Lido.

Proporciona una función muy importante: ofrece dos endpoints mediante los cuales un Operador de Nodo puede entender para qué validadores generar y firmar mensajes de salida con anticipación.

Bajo la capucha, KAPI también filtra automáticamente los validadores que ya han sido retirados o que están actualmente en proceso de retirada.

### Validator Ejector (Ejector)

Ejector es un servicio daemon que monitorea los eventos de `ValidatorsExitBusOracle` e inicia un retiro cuando sea necesario.

En el modo de mensajes, al iniciarse, carga los mensajes de salida en forma de archivos individuales .json desde una carpeta especificada o un almacenamiento externo, y valida su formato, estructura y firma.

Luego, carga eventos de una cantidad configurable de bloques finalizados más recientes, verifica si deben realizarse salidas y después periódicamente obtiene eventos frescos.

En el modo de webhook, simplemente obtiene un punto final remoto cuando se debe realizar un retiro, permitiendo implementar un enfoque JIT (Just In Time) descargando la lógica de salida a un servicio externo y utilizando Ejector como lector seguro de eventos de salida.
