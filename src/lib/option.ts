import { Err, Ok, Result } from './result'

type OptionTypeOf<O extends Option<unknown>> = O extends Option<infer T> ? T : never

type ReverseOption<O extends Option<unknown>> = O extends Some<unknown>
  ? None<OptionTypeOf<O>>
  : Some<OptionTypeOf<O>>

interface IOption<T> {
  isSome(): this is Some<T>
  isNone(): this is None<T>
  unwrap(): T
  unwrapOr(defaultValue: T): T
  unwrapOrElse(fn: () => T): T
  expect(message: string): T
  filter(fn: (value: T) => boolean): Option<T>
  map<U>(fn: (value: T) => U): Option<U>
  mapOr<U>(default_value: U, fn: (value: T) => U): U
  mapOrElse<U>(default_fn: () => U, fn: (value: T) => U): U
  and<O extends Option<unknown>>(other: O): None<T> | O
  or<O extends Option<T>>(other: O): Some<T> | O
  xor<O extends Option<T>>(other: O): Option<T>
  okOr<E>(error: E): Result<T, E>
  okOrElse<E>(fn: () => E): Result<T, E>
  andThen<O extends Option<unknown>>(fn: (value: T) => O): None<OptionTypeOf<O>> | O
  orElse<O extends Option<unknown>>(fn: () => O): Some<T> | O
}

class Some<T> implements IOption<T> {
  constructor(public value: T) {}

  isSome(): this is Some<T> {
    return true
  }

  isNone(): this is None<T> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  unwrapOr(defaultValue: T): T {
    return this.value
  }

  unwrapOrElse(fn: () => T): T {
    return this.value
  }

  expect(message: string): T {
    return this.value
  }

  filter(fn: (value: T) => boolean): Option<T> {
    return fn(this.value) ? this : new None<T>()
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some(fn(this.value))
  }

  mapOr<U>(default_value: U, fn: (value: T) => U): U {
    return fn(this.value)
  }

  mapOrElse<U>(default_fn: () => U, fn: (value: T) => U): U {
    return fn(this.value)
  }

  and<O extends Option<unknown>>(other: O): O {
    return other
  }

  or<O extends Option<T>>(other: O): Some<T> {
    return this
  }

  xor<O extends Option<T>>(other: O): ReverseOption<O> {
    return other.isSome()
      ? (new None<T>() as ReverseOption<O>)
      : (this as unknown as ReverseOption<O>)
  }

  okOr<E>(error: E): Result<T, E> {
    return new Ok(this.value)
  }

  okOrElse<E>(fn: () => E): Result<T, E> {
    return new Ok(this.value)
  }

  andThen<O extends Option<unknown>>(fn: (value: T) => O): O {
    return fn(this.value)
  }

  orElse<O extends Option<unknown>>(fn: () => O): Some<T> {
    return this
  }
}

class None<T> implements IOption<T> {
  declare private none_: void
  constructor() {}

  isSome(): this is Some<T> {
    return false
  }

  isNone(): this is None<T> {
    return true
  }

  unwrap(): T {
    throw new Error('Option is None')
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapOrElse(fn: () => T): T {
    return fn()
  }

  expect(message: string): T {
    throw new Error(message)
  }

  filter(fn: (value: T) => boolean): Option<T> {
    return new None<T>()
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new None<U>()
  }

  mapOr<U>(default_value: U, fn: (value: T) => U): U {
    return default_value
  }

  mapOrElse<U>(default_fn: () => U, fn: (value: T) => U): U {
    return default_fn()
  }

  and<O extends Option<unknown>>(other: O): None<T> {
    return this
  }

  or<O extends Option<T>>(other: O): O {
    return other
  }

  xor<O extends Option<T>>(other: O): O {
    return other
  }

  okOr<E>(error: E): Result<T, E> {
    return new Err(error)
  }

  okOrElse<E>(fn: () => E): Result<T, E> {
    return new Err(fn())
  }

  andThen<O extends Option<unknown>>(fn: (value: T) => O): None<OptionTypeOf<O>> {
    return new None<OptionTypeOf<O>>()
  }

  orElse<O extends Option<unknown>>(fn: () => O): O {
    return fn()
  }
}

type Option<T> = Some<T> | None<T>

export { Option, Some, None, OptionTypeOf, ReverseOption }
