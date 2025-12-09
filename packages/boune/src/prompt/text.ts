import { color } from "../output/color.ts";
import { readLine } from "./stdin.ts";
import type { Validator } from "../validation/types.ts";

export interface TextOptions {
  message: string;
  default?: string;
  placeholder?: string;
  /** Custom validation function (legacy) */
  validate?: (value: string) => string | true;
  /** Validator instance */
  validator?: Validator<string>;
}

/**
 * Prompt for text input
 */
export async function text(options: TextOptions): Promise<string> {
  const { message, default: defaultValue, placeholder, validate, validator } = options;

  // Build prompt string
  let prompt = color.cyan("? ") + color.bold(message);
  if (defaultValue) {
    prompt += color.dim(` (${defaultValue})`);
  }
  prompt += " ";

  process.stdout.write(prompt);

  const input = await readLine();
  let result = input.trim();

  // Apply default if empty
  if (result === "" && defaultValue !== undefined) {
    result = defaultValue;
  }

  // Validate with validator instance (new)
  if (validator) {
    const validation = validator.validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return text(options); // Retry
    }
  }

  // Validate with function (legacy)
  if (validate) {
    const validation = validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return text(options); // Retry
    }
  }

  return result;
}
