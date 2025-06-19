import { None, Option, Some, match, P, Result, Ok, Err } from '../src/index'

describe('match', () => {
  describe('enumerable patterns', () => {
    type response = 200 | 400 | 'message'
    function handleResponse(response: response) {
      return match(response)
        .with(200, () => 'ok')
        .with(400, () => 'not found')
        .with('message', () => 'message received')
        .exhaust()
    }

    it('gets ok', () => {
      expect(handleResponse(200)).toBe('ok')
    })

    it('gets not found', () => {
      expect(handleResponse(400)).toBe('not found')
    })

    it('gets a message', () => {
      expect(handleResponse('message')).toBe('message received')
    })
  })

  describe('primitive patterns', () => {
    function abs(x: number) {
      return match(x)
        .with(0, () => 0)
        .with(
          P.fn((x) => x > 0),
          () => x
        )
        .otherwise(() => -x)
        .exhaust()
    }

    it('gets 0', () => {
      expect(abs(0)).toBe(0)
    })
    it('gets positive', () => {
      expect(abs(5)).toBe(5)
    })
    it('gets negative', () => {
      expect(abs(-5)).toBe(5)
    })
  })

  describe('object patterns', () => {
    type Parcel = {
      id: number
      weight: number
      address: { global: boolean; city: string }
      state: 'new' | 'in transit' | 'delivered'
    }

    type Info = {
      id: number
      address: string
      delivered: boolean
      overweight: boolean
    }

    function getInfo(parcel: Parcel): Info {
      return {
        id: parcel.id,
        address: match(parcel.address)
          .with({ global: true, city: P._ }, (a) => 'G-' + a.city)
          .with({ global: false, city: P._ }, (a) => 'L-' + a.city)
          .assertExhaust(),
        delivered: match(parcel.state)
          .with('delivered', () => true)
          .otherwise(() => false)
          .exhaust(),
        overweight: match(parcel.weight)
          .with(
            P.fn((w) => w > 10),
            () => true
          )
          .otherwise(() => false)
          .exhaust(),
      }
    }

    it('gets global address', () => {
      expect(
        getInfo({
          id: 1,
          weight: 5,
          address: { global: true, city: 'New York' },
          state: 'delivered',
        })
      ).toEqual({
        id: 1,
        address: 'G-New York',
        delivered: true,
        overweight: false,
      })
    })

    it('gets local address', () => {
      expect(
        getInfo({
          id: 2,
          weight: 15,
          address: { global: false, city: 'Los Angeles' },
          state: 'in transit',
        })
      ).toEqual({
        id: 2,
        address: 'L-Los Angeles',
        delivered: false,
        overweight: true,
      })
    })
  })

  describe('then()', () => {
    function strangeSqrt(value: number) {
      return match(value) // tell if it's positive
        .with(
          P.fn((x) => x >= 0),
          (x) => x
        )
        .otherwise(() => 0)
        .then(Math.sqrt)
    }

    it('is 2', () => {
      expect(strangeSqrt(4)).toBe(2)
    })
    it('is 0', () => {
      expect(strangeSqrt(-4)).toBe(0)
    })
  })

  describe('option', () => {
    function matchOption(option: Option<number>) {
      return match(option)
        .some((x) => x + 1)
        .none(() => 'no value')
    }

    it('gets 2', () => {
      expect(matchOption(new Some(1))).toBe(2)
    })
    it('gets no value', () => {
      expect(matchOption(new None())).toBe('no value')
    })
  })

  describe('result', () => {
    function matchResult(result: Result<number, string>) {
      return match(result)
        .ok((x) => 2 * x)
        .err((e) => 'Err: ' + e)
    }

    it('gets 2', () => {
      expect(matchResult(new Ok(1))).toBe(2)
    })
    it('gets Err', () => {
      expect(matchResult(new Err('error'))).toBe('Err: error')
    })
  })
})
