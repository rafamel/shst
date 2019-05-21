export default class ShError extends Error {
  public static stackTraceLimit: number = Error.stackTraceLimit;
  public constructor(message: string) {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = ShError.stackTraceLimit;
    super(message);
    Error.stackTraceLimit = limit;
  }
  public get name(): string {
    return 'ShError';
  }
}

export function InternalShError(
  this: ShError,
  message: string
): void | ShError {
  if (!new.target) return new ShError(message);

  const err: Error = new ShError(message);
  Object.defineProperties(this, {
    message: { enumerable: false, value: err.message },
    stack: { enumerable: false, value: err.stack }
  });
}
InternalShError.prototype = Object.create(ShError.prototype);
