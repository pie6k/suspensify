export function createArgsCache<A extends any[], V>(
  valueGetter: (...args: A) => V,
) {
  let noArgsCache: V | undefined;

  const nestedCacheMap = new Map<any, any>();

  function getOrSetCacheForArgs(args: A, setValue?: V) {
    if (args.length === 0) {
      if (noArgsCache !== undefined) {
        return noArgsCache;
      }
      const argsValue = valueGetter(...args);
      noArgsCache = argsValue;
      return argsValue;
    }

    const argsValue: V = args.reduce(
      (currentArgMap: Map<any, any>, currentArgument, index) => {
        const hasMoreArgs = index < args.length - 1;

        if (currentArgMap.has(currentArgument)) {
          if (!hasMoreArgs && setValue) {
            currentArgMap.set(currentArgument, setValue);
            return setValue;
          }
          return currentArgMap.get(currentArgument);
        }

        if (hasMoreArgs) {
          const nextArgMap = new Map<any, any>();
          currentArgMap.set(currentArgument, nextArgMap);

          return nextArgMap;
        }

        const valueToSave =
          setValue !== undefined ? setValue : valueGetter(...args);

        currentArgMap.set(currentArgument, valueToSave);

        return valueToSave;
      },
      nestedCacheMap,
    );

    return argsValue;
  }

  function getCacheForArgs(args: A) {
    return getOrSetCacheForArgs(args);
  }

  function setCacheForArgs(args: A, value: V) {
    return getOrSetCacheForArgs(args, value);
  }

  return [getCacheForArgs, setCacheForArgs] as const;
}
