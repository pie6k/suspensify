import { createArgsCache } from './argsCache';

export function suspensify<T, A extends any[]>(
  promiseGetter: (...args: A) => Promise<T>,
): (...args: A) => T {
  const [getCacheForArgs, setCacheForArgs] = createArgsCache<A, T | Promise<T>>(
    promiseGetter,
  );

  return function getSuspended(...args: A) {
    // prepare cache key for given args

    const cacheValue = getCacheForArgs(args);

    // if value in cache is still promise
    if (cacheValue instanceof Promise) {
      cacheValue.then((result) => {
        if (result instanceof Promise) {
          throw new Error('Suspensed promise resolved to another promise.');
        }
        setCacheForArgs(args, result);
      });
      // throw it to suspend
      throw cacheValue;
    }

    // cache value is resolved - just return it
    return cacheValue;
  };
}

export default suspensify;
