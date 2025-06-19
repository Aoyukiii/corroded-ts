import { Option, Some, None, OptionTypeOf } from './option'
import { P } from './match/p-pattern'
import { MatcherRaw } from './match/matcher-raw'
import { MatcherOption } from './match/matcher-option'
import { MatcherResult } from './match/matcher-result'
import { Err, ErrTypeOf, Ok, OkTypeOf, Result } from './result'

type Matcher<T> = [T] extends [Option<unknown>]
  ? MatcherOption<OptionTypeOf<T>>
  : [T] extends [Result<unknown>]
  ? MatcherResult<OkTypeOf<T>, ErrTypeOf<T>>
  : MatcherRaw<T>

/**
 * Creates a matcher with a value.
 * @param to_match The value to match.
 * @returns A matcher.
 */
function match<MType>(to_match: MType): Matcher<MType> {
  if (to_match instanceof Some || to_match instanceof None) {
    return new MatcherOption<unknown>(to_match) as any
  } else if (to_match instanceof Ok || to_match instanceof Err) {
    return new MatcherResult<unknown, unknown>(to_match) as any
  } else {
    return new MatcherRaw(to_match) as any
  }
}

export { match, P, MatcherRaw as Matcher }
