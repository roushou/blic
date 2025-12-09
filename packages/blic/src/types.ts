/**
 * Core types for the blic CLI framework
 */

/** Supported argument types */
export type ArgumentType = "string" | "number" | "boolean";

/** Argument definition */
export interface ArgumentDef {
  name: string;
  description: string;
  required: boolean;
  type: ArgumentType;
  default?: unknown;
  variadic?: boolean;
}

/** Option/flag definition */
export interface OptionDef {
  name: string;
  short?: string;
  description: string;
  type: ArgumentType;
  required: boolean;
  default?: unknown;
  env?: string;
}

/** Parsed argument values */
export type ParsedArgs = Record<string, unknown>;

/** Parsed option values */
export type ParsedOptions = Record<string, unknown>;

/** Context passed to command action */
export interface ActionContext<
  TArgs extends ParsedArgs = ParsedArgs,
  TOpts extends ParsedOptions = ParsedOptions,
> {
  args: TArgs;
  options: TOpts;
  rawArgs: string[];
}

/** Command action handler */
export type ActionHandler<
  TArgs extends ParsedArgs = ParsedArgs,
  TOpts extends ParsedOptions = ParsedOptions,
> = (context: ActionContext<TArgs, TOpts>) => void | Promise<void>;

/** Hook types */
export type HookType = "preAction" | "postAction" | "preError" | "postError";

/** Hook handler */
export type HookHandler = (context: {
  command: CommandConfig;
  args: ParsedArgs;
  options: ParsedOptions;
  error?: Error;
}) => void | Promise<void>;

/** Command configuration */
export interface CommandConfig {
  name: string;
  description: string;
  aliases: string[];
  arguments: ArgumentDef[];
  options: OptionDef[];
  subcommands: Map<string, CommandConfig>;
  action?: ActionHandler;
  hooks: Map<HookType, HookHandler[]>;
  hidden: boolean;
}

/** CLI configuration */
export interface CliConfig {
  name: string;
  version: string;
  description: string;
  commands: Map<string, CommandConfig>;
  globalOptions: OptionDef[];
  hooks: Map<HookType, HookHandler[]>;
}

/** Token types from argv parsing */
export type TokenType = "command" | "argument" | "option" | "value" | "separator";

/** Parsed token */
export interface Token {
  type: TokenType;
  value: string;
  raw: string;
}

/** Parse result */
export interface ParseResult {
  command: string[];
  args: ParsedArgs;
  options: ParsedOptions;
  rest: string[];
}

/** Validation error */
export interface ValidationError {
  type: "missing_required" | "invalid_type" | "unknown_option" | "unknown_command";
  message: string;
  field?: string;
}
