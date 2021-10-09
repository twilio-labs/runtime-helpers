import { Mock, It } from 'moq.ts';
import { Context } from '@twilio-labs/serverless-runtime-types/types';
import {
  ServiceContext,
  ServiceInstance,
  ServiceListInstance,
} from 'twilio/lib/rest/serverless/v1/service';
import {
  EnvironmentInstance,
  EnvironmentListInstance,
  EnvironmentContext,
} from 'twilio/lib/rest/serverless/v1/service/environment';
import { VariableInstance } from 'twilio/lib/rest/serverless/v1/service/environment/variable';
import Twilio from 'twilio/lib/rest/Twilio';
import {
  getCurrentEnvironment,
  getEnvironmentVariables,
  getEnvironmentVariable,
  setEnvironmentVariable,
} from '../environment';

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

function mockEnvVar(): VariableInstance {
  return new Mock<VariableInstance>().object();
}

function mockEnvironment(): EnvironmentInstance {
  return new Mock<EnvironmentInstance>()
    .setup((instance) => instance.sid)
    .returns('testsid')
    .setup((instance) => instance.serviceSid)
    .returns('testsid')
    .object();
}

type mockContextConfig = {
  domainName?: string;
  environments?: EnvironmentInstance[];
  envVars?: VariableInstance[];
  variableCreateError?: boolean;
};

function mockContext({
  domainName = 'validDomainName',
  environments = [],
  envVars = [],
  variableCreateError = false,
}: mockContextConfig): Context {
  const serviceInstanceMock = new Mock<ServiceInstance>()
    .setup((instance) => instance.sid)
    .returns('testsid')
    .object();

  const environmentContextMock = new Mock<EnvironmentContext>()
    .setup((instance) => instance.variables.list())
    .returns(Promise.resolve(envVars))
    .setup((instance) => instance.variables.create(It.IsAny()))
    .callback(() => {
      if (variableCreateError) {
        throw new Error('mock error');
      } else {
        return Promise.resolve(mockEnvVar());
      }
    })
    .object();

  const environmentListInstanceMock = new Mock<EnvironmentListInstance>()
    .setup((instance) => instance('testsid'))
    .returns(environmentContextMock)
    .setup((instance) => instance.list())
    .returns(Promise.resolve(environments))
    .object();

  const serviceContextMock = new Mock<ServiceContext>()
    .setup((instance) => instance.environments)
    .returns(environmentListInstanceMock)
    .object();

  const serviceListMock = new Mock<ServiceListInstance>()
    .setup((instance) => instance('testsid'))
    .returns(serviceContextMock)
    .setup((instance) => instance.list())
    .returns(Promise.resolve([serviceInstanceMock]))
    .object();

  const clientMock = new Mock<Twilio>()
    .setup((instance) => instance.serverless.services)
    .returns(serviceListMock)
    .object();

  return new Mock<Context>()
    .setup((instance) => instance.getTwilioClient())
    .returns(clientMock)
    .setup((instance) => instance.DOMAIN_NAME)
    .returns(domainName)
    .object();
}

describe('getCurrentEnvironment()', () => {
  it('should return undefined for localhost', async () => {
    expect(
      await getCurrentEnvironment(
        mockContext({
          domainName: 'localhost',
        })
      )
    ).toBeFalsy();
  });

  it('should return undefined if no environments are found', async () => {
    expect(
      await getCurrentEnvironment(
        mockContext({
          environments: [],
        })
      )
    ).toBeFalsy();
  });

  it('should return the first available environment', async () => {
    const domainName = 'testDomainName1';

    const validEnvMock1 = new Mock<EnvironmentInstance>()
      .setup((instance) => instance.domainName)
      .returns(domainName)
      .object();

    const validEnvMock2 = new Mock<EnvironmentInstance>()
      .setup((instance) => instance.domainName)
      .returns(domainName)
      .object();

    const invalidEnvMock = new Mock<EnvironmentInstance>()
      .setup((instance) => instance.domainName)
      .returns('invalidDomainName1')
      .object();

    const environments = [invalidEnvMock, validEnvMock1, validEnvMock2];

    expect(
      await getCurrentEnvironment(
        mockContext({
          domainName,
          environments,
        })
      )
    ).toBe(validEnvMock1);
  });
});

describe('getEnvironmentVariables()', () => {
  it('should return a list of environment variables', async () => {
    const envVar1 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key1')
      .setup((instance) => instance.value)
      .returns('value1')
      .object();
    const envVar2 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key2')
      .setup((instance) => instance.value)
      .returns('value2')
      .object();
    const envVars = [envVar1, envVar2];

    expect(
      await getEnvironmentVariables(
        mockContext({
          envVars,
        }),
        mockEnvironment()
      )
    ).toBe(envVars);
  });
});

describe('getEnvironmentVariable()', () => {
  it('should return the right value for each environment variable', async () => {
    const envVar1 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key1')
      .setup((instance) => instance.value)
      .returns('value1')
      .object();
    const envVar2 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key2')
      .setup((instance) => instance.value)
      .returns('value2')
      .object();
    const envVars = [envVar1, envVar2];

    expect(
      await getEnvironmentVariable(
        mockContext({
          envVars,
        }),
        mockEnvironment(),
        'key1'
      )
    ).toBe(envVar1);
    expect(
      await getEnvironmentVariable(
        mockContext({
          envVars,
        }),
        mockEnvironment(),
        'key2'
      )
    ).toBe(envVar2);
  });
});

describe('setEnvironmentVariable()', () => {
  it('should skip overriding a variable if override === false', async () => {
    const envVar1 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key1')
      .setup((instance) => instance.value)
      .returns('value1')
      .object();
    const envVar2 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key2')
      .setup((instance) => instance.value)
      .returns('value2')
      .object();
    const envVars = [envVar1, envVar2];

    expect(
      await setEnvironmentVariable(
        mockContext({ envVars }),
        mockEnvironment(),
        'key1',
        'othervalue',
        false
      )
    ).toBeFalsy();
  });

  it('should skip setting a variable to its existing value', async () => {
    const envVar1 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key1')
      .setup((instance) => instance.value)
      .returns('value1')
      .object();
    const envVar2 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key2')
      .setup((instance) => instance.value)
      .returns('value2')
      .object();
    const envVars = [envVar1, envVar2];

    expect(
      await setEnvironmentVariable(
        mockContext({ envVars }),
        mockEnvironment(),
        'key1',
        'value1',
        true
      )
    ).toBeFalsy();
  });

  it('should set an existing variable if override === true', async () => {
    const envVar2 = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key2')
      .setup((instance) => instance.value)
      .returns('value2')
      .object();
    const envVar1Mock = new Mock<VariableInstance>()
      .setup((instance) => instance.key)
      .returns('key1')
      .setup((instance) => instance.value)
      .returns('value1')
      .setup((instance) => instance.update({ value: 'othervalue' }))
      .returns(Promise.resolve(envVar2));
    const envVar1 = envVar1Mock.object();
    const envVars = [envVar1, envVar2];

    expect(
      await setEnvironmentVariable(
        mockContext({ envVars }),
        mockEnvironment(),
        'key1',
        'othervalue',
        true
      )
    ).toBeTruthy();
  });

  it('should create a new environment variable if necessary', async () => {
    expect(
      await setEnvironmentVariable(
        mockContext({}),
        mockEnvironment(),
        'key1',
        'value1',
        false
      )
    ).toBeTruthy();
  });

  it('should handle errors in environment variable creation', async () => {
    expect(
      await setEnvironmentVariable(
        mockContext({ variableCreateError: true }),
        mockEnvironment(),
        'key1',
        'value1',
        false
      )
    ).toBeFalsy();
  });
});
