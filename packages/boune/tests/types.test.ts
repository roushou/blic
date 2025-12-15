/**
 * Type inference tests
 * These tests verify that TypeScript correctly infers types through the command definition API
 */
import { describe, expect, test } from "bun:test";
import { argument } from "../src/schema/argument.ts";
import { defineCommand } from "../src/define/index.ts";
import { option } from "../src/schema/option.ts";

describe("type inference", () => {
  test("infers argument types in action handler", () => {
    // This test verifies compile-time type inference
    // If types were wrong, this would fail TypeScript compilation
    const cmd = defineCommand({
      name: "test",
      arguments: {
        name: argument.string().required(),
        count: argument.number().default(1),
      },
      action({ args }) {
        // TypeScript should infer:
        // args.name: string (required)
        // args.count: number (has default)
        const nameLen: number = args.name.length;
        const doubled: number = args.count * 2;
        expect(typeof nameLen).toBe("number");
        expect(typeof doubled).toBe("number");
      },
    });
    expect(cmd.arguments.length).toBe(2);
  });

  test("infers option types in action handler", () => {
    const cmd = defineCommand({
      name: "test",
      options: {
        output: option.string().required(),
        port: option.number().default(3000),
        verbose: option.boolean(),
      },
      action({ options }) {
        // TypeScript should infer:
        // options.output: string (required)
        // options.port: number (has default)
        // options.verbose: boolean (flag defaults to false)
        const outLen: number = options.output.length;
        const portPlus: number = options.port + 1;
        const flag: boolean = options.verbose;
        expect(typeof outLen).toBe("number");
        expect(typeof portPlus).toBe("number");
        expect(typeof flag).toBe("boolean");
      },
    });
    expect(cmd.options.length).toBe(3);
  });

  test("infers optional argument types", () => {
    defineCommand({
      name: "test",
      arguments: {
        file: argument.string(), // optional, no default
      },
      action({ args }) {
        // TypeScript should infer: args.file: string | undefined
        // This checks that optional handling doesn't break
        const value: string | undefined = args.file;
        if (value) {
          const len: number = value.length;
          expect(typeof len).toBe("number");
        }
      },
    });
  });

  test("infers variadic argument types", () => {
    defineCommand({
      name: "test",
      arguments: {
        files: argument.string().variadic().required(),
      },
      action({ args }) {
        // TypeScript should infer: args.files: string[]
        const mapped: string[] = args.files.map((f) => f.toUpperCase());
        expect(Array.isArray(mapped)).toBe(true);
      },
    });
  });

  test("infers combined args and options types", () => {
    defineCommand({
      name: "test",
      arguments: {
        source: argument.string().required(),
        dest: argument.string().required(),
      },
      options: {
        force: option.boolean().short("f"),
        mode: option.string().default("copy"),
      },
      action({ args, options }) {
        // All types should be properly inferred
        const srcLen: number = args.source.length;
        const destLen: number = args.dest.length;
        const forceFlag: boolean = options.force;
        const modeStr: string = options.mode;

        expect(typeof srcLen).toBe("number");
        expect(typeof destLen).toBe("number");
        expect(typeof forceFlag).toBe("boolean");
        expect(typeof modeStr).toBe("string");
      },
    });
  });
});
