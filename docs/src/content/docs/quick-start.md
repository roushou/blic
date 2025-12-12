---
title: Quick Start
description: Get up and running with Boune in under 5 minutes.
---

This guide will walk you through creating your first CLI with Boune.

## Scaffold a Project

The fastest way to get started:

```bash
bun create boune my-cli
cd my-cli
bun run dev greet World
```

This creates a new project with commands, options, and a build script ready to go.

## Manual Setup

Alternatively, add Boune to an existing project:

```bash
bun add boune
```

## Create Your CLI

Create a new file `cli.ts`:

```typescript
import { defineCli, defineCommand } from "boune";

const hello = defineCommand({
  name: "hello",
  description: "Say hello",
  action() {
    console.log("Hello, World!");
  },
});

const cli = defineCli({
  name: "mycli",
  version: "1.0.0",
  commands: { hello },
});

cli.run();
```

## Run It

```bash
bun run cli.ts hello
# Output: Hello, World!
```

## Add Arguments

Make your command accept input:

```typescript
import { defineCli, defineCommand, argument } from "boune";

const greet = defineCommand({
  name: "greet",
  description: "Greet someone",
  arguments: {
    name: argument.string().required().describe("Name to greet"),
  },
  action({ args }) {
    console.log(`Hello, ${args.name}!`);
  },
});

const cli = defineCli({
  name: "mycli",
  version: "1.0.0",
  commands: { greet },
});

cli.run();
```

```bash
bun run cli.ts greet Alice
# Output: Hello, Alice!
```

## Add Options

Add flags to modify behavior:

```typescript
import { defineCli, defineCommand, argument, option } from "boune";

const greet = defineCommand({
  name: "greet",
  description: "Greet someone",
  arguments: {
    name: argument.string().required().describe("Name to greet"),
  },
  options: {
    loud: option.boolean().short("l").describe("Shout the greeting"),
    times: option.number().short("t").default(1).describe("Repeat count"),
  },
  action({ args, options }) {
    for (let i = 0; i < options.times; i++) {
      const message = `Hello, ${args.name}!`;
      console.log(options.loud ? message.toUpperCase() : message);
    }
  },
});

const cli = defineCli({
  name: "mycli",
  version: "1.0.0",
  commands: { greet },
});

cli.run();
```

```bash
bun run cli.ts greet Alice --loud --times 3
# Output:
# HELLO, ALICE!
# HELLO, ALICE!
# HELLO, ALICE!
```

## Build a Single Executable

Compile your CLI to a standalone binary:

```bash
bun build cli.ts --compile --outfile mycli
./mycli greet World
```

## Next Steps

- [Commands](/docs/commands) - Subcommands, aliases, and more
- [Arguments & Options](/docs/arguments-options) - Types, defaults, and validation
- [Prompts](/docs/prompts) - Interactive user input
