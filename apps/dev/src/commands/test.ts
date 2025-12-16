import { PACKAGES, resolvePackages } from "../packages.ts";
import { color, defineCommand } from "boune";

export const test = defineCommand({
  name: "test",
  description: "Run tests",
  arguments: {
    packages: {
      type: "string",
      required: false,
      variadic: true,
      description: `Packages to test (${PACKAGES.map((p) => p.name).join(", ")}, or "all")`,
    },
  },
  options: {
    watch: {
      type: "boolean",
      short: "w",
      description: "Watch for changes",
    },
    coverage: {
      type: "boolean",
      short: "c",
      description: "Generate coverage report",
    },
    filter: {
      type: "string",
      short: "f",
      description: "Filter tests by name",
    },
  },
  async action({ args, options }) {
    const packages = resolvePackages(args.packages);

    if (packages.length === 0) {
      console.log(color.red("No packages found"));
      process.exit(1);
    }

    console.log(color.bold(`\nRunning tests for ${packages.length} package(s)...\n`));

    for (const pkg of packages) {
      const testArgs = ["bun", "test"];

      if (options.watch) testArgs.push("--watch");
      if (options.coverage) testArgs.push("--coverage");
      if (options.filter) testArgs.push("--test-name-pattern", options.filter);

      console.log(color.cyan(`\n${pkg.name}\n${"─".repeat(40)}`));

      const proc = Bun.spawn(testArgs, {
        cwd: pkg.dir,
        stdout: "inherit",
        stderr: "inherit",
      });

      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        console.log(color.red(`\nTests failed for ${pkg.name}`));
        process.exit(1);
      }
    }

    console.log(color.green("\nAll tests passed!\n"));
  },
});
