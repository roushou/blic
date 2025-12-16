import { PACKAGES, resolvePackages } from "../packages.ts";
import { color, createSpinner, defineCommand } from "boune";

export const typecheck = defineCommand({
  name: "typecheck",
  description: "Run TypeScript type checking",
  arguments: {
    packages: {
      type: "string",
      required: false,
      variadic: true,
      description: `Packages to typecheck (${PACKAGES.map((p) => p.name).join(", ")}, or "all")`,
    },
  },
  options: {
    watch: {
      type: "boolean",
      short: "w",
      description: "Watch for changes",
    },
  },
  async action({ args, options }) {
    const packages = resolvePackages(args.packages);

    if (packages.length === 0) {
      console.log(color.red("No packages found"));
      process.exit(1);
    }

    console.log(color.bold(`\nType checking ${packages.length} package(s)...\n`));

    for (const pkg of packages) {
      const spinner = createSpinner(`Checking ${pkg.name}`).start();

      const tscArgs = ["bunx", "tsc", "--noEmit"];
      if (options.watch) tscArgs.push("--watch");

      const proc = Bun.spawn(tscArgs, {
        cwd: pkg.dir,
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        spinner.succeed(`${pkg.name} passed`);
      } else {
        spinner.fail(`${pkg.name} has type errors`);
        const stderr = await new Response(proc.stderr).text();
        const stdout = await new Response(proc.stdout).text();
        if (stderr) console.log(stderr);
        if (stdout) console.log(stdout);
        process.exit(1);
      }
    }

    console.log(color.green("\nType checking complete!\n"));
  },
});
