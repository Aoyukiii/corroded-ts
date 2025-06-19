import { Option, Some, None } from '../src/index'

describe('Option', () => {
  const value = 10
  const some: Option<number> = new Some(value)
  const none: Option<number> = new None()

  const default_hander = () => 2

  const is_positive = (v: number) => v > 0
  const is_negative = (v: number) => v < 0
  const double = (v: number) => v * 2

  describe('isSome', () => {
    it('returns true', () => {
      expect(some.isSome()).toBe(true)
    })
    it('returns false', () => {
      expect(none.isSome()).toBe(false)
    })
  })

  describe('isNone', () => {
    it('returns false', () => {
      expect(some.isNone()).toBe(false)
    })
    it('returns true', () => {
      expect(none.isNone()).toBe(true)
    })
  })

  describe('unwrap', () => {
    it('returns the value', () => {
      expect(some.unwrap()).toBe(value)
    })
    it('throws an error', () => {
      expect(() => none.unwrap()).toThrow()
    })
  })

  describe('unwrapOr', () => {
    it('returns the value', () => {
      expect(some.unwrapOr(2)).toBe(value)
    })
    it('returns the default value', () => {
      expect(none.unwrapOr(2)).toBe(2)
    })
  })

  describe('unwrapOrElse', () => {
    it('returns the value', () => {
      expect(some.unwrapOrElse(default_hander)).toBe(value)
    })
    it('returns the default value', () => {
      expect(none.unwrapOrElse(default_hander)).toBe(2)
    })
  })

  describe('expect', () => {
    it('returns the value', () => {
      expect(some.expect('error message')).toBe(value)
    })
    it('throws an error with the message', () => {
      expect(() => none.expect('error message')).toThrow('error message')
    })
  })

  describe('filter', () => {
    it('returns the value', () => {
      expect(some.filter(is_positive).unwrap()).toBe(value)
    })
    it('returns None', () => {
      expect(some.filter(is_negative).isNone()).toBe(true)
      expect(none.filter(is_positive).isNone()).toBe(true)
    })
  })

  describe('map', () => {
    it('returns the mapped value', () => {
      expect(some.map(double).unwrap()).toBe(value * 2)
    })
    it('returns None', () => {
      expect(none.map(double).isNone()).toBe(true)
    })
  })

  describe('mapOr', () => {
    it('returns the mapped value', () => {
      expect(some.mapOr(2, double)).toBe(value * 2)
    })
    it('returns the default value', () => {
      expect(none.mapOr(2, double)).toBe(2)
    })
  })

  describe('mapOrElse', () => {
    it('returns the mapped value', () => {
      expect(some.mapOrElse(default_hander, double)).toBe(value * 2)
    })
    it('returns the default value', () => {
      expect(none.mapOrElse(default_hander, double)).toBe(2)
    })
  })

  describe('and', () => {
    const some1: Option<number> = new Some(1)
    const some2: Option<string> = new Some('2')
    const none1: Option<number> = new None()
    const none2: Option<string> = new None()

    it('returns None', () => {
      expect(some1.and(none2).isNone()).toBe(true)
      expect(none1.and(some2).isNone()).toBe(true)
      expect(none1.and(none2).isNone()).toBe(true)
    })
    it('returns the second Option', () => {
      expect(some1.and(some2).unwrap()).toBe('2')
    })
  })

  describe('or', () => {
    const some1: Option<number> = new Some(1)
    const some2: Option<number> = new Some(2)
    const none1: Option<number> = new None()
    const none2: Option<number> = new None()

    it('returns Option', () => {
      expect(some1.or(some2).unwrap()).toBe(1)
      expect(some1.or(none2).unwrap()).toBe(1)
      expect(none1.or(some2).unwrap()).toBe(2)
    })
    it('returns None', () => {
      expect(none1.or(none2).isNone()).toBe(true)
    })
  })

  describe('xor', () => {
    const some1: Option<number> = new Some(1)
    const some2: Option<number> = new Some(2)
    const none1: Option<number> = new None()
    const none2: Option<number> = new None()

    it('returns Option', () => {
      expect(some1.xor(none2).unwrap()).toBe(1)
      expect(none1.xor(some2).unwrap()).toBe(2)
    })
    it('returns None', () => {
      expect(some1.xor(some2).isNone()).toBe(true)
      expect(none1.xor(none2).isNone()).toBe(true)
    })
  })

  describe('okOr', () => {
    it('returns an Ok', () => {
      expect(some.okOr('error message').unwrap()).toBe(value)
    })
    it('returns an Err', () => {
      expect(none.okOr('error message').unwrapErr()).toBe('error message')
    })
  })

  describe('okOrElse', () => {
    it('returns an Ok', () => {
      expect(some.okOrElse(() => 'error message').unwrap()).toBe(value)
    })
    it('returns an Err', () => {
      expect(none.okOrElse(() => 'error message').unwrapErr()).toBe('error message')
    })
  })

  describe('andThen', () => {
    it('returns the mapped value', () => {
      expect(some.andThen((v) => new Some(v * 2)).unwrap()).toBe(value * 2)
    })
    it('returns None', () => {
      expect(none.andThen((v) => new Some(v * 2)).isNone()).toBe(true)
    })
  })

  describe('orElse', () => {
    it('returns the value', () => {
      expect(some.orElse(() => new Some(2)).unwrap()).toBe(value)
    })
    it('returns the default value', () => {
      expect(none.orElse(() => new Some(2)).unwrap()).toBe(2)
    })
  })
})
