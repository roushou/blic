import { describe, expect, test } from "bun:test";
import { command } from "../src/command.ts";

describe("command builder", () => {
  test("creates a command with name", () => {
    const cmd = command("build");
    const config = cmd.getConfig();
    expect(config.name).toBe("build");
  });

  test("sets description", () => {
    const cmd = command("build").description("Build the project");
    const config = cmd.getConfig();
    expect(config.description).toBe("Build the project");
  });

  test("adds aliases", () => {
    const cmd = command("build").alias("b", "compile");
    const config = cmd.getConfig();
    expect(config.aliases).toEqual(["b", "compile"]);
  });

  test("adds required argument", () => {
    const cmd = command("greet").argument("<name>", "Name to greet");
    const config = cmd.getConfig();
    expect(config.arguments).toEqual([
      {
        name: "name",
        description: "Name to greet",
        required: true,
        type: "string",
        variadic: false,
      },
    ]);
  });

  test("adds optional argument", () => {
    const cmd = command("greet").argument("[name]", "Name to greet", { default: "World" });
    const config = cmd.getConfig();
    expect(config.arguments).toEqual([
      {
        name: "name",
        description: "Name to greet",
        required: false,
        type: "string",
        default: "World",
        variadic: false,
      },
    ]);
  });

  test("adds variadic argument", () => {
    const cmd = command("cat").argument("<files...>", "Files to concatenate");
    const config = cmd.getConfig();
    expect(config.arguments).toEqual([
      {
        name: "files",
        description: "Files to concatenate",
        required: true,
        type: "string",
        variadic: true,
      },
    ]);
  });

  test("adds boolean option", () => {
    const cmd = command("build").option("-v, --verbose", "Verbose output");
    const config = cmd.getConfig();
    expect(config.options).toEqual([
      {
        name: "verbose",
        short: "v",
        description: "Verbose output",
        type: "boolean",
        required: false,
      },
    ]);
  });

  test("adds string option", () => {
    const cmd = command("build").option("-o, --output <dir>", "Output directory");
    const config = cmd.getConfig();
    expect(config.options).toEqual([
      {
        name: "output",
        short: "o",
        description: "Output directory",
        type: "string",
        required: false,
      },
    ]);
  });

  test("adds option with env var", () => {
    const cmd = command("serve").option("-p, --port <number>", "Port", {
      type: "number",
      env: "PORT",
      default: 3000,
    });
    const config = cmd.getConfig();
    expect(config.options).toEqual([
      {
        name: "port",
        short: "p",
        description: "Port",
        type: "number",
        required: false,
        env: "PORT",
        default: 3000,
      },
    ]);
  });

  test("adds subcommand", () => {
    const sub = command("watch").description("Watch mode");
    const cmd = command("build").subcommand(sub);
    const config = cmd.getConfig();
    expect(config.subcommands.get("watch")?.name).toBe("watch");
  });

  test("sets action handler", () => {
    const handler = () => {};
    const cmd = command("build").action(handler);
    const config = cmd.getConfig();
    expect(config.action).toBe(handler);
  });

  test("hides command", () => {
    const cmd = command("internal").hidden();
    const config = cmd.getConfig();
    expect(config.hidden).toBe(true);
  });

  test("adds hooks", () => {
    const handler = () => {};
    const cmd = command("build").hook("preAction", handler);
    const config = cmd.getConfig();
    expect(config.hooks.get("preAction")).toEqual([handler]);
  });

  test("chains all methods", () => {
    const cmd = command("build")
      .description("Build the project")
      .alias("b")
      .argument("<entry>", "Entry file")
      .option("-o, --output <dir>", "Output directory")
      .option("-w, --watch", "Watch mode")
      .action(({ args, options }) => {
        console.log(args, options);
      });

    const config = cmd.getConfig();
    expect(config.name).toBe("build");
    expect(config.description).toBe("Build the project");
    expect(config.aliases).toEqual(["b"]);
    expect(config.arguments.length).toBe(1);
    expect(config.options.length).toBe(2);
    expect(config.action).toBeDefined();
  });
});
