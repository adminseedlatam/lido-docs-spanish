# Advertencias de stETH en AAVE

### Flashloans

El protocolo AAVE permite el préstamo de cualquier token a través de flashloans, independientemente de si el préstamo está habilitado o no para el token específico. Cualquier usuario puede pedir prestado stETH en AAVE mediante un flashloan.  
Debido a las mecánicas internas de stETH necesarias para el soporte de rebase, en la mayoría de los casos las transferencias de stETH se realizan por el valor de 1 wei menos que el valor pasado al método `transfer`. Esto podría causar problemas al devolver un flashloan, con la transacción revirtiendo con el error `SafeERC20: low-level call failed`.

### Soluciones alternativas

Existen dos soluciones alternativas:

- Tener al menos 1 wei más de stETH del necesario para cerrar el flashloan. En este caso, la cantidad de stETH transferida será igual o 1 wei mayor que la cantidad prestada.
- Si no es posible dejar un wei extra por alguna razón, se debe verificar si la cantidad a transferir coincide realmente con la cantidad prestada antes de tiempo. Esto se puede hacer utilizando la siguiente fórmula:
  ```
  uint256 exactTransferedAmount = StETH.getPooledEthByShares(StETH.getSharesByPooledEth(amount))
  ```

### ¿Por qué ocurre esto?

Los rebase diarios de stETH se implementan mediante `shares`, que es la unidad básica que representa la participación del titular de stETH en la cantidad total de ether controlada por el protocolo Lido.
Debido al redondeo matemático hacia abajo, es común que no se pueda transferir todo el saldo de stETH de una cuenta, dejando 1 wei en la cuenta del remitente. Esto sucede porque el último wei es inferior a 1 share y se redondea a cero en la transferencia.

### Depósitos

Cuando se deposita stETH en el pool de préstamos en AAVE, la siguiente declaración se considera correcta:  
"En cualquier momento, un usuario puede depositar X stETH para emitir X astETH. El suministro total de astETH aumenta en X."
De hecho, la cantidad real de astETH emitidos puede ser menor o igual a X debido a la división doble de enteros (en la tasa de rebase del token stETH y la tasa de interés de AAVE). Sin embargo, el error de redondeo real no se espera que exceda un par de wei en cualquier momento. Mientras tanto, el evento emitido reportará la cantidad inicialmente depositada completa.

#### Ejemplo de depósito

En este [caso de depósito](https://etherscan.io/tx/0xd599641193da40080f3effa175874624f49a8efd6f5b748abd8bc7950fc270f0) podemos ver que se depositaron 369 stETH en el pool de préstamos stETH de AAVE. Pero de hecho, se transfirieron 368.999999999999999999 stETH desde el remitente y se emitieron 368.999999999999999998 astETH en la dirección del remitente. Sin embargo, los eventos reportaron exactamente 369 stETH transferidos y 369 astETH emitidos.
