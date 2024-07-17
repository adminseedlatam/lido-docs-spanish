# Seguridad

### Nodos RPC

La compilación de IPFS utiliza variables de entorno no secretas, ya que todo el contenido de IPFS debe ser accesible para todos.
Por lo tanto, el widget utiliza nodos RPC públicos para atender las solicitudes RPC. Los usuarios son notificados explícitamente sobre este hecho en la interfaz de usuario, permitiéndoles la opción de especificar los nodos RPC necesarios en la página de configuración. La configuración de los nodos RPC se almacenará en el localStorage del navegador y se usará para visitas posteriores al mismo gateway de IPFS.

### Posible fuga de localStorage

:::warning
La información a continuación podría afectar gravemente su experiencia con las aplicaciones de IPFS.
:::

Los widgets de Lido utilizan el localStorage de su navegador para almacenar algunas configuraciones de la interfaz de usuario y las URLs de los nodos RPC.
Si está utilizando un gateway de IPFS, que hace referencia al hash CID como parte de la ruta de la URL (por ejemplo, `{GATEWAY_DOMAIN}/ipfs/{HASH}`),
en lugar del subdominio (por ejemplo, `{HASH}.{GATEWAY}`), entonces otros sitios web accedidos desde el mismo gateway de IPFS pueden potencialmente ver o editar sus configuraciones, ya que localStorage permanece igual para el mismo dominio.

Para evitar esta posibilidad, se sugiere utilizar la URL del gateway de IPFS, adjunta a la descripción del lanzamiento de IPFS, vea [instrucciones](about.md#dónde-obtener-cid-y-la-dirección-de-la-puerta-de-enlace). El gateway ofrecido utiliza el formato de subdominio.

### Enrutamiento

Debido a que los gateways de IPFS no sirven automáticamente `/index.html` como se espera en muchas aplicaciones de una sola página,
la interfaz de Lido utiliza un enrutamiento basado en hash.