# @boune/cli

The official CLI for [boune](https://github.com/roushou/boune) - a batteries-included CLI framework for Bun.

## Installation

### npm / bun (recommended)

```bash
# Using bun
bun add -g @boune/cli

# Using npm
npm install -g @boune/cli
```

### Install script

```bash
curl -fsSL https://raw.githubusercontent.com/roushou/boune/main/install.sh | bash
```

### GitHub releases

Download pre-built binaries from [GitHub Releases](https://github.com/roushou/boune/releases).

Available platforms:

- `boune-linux-x64`
- `boune-linux-arm64`
- `boune-darwin-x64`
- `boune-darwin-arm64`
- `boune-windows-x64.exe`

## Commands

```bash
# Initialize a new CLI project
boune init [directory]

# Development mode
boune dev

# Build your CLI
boune build

# Manage configuration
boune config

# Manage environment profiles
boune profile

# Open interactive playground
boune playground

# Open documentation
boune docs
```

## Quick Start

```bash
# Create a new CLI project
boune init my-cli
cd my-cli

# Run in development mode
bun run dev --help

# Build standalone binary
bun run build
```

## License

MIT
