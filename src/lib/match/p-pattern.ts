
abstract class BaseP {
  private declare basep_: void
}

class PNone extends BaseP {
  private declare pnone_: void
}

class PFunction<T> extends BaseP {
  private declare pfunction_: void
  private handler_: (value: T) => boolean
  constructor(handler: (value: T) => boolean) {
    super()
    this.handler_ = handler
  }

  handle(value: T): boolean {
    return this.handler_(value)
  }
}

namespace PPattern {
  /**
   * A pattern that matches nothing.
   */
  export const _ = new PNone()

  /**
   * Returns a pattern that matches with a function.
   * @param handler A function to handle the matched value.
   * @returns A function pattern `PFunction`.
   */
  export function fn<T>(handler: (value: T) => boolean): PFunction<T> {
    return new PFunction(handler)
  }
}

export { PPattern as P, BaseP, PNone, PFunction }