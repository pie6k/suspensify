export class SuspenseError<T> extends Error {
  public readonly type = 'SuspenseError';
  constructor(public originalError: T) {
    super('SuspenseError');
  }
}

export function isSuspenseError(input: any): input is SuspenseError<any> {
  return input && input.type === 'SuspenseError';
}
