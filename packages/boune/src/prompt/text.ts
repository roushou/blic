import { color } from "../output/color.ts";
import { readLine } from "./stdin.ts";

export interface TextOptions {
  message: string;
  default?: string;
  placeholder?: string;
  validate?: (value: string) => string | true;
}

/**
 * Prompt for text input
 */
export async function text(options: TextOptions): Promise<string> {
  const { message, default: defaultValue, placeholder, validate } = options;

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

  // Validate
  if (validate) {
    const validation = validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return text(options); // Retry
    }
  }

  return result;
}
