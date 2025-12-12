#!/usr/bin/env bun

/**
 * Testing CLI commands with boune/testing
 *
 * Run tests:
 *   bun test ./examples/testing.ts
 *
 * This file demonstrates how to write integration tests for CLI commands.
 */
import { argument, defineCli, defineCommand, option } from "../packages/boune/src/index.ts";
import { describe, expect, test } from "bun:test";
import { testCli } from "../packages/boune/src/testing/index.ts";

// ============================================================================
// CLI Definition
// ============================================================================

const greet = defineCommand({
  name: "greet",
  description: "Greet someone",
  arguments: {
    name: argument.string().default("World").describe("Name to greet"),
  },
  options: {
    loud: option.boolean().short("l").describe("Shout the greeting"),
  },
  action({ args, options }) {
    const message = `Hello, ${args.name}!`;
    console.log(options.loud ? message.toUpperCase() : message);
  },
});

const add = defineCommand({
  name: "add",
  description: "Add two numbers",
  arguments: {
    a: argument.number().required().describe("First number"),
    b: argument.number().required().describe("Second number"),
  },
  action({ args }) {
    console.log(`Result: ${args.a + args.b}`);
  },
});

const deploy = defineCommand({
  name: "deploy",
  description: "Deploy to environment",
  arguments: {
    env: argument.string().required().describe("Target environment"),
  },
  options: {
    dryRun: option.boolean().long("dry-run").describe("Simulate deployment"),
  },
  action({ args, options }) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Error: API_KEY environment variable is required");
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would deploy to ${args.env}`);
    } else {
      console.log(`Deploying to ${args.env} with key ${apiKey.slice(0, 4)}...`);
    }
  },
});

const fail = defineCommand({
  name: "fail",
  description: "A command that fails",
  action() {
    console.error("Something went wrong");
    process.exit(1);
  },
});

const slow = defineCommand({
  name: "slow",
  description: "A slow command",
  arguments: {
    ms: argument.number().default(100).describe("Milliseconds to wait"),
  },
  async action({ args }) {
    await new Promise((resolve) => setTimeout(resolve, args.ms));
    console.log("Done");
  },
});

const cli = defineCli({
  name: "myapp",
  version: "1.0.0",
  description: "Example CLI for testing demonstration",
  commands: { greet, add, deploy, fail, slow },
});

// ============================================================================
// Tests
// ============================================================================

describe("Basic command execution", () => {
  test("runs command and captures stdout", async () => {
    const result = await testCli(cli).run(["greet"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Hello, World!");
  });

  test("passes arguments to command", async () => {
    const result = await testCli(cli).run(["greet", "Alice"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Hello, Alice!");
  });

  test("passes options to command", async () => {
    const result = await testCli(cli).run(["greet", "Bob", "--loud"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("HELLO, BOB!");
  });

  test("parses number arguments", async () => {
    const result = await testCli(cli).run(["add", "5", "3"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Result: 8");
  });
});

describe("Environment variables", () => {
  test("sets environment variables", async () => {
    const result = await testCli(cli).env({ API_KEY: "secret-key-123" }).run(["deploy", "staging"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Deploying to staging");
    expect(result.stdout).toContain("secr");
  });

  test("command fails without required env var", async () => {
    const result = await testCli(cli).run(["deploy", "staging"]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("API_KEY");
  });
});

describe("Exit codes and error handling", () => {
  test("captures non-zero exit code", async () => {
    const result = await testCli(cli).run(["fail"]);

    expect(result.code).toBe(1);
  });

  test("captures stderr output", async () => {
    const result = await testCli(cli).run(["fail"]);

    expect(result.stderr).toContain("Something went wrong");
  });
});

describe("Help and version", () => {
  test("shows help with --help flag", async () => {
    const result = await testCli(cli).run(["--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Example CLI");
  });

  test("shows version with --version flag", async () => {
    const result = await testCli(cli).run(["--version"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("1.0.0");
  });

  test("shows command help", async () => {
    const result = await testCli(cli).run(["greet", "--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Greet someone");
  });
});

describe("Timeouts", () => {
  test("slow command completes within timeout", async () => {
    const result = await testCli(cli).timeout(200).run(["slow", "50"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Done");
  });

  test("times out slow commands", async () => {
    const result = await testCli(cli).timeout(50).run(["slow", "500"]);

    expect(result.code).toBe(1);
    expect(result.error?.message).toContain("timed out");
  });
});

describe("Chaining", () => {
  test("chainable API creates new instances", () => {
    const runner1 = testCli(cli);
    const runner2 = runner1.env({ FOO: "bar" });
    const runner3 = runner2.timeout(1000);

    expect(runner1).not.toBe(runner2);
    expect(runner2).not.toBe(runner3);
  });
});
