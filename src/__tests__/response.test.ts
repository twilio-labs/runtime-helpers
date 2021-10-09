import { Mock } from 'moq.ts';
import { TwilioResponse } from '@twilio-labs/serverless-runtime-types/types';
import { enableCORS } from '../response';

describe('enableCORS()', () => {
  it('should modify a TwilioResponse', () => {
    const origin = 'example.org';
    const methods = ['GET', 'POST', 'OPTIONS'];
    const headers = ['X-Test'];
    const responseMock = new Mock<TwilioResponse>()
      .setup((instance) =>
        instance.appendHeader('Access-Control-Allow-Origin', origin)
      )
      .returns()
      .setup((instance) =>
        instance.appendHeader(
          'Access-Control-Allow-Methods',
          methods.join(', ')
        )
      )
      .returns()
      .setup((instance) =>
        instance.appendHeader(
          'Access-Control-Allow-Headers',
          headers.join(', ')
        )
      )
      .returns()
      .object();

    enableCORS(responseMock, origin, methods, headers);
  });
});
