import { color } from "../output/color.ts";
import { readKey } from "./stdin.ts";
import * as tty from "node:tty";

export interface SelectOption<T = string> {
  label: string;
  value: T;
  hint?: string;
}

export interface SelectOptions<T = string> {
  message: string;
  options: SelectOption<T>[];
  default?: T;
}

// ANSI escape codes for cursor control
const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CLEAR_LINE = "\x1b[2K";
const MOVE_UP = (n: number): string => `\x1b[${n}A`;
const MOVE_TO_COL_0 = "\r";

/**
 * Render the select options list
 */
function renderOptions<T>(
  choices: SelectOption<T>[],
  selectedIndex: number,
  isInitialRender: boolean,
): void {
  // Move cursor up to overwrite previous render (except on first render)
  if (!isInitialRender) {
    process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
  }

  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]!;
    const isSelected = i === selectedIndex;

    process.stdout.write(CLEAR_LINE);

    const pointer = isSelected ? color.cyan("❯") : " ";
    const label = isSelected ? color.cyan(choice.label) : choice.label;
    let line = `  ${pointer} ${label}`;

    if (choice.hint) {
      line += color.dim(` - ${choice.hint}`);
    }

    console.log(line);
  }
}

/**
 * Prompt for single selection from a list
 * Use arrow keys or j/k to navigate, enter to select
 */
export async function select<T = string>(options: SelectOptions<T>): Promise<T> {
  const { message, options: choices, default: defaultValue } = options;

  // Find default/initial index
  let selectedIndex = defaultValue ? choices.findIndex((c) => c.value === defaultValue) : 0;
  if (selectedIndex < 0) selectedIndex = 0;

  const isTTY = tty.isatty(0);

  // Print message
  console.log(
    color.cyan("? ") + color.bold(message) + color.dim(" (use ↑↓ or j/k, enter to select)"),
  );

  if (!isTTY) {
    // Fallback to simple numbered selection for non-TTY
    return selectFallback(options);
  }

  // Hide cursor during selection
  process.stdout.write(HIDE_CURSOR);

  // Initial render
  renderOptions(choices, selectedIndex, true);

  // Read keys until enter is pressed
  while (true) {
    const key = await readKey();

    if (key.name === "up" || key.name === "k") {
      selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : choices.length - 1;
      renderOptions(choices, selectedIndex, false);
    } else if (key.name === "down" || key.name === "j") {
      selectedIndex = selectedIndex < choices.length - 1 ? selectedIndex + 1 : 0;
      renderOptions(choices, selectedIndex, false);
    } else if (key.name === "return") {
      // Show cursor and print final selection
      process.stdout.write(SHOW_CURSOR);
      // Move up and clear the options, then show selected value
      process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
      for (let i = 0; i < choices.length; i++) {
        process.stdout.write(CLEAR_LINE + "\n");
      }
      process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
      console.log(color.dim("  ✓ ") + color.cyan(choices[selectedIndex]!.label));
      return choices[selectedIndex]!.value;
    } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      // Show cursor and exit
      process.stdout.write(SHOW_CURSOR);
      process.exit(0);
    }
  }
}

/**
 * Fallback for non-TTY environments (numbered selection)
 */
async function selectFallback<T>(options: SelectOptions<T>): Promise<T> {
  const { options: choices, default: defaultValue } = options;
  const { readLine } = await import("./stdin.ts");

  const defaultIndex = defaultValue ? choices.findIndex((c) => c.value === defaultValue) : -1;

  // Print options
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]!;
    const isDefault = i === defaultIndex;
    const prefix = isDefault ? color.cyan(`  ${i + 1}.`) : `  ${i + 1}.`;
    let line = `${prefix} ${choice.label}`;
    if (choice.hint) {
      line += color.dim(` - ${choice.hint}`);
    }
    if (isDefault) {
      line += color.dim(" (default)");
    }
    console.log(line);
  }

  const hint =
    defaultIndex >= 0 ? `1-${choices.length}, default: ${defaultIndex + 1}` : `1-${choices.length}`;
  process.stdout.write(color.dim(`  Enter choice (${hint}): `));

  const input = await readLine();
  const result = input.trim();

  if (result === "" && defaultIndex >= 0) {
    return choices[defaultIndex]!.value;
  }

  const num = parseInt(result, 10);
  if (isNaN(num) || num < 1 || num > choices.length) {
    console.log(color.red(`  Please enter a number between 1 and ${choices.length}`));
    return selectFallback(options);
  }

  return choices[num - 1]!.value;
}

/**
 * Render the multiselect options list
 */
function renderMultiselectOptions<T>(
  choices: SelectOption<T>[],
  cursorIndex: number,
  selectedIndices: Set<number>,
  isInitialRender: boolean,
): void {
  if (!isInitialRender) {
    process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
  }

  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]!;
    const isCursor = i === cursorIndex;
    const isSelected = selectedIndices.has(i);

    process.stdout.write(CLEAR_LINE);

    const pointer = isCursor ? color.cyan("❯") : " ";
    const checkbox = isSelected ? color.green("◉") : color.dim("○");
    const label = isCursor ? color.cyan(choice.label) : choice.label;
    let line = `  ${pointer} ${checkbox} ${label}`;

    if (choice.hint) {
      line += color.dim(` - ${choice.hint}`);
    }

    console.log(line);
  }
}

/**
 * Prompt for multiple selections from a list
 * Use arrow keys or j/k to navigate, space to toggle, enter to confirm
 */
export async function multiselect<T = string>(
  options: SelectOptions<T> & { min?: number; max?: number },
): Promise<T[]> {
  const { message, options: choices, min = 0, max = choices.length } = options;

  const isTTY = tty.isatty(0);

  // Print message
  console.log(
    color.cyan("? ") +
      color.bold(message) +
      color.dim(" (use ↑↓ or j/k, space to toggle, enter to confirm)"),
  );

  if (!isTTY) {
    return multiselectFallback(options);
  }

  let cursorIndex = 0;
  const selectedIndices = new Set<number>();

  // Hide cursor during selection
  process.stdout.write(HIDE_CURSOR);

  // Initial render
  renderMultiselectOptions(choices, cursorIndex, selectedIndices, true);

  while (true) {
    const key = await readKey();

    if (key.name === "up" || key.name === "k") {
      cursorIndex = cursorIndex > 0 ? cursorIndex - 1 : choices.length - 1;
      renderMultiselectOptions(choices, cursorIndex, selectedIndices, false);
    } else if (key.name === "down" || key.name === "j") {
      cursorIndex = cursorIndex < choices.length - 1 ? cursorIndex + 1 : 0;
      renderMultiselectOptions(choices, cursorIndex, selectedIndices, false);
    } else if (key.name === "space") {
      // Toggle selection
      if (selectedIndices.has(cursorIndex)) {
        selectedIndices.delete(cursorIndex);
      } else if (selectedIndices.size < max) {
        selectedIndices.add(cursorIndex);
      }
      renderMultiselectOptions(choices, cursorIndex, selectedIndices, false);
    } else if (key.name === "a" && !key.ctrl) {
      // Toggle all
      if (selectedIndices.size === choices.length) {
        selectedIndices.clear();
      } else {
        for (let i = 0; i < Math.min(choices.length, max); i++) {
          selectedIndices.add(i);
        }
      }
      renderMultiselectOptions(choices, cursorIndex, selectedIndices, false);
    } else if (key.name === "return") {
      // Validate selection count
      if (selectedIndices.size < min) {
        // Show error message briefly, then continue
        process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
        for (let i = 0; i < choices.length; i++) {
          process.stdout.write(CLEAR_LINE + "\n");
        }
        process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
        console.log(color.red(`  Please select at least ${min} option(s)`));
        renderMultiselectOptions(choices, cursorIndex, selectedIndices, true);
        continue;
      }

      // Show cursor and print final selection
      process.stdout.write(SHOW_CURSOR);
      process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);
      for (let i = 0; i < choices.length; i++) {
        process.stdout.write(CLEAR_LINE + "\n");
      }
      process.stdout.write(MOVE_UP(choices.length) + MOVE_TO_COL_0);

      const selectedLabels = Array.from(selectedIndices)
        .sort((a, b) => a - b)
        .map((i) => choices[i]!.label)
        .join(", ");
      console.log(color.dim("  ✓ ") + color.cyan(selectedLabels || "(none)"));

      return Array.from(selectedIndices)
        .sort((a, b) => a - b)
        .map((i) => choices[i]!.value);
    } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      process.stdout.write(SHOW_CURSOR);
      process.exit(0);
    }
  }
}

/**
 * Fallback for non-TTY environments (comma-separated numbers)
 */
async function multiselectFallback<T>(
  options: SelectOptions<T> & { min?: number; max?: number },
): Promise<T[]> {
  const { options: choices, min = 0, max = choices.length } = options;
  const { readLine } = await import("./stdin.ts");

  // Print options
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]!;
    let line = `  ${i + 1}. ${choice.label}`;
    if (choice.hint) {
      line += color.dim(` - ${choice.hint}`);
    }
    console.log(line);
  }

  process.stdout.write(color.dim(`  Enter choices (comma-separated, e.g., 1,3,4): `));

  const input = await readLine();
  const result = input.trim();

  if (result === "") {
    if (min > 0) {
      console.log(color.red(`  Please select at least ${min} option(s)`));
      return multiselectFallback(options);
    }
    return [];
  }

  const nums = result.split(",").map((s) => parseInt(s.trim(), 10));
  const invalid = nums.some((n) => isNaN(n) || n < 1 || n > choices.length);

  if (invalid) {
    console.log(color.red(`  Invalid selection. Enter numbers between 1 and ${choices.length}`));
    return multiselectFallback(options);
  }

  if (nums.length < min) {
    console.log(color.red(`  Please select at least ${min} option(s)`));
    return multiselectFallback(options);
  }

  if (nums.length > max) {
    console.log(color.red(`  Please select at most ${max} option(s)`));
    return multiselectFallback(options);
  }

  return nums.map((n) => choices[n - 1]!.value);
}
