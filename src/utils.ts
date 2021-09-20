/**
 * Miscellaneous utility functions.
 * @module
 */
import '@twilio-labs/serverless-runtime-types';

/**
 * Works like NodeJS `require`, but loads code from the requested Twilio Asset
 * path.
 *
 * Usually, non-NPM code libraries included in your Function deployment bundle
 * cannot be accessed by their filename; instead, use either a Twilio Asset path
 * or a private Function name, depending on whether your code is in the `assets`
 * or the `functions` directory.
 *
 * @param assetPath The path to the Twilio Asset you want to load as code.
 * @returns A NodeJS module.
 */

export function requireAsset(assetPath: string): any {
  const assets = Runtime.getAssets();
  return require(assets[assetPath].path);
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
 * @param functionName The name of the Twilio Function whose code you want to load.
 * @returns A NodeJS module.
 */

export function requireFunction(functionName: string): any {
  const { path } = Runtime.getFunctions()[functionName];
  return require(path);
}
