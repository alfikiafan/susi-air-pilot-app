import type { ApiError } from '~/types/api';

export interface AppError {
  code: string;
  message: string;
  status?: number;
}

/** Normalises anything $fetch can throw into something the UI can show. */
export function toAppError(error: unknown): AppError {
  const fetchError = error as {
    data?: Partial<ApiError>;
    statusCode?: number;
    response?: unknown;
  };
  const data = fetchError?.data;

  if (data && typeof data.code === 'string') {
    return {
      code: data.code,
      message: data.message ?? 'Something went wrong',
      status: data.statusCode,
    };
  }

  // No response at all: the API is down, asleep, or the device is offline.
  if (!fetchError?.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Cannot reach the server. Check your connection and try again.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
    status: fetchError.statusCode,
  };
}
