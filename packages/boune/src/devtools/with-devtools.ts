import { detectCliEntry, loadCli } from "./utils.ts";
import type { CliSchema } from "../types/index.ts";
import { color } from "../output/color.ts";
import { createCaptureMiddleware } from "./capture.ts";
import { defineCommand } from "../define/command.ts";
import { resolve } from "node:path";
import { serveDevTools } from "./server.ts";

type WithDevtoolsOptions = {
  /**
   * Capture events in production too
   * @default false
   */
  captureInProduction?: boolean;
  /**
   * Custom database path for event storage
   * @default ".boune/devtools.db"
   */
  dbPath?: string;
  /**
   * Default port for devtools server
   * @default 4000
   */
  defaultPort?: number;
};

/**
 * Enable devtools for a CLI - adds event capture middleware and devtools command
 *
 * @example
 * ```typescript
 * import { defineCli } from "boune";
 * import { withDevtools } from "boune/devtools";
 *
 * const cli = defineCli(withDevtools({
 *   name: "myapp",
 *   version: "1.0.0",
 *   commands: { build, deploy },
 * }));
 *
 * // Now includes:
 * // - Automatic event capture middleware
 * // - `myapp devtools` command
 * ```
 *
 * @example
 * ```typescript
 * // With custom options
 * const cli = defineCli(withDevtools({
 *   name: "myapp",
 *   commands: { build },
 * }, {
 *   defaultPort: 3000,
 *   dbPath: ".myapp/events.db",
 * }));
 * ```
 */
export function withDevtools(schema: CliSchema, options: WithDevtoolsOptions = {}): CliSchema {
  const { captureInProduction = false, dbPath, defaultPort = 4000 } = options;

  const captureMiddleware = createCaptureMiddleware({
    devOnly: !captureInProduction,
    dbPath,
  });

  const devtoolsCommand = defineCommand({
    name: "devtools",
    description: "Start the devtools dashboard",
    options: {
      port: {
        type: "number",
        short: "p",
        description: "Server port",
        default: defaultPort,
      },
      entry: {
        type: "string",
        short: "e",
        description: "CLI entry point (defaults to package.json bin or src/app.ts)",
      },
      open: {
        type: "boolean",
        short: "o",
        description: "Open in browser automatically",
      },
    },
    async action({ options: cmdOptions }) {
      const entry = (cmdOptions.entry as string) ?? (await detectCliEntry());

      if (!entry) {
        console.log(color.red("Could not find CLI entry point."));
        console.log(color.dim("Specify one with --entry or create src/app.ts"));
        process.exit(1);
      }

      const fullPath = resolve(process.cwd(), entry);
      console.log(color.cyan("⚡ ") + color.bold("Loading CLI from ") + color.dim(fullPath));

      let cli;
      try {
        cli = await loadCli(entry);
      } catch (err) {
        console.log(
          color.red("Failed to load CLI:"),
          err instanceof Error ? err.message : String(err),
        );
        process.exit(1);
      }

      await serveDevTools(cli, {
        port: (cmdOptions.port as number) ?? defaultPort,
        open: cmdOptions.open as boolean,
        dbPath,
      });
    },
  });

  return {
    ...schema,
    middleware: [captureMiddleware, ...(schema.middleware ?? [])],
    commands: {
      ...schema.commands,
      devtools: devtoolsCommand,
    },
  };
}
