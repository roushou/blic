/**
 * Logger utility for CLI applications
 *
 * Provides leveled logging with colors, prefixes, and timestamps.
 */

import { color } from "../../output/color.ts";

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export type LoggerOptions = {
  /** Minimum log level to display (default: "info") */
  level?: LogLevel;
  /** Prefix for all messages */
  prefix?: string;
  /** Show timestamps (default: false) */
  timestamp?: boolean;
};

export type Logger = {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
  /** Create a child logger with a prefix */
  child(prefix: string): Logger;
  /** Update the log level */
  setLevel(level: LogLevel): void;
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/**
 * Create a logger instance
 *
 * @example
 * ```typescript
 * import { createLogger } from "boune/x/logger";
 *
 * const log = createLogger({ level: "debug" });
 *
 * log.debug("Parsing arguments...");
 * log.info("Server started on :3000");
 * log.warn("Config file not found, using defaults");
 * log.error("Failed to connect to database");
 * log.success("Build complete!");
 *
 * // Child logger with prefix
 * const httpLog = log.child("http");
 * httpLog.info("Request received"); // → [http] info: Request received
 * ```
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  let currentLevel = options.level ?? "info";
  const prefix = options.prefix;
  const showTimestamp = options.timestamp ?? false;

  function shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
  }

  function formatPrefix(): string {
    const parts: string[] = [];

    if (showTimestamp) {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour12: false });
      parts.push(color.dim(time));
    }

    if (prefix) {
      parts.push(color.dim(`[${prefix}]`));
    }

    return parts.length > 0 ? `${parts.join(" ")} ` : "";
  }

  function log(
    level: LogLevel,
    label: string,
    colorFn: (s: string) => string,
    message: string,
  ): void {
    if (!shouldLog(level)) return;

    const formattedPrefix = formatPrefix();
    const output = `${formattedPrefix}${colorFn(label)} ${message}`;

    if (level === "error" || level === "warn") {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  return {
    debug(message: string): void {
      log("debug", "debug:", color.dim, message);
    },
    info(message: string): void {
      log("info", "info:", color.blue, message);
    },
    warn(message: string): void {
      log("warn", "warn:", color.yellow, message);
    },
    error(message: string): void {
      log("error", "error:", color.red, message);
    },
    success(message: string): void {
      log("info", "success:", color.green, message);
    },
    child(childPrefix: string): Logger {
      const newPrefix = prefix ? `${prefix}:${childPrefix}` : childPrefix;
      return createLogger({
        level: currentLevel,
        prefix: newPrefix,
        timestamp: showTimestamp,
      });
    },
    setLevel(level: LogLevel): void {
      currentLevel = level;
    },
  };
}

// =============================================================================
// Simple one-shot functions (print directly)
// =============================================================================

/**
 * Log a debug message
 */
export function logDebug(message: string): void {
  console.log(`${color.dim("debug:")} ${message}`);
}

/**
 * Log an info message
 */
export function logInfo(message: string): void {
  console.log(`${color.blue("info:")} ${message}`);
}

/**
 * Log a warning message
 */
export function logWarn(message: string): void {
  console.error(`${color.yellow("warn:")} ${message}`);
}

/**
 * Log an error message
 */
export function logError(message: string): void {
  console.error(`${color.red("error:")} ${message}`);
}

/**
 * Log a success message
 */
export function logSuccess(message: string): void {
  console.log(`${color.green("success:")} ${message}`);
}

// =============================================================================
// Pure formatters (return strings, don't print)
// =============================================================================

/**
 * Format a debug message (returns string)
 */
export function formatDebug(message: string): string {
  return `${color.dim("debug:")} ${message}`;
}

/**
 * Format an info message (returns string)
 */
export function formatInfo(message: string): string {
  return `${color.blue("info:")} ${message}`;
}

/**
 * Format a warning message (returns string)
 */
export function formatWarning(message: string): string {
  return `${color.yellow("warning:")} ${message}`;
}

/**
 * Format an error message (returns string)
 */
export function formatError(message: string): string {
  return `${color.red("error:")} ${message}`;
}

/**
 * Format a success message (returns string)
 */
export function formatSuccess(message: string): string {
  return `${color.green("success:")} ${message}`;
}
