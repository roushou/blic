#!/usr/bin/env bun

import { closeStdin, confirm, select, text } from "boune/prompt";
import { color, createSpinner } from "boune";
import { generateProject } from "./generator.ts";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle --help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
  ${color.bold("create-boune")} - Scaffold a new CLI project with boune

  ${color.dim("Usage:")}
    bun create boune [name] [options]

  ${color.dim("Options:")}
    -t, --template <template>  Template to use (minimal, full)
    --no-install               Skip installing dependencies
    --no-git                   Skip git initialization
    -h, --help                 Show help
    -V, --version              Show version
`);
    return;
  }

  // Handle --version
  if (args.includes("--version") || args.includes("-V")) {
    console.log("0.1.0");
    return;
  }

  // Parse args
  let projectName: string | undefined;
  let template: string | undefined;
  let skipInstall = false;
  let skipGit = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "-t" || arg === "--template") {
      template = args[++i];
    } else if (arg === "--no-install") {
      skipInstall = true;
    } else if (arg === "--no-git") {
      skipGit = true;
    } else if (!arg.startsWith("-")) {
      projectName = arg;
    }
  }

  console.log();
  console.log(color.bold("  Create a new CLI with boune"));
  console.log();

  // Project name
  if (!projectName) {
    projectName = await text({
      message: "Project name:",
      default: "my-cli",
      validate: (v) => {
        if (!v) return "Project name is required";
        if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only";
        return true;
      },
    });
  }

  // Template
  if (!template) {
    template = await select({
      message: "Select a template:",
      options: [
        { label: "Minimal", value: "minimal", hint: "Basic CLI with one command" },
        { label: "Full", value: "full", hint: "Multiple commands, prompts, and hooks" },
      ],
      default: "minimal",
    });
  }

  // Confirmation
  console.log();
  console.log(color.dim("  Project: ") + color.cyan(projectName));
  console.log(color.dim("  Template: ") + color.cyan(template));
  console.log();

  const proceed = await confirm({
    message: "Create project?",
    default: true,
  });

  if (!proceed) {
    console.log(color.dim("\n  Cancelled.\n"));
    return;
  }

  // Generate project
  console.log();
  const spinner = createSpinner("Creating project...").start();

  try {
    await generateProject({
      name: projectName,
      template: template as "minimal" | "full",
      skipInstall,
      skipGit,
    });

    spinner.succeed("Project created!");

    // Next steps
    console.log();
    console.log(color.bold("  Next steps:"));
    console.log();
    console.log(`  ${color.cyan("cd")} ${projectName}`);
    if (skipInstall) {
      console.log(`  ${color.cyan("bun install")}`);
    }
    console.log(`  ${color.cyan("bun run dev")}`);
    console.log();
  } catch (err) {
    spinner.fail(`Failed: ${err}`);
    process.exit(1);
  }
}

main().finally(() => {
  closeStdin();
});
