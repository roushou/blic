#!/usr/bin/env bun

import { cli, command, color, createSpinner } from "boune";
import { text, select, confirm } from "boune/prompt";
import { generateProject } from "./generator.ts";

const create = command("create")
  .description("Create a new CLI project")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Template to use (minimal, full)")
  .option("--no-install", "Skip installing dependencies")
  .option("--no-git", "Skip git initialization")
  .action(async ({ args, options }) => {
    console.log();
    console.log(color.bold("  Create a new CLI with boune"));
    console.log();

    // Project name
    let name = args.name as string | undefined;
    if (!name) {
      name = await text({
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
    let template = options.template as string | undefined;
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
    console.log(color.dim("  Project: ") + color.cyan(name));
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
        name,
        template: template as "minimal" | "full",
        skipInstall: options["no-install"] as boolean,
        skipGit: options["no-git"] as boolean,
      });

      spinner.succeed("Project created!");

      // Next steps
      console.log();
      console.log(color.bold("  Next steps:"));
      console.log();
      console.log(`  ${color.cyan("cd")} ${name}`);
      if (options["no-install"]) {
        console.log(`  ${color.cyan("bun install")}`);
      }
      console.log(`  ${color.cyan("bun run dev")}`);
      console.log();
    } catch (err) {
      spinner.fail(`Failed: ${err}`);
      process.exit(1);
    }
  });

cli("create-boune")
  .version("0.1.0")
  .description("Scaffold a new CLI project with boune")
  .command(create)
  .run();
