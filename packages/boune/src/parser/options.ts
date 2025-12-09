import type { OptionDef, ParsedOptions, Token, ValidationError } from "../types.ts";
import { coerceValue } from "./args.ts";

/**
 * Build a lookup map for options by name and short flag
 */
function buildOptionMap(definitions: OptionDef[]): Map<string, OptionDef> {
  const map = new Map<string, OptionDef>();
  for (const def of definitions) {
    map.set(def.name, def);
    if (def.short) {
      map.set(def.short, def);
    }
  }
  return map;
}

/**
 * Parse options from tokens
 */
export function parseOptions(
  tokens: Token[],
  definitions: OptionDef[],
  allowUnknown = false,
): {
  options: ParsedOptions;
  errors: ValidationError[];
  remaining: Token[];
} {
  const options: ParsedOptions = {};
  const errors: ValidationError[] = [];
  const remaining: Token[] = [];
  const optionMap = buildOptionMap(definitions);
  const seenOptions = new Set<string>();

  let i = 0;
  let afterSeparator = false;

  while (i < tokens.length) {
    const token = tokens[i]!;

    // After -- separator, everything is an argument
    if (token.type === "separator") {
      afterSeparator = true;
      i++;
      continue;
    }

    if (afterSeparator || token.type !== "option") {
      remaining.push(token);
      i++;
      continue;
    }

    const def = optionMap.get(token.value);

    if (!def) {
      if (allowUnknown) {
        // Keep unknown options in remaining for later parsing
        remaining.push(token);
        // Also keep the next token if it looks like a value
        const nextToken = tokens[i + 1];
        if (nextToken && (nextToken.type === "value" || nextToken.type === "argument")) {
          remaining.push(nextToken);
          i += 2;
        } else {
          i++;
        }
      } else {
        errors.push({
          type: "unknown_option",
          message: `Unknown option: ${token.raw}`,
          field: token.value,
        });
        i++;
      }
      continue;
    }

    seenOptions.add(def.name);

    // Boolean flags don't need a value
    if (def.type === "boolean") {
      // Check if next token is an explicit value
      const nextToken = tokens[i + 1];
      if (nextToken?.type === "value") {
        const result = coerceValue(nextToken.value, "boolean");
        if (result.ok) {
          options[def.name] = result.value;
          i += 2;
          continue;
        }
      }
      // No explicit value, toggle to true
      options[def.name] = true;
      i++;
      continue;
    }

    // Non-boolean options need a value
    const nextToken = tokens[i + 1];
    if (nextToken?.type === "value") {
      const result = coerceValue(nextToken.value, def.type);
      if (result.ok) {
        options[def.name] = result.value;
      } else {
        errors.push({
          type: "invalid_type",
          message: `Invalid value for --${def.name}: ${result.error}`,
          field: def.name,
        });
      }
      i += 2;
    } else if (nextToken?.type === "argument") {
      // Use argument as value
      const result = coerceValue(nextToken.value, def.type);
      if (result.ok) {
        options[def.name] = result.value;
        i += 2;
      } else {
        errors.push({
          type: "invalid_type",
          message: `Option --${def.name} requires a value`,
          field: def.name,
        });
        i++;
      }
    } else {
      errors.push({
        type: "invalid_type",
        message: `Option --${def.name} requires a value`,
        field: def.name,
      });
      i++;
    }
  }

  // Apply defaults and env vars for unseen options
  for (const def of definitions) {
    if (seenOptions.has(def.name)) continue;

    // Check environment variable
    if (def.env) {
      const envValue = process.env[def.env];
      if (envValue !== undefined) {
        const result = coerceValue(envValue, def.type);
        if (result.ok) {
          options[def.name] = result.value;
          continue;
        }
      }
    }

    // Apply default
    if (def.default !== undefined) {
      options[def.name] = def.default;
    } else if (def.required) {
      errors.push({
        type: "missing_required",
        message: `Missing required option: --${def.name}`,
        field: def.name,
      });
    }
  }

  // Run custom validators
  for (const def of definitions) {
    const value = options[def.name];
    if (value !== undefined && def.validate) {
      const result = def.validate.validate(value);
      if (result !== true) {
        errors.push({
          type: "validation_failed",
          message: `Invalid value for --${def.name}: ${result}`,
          field: def.name,
        });
      }
    }
  }

  return { options, errors, remaining };
}
