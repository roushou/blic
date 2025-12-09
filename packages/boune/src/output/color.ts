/**
 * Terminal color utilities using Bun.color
 */

type ColorName =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray";

// ANSI color codes
const colors: Record<ColorName, string> = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const underline = "\x1b[4m";

/**
 * Check if colors are supported
 */
export function supportsColor(): boolean {
  if (process.env["NO_COLOR"]) return false;
  if (process.env["FORCE_COLOR"]) return true;
  return process.stdout.isTTY ?? false;
}

/**
 * Color text if supported
 */
function colorize(text: string, code: string): string {
  if (!supportsColor()) return text;
  return `${code}${text}${reset}`;
}

export const color = {
  black: (text: string) => colorize(text, colors.black),
  red: (text: string) => colorize(text, colors.red),
  green: (text: string) => colorize(text, colors.green),
  yellow: (text: string) => colorize(text, colors.yellow),
  blue: (text: string) => colorize(text, colors.blue),
  magenta: (text: string) => colorize(text, colors.magenta),
  cyan: (text: string) => colorize(text, colors.cyan),
  white: (text: string) => colorize(text, colors.white),
  gray: (text: string) => colorize(text, colors.gray),
  bold: (text: string) => colorize(text, bold),
  dim: (text: string) => colorize(text, dim),
  underline: (text: string) => colorize(text, underline),
};
