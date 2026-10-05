import { describe, expect, it } from 'vitest';
import { toAppError } from './api-error';

describe('toAppError', () => {
  it('keeps the API error code and message', () => {
    const error = {
      data: {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      },
      response: {},
    };
    expect(toAppError(error)).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password',
      status: 401,
    });
  });

  it('reports a network error when there was no response at all', () => {
    const result = toAppError(new TypeError('Failed to fetch'));
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toMatch(/cannot reach the server/i);
  });

  it('falls back to a generic message for responses without an API error body', () => {
    const result = toAppError({
      response: {},
      statusCode: 502,
      data: '<html>Bad gateway</html>',
    });
    expect(result).toEqual({
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
      status: 502,
    });
  });

  it('copes with non-error values', () => {
    expect(toAppError(undefined).code).toBe('NETWORK_ERROR');
    expect(toAppError(null).code).toBe('NETWORK_ERROR');
  });
});
