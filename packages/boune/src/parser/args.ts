import type { ArgumentDef, ParsedArgs, ValidationError } from "../types.ts";

/**
 * Coerce a string value to the specified type
 */
export function coerceValue(
  value: string,
  type: ArgumentDef["type"],
): { ok: true; value: unknown } | { ok: false; error: string } {
  switch (type) {
    case "string":
      return { ok: true, value };

    case "number": {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return { ok: false, error: `"${value}" is not a valid number` };
      }
      return { ok: true, value: num };
    }

    case "boolean": {
      const lower = value.toLowerCase();
      if (lower === "true" || lower === "1" || lower === "yes") {
        return { ok: true, value: true };
      }
      if (lower === "false" || lower === "0" || lower === "no") {
        return { ok: true, value: false };
      }
      return { ok: false, error: `"${value}" is not a valid boolean` };
    }

    default:
      return { ok: false, error: `Unknown type: ${type}` };
  }
}

/**
 * Parse positional arguments according to argument definitions
 */
export function parseArguments(
  values: string[],
  definitions: ArgumentDef[],
): { args: ParsedArgs; errors: ValidationError[] } {
  const args: ParsedArgs = {};
  const errors: ValidationError[] = [];

  let valueIndex = 0;

  for (const def of definitions) {
    if (def.variadic) {
      // Variadic argument consumes all remaining values
      const remaining = values.slice(valueIndex);
      if (remaining.length === 0 && def.required) {
        errors.push({
          type: "missing_required",
          message: `Missing required argument: <${def.name}>`,
          field: def.name,
        });
        args[def.name] = def.default ?? [];
      } else {
        const coerced: unknown[] = [];
        for (const val of remaining) {
          const result = coerceValue(val, def.type);
          if (result.ok) {
            coerced.push(result.value);
          } else {
            errors.push({
              type: "invalid_type",
              message: `Invalid value for <${def.name}>: ${result.error}`,
              field: def.name,
            });
          }
        }
        args[def.name] = coerced.length > 0 ? coerced : (def.default ?? []);
      }
      valueIndex = values.length;
    } else {
      const value = values[valueIndex];

      if (value === undefined) {
        if (def.required) {
          errors.push({
            type: "missing_required",
            message: `Missing required argument: <${def.name}>`,
            field: def.name,
          });
        }
        args[def.name] = def.default;
      } else {
        const result = coerceValue(value, def.type);
        if (result.ok) {
          args[def.name] = result.value;
        } else {
          errors.push({
            type: "invalid_type",
            message: `Invalid value for <${def.name}>: ${result.error}`,
            field: def.name,
          });
          args[def.name] = def.default;
        }
        valueIndex++;
      }
    }
  }

  // Run custom validators
  for (const def of definitions) {
    const value = args[def.name];
    if (value !== undefined && def.validate) {
      const result = def.validate.validate(value);
      if (result !== true) {
        errors.push({
          type: "validation_failed",
          message: `Invalid value for <${def.name}>: ${result}`,
          field: def.name,
        });
      }
    }
  }

  return { args, errors };
}
