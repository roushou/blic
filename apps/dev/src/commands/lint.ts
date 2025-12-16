import { color, defineCommand } from "boune";
import { MONOREPO_ROOT } from "../packages.ts";

export const lint = defineCommand({
  name: "lint",
  description: "Run linter (oxlint)",
  options: {
    fix: {
      type: "boolean",
      short: "f",
      description: "Auto-fix issues",
    },
    typeAware: {
      type: "boolean",
      short: "t",
      long: "type-aware",
      description: "Enable type-aware linting",
    },
  },
  async action({ options }) {
    console.log(color.bold("\nRunning linter...\n"));

    const args = ["oxlint", "."];

    if (options.fix) {
      args.push("--fix");
    }

    if (options.typeAware) {
      args.push("--type-aware");
    }

    const proc = Bun.spawn(args, {
      cwd: MONOREPO_ROOT,
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await proc.exited;

    if (exitCode === 0) {
      console.log(color.green("\nLinting complete!\n"));
    } else {
      console.log(color.red("\nLinting failed!\n"));
      process.exit(1);
    }
  },
});
