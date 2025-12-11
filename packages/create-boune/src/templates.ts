export interface TemplateFile {
  path: string;
  content: string;
}

export function getMinimalTemplate(name: string): TemplateFile[] {
  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "bun run src/index.ts",
            build: "bun build src/index.ts --compile --outfile dist/" + name,
          },
          dependencies: {
            boune: "^0.1.0",
          },
          devDependencies: {
            "@types/bun": "latest",
            typescript: "^5",
          },
        },
        null,
        2,
      ),
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            lib: ["ESNext"],
            target: "ESNext",
            module: "Preserve",
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            verbatimModuleSyntax: true,
            noEmit: true,
            strict: true,
            skipLibCheck: true,
          },
        },
        null,
        2,
      ),
    },
    {
      path: "src/index.ts",
      content: `#!/usr/bin/env bun

import { cli, command, color } from "boune";

const greet = command("greet")
  .description("Greet someone")
  .argument({ name: "name", kind: "string", required: true, description: "Name to greet" })
  .option({ name: "loud", short: "l", kind: "boolean", description: "Shout the greeting" })
  .action(({ args, options }) => {
    const msg = \`Hello, \${args.name}!\`;
    console.log(options.loud ? color.bold(msg.toUpperCase()) : msg);
  });

cli("${name}")
  .version("0.1.0")
  .description("My CLI built with boune")
  .command(greet)
  .run();
`,
    },
    {
      path: ".gitignore",
      content: `node_modules/
dist/
.DS_Store
`,
    },
    {
      path: "README.md",
      content: `# ${name}

A CLI built with [boune](https://github.com/roushou/boune).

## Usage

\`\`\`bash
# Development
bun run dev greet World

# Build standalone binary
bun run build
./dist/${name} greet World
\`\`\`

## Commands

- \`greet <name>\` - Greet someone
  - \`-l, --loud\` - Shout the greeting
`,
    },
  ];
}

export function getFullTemplate(name: string): TemplateFile[] {
  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "bun run src/index.ts",
            build: "bun build src/index.ts --compile --outfile dist/" + name,
            test: "bun test",
          },
          dependencies: {
            boune: "^0.1.0",
          },
          devDependencies: {
            "@types/bun": "latest",
            typescript: "^5",
          },
        },
        null,
        2,
      ),
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            lib: ["ESNext"],
            target: "ESNext",
            module: "Preserve",
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            verbatimModuleSyntax: true,
            noEmit: true,
            strict: true,
            skipLibCheck: true,
          },
        },
        null,
        2,
      ),
    },
    {
      path: "src/index.ts",
      content: `#!/usr/bin/env bun

import { cli } from "boune";
import { greet } from "./commands/greet.ts";
import { init } from "./commands/init.ts";

cli("${name}")
  .version("0.1.0")
  .description("My CLI built with boune")
  .hook("preAction", ({ command }) => {
    // Runs before every command
  })
  .command(greet)
  .command(init)
  .run();
`,
    },
    {
      path: "src/commands/greet.ts",
      content: `import { command, color } from "boune";

export const greet = command("greet")
  .description("Greet someone")
  .argument({ name: "name", kind: "string", required: true, description: "Name to greet" })
  .option({ name: "loud", short: "l", kind: "boolean", description: "Shout the greeting" })
  .option({ name: "times", short: "t", kind: "number", default: 1, description: "Repeat the greeting" })
  .action(({ args, options }) => {
    for (let i = 0; i < options.times; i++) {
      const msg = \`Hello, \${args.name}!\`;
      console.log(options.loud ? color.bold(msg.toUpperCase()) : msg);
    }
  });
`,
    },
    {
      path: "src/commands/init.ts",
      content: `import { command, color, createSpinner } from "boune";
import { text, confirm, select } from "boune/prompt";

export const init = command("init")
  .description("Initialize a new project")
  .action(async () => {
    console.log(color.bold("\\nProject Setup\\n"));

    const name = await text({
      message: "Project name:",
      default: "my-project",
    });

    const template = await select({
      message: "Select a template:",
      options: [
        { label: "Basic", value: "basic" },
        { label: "Advanced", value: "advanced" },
      ],
    });

    const proceed = await confirm({
      message: "Create project?",
      default: true,
    });

    if (!proceed) {
      console.log(color.dim("Cancelled."));
      return;
    }

    const spinner = createSpinner("Creating project...").start();

    // Simulate work
    await new Promise((r) => setTimeout(r, 1000));

    spinner.succeed("Project created!");

    console.log(\`\\n  \${color.green("→")} cd \${name}\`);
    console.log(\`  \${color.green("→")} bun install\\n\`);
  });
`,
    },
    {
      path: "src/commands/index.ts",
      content: `export { greet } from "./greet.ts";
export { init } from "./init.ts";
`,
    },
    {
      path: "tests/greet.test.ts",
      content: `import { describe, expect, test } from "bun:test";

describe("greet command", () => {
  test("outputs greeting", async () => {
    // Add your tests here
    expect(true).toBe(true);
  });
});
`,
    },
    {
      path: ".gitignore",
      content: `node_modules/
dist/
.DS_Store
`,
    },
    {
      path: "README.md",
      content: `# ${name}

A CLI built with [boune](https://github.com/roushou/boune).

## Usage

\`\`\`bash
# Development
bun run dev --help

# Run commands
bun run dev greet World --loud
bun run dev init

# Build standalone binary
bun run build

# Run tests
bun test
\`\`\`

## Commands

- \`greet <name>\` - Greet someone
  - \`-l, --loud\` - Shout the greeting
  - \`-t, --times <n>\` - Repeat the greeting

- \`init\` - Initialize a new project (interactive)

## Project Structure

\`\`\`
src/
├── index.ts          # CLI entry point
└── commands/
    ├── greet.ts      # Greet command
    └── init.ts       # Init command (with prompts)
\`\`\`
`,
    },
  ];
}
