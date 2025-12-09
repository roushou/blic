// Core builders
export { cli, Cli } from "./cli.ts";
export { command, Command } from "./command.ts";

// Types
export type {
  ActionContext,
  ActionHandler,
  ArgumentDef,
  ArgumentType,
  CliConfig,
  CommandConfig,
  HookHandler,
  HookType,
  OptionDef,
  ParsedArgs,
  ParsedOptions,
  ParseResult,
  Token,
  TokenType,
  ValidationError,
} from "./types.ts";

// Parser utilities
export { tokenize, parseArguments, parseOptions, coerceValue } from "./parser/index.ts";

// Output utilities
export {
  color,
  supportsColor,
  table,
  list,
  keyValue,
  error,
  warning,
  success,
  info,
  createSpinner,
} from "./output/index.ts";
