import { Mock, IMock } from 'moq.ts';
import { Context } from '@twilio-labs/serverless-runtime-types/types';
import { isAuthenticated, AuthEnvVars, AuthEvent } from '../auth';

type AuthContext = Context<AuthEnvVars>;

jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

const testUsername = 'testuser';
const testPasscode = 'testpass';
const testHeader = 'Basic dGVzdHVzZXI6dGVzdHBhc3M=';

function mockContext(
  username: string = testUsername,
  passcode: string = testPasscode
): [AuthContext, IMock<AuthContext>] {
  const contextMock = new Mock<AuthContext>()
    .setup((instance) => instance.AUTH_USERNAME)
    .returns(username)
    .setup((instance) => instance.AUTH_PASSCODE)
    .returns(passcode);

  return [contextMock.object(), contextMock];
}

describe('isAuthenticated()', () => {
  it('should throw if its environment variables are not set', () => {
    const contextWithoutVarsMock = new Mock<AuthContext>().object();
    const authEventMock = new Mock<AuthEvent>().object();

    expect(() =>
      isAuthenticated(contextWithoutVarsMock, authEventMock)
    ).toThrow();
  });

  it('should throw if auth headers are not present', () => {
    const [contextMock] = mockContext();
    const authEventMock = new Mock<AuthEvent>().object();

    expect(() => isAuthenticated(contextMock, authEventMock)).toThrow();
  });

  it('should return false if the auth header does not parse', () => {
    const [contextMock] = mockContext();
    const authEventMock = new Mock<AuthEvent>()
      .setup((instance) => instance.request.headers.authorization)
      .returns('nonsense')
      .object();

    expect(isAuthenticated(contextMock, authEventMock)).toBeFalsy();
  });

  it('should return false if the username is wrong', () => {
    const [contextMock] = mockContext('baduser');
    const authEventMock = new Mock<AuthEvent>()
      .setup((instance) => instance.request.headers.authorization)
      .returns(testHeader)
      .object();

    expect(isAuthenticated(contextMock, authEventMock)).toBeFalsy();
  });

  it('should return false if the passcode is wrong', () => {
    const [contextMock] = mockContext(testUsername, 'badpass');
    const authEventMock = new Mock<AuthEvent>()
      .setup((instance) => instance.request.headers.authorization)
      .returns(testHeader)
      .object();

    expect(isAuthenticated(contextMock, authEventMock)).toBeFalsy();
  });

  it('should return true if authentication succeeds', () => {
    const [contextMock] = mockContext();
    const authEventMock = new Mock<AuthEvent>()
      .setup((instance) => instance.request.headers.authorization)
      .returns(testHeader)
      .object();

    expect(isAuthenticated(contextMock, authEventMock)).toBeTruthy();
  });
});
