import type { CliConfig, CommandConfig, OptionDef } from "../types.ts";
import { color } from "./color.ts";

/**
 * Format argument syntax for display
 */
function formatArgument(arg: { name: string; required: boolean; variadic?: boolean }): string {
  const name = arg.variadic ? `${arg.name}...` : arg.name;
  return arg.required ? `<${name}>` : `[${name}]`;
}

/**
 * Format option syntax for display
 */
function formatOption(opt: OptionDef): string {
  const parts: string[] = [];
  if (opt.short) parts.push(`-${opt.short}`);
  const longFlag = opt.long ?? opt.name;
  parts.push(`--${longFlag}`);
  if (opt.type !== "boolean") {
    parts[parts.length - 1] += ` <${opt.type}>`;
  }
  return parts.join(", ");
}

/**
 * Pad string to width
 */
function pad(str: string, width: number): string {
  return str + " ".repeat(Math.max(0, width - str.length));
}

/**
 * Generate help text for a command
 */
export function generateCommandHelp(
  command: CommandConfig,
  cliName: string,
  parentCommands: string[] = [],
  globalOptions: OptionDef[] = [],
): string {
  const lines: string[] = [];
  const commandPath = [cliName, ...parentCommands, command.name].join(" ");

  // Description
  if (command.description) {
    lines.push(command.description);
    lines.push("");
  }

  // Usage
  lines.push(color.bold("Usage:"));
  let usage = `  ${commandPath}`;
  if (command.subcommands.size > 0) {
    usage += " <command>";
  }
  if (command.options.length > 0 || globalOptions.length > 0) {
    usage += " [options]";
  }
  for (const arg of command.arguments) {
    usage += ` ${formatArgument(arg)}`;
  }
  lines.push(usage);
  lines.push("");

  // Arguments
  if (command.arguments.length > 0) {
    lines.push(color.bold("Arguments:"));
    const maxArgLen = Math.max(...command.arguments.map((a) => formatArgument(a).length));
    for (const arg of command.arguments) {
      const syntax = formatArgument(arg);
      let line = `  ${color.cyan(pad(syntax, maxArgLen + 2))}${arg.description}`;
      if (arg.default !== undefined) {
        line += color.dim(` (default: ${JSON.stringify(arg.default)})`);
      }
      lines.push(line);
    }
    lines.push("");
  }

  // Options
  const allOptions = [...command.options, ...globalOptions];
  if (allOptions.length > 0) {
    lines.push(color.bold("Options:"));
    const maxOptLen = Math.max(...allOptions.map((o) => formatOption(o).length));
    for (const opt of allOptions) {
      const syntax = formatOption(opt);
      let line = `  ${color.cyan(pad(syntax, maxOptLen + 2))}${opt.description}`;
      if (opt.default !== undefined) {
        line += color.dim(` (default: ${JSON.stringify(opt.default)})`);
      }
      if (opt.env) {
        line += color.dim(` (env: ${opt.env})`);
      }
      lines.push(line);
    }
    lines.push("");
  }

  // Subcommands
  const visibleSubcommands = [...command.subcommands.values()].filter(
    (cmd, index, arr) => !cmd.hidden && arr.findIndex((c) => c.name === cmd.name) === index,
  );
  if (visibleSubcommands.length > 0) {
    lines.push(color.bold("Commands:"));
    const maxCmdLen = Math.max(...visibleSubcommands.map((c) => c.name.length));
    for (const cmd of visibleSubcommands) {
      lines.push(`  ${color.cyan(pad(cmd.name, maxCmdLen + 2))}${cmd.description}`);
    }
    lines.push("");
  }

  // Aliases
  if (command.aliases.length > 0) {
    lines.push(color.bold("Aliases:"));
    lines.push(`  ${command.aliases.join(", ")}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate help text for the CLI
 */
export function generateCliHelp(config: CliConfig): string {
  const lines: string[] = [];

  // Description
  if (config.description) {
    lines.push(config.description);
    lines.push("");
  }

  // Usage
  lines.push(color.bold("Usage:"));
  lines.push(`  ${config.name} <command> [options]`);
  lines.push("");

  // Global options
  if (config.globalOptions.length > 0) {
    lines.push(color.bold("Options:"));
    const maxOptLen = Math.max(...config.globalOptions.map((o) => formatOption(o).length));
    for (const opt of config.globalOptions) {
      const syntax = formatOption(opt);
      let line = `  ${color.cyan(pad(syntax, maxOptLen + 2))}${opt.description}`;
      if (opt.default !== undefined) {
        line += color.dim(` (default: ${JSON.stringify(opt.default)})`);
      }
      lines.push(line);
    }
    lines.push("");
  }

  // Commands
  const visibleCommands = [...config.commands.values()].filter(
    (cmd, index, arr) => !cmd.hidden && arr.findIndex((c) => c.name === cmd.name) === index,
  );
  if (visibleCommands.length > 0) {
    lines.push(color.bold("Commands:"));
    const maxCmdLen = Math.max(...visibleCommands.map((c) => c.name.length));
    for (const cmd of visibleCommands) {
      lines.push(`  ${color.cyan(pad(cmd.name, maxCmdLen + 2))}${cmd.description}`);
    }
    lines.push("");
  }

  // Version
  if (config.version) {
    lines.push(color.dim(`v${config.version}`));
  }

  return lines.join("\n");
}
