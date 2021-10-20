/**
 * Logging utilities for use with Twilio Functions.
 * @module
 */

import { Context } from '@twilio-labs/serverless-runtime-types/types';

/**
 * A type describing the environment variable that enables optional logging.
 * This type can be combined with a `Context`, IE `Context<DebugEnvVar>`.
 */

export type DebugEnvVar = {
  TWILIO_DEBUG?: string;
};

/**
 * An object representing a simple logger that outputs to a Function's
 * console. Will enable or disable `info` and `warn` logging based on the
 * presence or absence of a `TWILIO_DEBUG` environment variable. Also tags each
 * log message with a `label` representing the component, system, or app that is
 * logging the message.
 *
 * Usage: `const logger = new Logger(context, 'my-app');`
 *
 * @param context A Serverless Context with debug flag environment variables.
 * @param label A string describing the component, system, or app that logging is being performed for.
 */

export class Logger {
  private context: Context<DebugEnvVar>;
  private label: string;

  constructor(context: Context<DebugEnvVar>, label: string) {
    this.context = context;
    this.label = label;
  }

  private formatLog(level: string, message: string): string {
    return `${new Date().toISOString()} [${this.label}] ${level}: ${message}`;
  }

  /**
   * Log an INFO message to the Function console, if the `TWILIO_DEBUG`
   * environment variable exists.
   *
   * @param message The message to write to the console.
   */

  info(message: string): void {
    if (this.context.TWILIO_DEBUG) {
      console.log(this.formatLog('INFO', message));
    }
  }

  /**
   * Log a WARN message to the Function console, if the `TWILIO_DEBUG`
   * environment variable exists.
   *
   * @param message The message to write to the console.
   */

  warn(message: string): void {
    if (this.context.TWILIO_DEBUG) {
      console.warn(this.formatLog('WARN', message));
    }
  }

  /**
   * Log an error to the Function console.
   *
   * @param message The message to write to the console.
   */

  error(message: string): void {
    console.error(this.formatLog('ERROR', message));
  }
}
