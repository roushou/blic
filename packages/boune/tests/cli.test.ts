import { describe, expect, test, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { cli } from "../src/cli.ts";
import { command } from "../src/command.ts";

describe("cli builder", () => {
  let consoleSpy: ReturnType<typeof spyOn>;
  let consoleErrorSpy: ReturnType<typeof spyOn>;
  let exitSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test("creates cli with name", () => {
    const app = cli("myapp");
    expect(app).toBeDefined();
  });

  test("sets version", () => {
    const app = cli("myapp").version("1.0.0");
    expect(app).toBeDefined();
  });

  test("adds command", () => {
    const cmd = command("build").description("Build project");
    const app = cli("myapp").command(cmd);
    expect(app).toBeDefined();
  });

  test("runs command action", async () => {
    const actionMock = mock(() => {});
    const cmd = command("build").description("Build project").action(actionMock);

    const app = cli("myapp").command(cmd);
    await app.run(["build"]);

    expect(actionMock).toHaveBeenCalled();
  });

  test("passes parsed args to action", async () => {
    let receivedContext: any;
    const cmd = command("greet")
      .argument({ name: "name", kind: "string", required: true, description: "Name" })
      .action((ctx) => {
        receivedContext = ctx;
      });

    const app = cli("myapp").command(cmd);
    await app.run(["greet", "World"]);

    expect(receivedContext.args.name).toBe("World");
  });

  test("passes parsed options to action", async () => {
    let receivedContext: any;
    const cmd = command("serve")
      .option({ name: "port", short: "p", kind: "number", default: 3000, description: "Port" })
      .action((ctx) => {
        receivedContext = ctx;
      });

    const app = cli("myapp").command(cmd);
    await app.run(["serve", "--port", "8080"]);

    expect(receivedContext.options.port).toBe(8080);
  });

  test("shows help with --help flag", async () => {
    const app = cli("myapp").version("1.0.0").description("My app");
    await app.run(["--help"]);

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0]?.[0];
    expect(output).toContain("My app");
  });

  test("shows version with --version flag", async () => {
    const app = cli("myapp").version("1.2.3");
    await app.run(["--version"]);

    expect(consoleSpy).toHaveBeenCalledWith("1.2.3");
  });

  test("runs subcommands", async () => {
    const actionMock = mock(() => {});
    const sub = command("watch").description("Watch mode").action(actionMock);
    const cmd = command("build").description("Build").subcommand(sub);

    const app = cli("myapp").command(cmd);
    await app.run(["build", "watch"]);

    expect(actionMock).toHaveBeenCalled();
  });

  test("runs preAction hook", async () => {
    const hookMock = mock(() => {});
    const actionMock = mock(() => {});

    const cmd = command("build").hook("preAction", hookMock).action(actionMock);

    const app = cli("myapp").command(cmd);
    await app.run(["build"]);

    expect(hookMock).toHaveBeenCalled();
    expect(actionMock).toHaveBeenCalled();
  });

  test("runs postAction hook", async () => {
    const hookMock = mock(() => {});
    const actionMock = mock(() => {});

    const cmd = command("build").hook("postAction", hookMock).action(actionMock);

    const app = cli("myapp").command(cmd);
    await app.run(["build"]);

    expect(hookMock).toHaveBeenCalled();
  });
});
