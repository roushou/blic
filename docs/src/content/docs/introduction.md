---
title: Introduction
description: Boune is a batteries-included CLI framework for Bun with type-safe arguments, prompts, spinners, and more.
---

Boune is a modern CLI framework built specifically for [Bun](https://bun.sh). It provides everything you need to build powerful command-line tools with zero configuration.

## Why Boune?

### Batteries Included

Everything you need in one package - no external dependencies required:

- **Type-safe arguments & options** - Full TypeScript inference
- **Interactive prompts** - Text, select, confirm, password, and more
- **Beautiful output** - Colors, spinners, progress bars, tables
- **Validation** - Chainable validators for input validation
- **Shell completions** - Generate scripts for Bash, Zsh, and Fish

### Built for Bun

Boune is designed to take full advantage of Bun's capabilities:

- Fast startup times
- Compile to a single executable with `bun build --compile`
- Zero external dependencies

### Developer Experience

- Intuitive, declarative API
- Full IDE autocompletion
- Catch errors at compile time, not runtime

## Quick Example

```typescript
import { defineCli, defineCommand } from "boune";

const greet = defineCommand({
  name: "greet",
  description: "Greet someone",
  arguments: {
    name: { type: "string", required: true, description: "Name to greet" },
  },
  options: {
    loud: { type: "boolean", short: "l", description: "Shout the greeting" },
  },
  action({ args, options }) {
    const message = `Hello, ${args.name}!`;
    console.log(options.loud ? message.toUpperCase() : message);
  },
});

const cli = defineCli({
  name: "myapp",
  version: "1.0.0",
  commands: { greet },
});

cli.run();
```

```bash
$ myapp greet World --loud
HELLO, WORLD!
```

## Next Steps

- [Quick Start](/docs/quick-start) - Install and create your first CLI
- [Commands](/docs/commands) - Learn about defining commands
- [Prompts](/docs/prompts) - Add interactive prompts
