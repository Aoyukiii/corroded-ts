import { Option } from '../option'
import { IsType } from '../../core/utils'

class MatcherOption<T, MR = never, Some = false, None = false> {
  private to_match_: Option<T>
  private some_handler_?: (value: T) => MR
  private none_handler_?: () => MR
  constructor(to_match: Option<T>) {
    this.to_match_ = to_match
  }

  some<R>(
    handler: (value: T) => R
  ): IsType<None, true, MR | R, MatcherOption<T, MR | R, true, false>> {
    this.some_handler_ = handler as any
    if (this.none_handler_ == null || this.some_handler_ == null) {
      return this as any
    } else {
      return this.to_match_.mapOrElse(this.none_handler_, this.some_handler_) as any
    }
  }

  none<R>(
    handler: () => R
  ): IsType<Some, true, MR | R, MatcherOption<T, MR | R, false, true>> {
    this.none_handler_ = handler as any
    if (this.none_handler_ == null || this.some_handler_ == null) {
      return this as any
    } else {
      return this.to_match_.mapOrElse(this.none_handler_, this.some_handler_) as any
    }
  }
}

export { MatcherOption }
