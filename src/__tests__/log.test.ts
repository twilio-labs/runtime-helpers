import { Mock } from 'moq.ts';
import { Context } from '@twilio-labs/serverless-runtime-types/types';
import { Logger, DebugEnvVar } from '../log';

const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

beforeEach(() => {
  consoleLogMock.mockClear();
  consoleWarnMock.mockClear();
  consoleErrorMock.mockClear();
});

afterAll(() => {
  consoleLogMock.mockRestore();
  consoleWarnMock.mockRestore();
  consoleErrorMock.mockRestore();
});

function mockContext(debugEnvVar: boolean) {
  return new Mock<Context<DebugEnvVar>>()
    .setup((instance) => instance.TWILIO_DEBUG)
    .returns(debugEnvVar ? 'true' : undefined)
    .object();
}

describe('class Logger', () => {
  describe('info()', () => {
    it('should log a properly-formatted message', () => {
      const logger = new Logger(mockContext(true), 'test');

      logger.info('test message');
      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringMatching(/.* \[test\] INFO: test message/)
      );
    });

    it('should skip logging without TWILIO_DEBUG', () => {
      const logger = new Logger(mockContext(false), 'test');

      logger.info('test message');
      expect(consoleLogMock).not.toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('should log a properly-formatted message', () => {
      const logger = new Logger(mockContext(true), 'test');

      logger.warn('test message');
      expect(consoleWarnMock).toHaveBeenCalledWith(
        expect.stringMatching(/.* \[test\] WARN: test message/)
      );
    });

    it('should skip logging without TWILIO_DEBUG', () => {
      const logger = new Logger(mockContext(false), 'test');

      logger.warn('test message');
      expect(consoleWarnMock).not.toHaveBeenCalled();
    });
  });

  describe('error()', () => {
    it('should log a properly-formatted message', () => {
      const logger = new Logger(mockContext(true), 'test');

      logger.error('test message');
      expect(consoleErrorMock).toHaveBeenCalledWith(
        expect.stringMatching(/.* \[test\] ERROR: test message/)
      );
    });
  });
});
