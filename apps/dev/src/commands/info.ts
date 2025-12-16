import { MONOREPO_ROOT, PACKAGES } from "../packages.ts";
import { color, defineCommand, keyValue, table } from "boune";

export const info = defineCommand({
  name: "info",
  description: "Show monorepo information",
  async action() {
    console.log(color.bold("\nBoune Monorepo\n"));

    // Package info
    console.log(color.cyan("Packages:"));
    const packageData = await Promise.all(
      PACKAGES.map(async (pkg) => {
        const pkgJson = await Bun.file(`${pkg.dir}/package.json`).json();
        return [pkg.name, pkgJson.version, pkg.dir];
      }),
    );

    console.log(table([["Package", "Version", "Path"], ...packageData]));

    // Environment
    console.log(color.cyan("\nEnvironment:"));
    console.log(
      keyValue({
        Runtime: `Bun ${Bun.version}`,
        Platform: process.platform,
        Arch: process.arch,
        "Node Compat": process.versions.node,
      }),
    );

    // Stats
    console.log(color.cyan("\nStats:"));
    const stats = await getCodeStats();
    console.log(
      keyValue({
        "TypeScript files": stats.tsFiles.toString(),
        "Test files": stats.testFiles.toString(),
        Examples: stats.examples.toString(),
      }),
    );

    console.log("");
  },
});

async function getCodeStats() {
  const glob = new Bun.Glob("**/*.ts");

  let tsFiles = 0;
  let testFiles = 0;
  let examples = 0;

  for await (const path of glob.scan({ cwd: `${MONOREPO_ROOT}/packages` })) {
    tsFiles++;
    if (path.includes(".test.") || path.includes("/tests/")) {
      testFiles++;
    }
  }

  for await (const _ of glob.scan({ cwd: `${MONOREPO_ROOT}/examples` })) {
    examples++;
  }

  return { tsFiles, testFiles, examples };
}
