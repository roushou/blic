import { color, createSpinner, defineCommand } from "boune";
import { MONOREPO_ROOT } from "../packages.ts";

type Step = {
  name: string;
  command: string[];
  description: string;
};

const CI_STEPS: Step[] = [
  {
    name: "format",
    command: ["oxfmt", ".", "--check"],
    description: "Check formatting",
  },
  {
    name: "lint",
    command: ["oxlint", ".", "--type-aware"],
    description: "Run linter",
  },
  {
    name: "typecheck",
    command: ["bunx", "tsc", "--noEmit"],
    description: "Type check",
  },
  {
    name: "test",
    command: ["bun", "test"],
    description: "Run tests",
  },
];

export const ci = defineCommand({
  name: "ci",
  description: "Run full CI pipeline (format, lint, typecheck, test)",
  options: {
    failFast: {
      type: "boolean",
      short: "f",
      long: "fail-fast",
      description: "Stop on first failure",
      default: true,
    },
  },
  async action({ options }) {
    console.log(color.bold("\nRunning CI pipeline...\n"));

    const results: { step: Step; success: boolean; duration: number }[] = [];

    for (const step of CI_STEPS) {
      const spinner = createSpinner(step.description).start();
      const start = performance.now();

      const proc = Bun.spawn(step.command, {
        cwd: MONOREPO_ROOT,
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await proc.exited;
      const duration = performance.now() - start;
      const success = exitCode === 0;

      results.push({ step, success, duration });

      if (success) {
        spinner.succeed(`${step.description} ${color.dim(`(${formatDuration(duration)})`)}`);
      } else {
        spinner.fail(`${step.description} ${color.dim(`(${formatDuration(duration)})`)}`);

        if (options.failFast) {
          const stderr = await new Response(proc.stderr).text();
          const stdout = await new Response(proc.stdout).text();
          if (stderr) console.log("\n" + stderr);
          if (stdout) console.log("\n" + stdout);

          console.log(color.red("\nCI failed!\n"));
          process.exit(1);
        }
      }
    }

    const failed = results.filter((r) => !r.success);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log("");

    if (failed.length > 0) {
      console.log(color.red(`${failed.length}/${results.length} steps failed`));
      console.log(color.red("\nCI failed!\n"));
      process.exit(1);
    } else {
      console.log(
        color.green(
          `All ${results.length} steps passed ${color.dim(`(${formatDuration(totalDuration)})`)}`,
        ),
      );
      console.log(color.green("\nCI passed!\n"));
    }
  },
});

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
