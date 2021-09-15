import { Context } from '@twilio-labs/serverless-runtime-types/types';
import { EnvironmentInstance } from 'twilio/lib/rest/serverless/v1/service/environment';

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

export async function getEnvironmentVariables(
  context: Context,
  environment: EnvironmentInstance
) {
  const client = context.getTwilioClient();
  return client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

export async function getEnvironmentVariable(
  context: Context,
  environment: EnvironmentInstance,
  key: string
) {
  const envVars = await getEnvironmentVariables(context, environment);

  return envVars.find((variable) => variable.key === key);
}

export async function setEnvironmentVariable(
  context: Context,
  environment: EnvironmentInstance,
  key: string,
  value: string,
  override: boolean = true
) {
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
