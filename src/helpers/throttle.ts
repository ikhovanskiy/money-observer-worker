function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T> | undefined;

  return function throttled(
    this: any,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = func.apply(this, args);
    }

    return lastResult;
  };
}

export { throttle };
