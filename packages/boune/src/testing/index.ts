/**
 * Testing utilities for Boune CLIs
 *
 * This module provides utilities for testing CLI commands in isolation,
 * with support for capturing output, mocking environment variables,
 * and handling process.exit calls.
 *
 * ## Basic Usage
 *
 * @example
 * ```typescript
 * import { testCli } from "boune/testing";
 * import { defineCli, defineCommand } from "boune";
 * import { expect, test } from "bun:test";
 *
 * const cli = defineCli({
 *   name: "myapp",
 *   commands: {
 *     deploy: defineCommand({
 *       name: "deploy",
 *       action: () => console.log("Deployed!"),
 *     }),
 *   },
 * });
 *
 * test("deploy command", async () => {
 *   const result = await testCli(cli).run(["deploy"]);
 *
 *   expect(result.code).toBe(0);
 *   expect(result.stdout).toContain("Deployed!");
 * });
 * ```
 *
 * ## With Environment Variables
 *
 * @example
 * ```typescript
 * test("uses API key from env", async () => {
 *   const result = await testCli(cli)
 *     .env({ API_KEY: "test-key" })
 *     .run(["deploy"]);
 *
 *   expect(result.code).toBe(0);
 * });
 * ```
 *
 * ## Testing Error Handling
 *
 * @example
 * ```typescript
 * test("handles errors gracefully", async () => {
 *   const result = await testCli(cli).run(["invalid-command"]);
 *
 *   expect(result.code).toBe(1);
 *   expect(result.stderr).toContain("Unknown command");
 * });
 * ```
 *
 * ## With Timeout
 *
 * @example
 * ```typescript
 * test("times out slow commands", async () => {
 *   const result = await testCli(cli)
 *     .timeout(100)
 *     .run(["slow-command"]);
 *
 *   expect(result.error?.message).toContain("timed out");
 * });
 * ```
 *
 * @module boune/testing
 */

export { testCli } from "./runner.ts";
export type { TestResult, TestRunner, TestRunnerOptions } from "./types.ts";
