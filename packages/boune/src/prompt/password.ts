import { color } from "../output/color.ts";

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

  // Read from stdin
  // Note: In a real implementation, we'd disable terminal echo
  // This requires native bindings or using a library like `readline`
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
