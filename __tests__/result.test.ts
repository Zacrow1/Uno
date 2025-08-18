import { Result, tryCatch, tryCatchAsync, validateAll, pipe } from '@/lib/result';

describe('Result Monad', () => {
  describe('Basic Result operations', () => {
    test('should create Ok result', () => {
      const result = Result.Ok(42);
      expect(result.isOk).toBe(true);
      expect(result.isErr).toBe(false);
      expect(result.value).toBe(42);
    });

    test('should create Err result', () => {
      const error = new Error('Something went wrong');
      const result = Result.Err(error);
      expect(result.isOk).toBe(false);
      expect(result.isErr).toBe(true);
      expect(result.value).toBe(error);
    });

    test('should map over Ok result', () => {
      const result = Result.Ok(5);
      const mapped = result.map(x => x * 2);
      expect(mapped.isOk).toBe(true);
      expect(mapped.value).toBe(10);
    });

    test('should not map over Err result', () => {
      const error = new Error('Error');
      const result = Result.Err<number>(error);
      const mapped = result.map(x => x * 2);
      expect(mapped.isErr).toBe(true);
      expect(mapped.value).toBe(error);
    });

    test('should flatMap over Ok result', () => {
      const result = Result.Ok(5);
      const flatMapped = result.flatMap(x => Result.Ok(x * 2));
      expect(flatMapped.isOk).toBe(true);
      expect(flatMapped.value).toBe(10);
    });

    test('should not flatMap over Err result', () => {
      const error = new Error('Error');
      const result = Result.Err<number>(error);
      const flatMapped = result.flatMap(x => Result.Ok(x * 2));
      expect(flatMapped.isErr).toBe(true);
      expect(flatMapped.value).toBe(error);
    });

    test('should getOrElse return value for Ok', () => {
      const result = Result.Ok(42);
      expect(result.getOrElse(0)).toBe(42);
    });

    test('should getOrElse return default for Err', () => {
      const result = Result.Err<number>(new Error('Error'));
      expect(result.getOrElse(0)).toBe(0);
    });

    test('should getOrThrow return value for Ok', () => {
      const result = Result.Ok(42);
      expect(result.getOrThrow()).toBe(42);
    });

    test('should getOrThrow throw for Err', () => {
      const error = new Error('Error');
      const result = Result.Err<number>(error);
      expect(() => result.getOrThrow()).toThrow(error);
    });

    test('should match patterns', () => {
      const okResult = Result.Ok(42);
      const errResult = Result.Err<number>(new Error('Error'));

      const okValue = okResult.match({
        Ok: (value) => `Ok: ${value}`,
        Err: (error) => `Err: ${error.message}`
      });

      const errValue = errResult.match({
        Ok: (value) => `Ok: ${value}`,
        Err: (error) => `Err: ${error.message}`
      });

      expect(okValue).toBe('Ok: 42');
      expect(errValue).toBe('Err: Error');
    });
  });

  describe('Async operations', () => {
    test('should mapAsync over Ok result', async () => {
      const result = Result.Ok(5);
      const mapped = await result.mapAsync(async x => x * 2);
      expect(mapped.isOk).toBe(true);
      expect(mapped.value).toBe(10);
    });

    test('should not mapAsync over Err result', async () => {
      const error = new Error('Error');
      const result = Result.Err<number>(error);
      const mapped = await result.mapAsync(async x => x * 2);
      expect(mapped.isErr).toBe(true);
      expect(mapped.value).toBe(error);
    });

    test('should handle errors in mapAsync', async () => {
      const result = Result.Ok(5);
      const mapped = await result.mapAsync(async () => {
        throw new Error('Async error');
      });
      expect(mapped.isErr).toBe(true);
      expect(mapped.value).toBeInstanceOf(Error);
    });

    test('should flatMapAsync over Ok result', async () => {
      const result = Result.Ok(5);
      const flatMapped = await result.flatMapAsync(async x => Result.Ok(x * 2));
      expect(flatMapped.isOk).toBe(true);
      expect(flatMapped.value).toBe(10);
    });

    test('should not flatMapAsync over Err result', async () => {
      const error = new Error('Error');
      const result = Result.Err<number>(error);
      const flatMapped = await result.flatMapAsync(async x => Result.Ok(x * 2));
      expect(flatMapped.isErr).toBe(true);
      expect(flatMapped.value).toBe(error);
    });
  });

  describe('Utility functions', () => {
    test('tryCatch should return Ok for successful operation', () => {
      const result = tryCatch(() => 42);
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    test('tryCatch should return Err for failed operation', () => {
      const result = tryCatch(() => {
        throw new Error('Test error');
      });
      expect(result.isErr).toBe(true);
      expect(result.value).toBeInstanceOf(Error);
    });

    test('tryCatchAsync should return Ok for successful async operation', async () => {
      const result = await tryCatchAsync(async () => 42);
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    test('tryCatchAsync should return Err for failed async operation', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('Async test error');
      });
      expect(result.isErr).toBe(true);
      expect(result.value).toBeInstanceOf(Error);
    });

    test('validateAll should return Ok for valid input', () => {
      const validations = [
        (value: number) => value > 0 ? Result.Ok(undefined) : Result.Err('Must be positive'),
        (value: number) => value < 100 ? Result.Ok(undefined) : Result.Err('Must be less than 100')
      ];

      const result = validateAll(42, validations);
      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    test('validateAll should return first error for invalid input', () => {
      const validations = [
        (value: number) => value > 0 ? Result.Ok(undefined) : Result.Err('Must be positive'),
        (value: number) => value < 100 ? Result.Ok(undefined) : Result.Err('Must be less than 100')
      ];

      const result = validateAll(-5, validations);
      expect(result.isErr).toBe(true);
      expect(result.value).toBe('Must be positive');
    });

    test('pipe should chain operations', () => {
      const result = pipe(5)
        .to(x => Result.Ok(x * 2))
        .to(x => Result.Ok(x + 1));

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(11);
    });

    test('pipe should handle errors', () => {
      const result = pipe(5)
        .to(x => Result.Ok(x * 2))
        .to(x => Result.Err<number>('Error occurred'));

      expect(result.isErr).toBe(true);
      expect(result.value).toBe('Error occurred');
    });

    test('pipe should work with async operations', async () => {
      const result = await pipe(5)
        .toAsync(async x => Result.Ok(x * 2))
        .toAsync(async x => Result.Ok(x + 1));

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(11);
    });
  });

  describe('Error handling', () => {
    test('should mapErr over Err result', () => {
      const error = new Error('Original error');
      const result = Result.Err<number>(error);
      const mapped = result.mapErr(err => new Error(`Mapped: ${err.message}`));
      expect(mapped.isErr).toBe(true);
      expect(mapped.value.message).toBe('Mapped: Original error');
    });

    test('should not mapErr over Ok result', () => {
      const result = Result.Ok(42);
      const mapped = result.mapErr(err => new Error(`Mapped: ${err.message}`));
      expect(mapped.isOk).toBe(true);
      expect(mapped.value).toBe(42);
    });

    test('should flatMapErr over Err result', () => {
      const error = new Error('Original error');
      const result = Result.Err<number>(error);
      const flatMapped = result.flatMapErr(err => Result.Err<number>(new Error(`Flat mapped: ${err.message}`)));
      expect(flatMapped.isErr).toBe(true);
      expect(flatMapped.value.message).toBe('Flat mapped: Original error');
    });

    test('should not flatMapErr over Ok result', () => {
      const result = Result.Ok(42);
      const flatMapped = result.flatMapErr(err => Result.Err<number>(new Error('Error')));
      expect(flatMapped.isOk).toBe(true);
      expect(flatMapped.value).toBe(42);
    });
  });
});