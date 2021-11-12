import '@twilio-labs/serverless-runtime-types';

/**
 * Functions that operate on Serverless `TwilioResponse` objects.
 * @module
 */

/**
 * Create a new `TwilioResponse` with CORS headers.
 *
 * The `origin` parameter is required, but passing in `*` will allow access from any origin.
 *
 * Usage: `const response = createCORSResponse('*');`
 *
 * @param origin A URL string representing an origin, or `*` for any origin.
 * @param methods A list of HTTP methods whose use is allowed by clients.
 * @param headers A list of HTTP headers that can be used in a client's request.
 * @returns A `TwilioResponse` with CORS headers for the given origin, methods, and headers.
 */

export function createCORSResponse(
  origin: string,
  methods: string[] = ['POST', 'OPTIONS'],
  headers: string[] = ['Content-Type']
) {
  const response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', origin);
  response.appendHeader('Access-Control-Allow-Methods', methods.join(', '));
  response.appendHeader('Access-Control-Allow-Headers', headers.join(', '));

  return response;
}
