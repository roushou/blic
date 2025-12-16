# @boune/dev

Development CLI for the boune monorepo.

## Usage

From the monorepo root:

```bash
bun run dev <command>
```

## Commands

| Command                   | Description           |
| ------------------------- | --------------------- |
| `build [packages...]`     | Build packages        |
| `test [packages...]`      | Run tests             |
| `lint`                    | Run oxlint            |
| `format`                  | Run oxfmt             |
| `typecheck [packages...]` | Type check with tsc   |
| `prompt [type]`           | Test prompt types     |
| `info`                    | Show monorepo info    |
| `ci`                      | Run full CI pipeline  |
| `clean`                   | Clean build artifacts |

## Options

```bash
# Test with watch mode
bun run dev test --watch

# Test with coverage
bun run dev test --coverage

# Lint with auto-fix
bun run dev lint --fix

# Format check only
bun run dev format --check

# Clean dry run
bun run dev clean --dry-run
```

## Global Install

To use `boune-dev` globally:

```bash
cd apps/dev
bun link
```

Then from anywhere:

```bash
boune-dev test boune
boune-dev ci
```
