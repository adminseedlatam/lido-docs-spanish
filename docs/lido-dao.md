# Lido DAO

Lido DAO es una Organización Autónoma Descentralizada que gestiona los protocolos de staking líquido, decidiendo sobre parámetros clave (por ejemplo, establecer tarifas, asignar operadores de nodos y oráculos, etc.) mediante el poder de voto de los titulares del token de gobernanza (`LDO`). Además, la DAO acumula tarifas de servicio y las gasta en investigación, desarrollo, incentivos de minería de liquidez y mejoras del protocolo.

## ¿Por qué DAO?

La DAO es el compromiso lógico entre la centralización completa y la descentralización, lo que permite el despliegue de productos competitivos sin centralización total y custodia en los intercambios. No creemos que sea posible hacer un protocolo de staking líquido completamente sin confianza en el futuro previsible. Una DAO es una estructura óptima para lanzar Lido porque:

- La DAO es esencialmente una entidad descentralizada, lo que permite un enfoque en la comunidad y podría ofrecer una estructura más consciente socialmente y decisiones consecuentes;
- La DAO podrá cubrir los costos de desarrollar y mejorar el protocolo desde el tesoro de tokens de la DAO.
- Y otras actividades de gestión también si existe la capacidad técnica.

La DAO acumulará tarifas de servicio de Lido, que se canalizarán hacia los fondos de seguro y desarrollo, distribuidos por la DAO.

## Funciones

Lido es gestionado por Lido DAO. Los miembros de la DAO gobiernan Lido para garantizar su eficiencia y estabilidad. Lido DAO debe hacer lo siguiente:
- Construir, desplegar, actualizar y decidir sobre parámetros clave de los protocolos de staking líquido, aprobar incentivos para las partes que contribuyan a los objetivos de la DAO.
- Gestión de operadores de nodos. Asignar operadores de nodos iniciales aprobados por la DAO, buscar y calificar nuevos operadores de nodos y penalizar a los existentes que sean sancionados según las reglas de las cadenas.
- Aprobar subvenciones LEGO para apoyar diferentes investigaciones e iniciativas de los gremios del protocolo.
- Pagos a colaboradores a tiempo completo y otras tareas operativas.
- Programa de recompensas por errores, responder a emergencias.
- Acumulación de tarifas de servicio de Lido, que pueden canalizarse hacia los fondos de seguro y desarrollo, distribuidos por la DAO.

## Gobernanza

El token `LDO` gobierna todas las decisiones de gobernanza y red de Lido DAO para asegurar su estabilidad prolongada y toma de decisiones descentralizada para facilitar el crecimiento de un staking líquido justo y transparente. La dirección del contrato de `LDO` - [`0x5a98fcbea516cf06857215779fd812ca3bef1b32`](https://etherscan.io/address/0x5a98fcbea516cf06857215779fd812ca3bef1b32).

> 📝 Para obtener información más detallada sobre la gobernanza, por favor, visita la página de [Gobernanza](https://lido.fi/governance).

Para tener derecho a voto en Lido DAO y contribuir a la determinación de cualquiera de los temas mencionados anteriormente, se debe poseer el token de gobernanza `LDO`. Tener `LDO` da a los miembros de la DAO un voto en el futuro de Lido, permitiendo que cada miembro de la DAO tenga una opinión personal en la comunidad. El peso del voto de `LDO` es proporcional a la cantidad de `LDO` que un votante posee. Cuanto más `LDO` tenga un usuario en su dirección, mayor será el poder de decisión del votante. El mecanismo exacto de votación de `LDO` puede ser actualizado al igual que las otras aplicaciones de la DAO.

> 📝 Si tienes alguna iniciativa que creas que beneficiará al protocolo Lido, comparte tus ideas en nuestro [foro de gobernanza](https://research.lido.fi).

## Software

Lido DAO es una organización de [Aragon](https://aragon.org/dao). Dado que Aragon proporciona un marco completo de extremo a extremo para construir DAOs, utilizamos sus herramientas estándar.

> 📝 El proceso de gobernanza solo tiene lugar dentro de la red Ethereum. Para otras redes, este proceso se implementa a través de comités y multisig (necesitamos una lista de multisig).

Si bien la aplicación de Aragon es una herramienta poderosa para la gobernanza de la DAO debido a que es transparente y confiable, no es adecuada para gestionar operaciones rutinarias que tienen un fuerte apoyo de los titulares de tokens y/o son solo relevantes para una subsección de la DAO (por ejemplo, el equipo de operaciones financieras). Por esa razón, se desarrolló [Easy Track](https://easytrack.lido.fi/) como un mecanismo eficiente para ayudar con propuestas de gobernanza rutinarias y no controversiales para Lido DAO. Es importante destacar que la flexibilidad y escalabilidad son preocupaciones primordiales durante el desarrollo de Easy Track, con medidas extensivas para asegurar que la seguridad no se haya comprometido por conveniencia.

Las nuevas mociones de Easy Track no solo reducen la fatiga de los votantes y los costos de gas en cadena para los titulares de tokens, sino que también facilitan el crecimiento de la DAO al proporcionar mayor autonomía a los subcomités y operadores de nodos dentro de la organización.