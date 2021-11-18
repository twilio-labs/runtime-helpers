import { Mock } from 'moq.ts';
import {
  TwilioResponse,
  ResponseConstructor,
  GlobalTwilio,
} from '@twilio-labs/serverless-runtime-types/types';
import { createCORSResponse } from '../response';

class Response implements TwilioResponse {
  headers: { [key: string]: string };

  constructor() {
    this.headers = {};
  }

  appendHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  setHeaders(headers: { [key: string]: string }): void {
    this.headers = headers;
  }

  setStatusCode() {}
  setBody() {}
}

describe('createCORSResponse()', () => {
  it('should create a new TwilioResponse with CORS headers', () => {
    const origin = 'example.org';
    const methods = ['GET', 'POST', 'OPTIONS'];
    const headers = ['X-Test'];

    const responseConstructorMock = new Mock<ResponseConstructor>()
      .setup((instance) => new instance())
      .returns(new Response())
      .object();
    globalThis.Twilio = new Mock<GlobalTwilio>()
      .setup((instance) => instance.Response)
      .returns(responseConstructorMock)
      .object();

    const response = createCORSResponse(origin, methods, headers) as Response;

    expect(response.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(response.headers['Access-Control-Allow-Methods']).toEqual(
      methods.join(', ')
    );
    expect(response.headers['Access-Control-Allow-Headers']).toEqual(
      headers.join(', ')
    );
  });
});
