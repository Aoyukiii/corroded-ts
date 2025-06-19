import { ResultAsync } from './result'

declare global {
  interface Promise<T> {
    toResult<E>(): ResultAsync<T, E>
  }
}

Promise.prototype.toResult = function <T, E>(): ResultAsync<T, E> {
  return ResultAsync.from(this)
}

export {}
