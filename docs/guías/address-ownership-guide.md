# Verificación de propiedad de dirección para operaciones del Lido DAO

El uso de una cuenta externa (EOA) en las operaciones del Lido DAO o contratos del protocolo requiere proporcionar una "prueba de propiedad" pública. Los principales casos de uso son utilizar la dirección como firmante en las multisigs del Lido DAO o usar EOAs para herramientas fuera de la cadena donde se pueden requerir derechos específicos.

## Preparación y compartición de dirección y firma

### En caso de usar una cuenta externa (EOA)

1. Firma el mensaje con algo como `@my_social_handle is looking to join X Lido DAO multisig with address 0x...` con la clave privada que estás buscando usar como clave de firma. Una de las opciones es usar la interfaz web de MyEtherWallet:
   1. Conecta tu billetera a https://www.myetherwallet.com/wallet/access.
   2. Ve a https://www.myetherwallet.com/wallet/sign (el enlace de la interfaz está bajo el desplegable "Message" a la izquierda).
   3. Ingresa el mensaje, haz clic en "sign" y firma el mensaje en la billetera.
   4. El campo `sig` en el resultado json es el hash de la firma.
2. Publica el mensaje junto con el hash de la firma en Twitter u otra red social fácilmente accesible.
3. Comparte el enlace a la publicación como un comentario en la publicación relevante del [foro de Lido DAO](https://research.lido.fi).
4. Asegúrate de seguir las [reglas generales](./multisig-signer-manual) para ser un firmante en las multisigs del Lido DAO.

### En caso de usar Safe multisig

1. En la pantalla principal de tu billetera multisig en https://app.safe.global, presiona el botón "New transaction" y selecciona "Contract interaction" en la pantalla que aparece.
2. En la pantalla de Nueva Transacción, activa el interruptor "Custom data".
3. Ingresa cualquier dirección EOA (por ejemplo `0x0000000000000000000000000000000000000000`) en el campo "Enter Address or ENS Name".
4. Usa cualquier codificador hexadecimal (como https://www.duplichecker.com/hex-to-text.php) para codificar un mensaje que consista en información sobre quién se une a qué comité o multisig del Lido con qué dirección, por ejemplo, `@mi_manejo_social está buscando unirse a X multisig del Lido DAO con la dirección 0x...`.
5. Pega el código generado en el paso anterior en el campo "Data (Hex encoded)" de la pantalla de Nueva Transacción en la interfaz multisig (agrega "0x" al inicio del código HEX si falta), pon "0" en el campo de valor ETH.
6. Publica el mensaje junto con el hash de la transacción en Twitter u otra red social fácilmente accesible.
7. Comparte el hash de la transacción en la publicación como un comentario en la publicación relevante del [foro del Lido DAO](https://research.lido.fi).

## Verificación de la firma de Ethereum

### En caso de usar EOA

Para verificar la firma compartida, se puede usar las interfaces de Etherscan o MyEtherWallet.

### Interfaz de Etherscan

1. Ve a https://etherscan.io/verifiedSignatures.
2. Haz clic en el botón `Verify Signature`.
3. Ingresa los datos de la dirección, el mensaje y el hash de la firma y haz clic en `Continue`.
4. Verifica si la firma proporcionada es válida.

### MyEtherWallet

1. Ve a https://www.myetherwallet.com/tools?tool=verify.
2. Codifica el texto del mensaje como una cadena hexadecimal (usa una herramienta como https://appdevtools.com/text-hex-converter).
3. Ingresa el json y haz clic en `Verify`:
   ```
   {
     "address": "0x...",
     "msg": "0x...",
     "sig": "signature_hash"
   }
   ```
   Nota que "msg" es texto hexadecimal que comienza con `0x` (agrega `0x` antes de la cadena codificada en hexadecimal si es necesario).
4. Verifica si la firma proporcionada es válida.

### Publicación de la firma en Etherscan

1. Ve a https://etherscan.io/verifiedSignatures y haz clic en "Verify Signature".
2. Ingresa la dirección, el mensaje en texto plano (no la versión hexadecimal que MyEtherWallet dará) y la firma (con el prefijo `0x`), elige la opción "Verify & publish" y haz clic en "Continue".
3. Después de que se verifique la firma, obtendrás el enlace para compartir.

### En caso de usar Safe multisig

1. Ve a la transacción firmada en [Etherscan](https://etherscan.io/).
2. Haz clic para mostrar más detalles y encuentra el campo "input Data", haz clic en "Decode input data".
3. Copia el código hexadecimal en la fila "data" y llévalo a cualquier decodificador hexadecimal (como [duplichecker](https://www.duplichecker.com/hex-to-text.php)).
4. Decodifica y verifica el mensaje (ten en cuenta que es posible que necesites eliminar el `0x` inicial del código hexadecimal obtenido en el paso anterior).
