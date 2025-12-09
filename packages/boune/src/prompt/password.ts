import { color } from "../output/color.ts";
import { readLine } from "./stdin.ts";

export interface PasswordOptions {
  message: string;
  mask?: string;
  validate?: (value: string) => string | true;
}

/**
 * Prompt for password/secret input
 * Note: This is a simple implementation. For true hidden input,
 * you would need to disable terminal echo which requires native bindings.
 */
export async function password(options: PasswordOptions): Promise<string> {
  const { message, mask = "*", validate } = options;

  // Build prompt string
  const prompt = color.cyan("? ") + color.bold(message) + " ";

  process.stdout.write(prompt);

  const input = await readLine();
  const result = input.trim();

  // Validate
  if (validate) {
    const validation = validate(result);
    if (validation !== true) {
      console.log(color.red(`  ${validation}`));
      return password(options);
    }
  }

  return result;
}
