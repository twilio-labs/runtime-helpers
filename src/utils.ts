/**
 * Miscellaneous utility functions.
 * @module
 */
import '@twilio-labs/serverless-runtime-types';
import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';

/**
 * Works like NodeJS `require`, but loads code from the requested Twilio Asset
 * path.
 *
 * Usually, non-NPM code libraries included in your Function deployment bundle
 * cannot be accessed by their filename; instead, use either a Twilio Asset path
 * or a private Function name, depending on whether your code is in the `assets`
 * or the `functions` directory.
 *
 * Usage: `const mylib = requireAsset('mylib');`
 *
 * @param assetPath The path to the Twilio Asset you want to load as code.
 * @returns A NodeJS module.
 */

export function requireAsset(assetPath: string): any {
  const assets = Runtime.getAssets();

  // Prepend '/' to assetPath if not already present
  assetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  if (assets[assetPath]) {
    return require(assets[assetPath].path);
  } else if (assets[`${assetPath}.json`]) {
    return require(assets[`${assetPath}.json`].path);
  } else {
    return require(assets[`${assetPath}.js`].path);
  }
}

/**
 * Works like NodeJS `require`, but loads code from the requested Twilio Function
 * name.
 *
 * Usually, non-NPM code libraries included in your Function deployment bundle
 * cannot be accessed by their filename; instead, use either a Twilio Asset path
 * or a private Function name, depending on whether your code is in the `assets`
 * or the `functions` directory.
 *
 * Usage: `const mylib = requireFunction('mylib');`
 *
 * @param functionName The name of the Twilio Function whose code you want to load.
 * @returns A NodeJS module.
 */

export function requireFunction(functionName: string): any {
  const functions = Runtime.getFunctions();

  // If functionName starts with '/', remove it
  functionName = functionName.startsWith('/')
    ? functionName.slice(1)
    : functionName;
  return require(functions[functionName].path);
}

/**
 * Small helper function to cause a Function to emit a successful response.
 *
 * Usage: `return success(callback, {message: 'Completed successfully'});`
 *
 * @param callback A Serverless callback.
 * @param data An optional JSON object to be included with the response.
 */

export function success(callback: ServerlessCallback, data: {} = {}) {
  const response = new Twilio.Response();

  response.appendHeader('Content-Type', 'application/json');
  response.setBody({
    success: true,
    ...data,
  });

  return callback(null, response);
}

/**
 * Small helper function to cause a Function to emit an error response.
 *
 * Usage: `return failure(callback, 'An error occurred');`
 *
 * @param callback A Serverless callback.
 * @param reason An error message.
 */

export function failure(callback: ServerlessCallback, reason: string) {
  const response = new Twilio.Response();

  response.appendHeader('Content-Type', 'application/json');
  response.setStatusCode(500);
  response.setBody({
    success: false,
    error: reason,
  });

  return callback(null, response);
}
