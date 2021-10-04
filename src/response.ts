/**
 * Functions that operate on Serverless `TwilioResponse` objects.
 * @module
 */
import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';

/**
 * Modifies a `TwilioResponse` to include CORS headers.
 *
 * The `origin` parameter is required, but passing in `*` will allow access from any origin.
 *
 * Usage: `enableCORS(response, '*');`
 *
 * @param origin A URL string representing an origin, or `*` for any origin.
 * @param methods A list of HTTP methods whose use is allowed by clients.
 * @param headers A list of HTTP headers that can be used in a client's request.
 */

export function enableCORS(
  response: TwilioResponse,
  origin: string,
  methods: string[] = ['POST', 'OPTIONS'],
  headers: string[] = ['Content-Type']
) {
  response.appendHeader('Access-Control-Allow-Origin', origin);
  response.appendHeader('Access-Control-Allow-Methods', methods.join(', '));
  response.appendHeader('Access-Control-Allow-Headers', headers.join(', '));

  return response;
}
