/**
 * CLI runtime and execution engine
 */

import type {
  CliConfig,
  CommandConfig,
  MiddlewareContext,
  MiddlewareHandler,
  ParsedArgs,
  ParsedOptions,
  Token,
  ValidationError,
} from "./types.ts";
import { type ShellType, generateCompletion } from "./completions/index.ts";
import { formatSuggestions, suggestCommands } from "./suggest.ts";
import { generateCliHelp, generateCommandHelp } from "./output/help.ts";
import { parseArguments, parseOptions, tokenize } from "./parser/index.ts";
import { closeStdin } from "./prompt/stdin.ts";
import { error as formatError } from "./output/format.ts";

// ============================================================================
// Pipeline Types
// ============================================================================

/**
 * Execution context passed through pipeline phases
 */
type PipelineContext = {
  argv: string[];
  tokens: Token[];
  globalOptions: ParsedOptions;
  commandPath: string[];
  command: CommandConfig | null;
  parentCommands: string[];
  commandOptions: ParsedOptions;
  args: ParsedArgs;
  errors: ValidationError[];
  firstUnknownArg: string | null;
};

/**
 * Pipeline phase result
 */
type PhaseResult =
  | { type: "continue"; ctx: PipelineContext }
  | { type: "exit"; code?: number }
  | { type: "execute"; ctx: PipelineContext };

/**
 * Pipeline phase definition
 */
type Phase = {
  name: string;
  run: (ctx: PipelineContext, config: CliConfig) => PhaseResult | Promise<PhaseResult>;
};

// ============================================================================
// Pipeline Phases
// ============================================================================

/**
 * Phase 1: Tokenize argv
 */
const tokenizePhase: Phase = {
  name: "tokenize",
  run: (ctx) => ({
    type: "continue",
    ctx: { ...ctx, tokens: tokenize(ctx.argv) },
  }),
};

/**
 * Phase 2: Parse global options
 */
const parseGlobalOptionsPhase: Phase = {
  name: "parseGlobalOptions",
  run: (ctx, config) => {
    const { options, errors, remaining } = parseOptions(ctx.tokens, config.globalOptions, true);
    return {
      type: "continue",
      ctx: {
        ...ctx,
        globalOptions: options,
        tokens: remaining,
        errors: [...ctx.errors, ...errors],
      },
    };
  },
};

/**
 * Phase 3: Handle --version flag
 */
const handleVersionPhase: Phase = {
  name: "handleVersion",
  run: (ctx, config) => {
    if (ctx.globalOptions["version"]) {
      console.log(config.version || "0.0.0");
      return { type: "exit" };
    }
    return { type: "continue", ctx };
  },
};

/**
 * Phase 4: Extract command path from tokens
 */
const extractCommandPathPhase: Phase = {
  name: "extractCommandPath",
  run: (ctx, config) => {
    const commandPath: string[] = [];
    const argTokens: Token[] = [];
    let firstUnknownArg: string | null = null;
    let currentCommands = config.commands;

    for (const token of ctx.tokens) {
      // Try to match as command/subcommand
      if (token.type === "argument") {
        const cmd = currentCommands[token.value];
        if (cmd && commandPath.length === 0) {
          commandPath.push(token.value);
          currentCommands = cmd.subcommands;
          continue;
        }
        if (cmd && commandPath.length > 0) {
          commandPath.push(token.value);
          currentCommands = cmd.subcommands;
          continue;
        }
        if (commandPath.length === 0 && firstUnknownArg === null) {
          firstUnknownArg = token.value;
        }
      }
      argTokens.push(token);
    }

    return {
      type: "continue",
      ctx: { ...ctx, commandPath, tokens: argTokens, firstUnknownArg },
    };
  },
};

/**
 * Phase 5: Handle --help at root level
 */
const handleRootHelpPhase: Phase = {
  name: "handleRootHelp",
  run: (ctx, config) => {
    if (ctx.globalOptions["help"] && ctx.commandPath.length === 0) {
      console.log(generateCliHelp(config));
      return { type: "exit" };
    }
    return { type: "continue", ctx };
  },
};

/**
 * Phase 6: Handle no command / unknown command
 */
const handleNoCommandPhase: Phase = {
  name: "handleNoCommand",
  run: (ctx, config) => {
    if (ctx.commandPath.length === 0) {
      if (ctx.firstUnknownArg) {
        const suggestions = suggestCommands(ctx.firstUnknownArg, config.commands);
        console.error(formatError(`Unknown command: ${ctx.firstUnknownArg}`));
        if (suggestions.length > 0) {
          console.error(formatSuggestions(suggestions));
        }
        return { type: "exit", code: 1 };
      }
      console.log(generateCliHelp(config));
      return { type: "exit" };
    }
    return { type: "continue", ctx };
  },
};

/**
 * Phase 7: Resolve command from path
 */
const resolveCommandPhase: Phase = {
  name: "resolveCommand",
  run: (ctx, config) => {
    const [first, ...rest] = ctx.commandPath;
    const initialCommand = config.commands[first!];

    if (!initialCommand) {
      const suggestions = suggestCommands(first ?? "", config.commands);
      console.error(formatError(`Unknown command: ${ctx.commandPath.join(" ")}`));
      if (suggestions.length > 0) {
        console.error(formatSuggestions(suggestions));
      }
      return { type: "exit", code: 1 };
    }

    let command: CommandConfig = initialCommand;
    const parentCommands: string[] = [];

    for (const name of rest) {
      parentCommands.push(command.name);
      const sub: CommandConfig | undefined = command.subcommands[name];
      if (!sub) break;
      command = sub;
    }

    return {
      type: "continue",
      ctx: { ...ctx, command, parentCommands },
    };
  },
};

/**
 * Phase 8: Handle --help for command
 */
const handleCommandHelpPhase: Phase = {
  name: "handleCommandHelp",
  run: (ctx, config) => {
    if (ctx.globalOptions["help"] && ctx.command) {
      console.log(
        generateCommandHelp(ctx.command, config.name, ctx.parentCommands, config.globalOptions),
      );
      return { type: "exit" };
    }
    return { type: "continue", ctx };
  },
};

/**
 * Phase 9: Parse command-specific options
 */
const parseCommandOptionsPhase: Phase = {
  name: "parseCommandOptions",
  run: (ctx) => {
    if (!ctx.command) return { type: "continue", ctx };

    const { options, errors, remaining } = parseOptions(ctx.tokens, ctx.command.options);

    return {
      type: "continue",
      ctx: {
        ...ctx,
        commandOptions: options,
        tokens: remaining,
        errors: [...ctx.errors, ...errors],
      },
    };
  },
};

/**
 * Phase 10: Parse positional arguments
 */
const parseArgumentsPhase: Phase = {
  name: "parseArguments",
  run: (ctx) => {
    if (!ctx.command) return { type: "continue", ctx };

    const positionalValues = ctx.tokens.filter((t) => t.type === "argument").map((t) => t.value);
    const { args, errors } = parseArguments(positionalValues, ctx.command.arguments);

    return {
      type: "continue",
      ctx: { ...ctx, args, errors: [...ctx.errors, ...errors] },
    };
  },
};

/**
 * Phase 11: Validate and check for errors
 */
const validatePhase: Phase = {
  name: "validate",
  run: (ctx) => {
    if (ctx.errors.length > 0) {
      for (const err of ctx.errors) {
        console.error(formatError(err.message));
      }
      return { type: "exit", code: 1 };
    }
    return { type: "continue", ctx };
  },
};

/**
 * Phase 12: Check if command has action, show help if not
 */
const checkActionPhase: Phase = {
  name: "checkAction",
  run: (ctx, config) => {
    if (!ctx.command?.action) {
      console.log(
        generateCommandHelp(ctx.command!, config.name, ctx.parentCommands, config.globalOptions),
      );
      return { type: "exit" };
    }
    return { type: "execute", ctx };
  },
};

/**
 * All pipeline phases in order
 */
const phases: Phase[] = [
  tokenizePhase,
  parseGlobalOptionsPhase,
  handleVersionPhase,
  extractCommandPathPhase,
  handleRootHelpPhase,
  handleNoCommandPhase,
  resolveCommandPhase,
  handleCommandHelpPhase,
  parseCommandOptionsPhase,
  parseArgumentsPhase,
  validatePhase,
  checkActionPhase,
];

// ============================================================================
// CLI Class
// ============================================================================

/**
 * CLI runtime class
 *
 * Create instances using `defineCli()` from the define module.
 */
export class Cli {
  private config: CliConfig;

  private constructor(config: CliConfig) {
    this.config = config;
  }

  /**
   * Create a Cli instance from a pre-built configuration
   * @internal
   */
  static fromConfig(config: CliConfig): Cli {
    return new Cli(config);
  }

  /**
   * Generate shell completion script
   */
  completions(shell: ShellType): string {
    return generateCompletion(this.config, shell);
  }

  /**
   * Get the CLI configuration (for advanced use cases)
   */
  getConfig(): CliConfig {
    return this.config;
  }

  /**
   * Run middleware chain with next() pattern
   */
  private async runMiddleware(
    handlers: MiddlewareHandler[],
    ctx: MiddlewareContext,
    final: () => Promise<void>,
  ): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < handlers.length) {
        const handler = handlers[index++]!;
        await handler(ctx, next);
      } else {
        await final();
      }
    };

    await next();
  }

  /**
   * Create initial pipeline context
   */
  private createInitialContext(argv: string[]): PipelineContext {
    return {
      argv,
      tokens: [],
      globalOptions: {},
      commandPath: [],
      command: null,
      parentCommands: [],
      commandOptions: {},
      args: {},
      errors: [],
      firstUnknownArg: null,
    };
  }

  /**
   * Execute the command action with middleware
   */
  private async executeAction(ctx: PipelineContext): Promise<void> {
    const command = ctx.command!;
    const allOptions = { ...ctx.globalOptions, ...ctx.commandOptions };

    const middlewareCtx: MiddlewareContext = {
      command,
      args: ctx.args,
      options: allOptions,
      rawArgs: ctx.argv,
    };

    try {
      const beforeMiddleware: MiddlewareHandler[] = [
        ...(this.config.middleware ?? []),
        ...(command.before ?? []),
      ];

      await this.runMiddleware(beforeMiddleware, middlewareCtx, async () => {
        await command.action!({ args: ctx.args, options: allOptions, rawArgs: ctx.argv });
      });

      if (command.after) {
        for (const handler of command.after) {
          await handler(middlewareCtx, async () => {});
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorHandler = command.onError ?? this.config.onError;

      if (errorHandler) {
        await errorHandler(error, middlewareCtx);
      } else {
        console.error(formatError(error.message));
        process.exit(1);
      }
    }
  }

  /**
   * Run the pipeline phases
   */
  private async runPipeline(argv: string[]): Promise<void> {
    let ctx = this.createInitialContext(argv);

    for (const phase of phases) {
      const result = await phase.run(ctx, this.config);

      switch (result.type) {
        case "continue":
          ctx = result.ctx;
          break;
        case "exit":
          if (result.code) process.exit(result.code);
          return;
        case "execute":
          await this.executeAction(result.ctx);
          return;
      }
    }
  }

  /**
   * Parse argv and run the appropriate command
   */
  async run(argv: string[] = process.argv.slice(2)): Promise<void> {
    try {
      await this.runPipeline(argv);
    } finally {
      closeStdin();
    }
  }
}
