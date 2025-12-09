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

/**
 * Simple spinner for async operations
 */
export function createSpinner(text: string) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;
  let interval: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      interval = setInterval(() => {
        process.stdout.write(`\r${color.cyan(frames[frameIndex % frames.length]!)} ${text}`);
        frameIndex++;
      }, 80);
      return this;
    },
    stop(finalText?: string) {
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
    succeed(message?: string) {
      return this.stop(`${color.green("✓")} ${message ?? text}`);
    },
    fail(message?: string) {
      return this.stop(`${color.red("✗")} ${message ?? text}`);
    },
  };
}
