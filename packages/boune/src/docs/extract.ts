import type { Cli } from "../runtime/cli.ts";
import type { CliConfig, CommandConfig } from "../types/index.ts";
import type { ArgumentInfo, CliInfo, CommandInfo, OptionInfo } from "./types.ts";

/**
 * Extract documentation info from a CLI instance
 *
 * @example
 * ```typescript
 * import { defineCli } from "boune";
 * import { extractCliInfo } from "boune/docs";
 *
 * const cli = defineCli({ ... });
 * const info = extractCliInfo(cli);
 * ```
 */
export function extractCliInfo(cli: Cli): CliInfo {
  const config = cli.getConfig();
  return extractFromConfig(config);
}

/**
 * Extract documentation info from a CLI config object
 */
export function extractFromConfig(config: CliConfig): CliInfo {
  return {
    name: config.name,
    version: config.version || "0.0.0",
    description: config.description || "",
    commands: extractCommands(config.commands),
    globalOptions: config.globalOptions.map(mapOption),
  };
}

function extractCommands(commands: Record<string, CommandConfig>): CommandInfo[] {
  const seen = new Set<CommandConfig>();

  return Object.entries(commands)
    .filter(([_, cmd]) => {
      // Skip hidden commands and aliases (already processed)
      if (cmd.hidden || seen.has(cmd)) return false;
      seen.add(cmd);
      return true;
    })
    .map(([name, cmd]) => ({
      name: cmd.name || name,
      description: cmd.description || "",
      aliases: cmd.aliases || [],
      arguments: cmd.arguments.map(mapArgument),
      options: cmd.options.map(mapOption),
      subcommands: extractCommands(cmd.subcommands || {}),
      hidden: cmd.hidden || false,
    }));
}

function mapArgument(arg: {
  name: string;
  description: string;
  type: string;
  required: boolean;
  default?: unknown;
  variadic?: boolean;
}): ArgumentInfo {
  return {
    name: arg.name,
    description: arg.description || "",
    type: arg.type || "string",
    required: arg.required || false,
    default: arg.default,
    variadic: arg.variadic,
  };
}

function mapOption(opt: {
  name: string;
  short?: string;
  description: string;
  type: string;
  required: boolean;
  default?: unknown;
  env?: string;
}): OptionInfo {
  return {
    name: opt.name,
    short: opt.short,
    description: opt.description || "",
    type: opt.type || "string",
    required: opt.required || false,
    default: opt.default,
    env: opt.env,
  };
}
