import { Option, None, Some } from './option'

type OkTypeOf<R extends Result<unknown, unknown> | ResultAsync<unknown, unknown>> = R extends
  | Result<infer T, unknown>
  | ResultAsync<infer T, unknown>
  ? T
  : never

type ErrTypeOf<R extends Result<unknown, unknown> | ResultAsync<unknown, unknown>> = R extends
  | Result<unknown, infer E>
  | ResultAsync<unknown, infer E>
  ? E
  : never

interface IResult<T = unknown, E = unknown> {
  /**
   * Check if the result is an `Ok` value.
   * @returns A type predicate.
   */
  isOk(): this is Ok<T, E>

  /**
   * Check if the result is an `Err` value.
   * @returns A type predicate.
   */
  isErr(): this is Err<T, E>

  /**
   * Get the contained `Ok` value.
   * @returns The `Ok` value.
   * @throws Throws an error if the result is an `Err` value.
   */
  unwrap(): T

  /**
   * Get the contained `Err` value.
   * @returns The `Err` value.
   * @throws Throws an error if the result is an `Ok` value.
   */
  unwrapErr(): E

  /**
   * Get the contained `Ok` value or a default value.
   * @param default_value The default value to return if the result is an `Err` value.
   * @returns The `Ok` value or the default value.
   */
  unwrapOr(default_value: T): T

  /**
   * Get the contained `Ok` value or compute it from `err` value.
   * @param fn A function that takes an `Err` value and returns a new `T` value.
   * @returns The `Ok` value or the computed value.
   */
  unwrapOrElse(fn: (err: E) => T): T

  /**
   * Get the contained `Ok` value or throw an error with a message.
   * @param message A message to include in the error if the result is an `Err` value.
   * @returns The `Ok` value.
   * @throws Throws an error with the given message if the result is an `Err` value.
   */
  expect(message: string): T

  /**
   * Get the contained `Err` value or throw an error with a message.
   * @param message A message to include in the error if the result is an `Ok` value.
   * @returns The `Err` value.
   * @throws Throws an error with the given message if the result is an `Ok` value.
   */
  expectErr(message: string): E

  /**
   * Map a `Result<T, E>` value to a `Result<U, E>` value.
   * @param fn A function that takes a `T` value and returns a `U` value.
   * @returns A `Result<U, E>` value.
   */
  map<U>(fn: (value: T) => U): Result<U, E>

  /**
   * Map a `Result<T, E>` error value to a `Result<T, F>` value.
   * @param fn A function that takes an `E` value and returns a `F` value.
   * @returns A `Result<T, F>` value.
   */
  mapErr<F>(fn: (err: E) => F): Result<T, F>

  /**
   * Map a `Result<T, E>` value to a `U` value or a default value.
   * @param default_value The default value to return if the result is an `Err` value.
   * @param fn A function that takes a `T` value and returns a `U` value.
   * @returns A `U` value or the default value.
   */
  mapOr<U>(default_value: U, fn: (value: T) => U): U

  /**
   * Map a `Result<T, E>` value to a `U` value.
   * @param default_fn A function that takes an `E` value and returns a `U` value.
   * @param fn A function that takes a `T` value and returns a `U` value.
   * @returns A `U` value.
   */
  mapOrElse<U>(default_fn: (err: E) => U, fn: (value: T) => U): U

  /**
   * Convert a `Result<T, E>` value to an `Option<T>` value.
   * @returns An `Option<T>` value.
   */
  okToOption(): Option<T>

  /**
   * Convert a `Result<T, E>` error value to an `Option<E>` value.
   * @returns An `Option<E>` value.
   */
  errToOption(): Option<E>

  /**
   * Return the `Ok` value if this and the other `Result<U, E> | ResultAsync<U, E>` are both `Ok`, otherwise return the `Err` value.
   * The two values should have the same error type.
   * @param other A `Result<U, E> | ResultAsync<U, E>` value.
   * @returns A `Result<U, E> | ResultAsync<U, E>` value.
   */
  and<R extends Result<unknown, E> | ResultAsync<unknown, E>>(other: R): Err<OkTypeOf<R>, E> | R

  /**
   * Return the `Err` value if this and the other `Result<T, F> | ResultAsync<T, F>` are both `Err`, otherwise return the `Ok` value.
   * The two values should have the same ok type.
   * @param other A `Result<T, F> | ResultAsync<T, F>` value.
   * @returns A `Result<T, F> | ResultAsync<T, F>` value.
   */
  or<R extends Result<T, unknown> | ResultAsync<T, unknown>>(other: R): Ok<T, ErrTypeOf<R>> | R
}

class Ok<T = unknown, E = unknown> implements IResult<T, E> {
  constructor(public readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  unwrapErr(): never {
    throw new Error('Called `unwrapErr` on an `Ok` value')
  }

  unwrapOr(default_value: T): T {
    return this.value
  }

  unwrapOrElse(fn: (err: E) => T): T {
    return this.value
  }

  expect(message: string): T {
    return this.value
  }

  expectErr(message: string): E {
    throw new Error(message)
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok<U, E>(fn(this.value))
  }

  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new Ok<T, F>(this.value)
  }

  mapOr<U>(default_value: U, fn: (value: T) => U): U {
    return fn(this.value)
  }

  mapOrElse<U>(default_fn: (err: E) => U, fn: (value: T) => U): U {
    return fn(this.value)
  }

  okToOption(): Some<T> {
    return new Some(this.value)
  }

  errToOption(): None<E> {
    return new None()
  }

  and<R extends Result<unknown, E> | ResultAsync<unknown, E>>(other: R): R {
    return other
  }

  or<R extends Result<T, unknown> | ResultAsync<T, unknown>>(other: R): Ok<T, ErrTypeOf<R>> {
    return this as Ok<T, ErrTypeOf<R>>
  }
}

class Err<T, E> implements IResult<T, E> {
  constructor(public readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return true
  }

  unwrap(): never {
    throw new Error('Called `unwrap` on an `Err` value')
  }

  unwrapErr(): E {
    return this.error
  }

  unwrapOr(default_value: T): T {
    return default_value
  }

  unwrapOrElse(fn: (err: E) => T): T {
    return fn(this.error)
  }

  expect(message: string): T {
    throw new Error(message)
  }

  expectErr(message: string): E {
    return this.error
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Err<U, E>(this.error)
  }

  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new Err<T, F>(fn(this.error))
  }

  mapOr<U>(default_value: U, fn: (value: T) => U): U {
    return default_value
  }

  mapOrElse<U>(default_fn: (err: E) => U, fn: (value: T) => U): U {
    return default_fn(this.error)
  }

  okToOption(): None<T> {
    return new None()
  }

  errToOption(): Some<E> {
    return new Some(this.error)
  }

  and<R extends Result<unknown, E> | ResultAsync<unknown, E>>(other: R): Err<OkTypeOf<R>, E> {
    return this as Err<OkTypeOf<R>, E>
  }

  or<R extends Result<T, unknown> | ResultAsync<T, unknown>>(other: R): R {
    return other
  }
}

type Result<T = unknown, E = unknown> = Ok<T, E> | Err<T, E>

class ResultAsync<T = unknown, E = unknown> implements PromiseLike<Result<T, E>> {
  private promise: Promise<Result<T, E>>
  /**
   * Create a `ResultAsync<T, E>` value from executor function which is similar to `Promise` constructor.
   * @param executor A function that takes two arguments: `resolve` and `reject`.
   */
  constructor(executor: (resolve: (value: T) => void, reject: (error: E) => void) => void) {
    this.promise = new Promise((resolve) => {
      executor(
        (value) => {
          resolve(new Ok(value))
        },
        (error) => {
          resolve(new Err(error))
        }
      )
    })
  }

  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled)
  }

  /**
   * Map a `ResultAsync<T, E>` value to a `ResultAsync<U, E>` value.
   * @param fn A function that takes a `T` value and returns a `U` value.
   * @returns A `ResultAsync<U, E>` value.
   */
  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync((resolve, reject) => {
      this.then((result) => {
        if (result.isOk()) {
          resolve(fn(result.unwrap()))
        } else {
          reject(result.unwrapErr())
        }
      })
    })
  }

  /**
   * Map a `ResultAsync<T, E>` error value to a `ResultAsync<T, F>` value.
   * @param fn A function that takes an `E` value and returns a `F` value.
   * @returns A `ResultAsync<T, F>` value.
   */
  mapErr<F>(fn: (err: E) => F): ResultAsync<T, F> {
    return new ResultAsync((resolve, reject) => {
      this.then((result) => {
        if (result.isOk()) {
          resolve(result.unwrap())
        } else {
          reject(fn(result.unwrapErr()))
        }
      })
    })
  }

  /**
   * Create a `ResultAsync<T, E>` value from a promise.
   * @param promise A promise that resolves to a value of type `T` or rejects with an error of type `E`.
   * @returns A `ResultAsync<T, E>` value.
   *
   * ### Note
   * - You should restrict the parameter type of `reject` in promise yourself.
   *
   * e.g.:
   * ```ts
   * // OK
   * const result1 = await ResultAsync.from<number, string>(Promise.reject('err'))
   * // Don't do this!
   * const result2 = await ResultAsync.from<number, string>(Promise.reject(1))
   * ```
   *
   * - This method has different behavior from using a constructor directly due to the feature of `Promise`,
   * i.e. it wraps the promise in a `ResultAsync` value, which may cause pending state though it's already resolved.
   *
   * e.g.:
   * ```ts
   * const resolved = new ResultAsync<number>((resolve) => resolve(1))
   * const pending = ResultAsync.from(Promise.resolve(2))
   *
   * console.log(resolved) // ResultAsync [Promise] { 1 }
   * console.log(pending) // ResultAsync [Promise] { <pending> }
   * ```
   */
  static from<T, E = unknown>(promise: Promise<T>): ResultAsync<T, E> {
    return new ResultAsync((resolve, reject) => {
      promise.then(
        (value) => resolve(value),
        (error) => reject(error)
      )
    })
  }

  /**
   * Create an `OkAsync<T, E>` value from a value.
   * @param value A value of type `T`.
   * @returns An `OkAsync<T, E>` value.
   */
  static ok<T, E = unknown>(value: T): OkAsync<T, E> {
    return new OkAsync((resolve) => {
      resolve(value)
    })
  }

  /**
   * Create an `ErrAsync<T, E>` value from an error.
   * @param error An error of type `E`.
   * @returns An `ErrAsync<T, E>` value.
   */
  static err<T, E = unknown>(error: E): ErrAsync<T, E> {
    return new ErrAsync((reject) => {
      reject(error)
    })
  }
}

class OkAsync<T = unknown, E = unknown> extends ResultAsync<T, E> {
  /**
   * Create an `OkAsync<T, E>` value from executor function.
   * @param executor A function that takes one argument `resolve`.
   */
  constructor(executor: (resolve: (value: T) => void) => void) {
    super(executor)
  }
}

class ErrAsync<T = unknown, E = unknown> extends ResultAsync<T, E> {
  /**
   * Create an `ErrAsync<T, E>` value from executor function.
   * @param executor A function that takes one argument `reject`.
   */
  constructor(executor: (reject: (error: E) => void) => void) {
    super((_, reject) => {
      executor(reject)
    })
  }
}

export { Result, Ok, Err, ResultAsync, OkAsync, ErrAsync, OkTypeOf, ErrTypeOf }
