import { PACKAGES, resolvePackages } from "../packages.ts";
import { color, createSpinner, defineCommand } from "boune";

export const build = defineCommand({
  name: "build",
  description: "Build packages",
  arguments: {
    packages: {
      type: "string",
      required: false,
      variadic: true,
      description: `Packages to build (${PACKAGES.map((p) => p.name).join(", ")}, or "all")`,
    },
  },
  options: {
    watch: {
      type: "boolean",
      short: "w",
      description: "Watch for changes",
    },
  },
  async action({ args }) {
    const packages = resolvePackages(args.packages);

    if (packages.length === 0) {
      console.log(color.red("No packages found"));
      process.exit(1);
    }

    console.log(color.bold(`\nBuilding ${packages.length} package(s)...\n`));

    for (const pkg of packages) {
      const spinner = createSpinner(`Building ${pkg.name}`).start();

      const proc = Bun.spawn(["bun", "build", "./src/app.ts", "--outdir", "dist"], {
        cwd: pkg.dir,
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        spinner.succeed(`Built ${pkg.name}`);
      } else {
        const stderr = await new Response(proc.stderr).text();
        spinner.fail(`Failed to build ${pkg.name}`);
        console.log(color.red(stderr));
        process.exit(1);
      }
    }

    console.log(color.green("\nBuild complete!\n"));
  },
});
