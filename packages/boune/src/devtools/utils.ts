import { join, resolve } from "node:path";
import type { Cli } from "../runtime/cli.ts";

export type EntryDetectionOptions = {
  cwd?: string;
  patterns?: string[];
};

const DEFAULT_PATTERNS = [
  "src/app.ts",
  "src/index.ts",
  "src/cli.ts",
  "app.ts",
  "index.ts",
  "cli.ts",
];

/**
 * Auto-detect CLI entry point from package.json or common patterns
 *
 * @example
 * ```typescript
 * const entry = await detectCliEntry();
 * // => "src/app.ts"
 * ```
 *
 * @example
 * ```typescript
 * const entry = await detectCliEntry({
 *   patterns: ["src/main.ts", "src/cli.ts"],
 * });
 * ```
 */
export async function detectCliEntry(
  options: EntryDetectionOptions = {},
): Promise<string | undefined> {
  const cwd = options.cwd ?? process.cwd();
  const patterns = options.patterns ?? DEFAULT_PATTERNS;

  // Try package.json first
  try {
    const pkg = await Bun.file(join(cwd, "package.json")).json();
    if (pkg.bin) {
      return typeof pkg.bin === "string" ? pkg.bin : (Object.values(pkg.bin)[0] as string);
    }
    if (pkg.main) return pkg.main;
  } catch {
    // No package.json or invalid JSON
  }

  // Fallback to patterns
  for (const pattern of patterns) {
    if (await Bun.file(join(cwd, pattern)).exists()) {
      return pattern;
    }
  }
}

/**
 * Load a CLI instance from an entry point
 *
 * @example
 * ```typescript
 * const cli = await loadCli("src/app.ts");
 * await serveDevTools(cli, { port: 4000 });
 * ```
 */
export async function loadCli(entryPath: string, cwd?: string): Promise<Cli> {
  const fullPath = resolve(cwd ?? process.cwd(), entryPath);
  const mod = (await import(fullPath)) as Record<string, unknown>;
  const cli = mod.cli || mod.default;

  if (!cli || typeof cli !== "object") {
    throw new Error("Could not find CLI definition. Export 'cli' or use default export.");
  }
  if (typeof (cli as { getConfig?: unknown }).getConfig !== "function") {
    throw new Error("Invalid CLI. Make sure it was created with defineCli().");
  }
  return cli as Cli;
}
