import { Option, Some, None } from '../option'
import { Primitive, NonPrimitive } from '../../core/js-types'
import { IsType } from '../../core/utils'
import { BaseP, PFunction, PNone } from '../match/p-pattern'

type OmitPattern<T> = IsType<
  T,
  NonPrimitive.PlainObject,
  { [K in keyof T]: OmitPattern<T[K]> | PFunction<T[K]> | PNone },
  Readonly<T>
>

/**
 * A primitive type.
 */
type Pri = Primitive
type IsPri<T, U, V> = IsType<T, Pri, U, V>
type BPatternPri<T> = IsPri<T, Readonly<T>, never>
type PPatternPri<T> = IsPri<T, PFunction<T> | PNone, never>
// type FinishedPatternPriC<T> = IsPriC<T, Readonly<T>, never>

/**
 * A plain object type.
 */
type Obj = NonPrimitive.PlainObject
type IsObj<T, U, V> = IsType<T, Obj, U, V>
type BPatternObj<T> = IsObj<T, never, never> // never
type PPatternObj<T> = IsObj<T, OmitPattern<T>, never>
// type FinishedPatternObjC<T> = IsObjC<T, OmitPattern<T>, never> // TODO: unused

// TODO: add other kinds of patterns here...

type BPattern<T> = BPatternPri<T> | BPatternObj<T>
type PPattern<T> = PPatternPri<T> | PPatternObj<T>
/**
 * All Patterns that:
 * - narrows the type of `pattern` in function `with`;
 * - ???
 *
 * It is restricted by `T`.
 */
type Pattern<T> = BPattern<T> | PPattern<T>
// type FinishedPatterns<T> = AllPatternPriC<T> | FinishedPatternObjC<T>

/**
 * A matcher that matches a value against a pattern.
 * @param MT The type to match.
 * @param MR Return type of the matcher, which will accumulate by calling `with` function.
 * @param MP Matched type, which will be used when `MType` is checkable.
 * @param MA Whether all patterns are matched.
 */
class MatcherRaw<MT, MR = never, MP extends Pattern<MT> = never, MA extends boolean = false> {
  private to_match_: MT
  private result_: Option<MR>

  constructor(to_match: MT) {
    this.to_match_ = to_match
    this.result_ = new None()
  }

  /**
   * Change the match result without type checking.
   * @param result The match result.
   * @returns A new matcher.
   */
  private transform_<T, R = never, P extends Pattern<T> = never, A extends boolean = false>(
    result?: Option<R>
  ): MatcherRaw<T, R, P, A> {
    if (result) {
      this.result_ = result as any
    }
    return this as any
  }

  private testPrimitive_(to_match: Pri, pattern: Pri): boolean {
    return Primitive.equals(to_match, pattern)
  }

  private testPPattern_(to_match: any, pattern: BaseP): boolean {
    if (pattern instanceof PNone) return true

    if (pattern instanceof PFunction) return pattern.handle(to_match)

    throw new Error(`Unsupported P: ${NonPrimitive.getClassName(pattern)}`)
  }

  private testObject_(to_match: Obj, pattern: Obj): boolean {
    for (const [key, subpattern] of Object.entries(pattern)) {
      const value_to_match = to_match[key]

      if (Primitive.isPrimitive(subpattern) && Primitive.assert(value_to_match)) {
        if (!this.testPrimitive_(value_to_match, subpattern)) return false
        continue
      }

      if (
        NonPrimitive.isPlainObject(subpattern) &&
        NonPrimitive.PlainObject.assert(value_to_match)
      ) {
        if (!this.testObject_(value_to_match, subpattern)) return false
        continue
      }

      if (subpattern instanceof BaseP) {
        if (!this.testPPattern_(value_to_match, subpattern)) return false
        continue
      }

      throw new Error(
        `Unsupported pattern: ${JSON.stringify(subpattern)} at pattern ${JSON.stringify(pattern)}`
      )
    }

    return true
  }

  // Due to the limitation of type inference, PFunction-like pattern should have individual signatures.

  // PPatterns
  /**
   * Branch on a `P` pattern.
   * @param pattern A type `P` pattern.
   * @param handler The function to handle the matched value.
   * @returns A new matcher.
   */
  with<R>(
    pattern: IsType<MA, true, never, PPattern<MT>> &
      (IsObj<MT, PPatternObj<MT>, never> | IsPri<MT, PPatternPri<MT>, never>),
    handler: (value: MT) => R
  ): MatcherRaw<MT, MR | R, MP>

  // BasicPatterns of Primitives
  /**
   * Branch on a primitive type pattern.
   * @param pattern A primitive type pattern.
   * @param handler The function to handle the matched value.
   * @returns A new matcher.
   */
  with<R, P extends BPatternPri<MT>>(
    pattern: IsPri<MT, P, never> & IsType<MA, true, never, P> & IsType<P, MP, never, P>,
    handler: (value: MT) => R
  ): MatcherRaw<MT, MR | R, MP | P, IsType<BPatternPri<MT>, MP | P, true, MA>>

  // BasicPatterns of Objects: no support.

  // `P extends MT` is needed to assist type inference.
  with<R, P extends Pattern<MT> & MT>(
    pattern: P,
    handler: (value: MT) => R
  ): MatcherRaw<MT, MR | R, MP | P, boolean> {
    if (this.result_.isSome()) {
      return this.transform_<MT, MR | R, MP, true>()
    }

    if (pattern instanceof BaseP) {
      if (this.testPPattern_(this.to_match_, pattern)) {
        return this.transform_<MT, MR | R, MP | P, true>(new Some(handler(this.to_match_)))
      } else {
        return this.transform_<MT, MR | R, MP, false>()
      }
    }

    if (NonPrimitive.isPlainObject(pattern) && NonPrimitive.PlainObject.assert(this.to_match_)) {
      if (this.testObject_(this.to_match_, pattern)) {
        return this.transform_<MT, MR | R, MP | P, true>(new Some(handler(this.to_match_)))
      } else {
        return this.transform_<MT, MR | R, MP, false>()
      }
    }

    if (Primitive.isPrimitive(pattern) && Primitive.assert(this.to_match_)) {
      if (this.testPrimitive_(this.to_match_, pattern)) {
        return this.transform_<MT, MR | R, MP | P, true>(new Some(handler(this.to_match_)))
      } else {
        return this.transform_<MT, MR | R, MP | P, false>()
      }
    }

    return this.transform_<MT, MR | R, MP, false>()
  }

  /**
   * Add a fallback handler for the matcher.
   * @param handler The function to handle the matched value.
   * @returns A new matcher.
   */
  otherwise<R>(
    handler: IsType<MA, false, (value: MT) => R, never>
  ): MatcherRaw<MT, MR | R, never, true> {
    if (this.result_.isSome()) {
      return this.transform_<MT, MR | R, never, true>()
    } else {
      return this.transform_<MT, MR | R, never, true>(new Some(handler(this.to_match_)))
    }
  }

  /**
   * Assert that all patterns are matched.
   * @returns The match result.
   *
   * ### Note
   * When using `assertExhaust`, you should ensure the exhaustiveness yourself.
   */
  assertExhaust(): MR {
    return this.result_.expect('MatchError: no pattern matched')
  }

  /**
   * Check if all patterns are matched and return the match result.
   * @returns The match result.
   */
  exhaust(): IsType<MA, true, MR, never> {
    // TODO: fix this type
    return this.result_.expect('MatchError: no pattern matched') as any
  }

  /**
   * Check if all patterns are matched and return the transformed match result.
   * @param fn A function to transform the match result.
   * @returns the transformed result.
   */
  then<R>(fn: (value: MR) => R): IsType<MA, true, R, never> {
    // TODO: fix this type
    return fn(this.exhaust()) as any
  }
}

export { MatcherRaw }
