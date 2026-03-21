import { RequestError } from "@/lib/http-errors";
import { logger } from "@/lib/logger";

import { handleError } from "./error";

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
  const {
    timeout = 5000,
    headers: customHeaders = {},
    authorize = true,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

  const config: RequestInit = {
    ...restOptions,
    credentials: authorize ? "include" : restOptions.credentials,
    headers,
    signal: controller.signal,
  };

  logger.debug(
    {
      authorize,
      method: config.method || "GET",
      timeout,
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
  } catch (caughtError) {
    const error = isError(caughtError)
      ? caughtError
      : new Error("Unknown error");

    if (error.name === "AbortError") {
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
          error: error.name,
          method: config.method || "GET",
          stack: error.stack,
          url,
        },
        `Error fetching ${url}: ${error.message}`
      );
    }

    return handleError(error) as ActionResponse<T>;
  }
}
