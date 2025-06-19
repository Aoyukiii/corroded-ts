type Primitive = undefined | null | boolean | number | bigint | string | symbol

type NonPrimitive = object

type NotNullOrUndefined = {}

namespace Primitive {
  export type Indexlike = keyof any // string | number | symbol

  export function equals<T extends Primitive>(a: T, b: T): boolean {
    return a === b
  }

  export function assert<T extends Primitive>(value: unknown): value is T {
    return true
  }

  // The negation of isPrimitive cannot work in TypeScript. You can use assertion to make it work.
  export function isPrimitive(value: unknown): value is Primitive {
    return value === null || typeof value !== 'object'
  }

  function isUndefined(value: unknown): value is undefined {
    return value === undefined
  }

  function isNull(value: unknown): value is null {
    return value === null
  }

  function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }

  function isNumber(value: unknown): value is number {
    return typeof value === 'number'
  }

  function isBigInt(value: unknown): value is bigint {
    if (value instanceof BigInt) {
      value
    }
    return typeof value === 'bigint'
  }

  function isString(value: unknown): value is string {
    if (value instanceof String) {
      value
    }
    return typeof value === 'string'
  }

  function isSymbol(value: unknown): value is symbol {
    if (value instanceof Symbol) {
      value
    }
    return typeof value === 'symbol'
  }
}

namespace NonPrimitive {
  export type PlainObject = Record<string | symbol, unknown>

  export function isNonPrimitive(value: unknown): value is NonPrimitive {
    return value !== null && typeof value === 'object'
  }

  export function assert(value: unknown): value is NonPrimitive {
    return true
  }

  export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value)
  }

  export namespace Arr {
    export function assert(value: unknown): value is unknown[] {
      return true
    }
  }

  export function isFunction(value: unknown): value is Function {
    return typeof value === 'function'
  }

  export namespace Fn {
    export function assert(value: unknown): value is Function {
      return true
    }
  }

  export function getClass(value: unknown): any {
    if (value == null) return null
    return Object.getPrototypeOf(value)?.constructor
  }

  export function getClassName(value: unknown): string | null {
    return getClass(value)?.name
  }

  export function isPlainObject(value: unknown): value is PlainObject {
    return value?.constructor === Object
  }

  export namespace PlainObject {
    export function assert(value: unknown): value is PlainObject {
      return true
    }
  }
}

export { Primitive, NonPrimitive }
