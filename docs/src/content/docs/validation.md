---
title: Validation
description: Validate user input with chainable validators.
---

Boune provides a powerful validation system with chainable validators for arguments and options.

## Basic Validation

Use the `v` factory to create validators:

```typescript
import { defineCommand, argument, option, v } from "boune";

const deploy = defineCommand({
  name: "deploy",
  arguments: {
    env: argument.string().required().validate(v.string().oneOf(["dev", "staging", "prod"])),
  },
  options: {
    port: option.number().validate(v.number().min(1).max(65535)),
  },
  action({ args, options }) {
    console.log(`Deploying to ${args.env} on port ${options.port}`);
  },
});
```

## String Validators

```typescript
import { v } from "boune";

// Email validation
v.string().email()

// URL validation
v.string().url()

// Regex pattern
v.string().regex(/^[a-z]+$/, "Must be lowercase letters")

// Length constraints
v.string().minLength(3)
v.string().maxLength(50)

// Allowed values
v.string().oneOf(["small", "medium", "large"])
```

### Email

```typescript
const register = defineCommand({
  name: "register",
  arguments: {
    email: argument.string().required().validate(v.string().email()),
  },
  action({ args }) {
    console.log(`Registering ${args.email}`);
  },
});
```

```bash
myapp register invalid       # Error: Must be a valid email address
myapp register user@test.com # Works
```

### URL

```typescript
const fetch = defineCommand({
  name: "fetch",
  arguments: {
    url: argument.string().required().validate(v.string().url()),
  },
  action({ args }) {
    console.log(`Fetching ${args.url}`);
  },
});
```

### Pattern Matching

```typescript
const tag = defineCommand({
  name: "tag",
  arguments: {
    version: argument
      .string()
      .required()
      .validate(v.string().regex(/^v\d+\.\d+\.\d+$/, "Must be semantic version (v1.0.0)")),
  },
  action({ args }) {
    console.log(`Creating tag ${args.version}`);
  },
});
```

## Number Validators

```typescript
import { v } from "boune";

// Range constraints
v.number().min(0)
v.number().max(100)
v.number().min(1).max(65535)

// Integer only
v.number().integer()

// Sign constraints
v.number().positive()
v.number().negative()

// Allowed values
v.number().oneOf([80, 443, 8080])
```

### Port Number

```typescript
const serve = defineCommand({
  name: "serve",
  options: {
    port: option
      .number()
      .default(3000)
      .validate(v.number().integer().min(1).max(65535)),
  },
  action({ options }) {
    console.log(`Listening on port ${options.port}`);
  },
});
```

```bash
myapp serve --port 80     # Works
myapp serve --port 70000  # Error: Must be at most 65535
myapp serve --port 3.5    # Error: Must be an integer
```

### Positive Numbers

```typescript
const resize = defineCommand({
  name: "resize",
  options: {
    width: option.number().required().validate(v.number().positive().integer()),
    height: option.number().required().validate(v.number().positive().integer()),
  },
  action({ options }) {
    console.log(`Resizing to ${options.width}x${options.height}`);
  },
});
```

## Chaining Validators

Chain multiple validations:

```typescript
const create = defineCommand({
  name: "create",
  arguments: {
    name: argument
      .string()
      .required()
      .validate(
        v.string()
          .minLength(3)
          .maxLength(20)
          .regex(/^[a-z][a-z0-9-]*$/, "Must start with letter, only lowercase, numbers, and hyphens")
      ),
  },
  action({ args }) {
    console.log(`Creating ${args.name}`);
  },
});
```

## Custom Validation

Use `refine` for custom logic:

```typescript
const upload = defineCommand({
  name: "upload",
  arguments: {
    file: argument
      .string()
      .required()
      .validate(
        v.string().refine((path) => {
          if (!path.endsWith(".json") && !path.endsWith(".yaml")) {
            return "Must be a JSON or YAML file";
          }
          return true;
        })
      ),
  },
  action({ args }) {
    console.log(`Uploading ${args.file}`);
  },
});
```

### Complex Validation

```typescript
const setDate = defineCommand({
  name: "set-date",
  arguments: {
    date: argument
      .string()
      .required()
      .validate(
        v.string().refine((value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return "Invalid date format";
          }
          if (date < new Date()) {
            return "Date must be in the future";
          }
          return true;
        })
      ),
  },
  action({ args }) {
    console.log(`Date set to ${args.date}`);
  },
});
```

## Custom Error Messages

Override default error messages:

```typescript
v.string().email("Please provide a valid email address")
v.number().min(1, "Value must be at least 1")
v.string().minLength(8, "Password must be at least 8 characters")
```

## Validation with Function

For simple cases, use inline validation:

```typescript
const greet = defineCommand({
  name: "greet",
  arguments: {
    name: argument.string().required().validate((value) => {
      if (value.toLowerCase() === "admin") {
        return "Name cannot be 'admin'";
      }
      return true;
    }),
  },
  action({ args }) {
    console.log(`Hello, ${args.name}!`);
  },
});
```

## Validator Methods

### String Validators

| Method                  | Description           |
| ----------------------- | --------------------- |
| `.email(msg?)`          | Valid email format    |
| `.url(msg?)`            | Valid URL format      |
| `.regex(pattern, msg?)` | Match regex pattern   |
| `.minLength(n, msg?)`   | Minimum length        |
| `.maxLength(n, msg?)`   | Maximum length        |
| `.oneOf(values, msg?)`  | One of allowed values |
| `.refine(fn, msg?)`     | Custom validation     |

### Number Validators

| Method                 | Description           |
| ---------------------- | --------------------- |
| `.min(n, msg?)`        | Minimum value         |
| `.max(n, msg?)`        | Maximum value         |
| `.integer(msg?)`       | Must be integer       |
| `.positive(msg?)`      | Must be > 0           |
| `.negative(msg?)`      | Must be < 0           |
| `.oneOf(values, msg?)` | One of allowed values |
| `.refine(fn, msg?)`    | Custom validation     |

## Next Steps

- [Prompts](/docs/prompts) - Interactive user input
- [Output & Styling](/docs/output) - Format CLI output
