# **Opción 1: “Juego de cartas UNO”**

El objetivo de este proyecto es desarrollar una versión digital del popular juego de cartas "UNO". La aplicación debería permitir que varios jugadores se unan a una sesión de juego y jueguen entre sí según las reglas de UNO.

## **1. Implementar operaciones CRUD para la gestión de jugadores.**

## **Descripción:**

Se deben implementar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de jugadores en el sistema. Esto incluye la capacidad de crear nuevos jugadores, recuperar información de jugadores existentes, actualizar los detalles de un jugador y eliminar jugadores del sistema.

Ejemplo JSON de entrada:

![week2-1.png](https://lms.jala.university/courses/208/files/35236/preview)

Ejemplo JSON de salida (Creación exitosa):

![week2-2.png](https://lms.jala.university/courses/208/files/35237/preview)

URI tentativa:

### Create: /api/players

### Read: /api/players/:id

### Update: /api/players/:id

### Delete: /api/players/:id

## 2. Implementar operaciones CRUD para administrar juegos.

## Descripción:

Se deben implementar operaciones CRUD para administrar juegos en el sistema. Esto incluye la capacidad de crear nuevos juegos, recuperar información de juegos existentes, actualizar los detalles de un juego y eliminar juegos del sistema.

Ejemplo JSON de entrada:

![week2-3.png](https://lms.jala.university/courses/208/files/35234/preview)

Ejemplo JSON de salida (Creación exitosa):

![week2-4.png](https://lms.jala.university/courses/208/files/35114/preview)

URI tentativa:

### Create: /api/games

### Read: /api/games/:id

### Update: /api/games/:id

### Delete: /api/games/:id

## 3. Implementar operaciones CRUD para administrar tarjetas.

## Descripción:

Se deben implementar operaciones CRUD para administrar tarjetas en el sistema. Las tarjetas deben ser inicializadas o creadas automáticamente al iniciarlas por primera vez.

Ejemplo JSON de entrada:

![week2-5.png](https://lms.jala.university/courses/208/files/35115/preview)

Ejemplo JSON de salida (Creación exitosa):

![week2-6.png](https://lms.jala.university/courses/208/files/35116/preview)

URI tentativa:

### Create: /api/cards

### Read: /api/cards/:id

### Update: /api/cards/:id

### Delete: /api/cards/:id

## 4. Implementar operaciones CRUD para la gestión de Scores históricos.

## Descripción:

Se deben implementar operaciones CRUD para la gestión de Scores históricos en el sistema. Esto implica registrar, recuperar, actualizar y eliminar scores históricos de jugadores.

Ejemplo JSON de entrada:

![week2-7and8.png](https://lms.jala.university/courses/208/files/35117/preview)

Ejemplo JSON de salida (Creación exitosa):

![week2-9.png](https://lms.jala.university/courses/208/files/35118/preview)

URI tentativa:

### Create: /api/scores

### Read: /api/scores/:id

### Update: /api/scores/:id

### Delete: /api/scores/:id

## 5. Implementar una arquitectura de tres capas.

## Descripción:

Se debe implementar una arquitectura de tres capas, que incluya la presentación, la lógica de negocios y el acceso a datos. Cada capa debe estar separada y modularizada para facilitar la escalabilidad y mantenibilidad del sistema.

## 6. ORM: Utilizar una biblioteca de mapeo relacional de objetos.

## Descripción:

Se debe utilizar una biblioteca de mapeo relacional de objetos (ORM) como Sequelize o TypeORM para interactuar con la base de datos. Esto simplificará la interacción con la base de datos y proporcionará un modelo de datos consistente.

## 7. Requisitos de la base de datos.

## Descripción:

Se puede utilizar una base de datos relacional o una base de datos documental para almacenar datos del usuario e información de la sesión del juego. La elección de la base de datos dependerá de los requisitos específicos del proyecto y las preferencias del equipo.

## 8. Crear una colección Postman con solicitudes de muestra.

## Descripción:

Se debe crear una colección de Postman que contenga solicitudes de muestra para cada punto final de la API. Esto permitirá probar y validar la funcionalidad del backend de manera fácil y eficiente.


Implementación completa y correcta de todas las operaciones CRUD, sin errores
Separación clara y modularidad eficiente entre capas
Uso efectivo de Postman para probar todas las rutas del backend, con resultados consistentes y correctos
Utilización correcta y efectiva de la base de datos, con una configuración adecuada y manipulación correcta de los datos del juego

## 1. Registrar un nuevo usuario:

## Descripción de la lógica:

Al registrar un nuevo usuario, se recibe un JSON con los datos del usuario (como nombre de usuario, correo electrónico y contraseña). Se verifica si el usuario ya existe en la base de datos. Si no existe, se crea un nuevo usuario con los datos proporcionados y se devuelve un JSON de confirmación. Si el usuario ya existe, se devuelve un JSON de error indicando que el usuario ya está registrado.

JSON de entrada (Tentativo):

|                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {  <br>       "username": "example_user", <br>	   "name" : "example_name"<br>       "email": "example@example.com",  <br>       "password": "password123"  <br>     } |
|                                                                                                                                                                       |

JSON de salida (éxito):

|   |
|---|
|{<br><br>       "message": "User registered successfully"<br><br>     }|

JSON de salida (error):

|   |
|---|
|{<br><br>       "error": "User already exists"<br><br>     }|

## 2. Iniciar sesión:

## Descripción de la lógica:

 Al iniciar sesión, se recibe un JSON con las credenciales del usuario (nombre de usuario y contraseña). Se verifica si las credenciales son válidas. Si lo son, se inicia sesión y se devuelve un token de acceso. Si las credenciales no son válidas, se devuelve un JSON de error.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "username": "example_user",<br><br>       "password": "password123"<br><br>     }|

JSON de salida (éxito):

|   |
|---|
|{<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lk "<br><br>     }|

JSON de salida (error):

|   |
|---|
|{<br><br>       "error": "Invalid credentials"<br><br>     }|

## 3. Cerrar sesión:

## Descripción de la lógica:

Al cerrar sesión, se recibe un token de acceso válido. Se invalida el token de acceso y se devuelve un JSON de confirmación.

JSON de salida (Tentativo):

|                                                                         |
| ----------------------------------------------------------------------- |
| {<br><br>       "message": "User logged out successfully"<br><br>     } |

## 4. Obtener el perfil de usuario:

## Descripción de la lógica:

 Al obtener el perfil de usuario, se recibe un token de acceso válido. Se utiliza el token para identificar al usuario y se devuelve un JSON con la información del perfil del usuario.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp "<br><br>     }|

JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "username": "example_user",<br><br>       "email": "example@example.com"<br><br>     }|

## 5. Crear un nuevo juego:

## Descripción de la lógica:

 Al crear un nuevo juego, se recibe un JSON con la información del juego (como nombre, reglas, etc.). Se crea un nuevo juego en la base de datos y se devuelve un JSON de confirmación con el ID del juego.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "name": "Example Game",<br><br>       "rules": "Some rules for the game..."<br><br>     }|

JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "message": "Game created successfully",<br><br>       "game_id": 12345<br><br>     }|

## 6. Unirse a un juego existente:

## Descripción de la lógica:

Al unirse a un juego existente, se recibe un JSON con el ID del juego y el token de acceso del usuario que desea unirse al juego. Se verifica si el juego existe y si el usuario no está ya en el juego. Si es así, se agrega al usuario al juego y se devuelve un JSON de confirmación.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "game_id": 12345,<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI "<br><br>     }|

JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "message": "User joined the game successfully"<br><br>     }|

## 7. Iniciar un juego cuando todos los jugadores estén listos:

## Descripción de la lógica:

 Al iniciar un juego cuando todos los jugadores están listos, se recibe un JSON con el ID del juego y el token de acceso del usuario que desea iniciar el juego. Se verifica si todos los jugadores están listos y si el usuario que desea iniciar el juego es el creador del juego. Si es así, se inicia el juego y se devuelve un JSON de confirmación.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "game_id": 12345,<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey "<br><br>     }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "message": "Game started successfully"<br><br>     }|

## 8. Abandonar un juego en progreso:

## Descripción de la lógica:

Al abandonar un juego en curso, se recibe un JSON con el ID del juego y el token de acceso del usuario que desea abandonar el juego. Se verifica si el juego está en curso y si el usuario que desea abandonar el juego es un jugador en el juego. Si es así, se elimina al usuario del juego y se devuelve un JSON de confirmación.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "game_id": 12345,<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. "<br><br>     }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "message": "User left the game successfully"<br><br>     }|

## 9. Finalizar un juego:

## Descripción de la lógica:

Al finalizar un juego, se recibe un JSON con el ID del juego y el token de acceso del usuario que desea finalizar el juego. Se verifica si el juego está en curso y si el usuario que desea finalizar el juego es el creador del juego. Si es así, se finaliza el juego y se devuelve un JSON de confirmación.

JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>       "game_id": 12345,<br><br>       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6"<br><br>     }|

JSON de salida (Tentativo):

|   |
|---|
|{<br><br>       "message": "Game ended successfully"<br><br>     }|

## 10. Obtener el estado actual del juego:

##  Descripción de la lógica:

Al obtener el estado actual del juego, se recibe un JSON con el ID del juego. Se consulta la base de datos para obtener el estado actual del juego y se devuelve un JSON con la información del estado.

 JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345<br><br>      }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345,<br><br>        "state": "in_progress"<br><br>      }|

## 11. Obtener la lista de jugadores en el juego:

##  Descripción de la lógica:

Al obtener la lista de jugadores en el juego, se recibe un JSON con el ID del juego. Se consulta la base de datos para obtener la lista de jugadores en el juego y se devuelve un JSON con la información de los jugadores.

 JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345<br><br>      }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345,<br><br>        "players": ["Player1", "Player2", "Player3"]<br><br>      }|

## 12. Obtener el jugador actual que debe jugar una carta:

##  Descripción de la lógica:

Al obtener el jugador actual que debe jugar una carta, se recibe un JSON con el ID del juego. Se consulta la base de datos para obtener el estado actual del juego y determinar cuál es el jugador que debe jugar una carta en este momento. Se devuelve un JSON con el nombre del jugador.

 JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345<br><br>      }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345,<br><br>        "current_player": "Player1"<br><br>      }|

## 13. Obtener la carta superior de la pila de descartes:

##  Descripción de la lógica:

Al obtener la carta superior de la pila de descartes, se recibe un JSON con el ID del juego. Se consulta la base de datos para obtener la carta superior de la pila de descartes y se devuelve un JSON con la información de la carta.

 JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345<br><br>      }|

## 14. Obtener las puntuaciones actuales de todos los jugadores:

##  Descripción de la lógica:

Al obtener las puntuaciones actuales de todos los jugadores, se recibe un JSON con el ID del juego. Se consulta la base de datos para obtener las puntuaciones actuales de todos los jugadores en el juego y se devuelve un JSON con la información de las puntuaciones.
  
 JSON de entrada (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345<br><br>      }|

 JSON de salida (Tentativo):

|   |
|---|
|{<br><br>        "game_id": 12345,<br><br>        "scores": {<br><br>          "Player1": 100,<br><br>          "Player2": 75,<br><br>          "Player3": 120<br><br>        }<br><br>      }|

## 15. Crear una colección Postman con solicitudes de muestra.

## Descripción:

Se debe crear una colección de Postman que contenga solicitudes de muestra para cada punto final de la API. Esto permitirá probar y validar la funcionalidad del backend de manera fácil y eficiente.


**1. Implementar Unit Test para Operaciones CRUD de Gestión de Jugadores**

Utilizando Jest, Axios, Ramda  En la programación funcional, las pruebas se centran en verificar el comportamiento y la pureza
de las funciones, simplificando el proceso y
garantizando mayor confiabilidad del código. Esto
contrasta con otros paradigmas donde se requiere
un diseño más deliberado para facilitar las pruebas
debido a los efectos secundarios.
**Descripción:**

Agrega pruebas unitarias para cada función de creación, lectura, actualización y eliminación de jugadores en el juego UNO. Escenarios incluyen verificar la creación exitosa de un nuevo jugador, recuperar información del jugador existente, actualizar detalles del jugador y eliminar un jugador de la base de datos.

**2. Implementar Unit Test para Operaciones CRUD de Administración de Juegos**

**Descripción:**

Añade pruebas unitarias para garantizar el correcto funcionamiento de las funciones CRUD relacionadas con la gestión de juegos en el juego UNO. Escenarios incluyen crear un nuevo juego, obtener información de juegos existentes, actualizar detalles del juego y eliminar un juego de la base de datos.

**3. Implementar Unit Test para Operaciones CRUD de Administración de Tarjetas**

**Descripción:**

Integra pruebas unitarias para validar las operaciones CRUD que manejan las tarjetas del juego UNO. Escenarios abarcan la creación de nuevas tarjetas, la recuperación de información de tarjetas existentes, la actualización de detalles de tarjetas y la eliminación de tarjetas de la base de datos.

**4. Implementar Unit Test para Operaciones CRUD de Gestión de Scores Históricos**

**Descripción:**

Agrega pruebas unitarias para asegurar el correcto funcionamiento de las operaciones CRUD relacionadas con los scores históricos en el juego UNO. Escenarios incluyen registrar un nuevo score, recuperar scores históricos, actualizar detalles del score y eliminar scores de la base de datos.

**5. Utilizar Unit Test con Base de Datos Relacional o Documental**

**Descripción:**

Implementa pruebas unitarias que verifiquen la correcta interacción entre las funciones del juego UNO y la base de datos relacional o documental utilizada para almacenar información. Escenarios abarcan la inserción, recuperación, actualización y eliminación de datos en la base de datos.

**6. Unit Test para Registro de Nuevo Usuario**

**Descripción:**

Crea pruebas unitarias para confirmar que el registro de un nuevo usuario en el juego UNO se realiza correctamente. Escenarios incluyen verificar la creación exitosa de una nueva cuenta de usuario con información válida y manejar errores en caso de datos incorrectos o faltantes.

**7. Unit Test para Iniciar Sesión**

**Descripción:**

Desarrolla pruebas unitarias para asegurar que el inicio de sesión en el juego UNO funcione correctamente. Escenarios incluyen verificar el acceso a la cuenta de usuario con credenciales válidas y manejar adecuadamente casos de inicio de sesión fallidos.

**8. Unit Test para Cerrar Sesión**

**Descripción:**

Agrega pruebas unitarias para garantizar que el cierre de sesión en el juego UNO se realice adecuadamente. Escenarios abarcan confirmar que la sesión del usuario se cierra correctamente y que no puede acceder a funciones protegidas después del cierre de sesión.

**9. Unit Test para Obtener Perfil de Usuario**

**Descripción:**

Integra pruebas unitarias para validar la correcta obtención del perfil de usuario en el juego UNO. Escenarios incluyen recuperar información de perfil válida del usuario y manejar adecuadamente casos de error cuando la información no está disponible.

**10. Unit Test para Crear Nuevo Juego**

**Descripción:**

Implementa pruebas unitarias para confirmar que la creación de un nuevo juego en el juego UNO funciona correctamente. Escenarios abarcan verificar la creación exitosa de un nuevo juego con información válida y manejar errores en caso de datos incorrectos o faltantes.

**11. Unit Test para Unirse a un Juego Existente**

**Descripción:**

Crea pruebas unitarias para asegurar que los usuarios puedan unirse a juegos existentes en el juego UNO de manera adecuada. Escenarios incluyen verificar la unión exitosa a un juego en curso y manejar correctamente casos de error cuando el juego no está disponible o está lleno.

**12. Unit Test para Iniciar Juego cuando Jugadores Están Listos**

**Descripción:**

Desarrolla pruebas unitarias para confirmar que el juego UNO puede iniciarse cuando todos los jugadores están listos. Escenarios incluyen verificar el inicio exitoso del juego y manejar adecuadamente casos de error cuando no hay suficientes jugadores o el juego ya ha comenzado.

**13. Unit Test para Abandonar Juego en Progreso**

**Descripción:**

Agrega pruebas unitarias para garantizar que los jugadores puedan abandonar un juego en curso en el juego UNO de manera adecuada. Escenarios abarcan verificar la salida exitosa del jugador del juego y manejar correctamente casos de error cuando el juego no está en progreso o el jugador no está involucrado en el juego.

**14. Unit Test para Finalizar Juego**

**Descripción:**

Integra pruebas unitarias para confirmar que el juego UNO puede finalizarse adecuadamente cuando se cumplen las condiciones necesarias. Escenarios incluyen verificar la finalización exitosa del juego y manejar correctamente casos de error cuando el juego ya ha terminado.

**15. Unit Test para Obtener Estado Actual del Juego**

**Descripción:**

Implementa pruebas unitarias para asegurar que el juego UNO pueda proporcionar el estado actual del juego de manera precisa. Escenarios abarcan verificar la obtención exitosa del estado del juego y manejar adecuadamente casos de error cuando la información no está disponible o el juego no está en progreso.

**16. Unit Test para Obtener Lista de Jugadores en el Juego**

**Descripción:**

Crea pruebas unitarias para confirmar que el juego UNO puede proporcionar la lista actual de jugadores en el juego de manera correcta. Escenarios incluyen verificar la obtención exitosa de la lista de jugadores y manejar adecuadamente casos de error.

**17. Unit Test para Obtener Jugador Actual que Debe Jugar una Carta**

**Descripción:**

Desarrolla pruebas unitarias para asegurar que el juego UNO pueda identificar correctamente al jugador que debe jugar una carta en un determinado momento. Escenarios abarcan verificar la obtención exitosa del jugador actual y manejar adecuadamente casos de error cuando el turno del jugador no está definido.

**18. Unit Test para Obtener Carta Superior de la Pila de Descartes**

**Descripción:**

Agrega pruebas unitarias para confirmar que el juego UNO puede proporcionar la carta superior de la pila de descartes de manera precisa. Escenarios incluyen verificar la obtención exitosa de la carta y manejar adecuadamente casos de error cuando la pila de descartes está vacía.

**19. Unit Test para Obtener Puntuaciones Actuales de Todos los Jugadores**

**Descripción:**

Integra pruebas unitarias para asegurar que el juego UNO pueda proporcionar las puntuaciones actuales de todos los jugadores de manera correcta. Escenarios abarcan verificar la obtención exitosa de las puntuaciones y manejar adecuadamente casos de error cuando la información no está disponible.

Implementación exitosa y completa de todos los puntos de la tarea, cumpliendo con todas las especificaciones y aplicando los conceptos de manera óptima.


|Los unit test cubren exhaustivamente todas las funcionalidades del programa, incluyendo escenarios complejos y bordes. La cobertura de código es alta y se incluyen pruebas para casos límite y errores. Todos los test pasan sin problemas y proporcionan una amplia confianza en la robustez del código.
 El proyecto debe realizarse utilizando programacion funcional