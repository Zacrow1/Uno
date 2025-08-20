export class Result<T, E = Error> {
  private readonly _isOk: boolean;
  private readonly _value: T | E;

  private constructor(isOk: boolean, value: T | E) {
    this._isOk = isOk;
    this._value = value;
  }

  static Ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  static Err<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, error);
  }

  get isOk(): boolean {
    return this._isOk;
  }

  get isErr(): boolean {
    return !this._isOk;
  }

  get value(): T | E {
    return this._value;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._isOk 
      ? Result.Ok(fn(this._value as T))
      : Result.Err(this._value as E);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._isOk 
      ? fn(this._value as T)
      : Result.Err(this._value as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this._isOk 
      ? Result.Ok(this._value as T)
      : Result.Err(fn(this._value as E));
  }

  flatMapErr<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return this._isOk 
      ? Result.Ok(this._value as T)
      : fn(this._value as E);
  }

  getOrElse(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue;
  }

  getOrThrow(): T {
    if (this._isOk) {
      return this._value as T;
    }
    throw this._value;
  }

  match<U>(patterns: { Ok: (value: T) => U; Err: (error: E) => U }): U {
    return this._isOk 
      ? patterns.Ok(this._value as T)
      : patterns.Err(this._value as E);
  }

  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
    if (!this._isOk) {
      return Result.Err(this._value as E);
    }
    
    try {
      const result = await fn(this._value as T);
      return Result.Ok(result);
    } catch (error) {
      return Result.Err(error as E);
    }
  }

  async flatMapAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    if (!this._isOk) {
      return Result.Err(this._value as E);
    }
    
    try {
      return await fn(this._value as T);
    } catch (error) {
      return Result.Err(error as E);
    }
  }
}

// Utility functions for working with Results
export const tryCatch = <T, E = Error>(fn: () => T): Result<T, E> => {
  try {
    return Result.Ok(fn());
  } catch (error) {
    return Result.Err(error as E);
  }
};

export const tryCatchAsync = async <T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> => {
  try {
    const result = await fn();
    return Result.Ok(result);
  } catch (error) {
    return Result.Err(error as E);
  }
};

// Compose multiple Result-returning functions
export const pipe = <T>(initialValue: T) => {
  return {
    to: <U>(fn: (value: T) => Result<U, unknown>): Result<U, unknown> => 
      fn(initialValue),
    toAsync: async <U>(fn: (value: T) => Promise<Result<U, unknown>>): Promise<Result<U, unknown>> => 
      await fn(initialValue),
  };
};

// Validate multiple conditions and return first error
export const validateAll = <T>(
  value: T,
  validations: ((value: T) => Result<void, string>)[]
): Result<T, string> => {
  for (const validation of validations) {
    const result = validation(value);
    if (result.isErr) {
      return Result.Err(result.value as string);
    }
  }
  return Result.Ok(value);
};