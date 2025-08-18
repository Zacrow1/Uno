Aquí tienes el contenido para el archivo WEEK5-ACT2.md. Puedes copiarlo y pegarlo directamente en tu proyecto.

Actividad #2: Aplicando Functors o Monads a tu Proyecto Capstone
1. Identificación del Caso de Uso
Archivo: src/services/playersService.js

El caso de uso identificado es la creación de un nuevo jugador, que implica una serie de operaciones encadenadas:

Normalización: Limpiar los datos de entrada del usuario.

Validación: Verificar que los datos sean correctos y completos.

Persistencia: Guardar los datos en la base de datos.

2. Elección del Concepto
Se optó por utilizar un Result Monad en lugar de un Functor. La razón principal es que el Result Monad es ideal para manejar operaciones que pueden fallar, como la validación o la persistencia en la base de datos. Permite encadenar estas operaciones de forma segura, pasando un resultado exitoso o un error a lo largo de la cadena, sin la necesidad de utilizar try/catch.

3. Implementación del Result Monad
Se creó una clase Result en src/utils/result.js para encapsular los resultados de las operaciones.

JavaScript

// src/utils/result.js
export class Result {
  constructor(isOk, value) {
    this.isOk = isOk;
    this.value = value;
  }

  static Ok(value) {
    return new Result(true, value);
  }

  static Err(error) {
    return new Result(false, error);
  }

  map(fn) {
    return this.isOk ? Result.Ok(fn(this.value)) : this;
  }

  flatMap(fn) {
    return this.isOk ? fn(this.value) : this;
  }

  getOrElse(defaultValue) {
    return this.isOk ? this.value : defaultValue;
  }
}
4. Uso del Monad en el Servicio
La función createPlayer fue refactorizada para utilizar el Monad, logrando un flujo de datos más claro y seguro.

JavaScript

// src/services/playersService.js
import { Result } from '../utils/result.js';
import { PlayerModel } from '../models/player.js';

const validatePlayer = (player) => {
  if (!player.username || !player.email) {
    return Result.Err('Missing fields');
  }
  return Result.Ok(player);
};

const persistPlayer = async (player) => {
  try {
    const saved = await PlayerModel.create(player);
    return Result.Ok(saved);
  } catch (e) {
    return Result.Err(e.message);
  }
};

export const createPlayer = async (data) => {
  return Result.Ok(data)
    .map(d => ({ ...d, username: d.username.trim() }))
    .flatMap(d => validatePlayer(d))
    .flatMap(d => persistPlayer(d));
};
5. Pruebas con Jest
Se crearon pruebas para verificar que el Monad maneja correctamente tanto los escenarios exitosos como los de error.

JavaScript

// tests/playersService.test.js
import { createPlayer } from '../../src/services/playersService.js';
import { Result } from '../../src/utils/result.js';

test('crea jugador con datos válidos', async () => {
  const res = await createPlayer({ username: '  juan  ', email: 'juan@example.com' });
  expect(res.isOk).toBe(true);
  expect(res.value.username).toBe('juan');
});

test('devuelve error por campos faltantes', async () => {
  const res = await createPlayer({ username: 'juan' });
  expect(res.isOk).toBe(false);
  expect(res.value).toBe('Missing fields');
});
6. Documentación de la Implementación
Qué se hizo:
Se implementó un Result Monad para gestionar la secuencia de validaciones y operaciones asincrónicas en la creación de un jugador. Esto permite un flujo de datos más robusto y predecible sin la necesidad de try/catch.

Beneficios:

Código más declarativo: La lógica es más fácil de seguir y entender.

Manejo centralizado de errores: Los errores se propagan de manera segura a través de la cadena de operaciones.

Mejora de la composición: Facilita la creación de funciones modulares y reutilizables.

Pruebas simplificadas: Los tests se enfocan en el resultado del Result en lugar de en la captura de excepciones.

Alternativa no elegida:
Un Functor (map) no habría sido suficiente, ya que solo transforma un valor y no tiene la capacidad de cambiar el contexto de la operación (por ejemplo, de un resultado exitoso a uno con error). El flatMap del Monad es fundamental para manejar esta lógica.

