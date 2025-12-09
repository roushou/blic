import { color } from "../output/color.ts";
import { readLine } from "./stdin.ts";

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

/**
 * Prompt for single selection from a list
 * Uses simple numbered selection for terminal compatibility
 */
export async function select<T = string>(options: SelectOptions<T>): Promise<T> {
  const { message, options: choices, default: defaultValue } = options;

  // Find default index
  const defaultIndex = defaultValue ? choices.findIndex((c) => c.value === defaultValue) : -1;

  // Print message
  console.log(color.cyan("? ") + color.bold(message));

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

  // Prompt for selection
  const hint =
    defaultIndex >= 0 ? `1-${choices.length}, default: ${defaultIndex + 1}` : `1-${choices.length}`;
  process.stdout.write(color.dim(`  Enter choice (${hint}): `));

  const input = await readLine();
  const result = input.trim();

  // Use default if empty
  if (result === "" && defaultIndex >= 0) {
    return choices[defaultIndex]!.value;
  }

  // Parse number
  const num = parseInt(result, 10);
  if (isNaN(num) || num < 1 || num > choices.length) {
    console.log(color.red(`  Please enter a number between 1 and ${choices.length}`));
    return select(options);
  }

  return choices[num - 1]!.value;
}

/**
 * Prompt for multiple selections from a list
 */
export async function multiselect<T = string>(
  options: SelectOptions<T> & { min?: number; max?: number },
): Promise<T[]> {
  const { message, options: choices, min = 0, max = choices.length } = options;

  // Print message
  console.log(color.cyan("? ") + color.bold(message));

  // Print options
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]!;
    let line = `  ${i + 1}. ${choice.label}`;
    if (choice.hint) {
      line += color.dim(` - ${choice.hint}`);
    }
    console.log(line);
  }

  // Prompt for selection
  process.stdout.write(color.dim(`  Enter choices (comma-separated, e.g., 1,3,4): `));

  const input = await readLine();
  const result = input.trim();

  if (result === "") {
    if (min > 0) {
      console.log(color.red(`  Please select at least ${min} option(s)`));
      return multiselect(options);
    }
    return [];
  }

  // Parse numbers
  const nums = result.split(",").map((s) => parseInt(s.trim(), 10));
  const invalid = nums.some((n) => isNaN(n) || n < 1 || n > choices.length);

  if (invalid) {
    console.log(color.red(`  Invalid selection. Enter numbers between 1 and ${choices.length}`));
    return multiselect(options);
  }

  if (nums.length < min) {
    console.log(color.red(`  Please select at least ${min} option(s)`));
    return multiselect(options);
  }

  if (nums.length > max) {
    console.log(color.red(`  Please select at most ${max} option(s)`));
    return multiselect(options);
  }

  return nums.map((n) => choices[n - 1]!.value);
}
