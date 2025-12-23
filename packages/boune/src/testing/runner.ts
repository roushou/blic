import type { TestResult, TestRunner, TestRunnerOptions } from "./types.ts";
import type { Cli } from "../runtime/index.ts";

/**
 * Internal class implementing the chainable test runner.
 *
 * This class provides a fluent API for testing CLI commands by:
 * - Capturing stdout/stderr output
 * - Mocking process.exit to prevent test termination
 * - Injecting environment variables
 * - Supporting execution timeouts
 *
 * @internal
 */
class TestRunnerImpl implements TestRunner {
  private cli: Cli;
  private options: TestRunnerOptions;

  constructor(cli: Cli, options: TestRunnerOptions = {}) {
    this.cli = cli;
    this.options = {
      timeout: 5000,
      env: {},
      stdin: [],
      ...options,
    };
  }

  env(vars: Record<string, string>): TestRunner {
    return new TestRunnerImpl(this.cli, {
      ...this.options,
      env: { ...this.options.env, ...vars },
    });
  }

  stdin(inputs: string[]): TestRunner {
    return new TestRunnerImpl(this.cli, {
      ...this.options,
      stdin: [...(this.options.stdin || []), ...inputs],
    });
  }

  timeout(ms: number): TestRunner {
    return new TestRunnerImpl(this.cli, {
      ...this.options,
      timeout: ms,
    });
  }

  async run(argv: string[]): Promise<TestResult> {
    const result: TestResult = {
      code: 0,
      stdout: "",
      stderr: "",
    };

    // Capture stdout
    const originalLog = console.log;
    const originalInfo = console.info;
    const stdoutChunks: string[] = [];

    console.log = (...args: unknown[]) => {
      stdoutChunks.push(args.map(String).join(" "));
    };
    console.info = (...args: unknown[]) => {
      stdoutChunks.push(args.map(String).join(" "));
    };

    // Capture stderr
    const originalError = console.error;
    const originalWarn = console.warn;
    const stderrChunks: string[] = [];

    console.error = (...args: unknown[]) => {
      stderrChunks.push(args.map(String).join(" "));
    };
    console.warn = (...args: unknown[]) => {
      stderrChunks.push(args.map(String).join(" "));
    };

    // Mock process.exit
    const originalExit = process.exit.bind(process);
    let exitCalled = false;

    process.exit = ((code?: number) => {
      exitCalled = true;
      result.code = code ?? 0;
      throw new ExitError(code ?? 0);
    }) as typeof process.exit;

    // Set environment variables
    const originalEnv: Record<string, string | undefined> = {};
    if (this.options.env) {
      for (const [key, value] of Object.entries(this.options.env)) {
        originalEnv[key] = process.env[key];
        process.env[key] = value;
      }
    }

    // Setup stdin mock if inputs provided
    const stdinMock = this.options.stdin?.length ? createStdinMock(this.options.stdin) : null;

    try {
      // Run with timeout
      const timeoutMs = this.options.timeout ?? 5000;
      await Promise.race([
        this.cli.run(argv),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs),
        ),
      ]);
    } catch (err) {
      if (err instanceof ExitError) {
        // Expected - process.exit was called
      } else {
        result.error = err as Error;
        if (!exitCalled) {
          result.code = 1;
        }
      }
    } finally {
      // Restore console
      console.log = originalLog;
      console.info = originalInfo;
      console.error = originalError;
      console.warn = originalWarn;

      // Restore process.exit
      process.exit = originalExit;

      // Restore environment variables
      for (const [key, value] of Object.entries(originalEnv)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }

      // Restore stdin
      stdinMock?.restore();

      // Build output strings
      result.stdout = stdoutChunks.join("\n");
      result.stderr = stderrChunks.join("\n");
    }

    return result;
  }
}

/**
 * Custom error class for process.exit calls
 */
class ExitError extends Error {
  code: number;

  constructor(code: number) {
    super(`process.exit(${code})`);
    this.name = "ExitError";
    this.code = code;
  }
}

/**
 * Creates a mock for stdin that provides queued inputs
 */
function createStdinMock(inputs: string[]) {
  const queue = [...inputs];
  let _originalReadLine: typeof globalThis.Bun.stdin.text | undefined;
  let _originalStdin: typeof process.stdin | undefined;

  // For Bun-based stdin reading, we need to mock at a lower level
  // This is a simplified mock - full prompt testing may need more work
  const mock = {
    getNextInput(): string {
      return queue.shift() ?? "";
    },
    restore() {
      // Restore any mocked functions
    },
  };

  return mock;
}

/**
 * Create a test runner for the given CLI
 *
 * @example
 * ```typescript
 * import { testCli } from "boune/test";
 *
 * const result = await testCli(cli)
 *   .env({ DEBUG: "true" })
 *   .run(["deploy", "production"]);
 *
 * expect(result.code).toBe(0);
 * expect(result.stdout).toContain("Deployed");
 * ```
 */
export function testCli(cli: Cli): TestRunner {
  return new TestRunnerImpl(cli);
}
