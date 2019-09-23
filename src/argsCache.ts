export function createArgsCache<A extends any[], V>(
  valueGetter: (...args: A) => V,
) {
  const noArgsSymbol = Symbol('no-args');

  const nestedCacheMap = new Map<any, any>();

  function getArgsParentMap(args: A) {
    if (args.length === 0) {
      return nestedCacheMap;
    }

    const lastArgumentParentMap: Map<any, any> = args.reduce(
      (currentArgMap: Map<any, any>, currentArgument, index) => {
        const hasMoreArgs = index < args.length - 1;

        if (!hasMoreArgs) {
          return currentArgMap;
        }

        if (currentArgMap.has(currentArgument)) {
          return currentArgMap.get(currentArgument);
        }

        const nextArgMap = new Map<any, any>();
        currentArgMap.set(currentArgument, nextArgMap);

        return nextArgMap;
      },
      nestedCacheMap,
    );

    return lastArgumentParentMap;
  }

  function getLastArgumentFromArgs(args: A) {
    if (args.length === 0) {
      return noArgsSymbol;
    }

    return args[args.length - 1];
  }

  function getCacheForArgs(args: A): V {
    const argsParentMap = getArgsParentMap(args);

    const lastArgument = getLastArgumentFromArgs(args);

    if (argsParentMap.has(lastArgument)) {
      return argsParentMap.get(lastArgument);
    }

    const value = valueGetter(...args);

    argsParentMap.set(lastArgument, value);

    return value;
  }

  function setCacheForArgs(args: A, value: V) {
    const argsParentMap = getArgsParentMap(args);

    const lastArgument = getLastArgumentFromArgs(args);

    argsParentMap.set(lastArgument, value);
  }

  function clearCacheForArgs(args: A) {
    const argsParentMap = getArgsParentMap(args);

    const lastArgument = getLastArgumentFromArgs(args);

    argsParentMap.delete(lastArgument);
  }

  function clearCache() {
    nestedCacheMap.clear();
  }

  return {
    get: getCacheForArgs,
    set: setCacheForArgs,
    remove: clearCacheForArgs,
    clear: clearCache,
  };
}
