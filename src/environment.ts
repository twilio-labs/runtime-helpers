/**
 * A set of utilities for accessing and modifying environment variables in
 * Twilio Functions.
 * @module
 */
import { Context } from '@twilio-labs/serverless-runtime-types/types';
import { EnvironmentInstance } from 'twilio/lib/rest/serverless/v1/service/environment';
import { VariableInstance } from 'twilio/lib/rest/serverless/v1/service/environment/variable';

/**
 * Given a Serverless `Context` object, finds and returns the first available `EnvironmentInstance`.
 *
 * Note that if running on `localhost`, or if no `EnvironmentInstance`s are available, this function
 * returns `undefined`.
 *
 * Usage: `const environment = await getCurrentEnvironment(context);`
 *
 * @param context The current Serverless context.
 * @returns The first valid environment for the given context, or `undefined`.
 */

export async function getCurrentEnvironment(
  context: Context
): Promise<EnvironmentInstance | undefined> {
  if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')) {
    return;
  }
  const client = context.getTwilioClient();
  const services = await client.serverless.services.list();
  for (const service of services) {
    const environments = await client.serverless
      .services(service.sid)
      .environments.list();
    const environment = environments.find(
      (env) => env.domainName === context.DOMAIN_NAME
    );

    if (environment) {
      return environment;
    }
  }
}

/**
 * Given a Serverless `Context` and an `EnvironmentInstance` (usually from {@link getCurrentEnvironment}),
 * returns a list of defined environment variable instances.
 *
 * Usage: `const envVars = await getEnvironmentVariables(context, environment);`
 *
 * @param context The current Serverless context.
 * @param environment A Serverless environment.
 * @returns A list of environment variable instances.
 */

export async function getEnvironmentVariables(
  context: Context,
  environment: EnvironmentInstance
): Promise<VariableInstance[]> {
  const client = context.getTwilioClient();
  return client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

/**
 * Given a Serverless `Context`, an `EnvironmentInstance` (usually from
 * {@link getCurrentEnvironment}), and a string `key`, returns the environment
 * variable corresponding to `key`, or `undefined` if no matching variable
 * exists.
 *
 * Usage: `const var = await getEnvironmentVariable(context, environment, 'var');`
 *
 * @param context The current Serverless context.
 * @param environment A Serverless environment.
 * @param key The name of the environment variable to access.
 * @returns The `VariableInstance` matching the `key`, or `undefined` if no match is found.
 */

export async function getEnvironmentVariable(
  context: Context,
  environment: EnvironmentInstance,
  key: string
): Promise<VariableInstance | undefined> {
  const envVars = await getEnvironmentVariables(context, environment);

  return envVars.find((variable) => variable.key === key);
}

/**
 * For a given Serverless `Context` and `EnvironmentInstance`, set the environment variable
 * named `key` to `value`.
 *
 * If the `override` parameter is `true` (the default), setting an existing environment variable
 * will override its current value with the new one. If it is `false`, then this function will instead
 * log a warning and return `false`.
 *
 * Usage: `setEnvironmentVariable(context, envrionment, 'var', 'value');`
 *
 * @param context The current Serverless context.
 * @param environment A Serverless environment.
 * @param key The name of the environment variable to set.
 * @param value The value to store in the environment variable.
 * @param override If true, allow overriding existing variables.
 * @returns `true` if setting the environment variable succeeded, `false` if an error occurred
 */

export async function setEnvironmentVariable(
  context: Context,
  environment: EnvironmentInstance,
  key: string,
  value: string,
  override: boolean = true
): Promise<boolean> {
  const client = context.getTwilioClient();
  try {
    const currentVariable = await getEnvironmentVariable(
      context,
      environment,
      key
    );
    if (currentVariable) {
      if (currentVariable.value !== value) {
        if (override) {
          await currentVariable.update({ value });
          return true;
        }
        console.warn(
          `Not overriding existing variable '${key}' which is set to '${currentVariable.value}'`
        );
        return false;
      }
      console.warn(`Variable '${key}' was already set to '${value}'`);
      return false;
    }
    await client.serverless
      .services(environment.serviceSid)
      .environments(environment.sid)
      .variables.create({
        key,
        value,
      });
  } catch (err) {
    console.error(`Error creating '${key}' with '${value}': ${err}`);
    return false;
  }
  return true;
}
