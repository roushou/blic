import { join, resolve } from "node:path";
import { color } from "../output/color.ts";
import { defineCommand } from "../define/command.ts";
import type { Cli } from "../runtime/cli.ts";
import type { CommandConfig } from "../types/index.ts";
import { extractCliInfo } from "./extract.ts";
import { serveDocsFromInfo } from "./server.ts";
import type { CliInfo } from "./types.ts";

type DocsCommandOptions = {
  /**
   * Default port for the docs server
   * @default 4000
   */
  defaultPort?: number;
  /**
   * Default entry point patterns to search for
   * @default ["src/app.ts", "src/index.ts", "src/cli.ts", "app.ts", "index.ts", "cli.ts"]
   */
  entryPatterns?: string[];
};

/**
 * Extract CLI info from a loaded CLI module
 */
function extractCliInfoFromModule(cliModule: unknown): CliInfo {
  const mod = cliModule as Record<string, unknown>;
  const cli = mod.cli || mod.default;

  if (!cli || typeof cli !== "object") {
    throw new Error(
      "Could not find CLI definition. Make sure to export 'cli' or use default export.",
    );
  }

  const cliObj = cli as { getConfig?: () => unknown };

  if (typeof cliObj.getConfig !== "function") {
    throw new Error(
      "Could not extract CLI configuration. Make sure the CLI was created with defineCli().",
    );
  }

  return extractCliInfo(cli as Cli);
}

/**
 * Auto-detect CLI entry point from package.json or common patterns
 */
async function detectEntryPoint(cwd: string, patterns: string[]): Promise<string | undefined> {
  let entryPath: string | undefined;

  // Try package.json first
  const packageJsonPath = join(cwd, "package.json");
  try {
    const packageJson = await Bun.file(packageJsonPath).json();
    if (packageJson.bin) {
      if (typeof packageJson.bin === "string") {
        entryPath = packageJson.bin;
      } else {
        entryPath = Object.values(packageJson.bin)[0] as string;
      }
    } else if (packageJson.main) {
      entryPath = packageJson.main;
    }
  } catch {
    // No package.json or invalid JSON
  }

  // Fallback to common patterns
  if (!entryPath) {
    for (const pattern of patterns) {
      const fullPath = join(cwd, pattern);
      if (await Bun.file(fullPath).exists()) {
        entryPath = pattern;
        break;
      }
    }
  }

  return entryPath;
}

/**
 * Create a pre-configured docs command for serving CLI documentation
 *
 * @example
 * ```typescript
 * import { createDocsCommand } from "boune/docs";
 *
 * export const docs = createDocsCommand();
 * ```
 *
 * @example
 * ```typescript
 * // With custom defaults
 * export const docs = createDocsCommand({
 *   defaultPort: 3000,
 *   entryPatterns: ["src/main.ts", "src/cli.ts"],
 * });
 * ```
 */
export function createDocsCommand(options: DocsCommandOptions = {}): CommandConfig {
  const defaultPatterns = [
    "src/app.ts",
    "src/index.ts",
    "src/cli.ts",
    "app.ts",
    "index.ts",
    "cli.ts",
  ];

  const patterns = options.entryPatterns ?? defaultPatterns;
  const defaultPort = options.defaultPort ?? 4000;

  return defineCommand({
    name: "docs",
    description: "Serve interactive documentation for your CLI",
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
    async action({ options }) {
      const cwd = process.cwd();
      let entryPath = options.entry as string | undefined;

      if (!entryPath) {
        entryPath = await detectEntryPoint(cwd, patterns);
      }

      if (!entryPath) {
        console.log(color.red("Could not find CLI entry point."));
        console.log(color.dim("Specify one with --entry or create src/app.ts"));
        process.exit(1);
      }

      const fullEntryPath = resolve(cwd, entryPath);

      console.log(color.cyan("? ") + color.bold("Loading CLI from ") + color.dim(fullEntryPath));

      let cliInfo: CliInfo;
      try {
        const cliModule = await import(fullEntryPath);
        cliInfo = extractCliInfoFromModule(cliModule);
      } catch (err) {
        console.log(
          color.red("Failed to load CLI:"),
          err instanceof Error ? err.message : String(err),
        );
        process.exit(1);
      }

      await serveDocsFromInfo(cliInfo, {
        port: (options.port as number) ?? defaultPort,
        open: options.open as boolean,
      });
    },
  });
}
