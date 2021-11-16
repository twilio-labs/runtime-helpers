import rawFetch from 'cross-fetch';
const fetchBuilder = require('fetch-retry').default;

/**
 * The default exponential backoff delay function used by
 * {@link fetch} when it needs to retry a request.
 */

export const exponentialDelay = (attempt: number) =>
  Math.pow(2, attempt) * 1000;

/**
 * A cross-platform (Node and browser) implementation of the
 * (Fetch API)[https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API]. This
 * Fetch implementation supports automatic retries on failure with (by default)
 * exponential backoff, in addition to the standard Fetch API features.
 *
 * Usage: `const response = await fetch(url, options);`
 *
 * The `options` object supports the following non-standard fields:
 *
 * `retries`: The number of retries to attempt (default 0; no retries)
 * `retryDelay`: A function or number used to calculate the number of milliseconds to delay between retries (default {@link exponentialDelay})
 * `retryOn`: An array of HTTP status codes that cause a retry (defaults to the set of network-related status codes)
 */

export const fetch = fetchBuilder(rawFetch, {
  retries: 0, // Default to no retry
  retryDelay: exponentialDelay,
});
