import { color } from "../output/color.ts";

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

  // Read from stdin
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();
  let input = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    input += chunk;

    if (input.includes("\n")) {
      break;
    }
  }

  reader.releaseLock();

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
