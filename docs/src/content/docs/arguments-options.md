---
title: Arguments & Options
description: Define type-safe positional arguments and command options.
---

Boune provides a declarative API for defining arguments and options with full type inference.

## Arguments

Arguments are positional values passed to your command.

### String Arguments

```typescript
import { defineCommand, argument } from "boune";

const greet = defineCommand({
  name: "greet",
  arguments: {
    name: argument.string().required().describe("Name to greet"),
  },
  action({ args }) {
    console.log(`Hello, ${args.name}!`); // args.name is string
  },
});
```

```bash
myapp greet Alice
```

### Number Arguments

```typescript
const add = defineCommand({
  name: "add",
  arguments: {
    a: argument.number().required(),
    b: argument.number().required(),
  },
  action({ args }) {
    console.log(args.a + args.b); // Both are numbers
  },
});
```

### Optional Arguments with Defaults

```typescript
const greet = defineCommand({
  name: "greet",
  arguments: {
    name: argument.string().default("World"),
  },
  action({ args }) {
    console.log(`Hello, ${args.name}!`);
  },
});
```

```bash
myapp greet        # Hello, World!
myapp greet Alice  # Hello, Alice!
```

### Variadic Arguments

Accept multiple values:

```typescript
const cat = defineCommand({
  name: "cat",
  arguments: {
    files: argument.string().required().variadic().describe("Files to read"),
  },
  action({ args }) {
    for (const file of args.files) { // string[]
      console.log(Bun.file(file).text());
    }
  },
});
```

```bash
myapp cat file1.txt file2.txt file3.txt
```

## Options

Options are named flags that modify command behavior.

### Boolean Options

```typescript
import { defineCommand, option } from "boune";

const build = defineCommand({
  name: "build",
  options: {
    verbose: option.boolean().short("v").describe("Verbose output"),
    minify: option.boolean().short("m").describe("Minify output"),
  },
  action({ options }) {
    if (options.verbose) console.log("Verbose mode");
    if (options.minify) console.log("Minifying...");
  },
});
```

```bash
myapp build --verbose --minify
myapp build -v -m
```

### String Options

```typescript
const build = defineCommand({
  name: "build",
  options: {
    output: option.string().short("o").default("dist").describe("Output dir"),
  },
  action({ options }) {
    console.log(`Output: ${options.output}`);
  },
});
```

```bash
myapp build --output=build
myapp build -o build
```

### Number Options

```typescript
const serve = defineCommand({
  name: "serve",
  options: {
    port: option.number().short("p").default(3000).describe("Port number"),
  },
  action({ options }) {
    console.log(`Listening on port ${options.port}`);
  },
});
```

### Environment Variable Fallback

Read from environment variables:

```typescript
const deploy = defineCommand({
  name: "deploy",
  options: {
    token: option.string().env("DEPLOY_TOKEN").describe("API token"),
  },
  action({ options }) {
    // Uses --token flag, or DEPLOY_TOKEN env var
    console.log(`Token: ${options.token}`);
  },
});
```

```bash
DEPLOY_TOKEN=secret myapp deploy
myapp deploy --token=secret
```

### Required Options

```typescript
const deploy = defineCommand({
  name: "deploy",
  options: {
    env: option.string().required().describe("Target environment"),
  },
  action({ options }) {
    console.log(`Deploying to ${options.env}`);
  },
});
```

### Long Option Names

By default, the option name becomes the long flag. Customize it:

```typescript
const build = defineCommand({
  name: "build",
  options: {
    dryRun: option.boolean().long("dry-run").describe("Simulate build"),
  },
  action({ options }) {
    if (options.dryRun) console.log("Dry run mode");
  },
});
```

```bash
myapp build --dry-run
```

## Global Options

Define options available to all commands:

```typescript
const cli = defineCli({
  name: "myapp",
  globalOptions: {
    verbose: option.boolean().short("v").describe("Verbose output"),
    config: option.string().short("c").describe("Config file path"),
  },
  commands: { build, serve },
});
```

```bash
myapp build --verbose
myapp serve --config=prod.json
```

## Argument Methods

| Method                 | Description            |
| ---------------------- | ---------------------- |
| `.string()`            | String type            |
| `.number()`            | Number type            |
| `.required()`          | Mark as required       |
| `.default(value)`      | Set default value      |
| `.variadic()`          | Accept multiple values |
| `.describe(text)`      | Help text              |
| `.validate(validator)` | Add validation         |

## Option Methods

| Method                 | Description        |
| ---------------------- | ------------------ |
| `.string()`            | String type        |
| `.number()`            | Number type        |
| `.boolean()`           | Boolean flag       |
| `.short(char)`         | Short flag (-x)    |
| `.long(name)`          | Long flag (--name) |
| `.default(value)`      | Default value      |
| `.required()`          | Mark as required   |
| `.env(name)`           | Env var fallback   |
| `.describe(text)`      | Help text          |
| `.validate(validator)` | Add validation     |

## Next Steps

- [Validation](/docs/validation) - Validate user input
- [Prompts](/docs/prompts) - Interactive input
