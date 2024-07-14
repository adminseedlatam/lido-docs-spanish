# Cómo verificar que el multisig es uno de Gnosis

Los contratos multisig de Gnosis generalmente se despliegan desde los contratos de la fábrica de Gnosis. Gnosis tiene una lista de direcciones de contratos `proxy_factory` desplegados en diferentes redes — https://github.com/safe-global/safe-deployments/tree/main/src/assets

## Cómo verificar que mi multisig se desplegó desde la fábrica de Gnosis

1. Selecciona la versión del contrato en la interfaz de usuario de Gnosis (configuración -> detalles del safe) — suelen ser `1.0.0`, `1.1.1`, `1.2.0` o `1.3.0`.
2. Abre la dirección del safe en el explorador de la red.
3. Encuentra la transacción de creación del safe (debería ser la más antigua en la pestaña de "Transacciones Internas" y tener la nota "Creación de Contrato").
4. Obtén la dirección a la que fue la transacción de creación del safe — debería ser un contrato de la fábrica.
5. Abre la carpeta correspondiente a la versión en GitHub https://github.com/safe-global/safe-deployments/tree/main/src/assets, abre el archivo `proxy_factory.json` y encuentra la dirección en la lista de direcciones desplegadas.