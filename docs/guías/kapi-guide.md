# Keys API

El Keys API proporciona una API HTTP sencilla para gestionar claves y validadores de Lido.

## Requisitos

1. **Hardware:**
   - CPU de 2 núcleos
   - 5 GB de RAM
     - Keys-API-DB — 500 MB
     - Keys-API — 4 GB

2. **Nodos:**
   - Nodo completo de EL
   - Nodo CL para aplicaciones (por ejemplo, Ejector) que utilizan la [API de validadores](https://hackmd.io/fv8btyNTTOGLZI6LqYyYIg?view#validators). Para Teku, se recomienda el modo de archivo. Actualmente, Nimbus no es compatible.

## Variables de entorno

Para configurar las variables de entorno necesarias para el Keys API, consulta el ejemplo anotado proporcionado en el repositorio:

[Ejemplo de Variables de Entorno](https://github.com/lidofinance/lido-keys-api/blob/main/sample.env)

## Cómo ejecutar

### Usando Docker

Para ejecutar Keys API con el hash de la imagen de una versión estable, consulta el hash disponible [aquí](https://docs.lido.fi/guías/tooling/).

Una forma típica de iniciar el servicio con una base de datos usando `docker-compose` es la siguiente:

1. Crea un archivo `docker-compose.yml` similar al ejemplo proporcionado en el repositorio:

   [Ejemplo de docker-compose.yml](https://github.com/lidofinance/lido-keys-api/blob/main/docker-compose.yml)

2. Ejecuta el siguiente comando en tu terminal:

   ```bash
   docker-compose up
   ```

3. Después de iniciar, la API estará accesible en `http://localhost:${PORT}/api`, donde `${PORT}` es el puerto configurado.

## Monitoreo

Se encuentran disponibles métricas de Prometheus para monitorear Keys API. Puedes acceder a ellas en el endpoint:

- `http://localhost:${PORT}/metrics`

Para la configuración local de Prometheus y Grafana, se proporcionan archivos de configuración y paneles en el repositorio:

- [Configuración de Grafana](https://github.com/lidofinance/lido-keys-api/tree/main/grafana)
- [Configuración de Prometheus](https://github.com/lidofinance/lido-keys-api/tree/main/prometheus)

