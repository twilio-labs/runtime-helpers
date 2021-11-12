import { Mock } from 'moq.ts';
import {
  TwilioResponse,
  ResponseConstructor,
  GlobalTwilio,
} from '@twilio-labs/serverless-runtime-types/types';
import { createCORSResponse } from '../response';

describe('createCORSResponse()', () => {
  it('should create a new TwilioResponse with CORS headers', () => {
    const origin = 'example.org';
    const methods = ['GET', 'POST', 'OPTIONS'];
    const headers = ['X-Test'];

    const responseMock = new Mock<TwilioResponse>()
      .setup((instance) =>
        instance.appendHeader('Access-Control-Allow-Origin', origin)
      )
      .returns(undefined)
      .setup((instance) =>
        instance.appendHeader(
          'Access-Control-Allow-Methods',
          methods.join(', ')
        )
      )
      .returns(undefined)
      .setup((instance) =>
        instance.appendHeader(
          'Access-Control-Allow-Headers',
          headers.join(', ')
        )
      )
      .returns(undefined)
      .object();
    const responseConstructorMock = new Mock<ResponseConstructor>()
      .setup((instance) => new instance())
      .returns(responseMock)
      .object();
    globalThis.Twilio = new Mock<GlobalTwilio>()
      .setup((instance) => instance.Response)
      .returns(responseConstructorMock)
      .object();

    createCORSResponse(origin, methods, headers);
  });
});
