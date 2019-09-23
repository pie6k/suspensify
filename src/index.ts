import { createArgsCache } from './argsCache';
import { isSuspenseError, SuspenseError } from './error';

export function suspensify<T, A extends any[]>(
  promiseGetter: (...args: A) => Promise<T>,
) {
  const argsCache = createArgsCache<A, T | Promise<T> | SuspenseError<any>>(
    promiseGetter,
  );

  function getSuspended(...args: A) {
    // get currently cache value for given args
    const valueOrValuePromise = argsCache.get(args);

    // if it resolved to error, just throw it
    if (isSuspenseError(valueOrValuePromise)) {
      throw valueOrValuePromise.originalError;
    }

    // if value in cache is still a promise
    if (valueOrValuePromise instanceof Promise) {
      // wait for it to resolve or reject and update cache with result
      valueOrValuePromise
        .then((resolvedValue) => {
          if (resolvedValue instanceof Promise) {
            throw new Error('Suspensed promise resolved to another promise.');
          }
          // update cache with resolved value instead of promise
          argsCache.set(args, resolvedValue);
        })
        .catch((error) => {
          // update cache with error that will be thrown on next use
          argsCache.set(args, new SuspenseError(error));
        });

      // throw promise to suspend
      throw valueOrValuePromise;
    }

    // cache value is resolved and it's not error - just return it
    return valueOrValuePromise;
  }

  const removeCacheForArgs = argsCache.remove;
  const clearCache = argsCache.clear;

  return [getSuspended, { removeCacheForArgs, clearCache }] as const;
}

export default suspensify;
