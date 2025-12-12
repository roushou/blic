/**
 * Result of running a CLI command in test mode
 */
export interface TestResult {
  /** Exit code (0 = success, non-zero = error) */
  code: number;
  /** Captured stdout output */
  stdout: string;
  /** Captured stderr output */
  stderr: string;
  /** Error thrown during execution, if any */
  error?: Error;
}

/**
 * Configuration options for test runner
 */
export interface TestRunnerOptions {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Environment variables to set during execution */
  env?: Record<string, string>;
  /** Queued stdin inputs for prompts */
  stdin?: string[];
}

/**
 * Chainable test runner interface
 */
export interface TestRunner {
  /**
   * Set environment variables for the test
   * @param vars - Key-value pairs of environment variables
   */
  env(vars: Record<string, string>): TestRunner;

  /**
   * Queue stdin inputs for prompts
   * @param inputs - Array of inputs to provide in order
   */
  stdin(inputs: string[]): TestRunner;

  /**
   * Set execution timeout
   * @param ms - Timeout in milliseconds
   */
  timeout(ms: number): TestRunner;

  /**
   * Execute the CLI with the given arguments
   * @param argv - Command line arguments (without the binary name)
   */
  run(argv: string[]): Promise<TestResult>;
}
