import { describe, expect, test } from "bun:test";
import { tokenize } from "../src/parser/tokenizer.ts";

describe("tokenizer", () => {
  test("tokenizes simple arguments", () => {
    const tokens = tokenize(["hello", "world"]);
    expect(tokens).toEqual([
      { type: "argument", value: "hello", raw: "hello" },
      { type: "argument", value: "world", raw: "world" },
    ]);
  });

  test("tokenizes long options", () => {
    const tokens = tokenize(["--verbose", "--name", "test"]);
    expect(tokens).toEqual([
      { type: "option", value: "verbose", raw: "--verbose" },
      { type: "option", value: "name", raw: "--name" },
      { type: "argument", value: "test", raw: "test" },
    ]);
  });

  test("tokenizes long options with equals", () => {
    const tokens = tokenize(["--name=test", "--count=5"]);
    expect(tokens).toEqual([
      { type: "option", value: "name", raw: "--name=test" },
      { type: "value", value: "test", raw: "test" },
      { type: "option", value: "count", raw: "--count=5" },
      { type: "value", value: "5", raw: "5" },
    ]);
  });

  test("tokenizes short options", () => {
    const tokens = tokenize(["-v", "-n", "test"]);
    expect(tokens).toEqual([
      { type: "option", value: "v", raw: "-v" },
      { type: "option", value: "n", raw: "-n" },
      { type: "argument", value: "test", raw: "test" },
    ]);
  });

  test("expands combined short options", () => {
    const tokens = tokenize(["-abc"]);
    expect(tokens).toEqual([
      { type: "option", value: "a", raw: "-a" },
      { type: "option", value: "b", raw: "-b" },
      { type: "option", value: "c", raw: "-c" },
    ]);
  });

  test("handles short option with equals", () => {
    const tokens = tokenize(["-n=test"]);
    expect(tokens).toEqual([
      { type: "option", value: "n", raw: "-n" },
      { type: "value", value: "test", raw: "test" },
    ]);
  });

  test("handles -- separator", () => {
    const tokens = tokenize(["cmd", "--", "--not-an-option"]);
    expect(tokens).toEqual([
      { type: "argument", value: "cmd", raw: "cmd" },
      { type: "separator", value: "--", raw: "--" },
      { type: "argument", value: "--not-an-option", raw: "--not-an-option" },
    ]);
  });

  test("handles mixed arguments and options", () => {
    const tokens = tokenize(["build", "-v", "--output", "dist", "src/index.ts"]);
    expect(tokens).toEqual([
      { type: "argument", value: "build", raw: "build" },
      { type: "option", value: "v", raw: "-v" },
      { type: "option", value: "output", raw: "--output" },
      { type: "argument", value: "dist", raw: "dist" },
      { type: "argument", value: "src/index.ts", raw: "src/index.ts" },
    ]);
  });
});
