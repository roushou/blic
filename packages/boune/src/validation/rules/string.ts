import type { RuleSpec } from "../types.ts";

/**
 * String validation rules
 */
export const stringRules = {
  email: {
    check: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: () => "Must be a valid email address",
  },
  url: {
    check: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: () => "Must be a valid URL",
  },
  regex: {
    check: (value: string, pattern: RegExp) => pattern.test(value),
    message: (pattern: RegExp) => `Must match pattern ${pattern}`,
  },
  minLength: {
    check: (value: string, min: number) => value.length >= min,
    message: (min: number) => `Must be at least ${min} characters`,
  },
  maxLength: {
    check: (value: string, max: number) => value.length <= max,
    message: (max: number) => `Must be at most ${max} characters`,
  },
} as const satisfies Record<string, RuleSpec<string, never[]>>;
