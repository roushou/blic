import type { Token } from "../types.ts";

/**
 * Tokenizes raw argv into structured tokens
 */
export function tokenize(argv: string[]): Token[] {
  const tokens: Token[] = [];
  let afterSeparator = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;

    // After -- separator, everything is an argument
    if (afterSeparator) {
      tokens.push({ type: "argument", value: arg, raw: arg });
      continue;
    }

    // -- separator: everything after is treated as arguments
    if (arg === "--") {
      tokens.push({ type: "separator", value: "--", raw: arg });
      afterSeparator = true;
      continue;
    }

    // Long option: --name or --name=value
    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex !== -1) {
        const name = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);
        tokens.push({ type: "option", value: name, raw: arg });
        tokens.push({ type: "value", value, raw: value });
      } else {
        tokens.push({ type: "option", value: arg.slice(2), raw: arg });
      }
      continue;
    }

    // Short option: -v or -abc (multiple flags) or -n=value
    if (arg.startsWith("-") && arg.length > 1) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex !== -1) {
        // -n=value
        const flags = arg.slice(1, eqIndex);
        const value = arg.slice(eqIndex + 1);
        // Only last flag gets the value
        for (let j = 0; j < flags.length - 1; j++) {
          tokens.push({ type: "option", value: flags[j]!, raw: `-${flags[j]}` });
        }
        tokens.push({
          type: "option",
          value: flags[flags.length - 1]!,
          raw: `-${flags[flags.length - 1]}`,
        });
        tokens.push({ type: "value", value, raw: value });
      } else {
        // -abc expands to -a -b -c
        const flags = arg.slice(1);
        for (const flag of flags) {
          tokens.push({ type: "option", value: flag, raw: `-${flag}` });
        }
      }
      continue;
    }

    // Everything else is an argument (could be command or positional)
    tokens.push({ type: "argument", value: arg, raw: arg });
  }

  return tokens;
}

/**
 * Check if a token looks like a negative number rather than a flag
 */
export function isNegativeNumber(value: string): boolean {
  return /^-\d+(\.\d+)?$/.test(value);
}
