/**
 * Functions that operate on Serverless `event` objects.
 * @module
 */
import '@twilio-labs/serverless-runtime-types';
import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import ow from 'ow';

type Parameters = {
  [key: string]: string;
};

/**
 * Ensures that a Serverless `event` has HTTP parameters defined for the keys
 * given in the argument `required`. If any required parameters are missing, an
 * error response is generated and passed to the given Serverless `callback`.
 *
 * Usage: `expectParams(event, callback, ['param1', 'param2', 'param3']);`
 *
 * @param event A Serverless event.
 * @param callback A Serverless callback.
 * @param required A list of required parameter keys.
 * @param moreInfo An optional URL to the Function's API docs, to be included in error responses.
 */

export function expectParams(
  event: unknown,
  callback: ServerlessCallback,
  required: string[],
  moreInfo: string | undefined = undefined
) {
  try {
    ow(event, ow.object.hasKeys.apply(required).valuesOfType(ow.string));
  } catch (error: any) {
    const response = new Twilio.Response();

    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: error.message,
        moreInfo,
      },
    });

    return callback(null, response);
  }
}
