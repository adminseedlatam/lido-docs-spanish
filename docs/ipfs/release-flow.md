# Flujo de Lanzamiento

Lanzar el widget a IPFS implica varios pasos, entre ellos:

1. Crear un archivo de contenido direccionable (archivo CAR) que contenga los archivos necesarios para el funcionamiento del widget.
2. Subir el archivo CAR a la red IPFS utilizando un proveedor de IPFS.
3. Fijar el archivo CAR subido para asegurar su disponibilidad permanente en la red IPFS.

:::note Fijación en IPFS
Por defecto, los nodos de IPFS solo mantienen los datos en su caché durante un tiempo limitado.
Luego, los datos se eliminan mediante un proceso automático de recolección de basura.
Para asegurar que el contenido permanezca disponible en la red IPFS de manera permanente,
debe ser fijado utilizando su Identificador de Contenido (CID).
:::

El poder de GitHub Actions se utiliza para completar y automatizar estos y otros pasos necesarios.

## Flujo de trabajo de GitHub Actions

GitHub Actions ya se ha utilizado para construir y desplegar aplicaciones de Lido, por lo que se decidió adaptarlos para los lanzamientos en IPFS.

El lanzamiento en IPFS ocurre como el siguiente paso después de un lanzamiento regular de la aplicación.

Pero solo las actualizaciones mayores o críticas se lanzan a IPFS debido a las numerosas acciones requeridas para realizar un lanzamiento en IPFS, y también al hecho de que cada nuevo lanzamiento de una aplicación de Lido producirá un nuevo CID y estará disponible en la nueva dirección, lo cual es inconveniente para los usuarios que desean usar siempre la última versión de una aplicación.

El flujo de trabajo desarrollado permite la fijación automática de cualquier aplicación de Lido que esté técnicamente lista para operar en IPFS.
Además, la fijación no se limita a un solo proveedor, sino que se puede realizar en varios proveedores simultáneamente.
Este enfoque busca aprovechar la descentralización, garantizando la accesibilidad al contenido de IPFS desde múltiples proveedores en caso de que uno de ellos falle. Esta configuración también permite pruebas independientes de la interfaz de usuario en varias redes y entornos.

La fijación en IPFS y la preparación de transacciones ENS en el flujo de trabajo son facilitadas por el paquete [Blumen](https://github.com/StauroDEV/blumen), desarrollado en colaboración con Lido.

En cada lanzamiento en IPFS, la verificación del contenido es realizada por contribuyentes de desarrollo y QA de Lido para asegurar que no se agregue contenido inesperado al código durante el proceso de CI.
La verificación se basa en comparaciones de hash, y si lo deseas, también puedes
realizarla utilizando las [instrucciones proporcionadas](hash-verification.md).

Después de la verificación, se inicia el lanzamiento en IPFS, lo que resulta en la adición de la información de fijación obtenida a la [página de lanzamientos](https://github.com/lidofinance/ethereum-staking-widget/releases) de la aplicación.
Los detalles sobre la fijación en IPFS (CID, proveedores de IPFS, puerta de enlace HTTPS, archivos fuente) se adjuntan a la descripción del lanzamiento.

### Pasos del flujo de trabajo

Puedes encontrar el código fuente del flujo de trabajo [en GitHub](https://github.com/lidofinance/actions/blob/main/.github/workflows/ci-ipfs.yml).
El flujo de trabajo realiza los siguientes pasos:

- Recuperar los secretos necesarios, etiquetas y los archivos de compilación de la aplicación.
- Obtener información sobre la fecha y el hash de commit de la etiqueta.
- Ejecutar el script [Blumen](https://github.com/StauroDEV/blumen) para realizar la fijación en IPFS.
- Crear artefactos para adjuntar al lanzamiento.
- Buscar un lanzamiento existente en GitHub basado en la etiqueta proporcionada para modificar la descripción.
- Generar y modificar la descripción existente del lanzamiento.