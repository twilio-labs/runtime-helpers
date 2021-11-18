/**
 * Functions that operate on Serverless `event` objects.
 * @module
 */
import '@twilio-labs/serverless-runtime-types';
import {
  ServerlessFunctionSignature,
  EnvironmentVariables,
} from '@twilio-labs/serverless-runtime-types/types';
import ow from 'ow';

/**
 * The set of options that can be passed into {@link expectParams}.
 */

export interface ExpectParamsOptions {
  moreInfo?: string;
}

/**
 * This is a higher-order function that wraps a given Serverless entry point
 * `handler` and verifies that each of the HTTP parameters in the list
 * `requiredParams` is set. If any required parameters are missing, this
 * function will generate an appropriate error response and send that instead of
 * running the code in `handler`. `options` is a set of optional configuration
 * values; for now, this is just the `moreInfo` field, which adds a link to
 * the relevant documentation for the returned error if set.
 *
 * Usage:
 * ```
 * const params = ['param1', 'param2'];
 *
 * exports.handler = expectParams(params, (context, event, callback) => {
 *   console.log('Only gets invoked if the params are provided');
 *   callback(null, { success: true });
 * });
 * ```
 *
 * @param requiredParams The list of required HTTP parameters.
 * @param handler A Serverless entry point to wrap.
 * @param options Optional configuration parameters.
 * @returns A Serverless entry point suitable for use as a Function's `exports.handler`.
 */

export function expectParams<T extends EnvironmentVariables = {}, U = {}>(
  requiredParams: string[],
  handler: ServerlessFunctionSignature<T, U>,
  options: ExpectParamsOptions = {}
): ServerlessFunctionSignature<T, U> {
  return (context, event, callback) => {
    try {
      ow(
        event,
        ow.object.hasKeys.apply(requiredParams).valuesOfType(ow.string)
      );
    } catch (error: any) {
      const response = new Twilio.Response();

      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(400);
      response.setBody({
        error: {
          message: error.message,
          moreInfo: options.moreInfo,
        },
      });

      return callback(null, response);
    }

    return handler(context, event, callback);
  };
}
