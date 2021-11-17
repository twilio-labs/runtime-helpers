import rawFetch from 'cross-fetch';

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
 */

export const exponentialDelay = (attempt: number) =>
  Math.pow(2, attempt) * 1000;

const fetchBuilder = (): ((
  input: RequestInfo,
  init?: RequestInitWithRetry
) => Promise<Response>) =>
  require('fetch-retry')(rawFetch, {
    retries: 0,
    retryDelay: exponentialDelay,
  });

/**
 * A cross-platform (Node and browser) implementation of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
 * Fetch implementation supports automatic retries on failure with (by default)
 * exponential backoff, in addition to the standard Fetch API features.
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
