import { color, defineCommand } from "boune";
import { MONOREPO_ROOT } from "../packages.ts";

export const format = defineCommand({
  name: "format",
  description: "Format code (oxfmt)",
  options: {
    check: {
      type: "boolean",
      short: "c",
      description: "Check formatting without writing",
    },
  },
  async action({ options }) {
    console.log(color.bold("\nFormatting code...\n"));

    const args = ["oxfmt", "."];

    if (options.check) {
      args.push("--check");
    } else {
      args.push("--write");
    }

    const proc = Bun.spawn(args, {
      cwd: MONOREPO_ROOT,
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await proc.exited;

    if (exitCode === 0) {
      console.log(color.green("\nFormatting complete!\n"));
    } else {
      if (options.check) {
        console.log(color.red("\nFormatting issues found! Run without --check to fix.\n"));
      } else {
        console.log(color.red("\nFormatting failed!\n"));
      }
      process.exit(1);
    }
  },
});
