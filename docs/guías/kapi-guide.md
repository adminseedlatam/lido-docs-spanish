# Keys API

API HTTP sencilla para claves y validadores de Lido.

## Requisitos

1. CPU con 2 núcleos
2. RAM de 5 GB
   - Keys-API-DB — 500 MB
   - Keys-API — 4 GB
3. Nodo completo de la EL (Execution Layer)
4. Nodo CL para aplicaciones como Ejector que utilizan la [API de validadores](https://hackmd.io/fv8btyNTTOGLZI6LqYyYIg?view#validators). Para Teku, utilice el modo de archivo. Actualmente, Nimbus no es compatible.

## Variables de Entorno

Se dispone de un ejemplo anotado de variables de entorno en el repositorio:

https://github.com/lidofinance/lido-keys-api/blob/main/sample.env

## Cómo Ejecutar

Para ejecutar `Keys API`, utilice el hash de la imagen de una versión estable, [disponible aquí](https://docs.lido.fi/guías/tooling/).

A continuación, puede encontrar un ejemplo de docker-compose para ejecutar el servicio con una base de datos.

https://github.com/lidofinance/lido-keys-api/blob/main/docker-compose.yml

Para ejecutar utilizando docker-compose:

```bash
docker-compose up
```

Ahora puede acceder a la API en `http://localhost:${PORT}/api`.

## Monitoreo

Las métricas de Prometheus estarán disponibles en el endpoint `http://localhost:${PORT}/metrics`.

Puede encontrar configuraciones y paneles para ejecutar Prometheus y Grafana localmente en el repositorio: [Grafana](https://github.com/lidofinance/lido-keys-api/tree/main/grafana), [Prometheus](https://github.com/lidofinance/lido-keys-api/tree/main/prometheus).

Ejemplo de `docker-compose.yml` con configuración de métricas:

https://github.com/lidofinance/lido-keys-api/blob/main/docker-compose.metrics.yml

## Recursos Adicionales

Repositorio de GitHub de Keys API (Código Abierto)
https://github.com/lidofinance/lido-keys-api

Documentación de la API y lógica interna
https://hackmd.io/@lido/B1aCdW6Lo
