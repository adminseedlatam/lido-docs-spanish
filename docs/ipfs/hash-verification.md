# Verificación de hash

Es posible que desee verificar la autenticidad e integridad de la aplicación desplegada en IPFS. Esto se puede hacer verificando el CID (hash). Para hacerlo, necesitará descargar el código fuente de la aplicación y compilarlo localmente. A continuación, se detallan las instrucciones paso a paso.

## Pasos

:::info
Tomaremos como ejemplo el [Lido Ethereum Staking Widget](https://github.com/lidofinance/ethereum-staking-widget).
:::

### Requisitos previos

Debe tener instaladas estas herramientas en su sistema:

- Node.js 20+
- Gestor de paquetes Yarn v1 (classic)

Alternativamente, puede usar Docker para configurar un entorno de compilación. Lea las secciones a continuación para obtener las instrucciones.

### 1. Clonar el repositorio

El repositorio para Ethereum Staking Widget se encuentra aquí: [https://github.com/lidofinance/ethereum-staking-widget](https://github.com/lidofinance/ethereum-staking-widget)

### 2. Hacer checkout del commit que coincida con la versión de IPFS

Debe hacer `git checkout` del commit específico que coincida con el lanzamiento de la aplicación que desea verificar. De esta manera, puede asegurarse de que la aplicación no incluya otros cambios que afecten al CID.

#### Método 1 – Usando etiquetas de git

Cada versión lanzada tiene su propia etiqueta git, que puede utilizar para hacer checkout.

1. Abra la aplicación en su navegador y verifique el lado derecho de su pie de página.
   Allí encontrará un número de versión, que en realidad es un enlace a la página de Releases en GitHub.
2. Ejecute `git fetch --all --tags --prune` para obtener todas las etiquetas.
3. Ejecute `git checkout tags/<version>`, donde `<version>` es la versión obtenida en el paso 1.

#### Método 2 – Búsqueda en la página de Releases de GitHub

1. Abra la página de Releases del repositorio del proyecto en GitHub. Para Ethereum Staking Widget es [aquí](https://github.com/lidofinance/ethereum-staking-widget/releases).
2. Busque manualmente el último lanzamiento donde se realizó el pinning a IPFS.
3. Busque el hash del commit cerca de la información del lanzamiento.
4. Ejecute `git checkout <hash>`, donde `<hash>` es el hash del commit obtenido en el paso anterior.

### 3. Configurar el proyecto

#### Sin Docker

1. Agregue las variables de entorno según las instrucciones en el README.
2. Elimine el directorio `node_modules` si el proyecto ya estaba configurado anteriormente.
3. Instale los módulos de Node usando `yarn install --frozen-lockfile`.
4. Siga otras instrucciones descritas en el README del proyecto.

#### Usando Docker

Si tiene problemas para configurar el entorno o si es su preferencia,
puede usar Docker para configurar y compilar el proyecto.

<details>
<summary>
**Pasos para Docker**
</summary>
<div>
1. Configure `build-info.json` como se indica en [este paso](hash-verification.md#4-configurar-build-infojson).
2. Cree el archivo `verification.Dockerfile` en la raíz del proyecto con el siguiente contenido:

```
# entorno de compilación
FROM node:20-alpine as build

WORKDIR /app

RUN apk add --no-cache git=~2
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive --ignore-scripts && yarn cache clean

COPY . .
RUN NODE_NO_BUILD_DYNAMICS=true yarn typechain && yarn build-ipfs
# public/runtime se utiliza para inyectar vars en tiempo de ejecución; debería existir y el usuario node debería tener acceso de escritura para ello
RUN rm -rf /app/public/runtime && mkdir /app/public/runtime && chown node /app/public/runtime

# imagen final
FROM node:20-alpine as base

WORKDIR /app
RUN apk add --no-cache curl=~8
COPY --from=build /app /app
```

3. Agregue las variables de entorno según las instrucciones en el README del proyecto.
4. Ejecute estos comandos:

```
docker build --no-cache -t verification:0 -f verification.Dockerfile .
docker create --name verification-container verification:0
docker cp verification-container:/app/out /Users/${Name}/${Path-to-project}/dockerbuild-verification
docker rm verification-container
```

5. Siga los pasos adicionales desde el [paso 6](hash-verification.md#6-crear-un-archivo-car-y-obtener-su-cid-hash) de estas instrucciones.
</div>
</details>

### 4. Configurar build-info.json

El archivo `build-info.json` se encuentra en la raíz del proyecto, [aquí está el enlace](https://github.com/lidofinance/ethereum-staking-widget/blob/develop/build-info.json).
Debe contener información sobre la versión de la aplicación que actualmente está desplegada en IPFS.
Puede obtener esta información de la última acción de GitHub en la que se realizó el pinning a IPFS:

1. Abra el repositorio de la aplicación, vaya a la pestaña "Actions".
2. En el lado izquierdo, en la navegación, busque el flujo de trabajo para el lanzamiento de IPFS, para el Ethereum Staking Widget se llama "[IPFS Release](https://github.com/lidofinance/ethereum-staking-widget/actions/workflows/ci-ipfs.yml)".
3. Abra el último flujo de trabajo exitoso y busque el título "prepare-for-ipfs summary" o los datos JSON que se ven así:
   ```json
   { "branch": "main", "commit": "56ab68d", "version": "0.0.1" }
   ```
4. Copie los datos a su `build-info.json` local.

### 5. Compilar la versión de IPFS

Ejecute un script npm adecuado para compilar la versión de IPFS.  
En el caso del Ethereum Staking Widget, es `yarn build-ipfs`.

### 6. Crear un archivo CAR y obtener su CID (hash)

Para aplicaciones Next.js, los archivos de compilación estarán en el directorio `out`.
El siguiente comando genera un archivo CAR a partir del directorio `out` con los archivos de compilación, y mostrará el hash IPFS en la consola:

```
npx ipfs-car pack ./out --output ./out.car
```

### 7. Obtener el CID (hash) de la aplicación desplegada en IPFS

Necesitará obtener el hash del archivo CAR más recientemente lanzado.  
Puede encontrarlo en la página de Releases del repositorio bajo el bloque "Assets" colapsable.
Descargue el archivo CAR y ejecute el siguiente comando:

```
npx ipfs-car roots ipfs_source_code.car
```

Esto mostrará las raíces CID encontradas en el encabezado del CAR. El CID (hash) debe ser el mismo que en el paso anterior.