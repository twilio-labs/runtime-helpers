/**
 * Functions that operate on Serverless `event` objects.
 * @module
 */
import '@twilio-labs/serverless-runtime-types';

type Parameters = {
  [key: string]: string;
};

/**
 * Extracts the HTTP parameters from a Serverless `event`. Can optionally accept a paramter
 * `required`, which is a list of required parameter names that the request to the Function should have
 * included. If any required parameters are missing, this function throws an error `Response` that should
 * be caught and passed to a Serverless Function's `callback`. If `moreInfo` is defined, it should be a
 * documentation URL describing the Function's API.
 *
 * Usage: `const {param1, param2, param3} = extractParams(event, ['param1', 'param2', 'param3']);`
 *
 * @param event A Serverless event.
 * @param required A list of required parameter keys.
 * @param moreInfo An optional URL to the Function's API docs, to be included in error responses.
 */

export function extractParams(
  event: Parameters,
  required: string[] = [],
  moreInfo: string | undefined = undefined
) {
  const missingParams = required.reduce((acc: string[], param: string) => {
    if (typeof event[param] === 'undefined') {
      acc.push(param);
    }
    return acc;
  }, []);

  if (missingParams.length > 0) {
    const response = new Twilio.Response();

    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: `Missing parameter; please provide: '${missingParams.join(
          ', '
        )}'.`,
        moreInfo,
      },
    });

    throw response;
  } else {
    return event;
  }
}
