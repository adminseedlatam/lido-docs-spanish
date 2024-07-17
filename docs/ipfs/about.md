# Acerca de IPFS

IPFS (InterPlanetary File System) es un conjunto de protocolos para publicar datos (archivos, directorios, sitios web, etc.) de manera descentralizada.
Para más información, consulta [¿Qué es IPFS?](https://docs.ipfs.tech/concepts/what-is-ipfs/).

Existe la opción de usar algunas interfaces de Lido a través de IPFS, por ejemplo, [Lido Ethereum Staking Widget](https://github.com/lidofinance/ethereum-staking-widget).

#### IPFS se usa para las aplicaciones de Lido porque:

- IPFS no tiene un único punto de fallo. La falla de uno o incluso varios nodos en la red no afecta el funcionamiento de toda la red.
- IPFS es descentralizado, lo que lo hace más resistente que los sistemas tradicionales.
- IPFS utiliza hashes criptográficos para verificar la autenticidad e integridad de los archivos, dificultando que actores maliciosos afecten los archivos.

## Dirección

### ¿Qué es un CID?

Un identificador de contenido, o CID, es una etiqueta utilizada para señalar material en IPFS. Los CID se basan en el hash criptográfico del contenido. Cualquier diferencia en el contenido producirá un CID diferente. Ten en cuenta que los CID no coinciden con los hashes de archivos (sumas de verificación), porque el CID contiene información adicional que el hash no tiene (es decir, el códec de los datos).

### Puertas de enlace HTTP de IPFS

Una puerta de enlace IPFS es un servicio basado en la web que obtiene contenido de una red IPFS y lo hace disponible a través del protocolo HTTP que todos los navegadores web entienden. Una dirección de puerta de enlace puede verse así: `https://{CID}.ipfs.cf-ipfs.com`. Puedes usar la puerta de enlace disponible de [tu elección](security.md#posible-fuga-de-localstorage). Verifica la disponibilidad de la puerta de enlace [aquí](https://ipfs.github.io/public-gateway-checker/).

### Dónde obtener CID y la dirección de la puerta de enlace

:::info
Cada nuevo conjunto de cambios en una aplicación de Lido producirá un nuevo CID, por lo tanto, cada versión estará disponible en su dirección específica.
Esto significa que para una aplicación de Lido, **no habrá una dirección de puerta de enlace que siempre apunte a la versión más reciente**.
La puerta de enlace que estés usando actualmente puede apuntar a la versión más actualizada, pero permanecerá así hasta que ocurra una nueva versión en IPFS.
Después de abrir una aplicación de Lido, esta verificará automáticamente si la versión de la aplicación es la más reciente. Si no lo es, el usuario será notificado y se le pedirá que use la última versión.
:::

#### Página de lanzamientos en GitHub

La información sobre el último lanzamiento está disponible en GitHub en la página de lanzamientos del repositorio de la aplicación. Para Ethereum Staking Widget, está [aquí](https://github.com/lidofinance/ethereum-staking-widget/releases).
Usando esta página, se puede encontrar la información sobre el último lanzamiento, incluidos los artefactos de fijación en IPFS.

:::info
Ten en cuenta que no todos los lanzamientos están fijados en IPFS, consulta [Frecuencia de lanzamiento](#frecuencia-de-lanzamiento).
:::

#### Página de acciones en GitHub

Puedes obtener esta información desde la última acción de GitHub en la que ocurrió la fijación en IPFS:

1. Abre el repositorio de la aplicación, sigue la pestaña "Actions".
2. En el lado izquierdo, en la barra de navegación, encuentra el flujo de trabajo para los lanzamientos de IPFS; para el Ethereum Staking Widget se llama "[IPFS Release](https://github.com/lidofinance/ethereum-staking-widget/actions/workflows/ci-ipfs.yml)".
3. Abre el último flujo de trabajo exitoso y busca el título "ipfs-pinning". Allí encontrarás un CID raíz y un enlace a una puerta de enlace HTTP de IPFS.

#### IPFS.json

Existe una convención para almacenar el último CID de una aplicación en el archivo `IPFS.json` en la raíz del proyecto.

:::info
Esta solución podría no ser la definitiva, sirve para fines de desarrollo y está sujeta a cambios en el futuro. Los planes futuros son reemplazar el registro del último CID por uno que viva en la cadena y se actualice a través de la gobernanza de Lido DAO.
:::

### Frecuencia de lanzamiento

No todos los nuevos lanzamientos de aplicaciones de Lido se desplegarán en IPFS; solo se desplegarán los lanzamientos principales o las correcciones críticas.
Por lo tanto, la cadencia de despliegue no debería ser demasiado frecuente.
Este enfoque se prefiere debido a las numerosas acciones requeridas para realizar un lanzamiento en IPFS, y también al hecho de que cada nuevo lanzamiento de una aplicación de Lido producirá un nuevo CID y estará disponible en una nueva dirección, lo cual es inconveniente para los usuarios que desean usar siempre la última versión de una aplicación.

## Lecturas adicionales

- [Flujo de lanzamiento](release-flow.md)
- [Seguridad](security.md)
- [Verificación de hashes](hash-verification.md)
- [Lista de aplicaciones IPFS](apps-list.md)