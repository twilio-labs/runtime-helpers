import rawFetch from 'node-fetch';

/**
 * The type signature for {@link fetch}'s `retryDelay` function.
 */

export type RequestDelayFunction = (
  attempt: number,
  error: Error | null,
  response: Response | null
) => number;

/**
 * The type signature for {@link fetch}'s `retryOn` function.
 */

export type RequestRetryOnFunction = (
  attempt: number,
  error: Error | null,
  response: Response | null
) => boolean | Promise<boolean>;

/**
 * The set of options that can be passed to {@link fetch}, augmented with
 * a number of non-standard fields related to retrying requests.
 */

export interface RequestInitWithRetry extends RequestInit {
  retries?: number;
  retryDelay?: number | RequestDelayFunction;
  retryOn?: number[] | RequestRetryOnFunction;
}

/**
 * The default exponential backoff delay function used by
 * {@link fetch} when it needs to retry a request.
 *
 * Note that since Functions are limited to 10 seconds of runtime, requests
 * that use this delay function can only retry a maximum of 4 times (8 seconds).
 */

export const exponentialDelay = (attempt: number) => Math.pow(2, attempt) * 500;

const fetchBuilder = (): ((
  input: RequestInfo,
  init?: RequestInitWithRetry
) => Promise<Response>) =>
  require('fetch-retry')(rawFetch, {
    retries: 0,
    retryDelay: exponentialDelay,
  });

/**
 * An implementation of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
 * Fetch implementation supports automatic retries on failure with (by default)
 * exponential backoff, in addition to the standard Fetch API features.
 *
 * Note that Functions are limited to 10 seconds of runtime, which imposes a
 * cap on the maximum number of retries and amount of time between retries
 * for failed requests. The default delay function allows for a maximum number
 * of 4 retries before the Function times out, but other requests and time spent
 * executing code will lower the practical maximum.
 *
 * Usage: `const response = await fetch(url, options);`
 *
 * The `options` object supports the following non-standard fields:
 *
 * `retries`: The number of retries to attempt (default 0; no retries)\
 * `retryDelay`: A function or number used to calculate the number of milliseconds to delay between retries (default {@link exponentialDelay})\
 * `retryOn`: An array of HTTP status codes that cause a retry (defaults to the set of network-related status codes)
 */

export const fetch = fetchBuilder();
