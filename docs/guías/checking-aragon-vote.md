# Verificación del script EVM desde el voto de Aragon

Hemos publicado un breve replit con las partes del script que usamos para preparar los votos: [EVMVoteScriptParser#main.py](https://replit.com/@VictorSuzdalev/EVMVoteScriptParser#main.py)

## Verificación del script EVM

1. Iniciar replit.
    
    ![](https://user-images.githubusercontent.com/4445523/149335803-4b7c71e2-12a1-4c48-973c-c064ffa4d0a7.jpeg)
    1. Abre el [script replit](https://replit.com/@VictorSuzdalev/EVMVoteScriptParser#main.py).
    2. Haz clic en el gran botón verde `RUN` en la parte superior.
    3. El script comenzará a instalar las dependencias, esto tomará un par de minutos.

2. Obtener el script EVM del voto.

    ![](https://user-images.githubusercontent.com/4445523/149335811-1332324b-b1ba-4e4a-af2e-9c79c347ff43.jpeg)
    1. Abre el contrato de votación en Etherscan [0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract](https://etherscan.io/address/0x2e59A20f205bB85a89C53f1936454680651E618e#readProxyContract) (puedes verificar la dirección del contrato de votación en [Contratos Desplegados](/deployed-contracts/#dao-contracts)).
    2. Revisa el método `getVote` (sexto en la lista): ingresa el voto en cuestión y presiona `query`.
    3. Copia el texto del `script` (una cadena larga que comienza con 0x).

3. Verificar el script.

    1. Vuelve a replit y espera a que termine la configuración.
    2. El replit te pedirá el script EVM; pega el texto de Etherscan y presiona `enter` para ver las acciones en el script.

    ![](https://user-images.githubusercontent.com/4445523/149335822-1bdc0c66-18f0-43c3-b2cf-124f3706ae36.png)
    ![](https://user-images.githubusercontent.com/4445523/149335833-3701273a-cb7a-4076-91c7-93cde4d2db4c.png)

¡Eso es todo! 💪🎉🏝

## Cómo verificar el propio replit

- Se pueden comparar los resultados del análisis para votos ya aprobados con las descripciones en la interfaz de usuario de votación ([voto #172](https://vote.lido.fi/vote/172) puede ser un buen ejemplo).
- El código del replit está disponible bajo el botón `Show files` en la izquierda; está basado en gran medida en los scripts y herramientas del repositorio [scripts](https://github.com/lidofinance/scripts).