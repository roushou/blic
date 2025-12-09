import { color } from "./color.ts";

/**
 * Format a table with columns
 */
export function table(rows: string[][], options?: { padding?: number }): string {
  if (rows.length === 0) return "";

  const padding = options?.padding ?? 2;
  const colWidths: number[] = [];

  // Calculate column widths
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const cell = row[i] ?? "";
      colWidths[i] = Math.max(colWidths[i] ?? 0, cell.length);
    }
  }

  // Format rows
  return rows
    .map((row) => row.map((cell, i) => cell.padEnd((colWidths[i] ?? 0) + padding)).join(""))
    .join("\n");
}

/**
 * Format a list with bullets
 */
export function list(items: string[], bullet = "•"): string {
  return items.map((item) => `${bullet} ${item}`).join("\n");
}

/**
 * Format a key-value pair
 */
export function keyValue(pairs: Record<string, string>, separator = ":"): string {
  const maxKeyLen = Math.max(...Object.keys(pairs).map((k) => k.length));
  return Object.entries(pairs)
    .map(([key, value]) => `${key.padEnd(maxKeyLen)}${separator} ${value}`)
    .join("\n");
}

/**
 * Format an error message
 */
export function error(message: string): string {
  return `${color.red("error:")} ${message}`;
}

/**
 * Format a warning message
 */
export function warning(message: string): string {
  return `${color.yellow("warning:")} ${message}`;
}

/**
 * Format a success message
 */
export function success(message: string): string {
  return `${color.green("success:")} ${message}`;
}

/**
 * Format an info message
 */
export function info(message: string): string {
  return `${color.blue("info:")} ${message}`;
}

export interface Spinner {
  start(): Spinner;
  stop(finalText?: string): Spinner;
  succeed(message?: string): Spinner;
  fail(message?: string): Spinner;
}

export interface ProgressBarOptions {
  /** Total number of steps (default: 100) */
  total?: number;
  /** Width of the progress bar in characters (default: 40) */
  width?: number;
  /** Character for completed portion (default: "█") */
  complete?: string;
  /** Character for incomplete portion (default: "░") */
  incomplete?: string;
  /** Show percentage (default: true) */
  showPercent?: boolean;
  /** Show count (e.g., "5/10") (default: true) */
  showCount?: boolean;
}

export interface ProgressBar {
  /** Update progress to a specific value */
  update(current: number, text?: string): ProgressBar;
  /** Increment progress by a given amount (default: 1) */
  increment(amount?: number, text?: string): ProgressBar;
  /** Complete the progress bar */
  complete(text?: string): ProgressBar;
  /** Fail the progress bar */
  fail(text?: string): ProgressBar;
  /** Stop and clear the progress bar */
  stop(): ProgressBar;
}

/**
 * Simple spinner for async operations
 */
export function createSpinner(text: string): Spinner {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;
  let interval: ReturnType<typeof setInterval> | null = null;

  return {
    start(): Spinner {
      interval = setInterval(() => {
        process.stdout.write(`\r${color.cyan(frames[frameIndex % frames.length]!)} ${text}`);
        frameIndex++;
      }, 80);
      return this;
    },
    stop(finalText?: string): Spinner {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r${" ".repeat(text.length + 4)}\r`);
      if (finalText) {
        console.log(finalText);
      }
      return this;
    },
    succeed(message?: string): Spinner {
      return this.stop(`${color.green("✓")} ${message ?? text}`);
    },
    fail(message?: string): Spinner {
      return this.stop(`${color.red("✗")} ${message ?? text}`);
    },
  };
}

/**
 * Create a progress bar for tracking task progress
 */
export function createProgressBar(text: string, options?: ProgressBarOptions): ProgressBar {
  const total = options?.total ?? 100;
  const width = options?.width ?? 40;
  const completeChar = options?.complete ?? "█";
  const incompleteChar = options?.incomplete ?? "░";
  const showPercent = options?.showPercent ?? true;
  const showCount = options?.showCount ?? true;

  let current = 0;
  let currentText = text;
  let stopped = false;

  function render(): void {
    if (stopped) return;

    const percent = Math.min(100, Math.round((current / total) * 100));
    const filledWidth = Math.round((current / total) * width);
    const emptyWidth = width - filledWidth;

    const bar = completeChar.repeat(filledWidth) + incompleteChar.repeat(emptyWidth);

    const parts: string[] = [color.cyan(bar)];

    if (showPercent) {
      parts.push(color.gray(`${percent.toString().padStart(3)}%`));
    }

    if (showCount) {
      parts.push(color.gray(`(${current}/${total})`));
    }

    parts.push(currentText);

    process.stdout.write(`\r${parts.join(" ")}`);
  }

  function clearLine(): void {
    const clearWidth = width + currentText.length + 30;
    process.stdout.write(`\r${" ".repeat(clearWidth)}\r`);
  }

  return {
    update(value: number, newText?: string): ProgressBar {
      current = Math.max(0, Math.min(total, value));
      if (newText !== undefined) {
        currentText = newText;
      }
      render();
      return this;
    },

    increment(amount = 1, newText?: string): ProgressBar {
      return this.update(current + amount, newText);
    },

    complete(finalText?: string): ProgressBar {
      stopped = true;
      clearLine();
      console.log(`${color.green("✓")} ${finalText ?? currentText}`);
      return this;
    },

    fail(finalText?: string): ProgressBar {
      stopped = true;
      clearLine();
      console.log(`${color.red("✗")} ${finalText ?? currentText}`);
      return this;
    },

    stop(): ProgressBar {
      stopped = true;
      clearLine();
      return this;
    },
  };
}
