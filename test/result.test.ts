import { Result, Ok, Err, ResultAsync } from '../src/index'
import '../src/lib/promise'

describe('Result', () => {
  const value = 1
  const error = 'error'

  const ok: Result<number, string> = new Ok(value)
  const err: Result<number, string> = new Err(error)

  describe('isOk', () => {
    it('returns true', () => {
      expect(ok.isOk()).toBe(true)
    })
    it('returns false', () => {
      expect(err.isOk()).toBe(false)
    })
  })

  describe('isErr', () => {
    it('returns false', () => {
      expect(ok.isErr()).toBe(false)
    })
    it('returns true', () => {
      expect(err.isErr()).toBe(true)
    })
  })

  describe('unwrap', () => {
    it('returns value', () => {
      expect(ok.unwrap()).toBe(value)
    })
    it('throws error', () => {
      expect(() => err.unwrap()).toThrow()
    })
  })

  describe('unwrapErr', () => {
    it('throws error', () => {
      expect(() => ok.unwrapErr()).toThrow()
    })
    it('returns value', () => {
      expect(err.unwrapErr()).toBe(error)
    })
  })

  describe('unwrapOr', () => {
    it('returns value', () => {
      expect(ok.unwrapOr(0)).toBe(value)
    })
    it('returns default value', () => {
      expect(err.unwrapOr(0)).toBe(0)
    })
  })

  describe('unwrapOrElse', () => {
    const get_err_len = (err: string) => err.length
    it('returns value', () => {
      expect(ok.unwrapOrElse(get_err_len)).toBe(value)
    })
    it('returns default value', () => {
      expect(err.unwrapOrElse(get_err_len)).toBe(error.length)
    })
  })

  describe('expect', () => {
    it('returns value', () => {
      expect(ok.expect('error message')).toBe(value)
    })
    it('throws error', () => {
      expect(() => err.expect('error message')).toThrow('error message')
    })
  })

  describe('expectErr', () => {
    it('throws error', () => {
      expect(() => ok.expectErr('error message')).toThrow('error message')
    })
    it('returns err', () => {
      expect(err.expectErr('error message')).toBe(error)
    })
  })

  describe('map', () => {
    const stringify = (num: number) => num.toString()
    it('returns Ok', () => {
      expect(ok.map(stringify).unwrap()).toEqual(value.toString())
    })
    it('returns Err', () => {
      expect(err.map(stringify).unwrapErr()).toEqual(error)
    })
  })

  describe('mapErr', () => {
    const get_err_len = (err: string) => err.length
    it('returns Ok', () => {
      expect(ok.mapErr(get_err_len).unwrap()).toEqual(value)
    })
    it('returns Err', () => {
      expect(err.mapErr(get_err_len).unwrapErr()).toEqual(error.length)
    })
  })

  describe('mapOr', () => {
    const stringify = (num: number) => num.toString()
    it('returns Ok', () => {
      expect(ok.mapOr('default', stringify)).toEqual(value.toString())
    })
    it('returns default value', () => {
      expect(err.mapOr('default', stringify)).toEqual('default')
    })
  })

  describe('mapOrElse', () => {
    const stringify = (num: number) => num.toString()
    const handle_err = (err: string) => 'Err: ' + err
    it('returns Ok', () => {
      expect(ok.mapOrElse(handle_err, stringify)).toEqual(value.toString())
    })
    it('returns Err', () => {
      expect(err.mapOrElse(handle_err, stringify)).toEqual('Err: ' + error)
    })
  })

  describe('okToOption', () => {
    it('returns Some', () => {
      expect(ok.okToOption().unwrap()).toBe(value)
    })
    it('returns None', () => {
      expect(err.okToOption().isNone()).toBe(true)
    })
  })

  describe('errToOption', () => {
    it('returns None', () => {
      expect(ok.errToOption().isNone()).toBe(true)
    })
    it('returns Some', () => {
      expect(err.errToOption().unwrap()).toBe(error)
    })
  })

  const ok1: Result<number, string> = new Ok(1)
  const ok2: Result<number, string> = new Ok(2)
  const err1: Result<number, string> = new Err('error1')
  const err2: Result<number, string> = new Err('error2')

  describe('and', () => {
    it('returns Ok', () => {
      expect(ok1.and(ok2).unwrap()).toBe(2)
    })
    it('returns Err', () => {
      expect(ok1.and(err2).unwrapErr()).toBe('error2')
      expect(err1.and(ok2).unwrapErr()).toBe('error1')
      expect(err1.and(err2).unwrapErr()).toBe('error1')
    })
  })

  describe('or', () => {
    it('returns ok', () => {
      expect(ok1.or(err2).unwrap()).toBe(1)
      expect(ok1.or(err2).unwrap()).toBe(1)
      expect(err1.or(ok2).unwrap()).toBe(2)
    })
    it('returns err', () => {
      expect(err1.or(err2).unwrapErr()).toBe('error2')
    })
  })
})

describe('ResultAsync', () => {
  const value = 1
  const error = 'error'
  const ok: ResultAsync<number, string> = ResultAsync.ok(value)
  const err: ResultAsync<number, string> = ResultAsync.err(error)

  const double = (num: number) => num * 2
  const handle_err = (err: string) => 'Err: ' + err

  describe('then', () => {
    it('returns Ok', () => {
      ok.then((v) => {
        expect(v.unwrap()).toBe(value)
      })
    })
    it('returns Err', () => {
      err.then((v) => {
        expect(v.unwrapErr()).toBe(error)
      })
    })
  })

  describe('await', () => {
    it('returns Ok', async () => {
      expect((await ok).unwrap()).toBe(value)
    })
    it('returns Err', async () => {
      expect((await err).unwrapErr()).toBe(error)
    })
  })

  describe('map', () => {
    it('returns Ok', async () => {
      expect((await ok.map(double)).unwrap()).toBe(value * 2)
    })
    it('returns Err', async () => {
      expect((await err.map(double)).unwrapErr()).toBe(error)
    })
  })

  describe('mapErr', () => {
    it('returns Ok', async () => {
      expect((await ok.mapErr(handle_err)).unwrap()).toBe(value)
    })
    it('returns Err', async () => {
      expect((await err.mapErr(handle_err)).unwrapErr()).toBe('Err: ' + error)
    })
  })

  describe('promise conversion', () => {
    const ok_promise = Promise.resolve(1)
    const err_promise = Promise.reject('error')

    describe('from', () => {
      const ok_async: ResultAsync<number, string> = ResultAsync.from(ok_promise)
      const err_async: ResultAsync<number, string> = ResultAsync.from(err_promise)
      it('returns Ok', async () => {
        expect((await ok_async).unwrap()).toBe(1)
      })
      it('returns Err', async () => {
        expect((await err_async).unwrapErr()).toBe('error')
      })
    })

    describe('to', () => {
      it('returns Ok', async () => {
        expect((await ok_promise.toResult()).unwrap()).toBe(1)
      })
      it('returns Err', async () => {
        expect((await err_promise.toResult()).unwrapErr()).toBe('error')
      })
    })
  })
})
