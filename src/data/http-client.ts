export interface RequestRetryOptions {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs: number;
}

const DEFAULT_RETRY_OPTIONS: RequestRetryOptions = {
  timeoutMs: 2500,
  maxRetries: 2,
  baseDelayMs: 120,
};

function delayMs(durationMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function runWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      reject(new Error(`Yêu cầu truy xuất dữ liệu quá thời gian chờ (${timeoutMs}ms).`));
    }, timeoutMs);

    operation()
      .then((result) => {
        window.clearTimeout(timerId);
        resolve(result);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timerId);
        reject(error);
      });
  });
}

export async function executeWithTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RequestRetryOptions> = {}
): Promise<T> {
  const merged: RequestRetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= merged.maxRetries; attempt += 1) {
    try {
      return await runWithTimeout(operation, merged.timeoutMs);
    } catch (error: unknown) {
      lastError = error;
      if (attempt < merged.maxRetries) {
        const backoff = merged.baseDelayMs * Math.pow(2, attempt);
        await delayMs(backoff);
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error('Không thể thực hiện tác vụ dữ liệu sau nhiều lần thử lại.');
}

export function formatErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }
  return fallbackMessage;
}
