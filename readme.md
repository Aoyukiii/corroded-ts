# corroded-ts

[![npm](https://img.shields.io/npm/v/corroded-ts?style=flat-square)](https://www.npmjs.com/package/rust.ts)


This is an experimental library written in TypeScript, imitating some features of Rust.

这是一个用TypeScript编写的实验性库，模仿Rust语言的一些特性。

## Usage

### Option

```typescript
import { Some, None, Option } from 'corroded-ts'

function findFirst<T>(arr: T[], value: T): Option<T> {
  return arr.find((v) => v === value) ? new Some(value) : new None()
}

const arr = [1, 2, 3]

findFirst(arr, 2).unwrap() // 2
findFirst(arr, 4).unwrapOr(0) // 0
findFirst(arr, 4).expect('not found') // throws Error('not found')
findFirst(arr, 4)
  .map((v) => v * 2)
  .isNone() // true
findFirst(arr, 2).and(findFirst(arr, 4)).isNone() // true
```

### Result

The synchronous `Result`:

```typescript
import { Ok, Err, Result } from 'corroded-ts'

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? new Err('division by zero') : new Ok(a / b)
}

const result = divide(10, 0)

result.unwrap() // throws an lib error
result.unwrapErr() // Err('division by zero')
result.mapOrElse(
  (err) => `An error occurred: ${err}`,
  (value) => `The result is ${value}`
) // 'An error occurred: division by zero'
```

There is also an asynchronous `ResultAsync`:

```typescript
import { ResultAsync } from 'corroded-ts'

async function asyncGet(url: string): Promise<string> {
  // do something
}

const result_async1: ResultAsync<string, Error> = ResultAsync.from(asyncGet('https://example.com'))
// or
const result_async2: ResultAsync<string, Error> = asyncGet('https://example.com').toResult()
// or just simply await, because ResultAsync won't throw an error
const result1: Result<string, Error> = await asyncGet('https://example.com').toResult()
// or traditionally use then
asyncGet('https://example.com')
  .toResult()
  .then((result) => {
    // result is Result<string, unknown>
    if (result.isOk()) {
      // ...
    } else {
      // ...
    }
  })
```

### match

#### Simple pattern matching

```typescript
import { match } from 'corroded-ts'

type Breakfast = 'eggs' | 'bacon' | 'toast'

function howIsBreakfast(breakfast: Breakfast): string {
  return match(breakfast)
    .with('eggs', () => 'yummy')
    .with('bacon', () => 'yucky')
    .with('toast', () => 'delicious')
    .exhaust()
}

console.log(howIsBreakfast('eggs')) // yummy
console.log(howIsBreakfast('bacon')) // yucky
console.log(howIsBreakfast('toast')) // delicious
```

Duplicate branches are not allowed:

```typescript
match(breakfast)
  .with('eggs', () => 'yummy')
  .with('eggs', () => 'not yummy')
  //    ^ argument `pattern` will be inferred as `never` here
```

And non-exhaustive pattern matching is also not allowed:

```typescript
match(breakfast)
  .with('eggs', () => 'yummy')
  .with('bacon', () => 'yucky')
  .exhaust()
  // ^ returns `never`

// You can simply add a default branch to handle the remaining cases:
match(breakfast)
  .with('eggs', () => 'yummy')
  .with('bacon', () => 'yucky')
  .otherwise(() => 'unknown')
  .exhaust()
```
#### Pattern matching with functions

You can also use functions as patterns by simply introducing a `P` namespace:

```typescript
import { match, P } from 'corroded-ts'

function abs(x: number) {
  return match(x)
    .with(0, () => 0)
    .with(P.fn((x) => x > 0), (x) => x)
    .otherwise(() => -x)
    .exhaust()
}

console.log(abs(10)) // 10
console.log(abs(-10)) // 10
console.log(abs(0)) // 0
```

#### Pattern matching for objects (experimental, incomplete)

The special `P` pattern supports empty values as well:

```typescript
import { match, P, Option, Some, None } from 'corroded-ts'

type Product = {
  id: number
  name: string
  price: number
  orderer: {
    id: number
    amount: number
  }
}

const product: Product = {
  id: 1,
  name: 'Product 1',
  price: 100,
  orderer: {
    id: 2,
    amount: 10,
  },
}

const preferential: Option<number> = match(product)
  .with(
    { id: P.fn((id) => id < 0), name: P._, price: P._, orderer: P._ },
    () => new None<number>()
  )
  .with(
    { id: P._, name: P._, price: P.fn((price) => price > 500), orderer: P._ },
    (p) => new Some(p.price * 0.9)
  )
  .with(
    {
      id: P._, name: P._, price: P._,
      orderer: { id: P._, amount: P.fn((amount) => amount > 100) },
    },
    (p) => new Some(p.price * 0.8)
  )
  .otherwise((p) => new Some(p.price))
  .exhaust()
```

#### Pattern matching for `Option` and `Result`

```typescript
import { match, Option, Some, None, Result, Ok, Err } from 'corroded-ts'

const doubled: number = match(new Some(1))
  .some((v) => v * 2)
  .none(() => 0)

const message: string = match(new Err<number, string>('error'))
  .ok((v) => `value: ${v}`)
  .err(() => 'An error occurred.')
```