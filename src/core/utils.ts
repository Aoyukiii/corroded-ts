export type IsType<T, S, U, V> = [T] extends [S] ? U : V

type Curry<T extends (...args: any[]) => any> = T extends (...args: infer Args) => infer Return
  ? Args extends [infer First, ...infer Rest]
    ? (arg: First) => Curry<(...args: Rest) => Return>
    : Return
  : never

export function curry<T extends (...args: any[]) => any>(fn: T): Curry<T> {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args)
    } else {
      return (...nextArgs: any[]) => curried(...args, ...nextArgs)
    }
  } as Curry<T>
}
