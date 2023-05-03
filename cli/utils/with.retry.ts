import { assertExists } from ".";

// execute a function with args up to MAX_RETRIES number of times with increasing backoff between each retry
// adapted from https://tusharf5.com/posts/type-safe-retry-function-in-typescript/
export type WithRetry = <T extends (...arg0: any[]) => any>(
  func: T,
  args: Parameters<T>,
  attemptNumber?: number
) => Promise<Awaited<ReturnType<T>>>;

const MAX_RETRIES = 3;

export default function provideWithRetry(
  sleep: (durationMs: number) => Promise<void>
): WithRetry {
  assertExists(sleep, "sleep");

  return async function withRetry<T extends (...arg0: any[]) => any>(
    func: T,
    args: Parameters<T>,
    attemptNumber: number = 1
  ): Promise<Awaited<ReturnType<T>>> {
    try {
      const result = await func(...args);
      return result;
    } catch (e) {
      if (attemptNumber >= MAX_RETRIES) throw e;
      await sleep(1000 * attemptNumber); // wait a bit before trying again
      return withRetry(func, args, attemptNumber + 1);
    }
  };
}
