#!/usr/bin/env bun

/**
 * Demo CLI showcasing blic features
 */
import { cli, command, color, createSpinner } from "../packages/blic/src/index.ts";
import { text, confirm, select } from "../packages/blic/src/prompt/index.ts";

// Greet command with argument and options
const greet = command("greet")
  .description("Greet someone")
  .argument("<name>", "Name to greet")
  .option("-l, --loud", "Shout the greeting")
  .option("-t, --times <number>", "Number of times to greet", { type: "number", default: 1 })
  .action(({ args, options }) => {
    const name = args.name as string;
    const loud = options.loud as boolean;
    const times = options.times as number;

    for (let i = 0; i < times; i++) {
      const msg = `Hello, ${name}!`;
      console.log(loud ? msg.toUpperCase() : msg);
    }
  });

// Build command with subcommands
const buildWatch = command("watch")
  .description("Watch for changes and rebuild")
  .option("-p, --poll", "Use polling instead of native watchers")
  .action(({ options }) => {
    console.log(color.cyan("Watching for changes..."));
    console.log(`Polling: ${options.poll ? "yes" : "no"}`);
  });

const build = command("build")
  .description("Build the project")
  .alias("b")
  .argument("<entry>", "Entry file")
  .option("-o, --output <dir>", "Output directory", { default: "dist" })
  .option("-m, --minify", "Minify output")
  .subcommand(buildWatch)
  .action(({ args, options }) => {
    console.log(color.bold("Building project..."));
    console.log(`  Entry: ${args.entry}`);
    console.log(`  Output: ${options.output}`);
    console.log(`  Minify: ${options.minify ? "yes" : "no"}`);
  });

// Init command with interactive prompts
const init = command("init")
  .description("Initialize a new project")
  .action(async () => {
    console.log(color.bold("\nProject Setup\n"));

    const name = await text({
      message: "Project name:",
      default: "my-project",
    });

    const template = await select({
      message: "Select a template:",
      options: [
        { label: "Minimal", value: "minimal", hint: "Basic setup" },
        { label: "Full", value: "full", hint: "With tests and linting" },
        { label: "Library", value: "lib", hint: "For publishing to npm" },
      ],
      default: "minimal",
    });

    const useTypeScript = await confirm({
      message: "Use TypeScript?",
      default: true,
    });

    console.log(color.bold("\nCreating project..."));
    const spinner = createSpinner("Setting up files").start();

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    spinner.succeed("Project created!");
    console.log(`\n  ${color.green("→")} cd ${name}`);
    console.log(`  ${color.green("→")} bun install`);
    console.log(`  ${color.green("→")} bun run dev\n`);
  });

// Create the CLI
cli("demo")
  .version("1.0.0")
  .description("A demo CLI built with blic")
  .command(greet)
  .command(build)
  .command(init)
  .run();
