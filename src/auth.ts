/**
 * Authentication-related utilities for use with Twilio Functions.
 * @module
 */
import { Context } from '@twilio-labs/serverless-runtime-types/types';
import * as auth from 'basic-auth';
import compare from 'tsscmp';
import { CustomError } from 'ts-custom-error';

/**
 * A type representing the environment variables used by the
 * {@link isAuthenticated} function. Can be used as a type variable for a
 * Function's `Context` type, IE: `Context<AuthEnvVars>`.
 */

export type AuthEnvVars = {
  AUTH_USERNAME: string;
  AUTH_PASSCODE: string;
};

/**
 * A Serverless Event with headers representing authentication data.
 */

export type AuthEvent = {
  request: {
    headers: {
      authorization: string;
    };
  };
};

/**
 * Uses Twilio Functions' support for the HTTP `authorization` header to
 * check if an incoming request is authenticated.
 *
 * This function expects the environment variables in {@link AuthEnvVars} to
 * be defined in the calling Function's environment.
 *
 * Note that `isAuthenticated` currently only works for one pre-defined username
 * and passcode.
 *
 * Usage:
 * ```
 * if (!isAuthenticated(context, event)) {
 *   return callback(null, 'Invalid credentials');
 * }
 * ```
 *
 * @param context A Serverless Context containing authentication environment variables.
 * @param event An incoming Serverless request.
 * @returns `true` if the incoming request's credentials match those given in the Function's environment variables. `false` otherwise.
 */

export function isAuthenticated(
  context: Context<AuthEnvVars>,
  event: AuthEvent
) {
  const { AUTH_USERNAME, AUTH_PASSCODE } = context;

  if (!AUTH_USERNAME || !AUTH_PASSCODE) {
    throw new AuthEnvError(
      'isAuthenticated requires the AUTH_USERNAME and AUTH_PASSCODE environment variables to be set'
    );
  }

  if (
    !event.request ||
    !event.request.headers ||
    !event.request.headers.authorization
  ) {
    throw new AuthHeaderError(
      'isAuthenticated requires HTTP requests to be sent with the authorization header'
    );
  }

  const parsedCredentials = auth.parse(event.request.headers.authorization);
  if (!parsedCredentials) {
    return false;
  }

  const { name, pass } = parsedCredentials;
  let valid = true;

  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, AUTH_USERNAME) && valid;
  valid = compare(pass, AUTH_PASSCODE) && valid;

  return valid;
}

/**
 * The error type thrown when isAuthenticated's required environment
 * variables are not set.
 */

class AuthEnvError extends CustomError {
  public constructor(message?: string) {
    super(message);
  }
}

/**
 * The error type thrown when isAuthenticated receives a request lacking the
 * `authorization` header.
 */

class AuthHeaderError extends CustomError {
  public constructor(message?: string) {
    super(message);
  }
}
