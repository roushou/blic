---
title: Prompts
description: Create interactive CLI experiences with built-in prompts.
---

Boune includes a complete set of interactive prompts for gathering user input.

## Text Input

Basic text input with optional defaults and validation:

```typescript
import { text } from "boune/prompt";

const name = await text({
  message: "What is your name?",
  default: "World",
  placeholder: "Enter your name",
});

console.log(`Hello, ${name}!`);
```

### With Validation

```typescript
import { text } from "boune/prompt";
import { v } from "boune";

const email = await text({
  message: "Enter your email:",
  validator: v.string().email(),
});
```

Or with a custom validation function:

```typescript
const username = await text({
  message: "Choose a username:",
  validate: (value) => {
    if (value.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-z0-9_]+$/.test(value)) return "Only lowercase letters, numbers, and underscores";
    return true;
  },
});
```

## Number Input

Prompt for numeric values with constraints:

```typescript
import { number } from "boune/prompt";

const port = await number({
  message: "Port number:",
  default: 3000,
  min: 1,
  max: 65535,
  integer: true,
});
```

### Options

| Option      | Type        | Description           |
| ----------- | ----------- | --------------------- |
| `message`   | `string`    | Prompt message        |
| `default`   | `number`    | Default value         |
| `min`       | `number`    | Minimum allowed value |
| `max`       | `number`    | Maximum allowed value |
| `integer`   | `boolean`   | Only allow integers   |
| `validator` | `Validator` | Custom validator      |

## Confirm

Yes/no confirmation:

```typescript
import { confirm } from "boune/prompt";

const proceed = await confirm({
  message: "Deploy to production?",
  default: false,
});

if (proceed) {
  console.log("Deploying...");
}
```

```
? Deploy to production? (y/N) y
```

## Select

Single selection from a list:

```typescript
import { select } from "boune/prompt";

const framework = await select({
  message: "Choose a framework:",
  options: [
    { label: "React", value: "react", hint: "Popular UI library" },
    { label: "Vue", value: "vue", hint: "Progressive framework" },
    { label: "Svelte", value: "svelte", hint: "Compiled framework" },
    { label: "Angular", value: "angular" },
  ],
  default: "react",
});

console.log(`Selected: ${framework}`);
```

Use arrow keys or `j`/`k` to navigate, Enter to select.

## Multiselect

Multiple selections:

```typescript
import { multiselect } from "boune/prompt";

const features = await multiselect({
  message: "Select features to enable:",
  options: [
    { label: "TypeScript", value: "typescript" },
    { label: "ESLint", value: "eslint" },
    { label: "Prettier", value: "prettier" },
    { label: "Testing", value: "testing" },
  ],
  min: 1,      // Require at least 1 selection
  max: 3,      // Allow at most 3 selections
});

console.log(`Selected: ${features.join(", ")}`);
```

Use Space to toggle selection, `a` to toggle all, Enter to confirm.

## Password

Secure password input:

```typescript
import { password } from "boune/prompt";
import { v } from "boune";

const secret = await password({
  message: "Enter your API key:",
  validator: v.string().minLength(10),
});
```

## Autocomplete

Searchable selection with fuzzy matching:

```typescript
import { autocomplete } from "boune/prompt";

const country = await autocomplete({
  message: "Select a country:",
  options: [
    { label: "United States", value: "us" },
    { label: "United Kingdom", value: "uk" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Japan", value: "jp" },
    // ... more options
  ],
  limit: 5,           // Show 5 options at a time
  allowCustom: false, // Only allow selecting from list
});
```

### Custom Filter

```typescript
const item = await autocomplete({
  message: "Search items:",
  options: items,
  filter: (input, option) => {
    // Custom matching logic
    return option.label.toLowerCase().startsWith(input.toLowerCase());
  },
});
```

### Allow Custom Values

```typescript
const tag = await autocomplete({
  message: "Select or enter a tag:",
  options: existingTags.map((t) => ({ label: t, value: t })),
  allowCustom: true, // Allow typing new values
});
```

## File Path

Interactive file/directory browser:

```typescript
import { filepath } from "boune/prompt";

const file = await filepath({
  message: "Select a config file:",
  basePath: "./configs",
  extensions: [".json", ".yaml", ".toml"],
});

console.log(`Selected: ${file}`);
```

### Options

| Option          | Type       | Description                       |
| --------------- | ---------- | --------------------------------- |
| `message`       | `string`   | Prompt message                    |
| `basePath`      | `string`   | Starting directory (default: cwd) |
| `extensions`    | `string[]` | Filter by extensions              |
| `directoryOnly` | `boolean`  | Only show directories             |
| `fileOnly`      | `boolean`  | Only show files                   |
| `allowNew`      | `boolean`  | Allow non-existent paths          |
| `showHidden`    | `boolean`  | Show dotfiles                     |
| `limit`         | `number`   | Max visible items                 |

### Directory Selection

```typescript
const outputDir = await filepath({
  message: "Select output directory:",
  directoryOnly: true,
});
```

### Create New File

```typescript
const newFile = await filepath({
  message: "Save as:",
  basePath: "./output",
  allowNew: true,
  extensions: [".json"],
});
```

## Using Prompts in Commands

Combine prompts with commands for interactive CLIs:

```typescript
import { defineCommand } from "boune";
import { text, select, confirm } from "boune/prompt";

const init = defineCommand({
  name: "init",
  description: "Initialize a new project",
  async action() {
    const name = await text({
      message: "Project name:",
      default: "my-project",
    });

    const template = await select({
      message: "Choose a template:",
      options: [
        { label: "Basic", value: "basic" },
        { label: "Full", value: "full" },
      ],
    });

    const useGit = await confirm({
      message: "Initialize git repository?",
      default: true,
    });

    console.log(`Creating ${name} with ${template} template...`);
    if (useGit) {
      console.log("Initializing git...");
    }
  },
});
```

## Non-TTY Fallback

All prompts automatically fall back to simple numbered/text input when running in non-interactive environments (CI, pipes, etc.):

```bash
# Interactive mode - full UI
./mycli init

# Non-TTY - simple fallback
echo "1" | ./mycli init
```

## Next Steps

- [Output & Styling](/docs/output) - Format CLI output
- [Validation](/docs/validation) - Validate user input
