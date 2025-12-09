import { color } from "../output/color.ts";

export interface ConfirmOptions {
  message: string;
  default?: boolean;
}

/**
 * Prompt for yes/no confirmation
 */
export async function confirm(options: ConfirmOptions): Promise<boolean> {
  const { message, default: defaultValue = false } = options;

  // Build prompt string
  const hint = defaultValue ? "Y/n" : "y/N";
  const prompt = color.cyan("? ") + color.bold(message) + color.dim(` (${hint}) `);

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

  const result = input.trim().toLowerCase();

  if (result === "") {
    return defaultValue;
  }

  if (result === "y" || result === "yes") {
    return true;
  }

  if (result === "n" || result === "no") {
    return false;
  }

  // Invalid input, retry
  console.log(color.red("  Please enter y or n"));
  return confirm(options);
}
