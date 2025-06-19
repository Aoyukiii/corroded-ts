import { ResultAsync } from './result'

declare global {
  interface Promise<T> {
    toResult(): ResultAsync<T>
  }
}

Promise.prototype.toResult = function <T>(): ResultAsync<T> {
  return ResultAsync.from(this)
}

export {}
