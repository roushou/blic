import { color } from "../output/color.ts";
import { readLine } from "./stdin.ts";
import type { Validator } from "../validation/types.ts";

export interface PasswordOptions {
  message: string;
  mask?: string;
  /** Custom validation function (legacy) */
  validate?: (value: string) => string | true;
  /** Validator instance */
  validator?: Validator<string>;
}

/**
 * Prompt for password/secret input
 * Note: This is a simple implementation. For true hidden input,
 * you would need to disable terminal echo which requires native bindings.
 */
export async function password(options: PasswordOptions): Promise<string> {
  const { message, mask = "*", validate, validator } = options;

  // Build prompt string
  const prompt = color.cyan("? ") + color.bold(message) + " ";

  process.stdout.write(prompt);

  const input = await readLine();
  const result = input.trim();

  // Validate with validator instance (new)
  if (validator) {
    const validation = validator.validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return password(options);
    }
  }

  // Validate with function (legacy)
  if (validate) {
    const validation = validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return password(options);
    }
  }

  return result;
}
