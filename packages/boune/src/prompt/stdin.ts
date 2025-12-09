/**
 * Shared stdin reader utility using Bun's console AsyncIterable
 */

let consoleIterator: AsyncIterator<string> | null = null;
let readCount = 0;

function getConsoleIterator(): AsyncIterator<string> {
  if (!consoleIterator) {
    // console is an AsyncIterable in Bun that yields lines from stdin
    consoleIterator = (console as unknown as AsyncIterable<string>)[Symbol.asyncIterator]();
  }
  return consoleIterator;
}

/**
 * Read a single line from stdin using Bun's console AsyncIterable
 */
export async function readLine(): Promise<string> {
  readCount++;
  const iterator = getConsoleIterator();
  const result = await iterator.next();

  if (result.done) {
    return "";
  }

  return result.value;
}

/**
 * Close the stdin reader to allow the process to exit
 */
export function closeStdin(): void {
  if (consoleIterator?.return) {
    consoleIterator.return(undefined);
  }
  consoleIterator = null;
  readCount = 0;
}

/**
 * Check if stdin has been used
 */
export function hasUsedStdin(): boolean {
  return readCount > 0;
}
