/**
 * Executes a function with exponential backoff retry logic.
 * 
 * @param fn The function to execute. Must return a Promise.
 * @param maxRetries Maximum number of retries.
 * @param initialDelay Initial delay in milliseconds.
 * @returns The result of the function execution.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      // Don't retry if it's a 4xx error (except maybe 429)
      if (err?.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }

      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, err);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
