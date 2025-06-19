import { Result } from '../result'
import { IsType } from '../../core/utils'

class MatcherResult<T, E, MR = never, Ok = false, Err = false> {
  private to_match_: Result<T, E>
  private ok_handler_?: (value: T) => MR
  private err_handler_?: () => MR
  constructor(to_match: Result<T, E>) {
    this.to_match_ = to_match
  }

  ok<R>(
    handler: (value: T) => R
  ): IsType<Err, true, MR | R, MatcherResult<T, E, MR | R, true, false>> {
    this.ok_handler_ = handler as any
    if (this.err_handler_ == null || this.ok_handler_ == null) {
      return this as any
    } else {
      return this.to_match_.mapOrElse(this.err_handler_, this.ok_handler_) as any
    }
  }

  err<R>(
    handler: (value: E) => R
  ): IsType<Ok, true, MR | R, MatcherResult<T, E, MR | R, false, true>> {
    this.err_handler_ = handler as any
    if (this.err_handler_ == null || this.ok_handler_ == null) {
      return this as any
    } else {
      return this.to_match_.mapOrElse(this.err_handler_, this.ok_handler_) as any
    }
  }
}

export { MatcherResult }
