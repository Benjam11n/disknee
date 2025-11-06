import { RequestError } from '@/lib/http-errors';
import { handleError } from './error';
import { logger } from '@/lib/logger';

interface FetchOptions extends RequestInit {
  timeout?: number;
  authorize?: boolean;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export async function fetchHandler<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ActionResponse<T>> {
  const { timeout = 5000, headers: customHeaders = {}, authorize = true, ...restOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
    credentials: authorize ? 'include' : restOptions.credentials,
  };

  logger.debug(
    {
      method: config.method || 'GET',
      timeout,
      authorize,
    },
    `Making request to ${url}`
  );

  try {
    const response = await fetch(url, config);

    clearTimeout(id);

    if (!response.ok) {
      throw new RequestError(response.status, `HTTP error: ${response.status}`);
    }

    logger.debug(
      {
        status: response.status,
      },
      `Request to ${url} successful`
    );

    return await response.json();
  } catch (err) {
    const error = isError(err) ? err : new Error('Unknown error');

    if (error.name === 'AbortError') {
      logger.warn(
        {
          timeout,
          url,
        },
        `Request to ${url} timed out after ${timeout}ms`
      );
    } else {
      logger.error(
        {
          url,
          method: config.method || 'GET',
          error: error.name,
          stack: error.stack,
        },
        `Error fetching ${url}: ${error.message}`
      );
    }

    return handleError(error) as ActionResponse<T>;
  }
}
