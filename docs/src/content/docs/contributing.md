---
title: Contributing
description: How to contribute to Boune
---

## Development Setup

```bash
git clone https://github.com/roushou/boune.git
cd boune
bun install
```

## Monorepo CLI

The monorepo includes a development CLI at `apps/dev/`:

```bash
bun run dev <command>
```

### Commands

| Command                   | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `test [packages...]`      | Run tests (`--watch`, `--coverage`, `--filter`) |
| `lint`                    | Run oxlint (`--fix`, `--type-aware`)            |
| `format`                  | Run oxfmt (`--check`)                           |
| `typecheck [packages...]` | Run tsc (`--watch`)                             |
| `prompt [type]`           | Test prompt types interactively                 |
| `info`                    | Show monorepo info                              |
| `ci`                      | Run full CI pipeline                            |
| `clean`                   | Clean build artifacts (`--dry-run`)             |

### Examples

```bash
# Run all tests
bun run dev test

# Run tests for boune package only
bun run dev test boune

# Run linter with auto-fix
bun run dev lint --fix

# Check formatting without writing
bun run dev format --check

# Test prompts interactively
bun run dev prompt

# Run full CI pipeline
bun run dev ci
```

## Project Structure

```
boune/
├── apps/
│   └── dev/              # Development CLI
├── packages/
│   ├── boune/            # Core framework
│   └── create-boune/     # Scaffolding tool
├── docs/                 # Documentation (Astro)
└── examples/             # Example CLIs
```
