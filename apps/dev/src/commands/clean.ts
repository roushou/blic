import { color, createSpinner, defineCommand } from "boune";
import { readdir, rm } from "node:fs/promises";
import { MONOREPO_ROOT } from "../packages.ts";
import { join } from "node:path";

const CLEANUP_TARGETS = ["node_modules", "dist"] as const;

type CleanupTarget = (typeof CLEANUP_TARGETS)[number];

export const clean = defineCommand({
  name: "clean",
  description: "Clean build artifacts and dependencies",
  options: {
    dist: {
      type: "boolean",
      short: "d",
      description: "Only clean dist folders",
    },
    nodeModules: {
      type: "boolean",
      short: "n",
      long: "node-modules",
      description: "Only clean node_modules",
    },
    dryRun: {
      type: "boolean",
      long: "dry-run",
      description: "Show what would be deleted without deleting",
    },
  },
  async action({ options }) {
    const targets: CleanupTarget[] = [];

    if (!options.dist && !options.nodeModules) {
      targets.push("dist", "node_modules");
    } else {
      if (options.dist) targets.push("dist");
      if (options.nodeModules) targets.push("node_modules");
    }

    console.log(color.bold(`\nCleaning: ${targets.join(", ")}\n`));

    if (options.dryRun) {
      console.log(color.yellow("Dry run mode - no files will be deleted\n"));
    }

    const spinner = createSpinner("Scanning directories").start();
    const found: string[] = [];

    await findTargets(MONOREPO_ROOT, targets, found, 0);

    spinner.succeed(`Found ${found.length} directories to clean`);

    if (found.length === 0) {
      console.log(color.green("\nNothing to clean!\n"));
      return;
    }

    console.log("");
    for (const path of found) {
      const relativePath = path.replace(MONOREPO_ROOT + "/", "");
      if (options.dryRun) {
        console.log(color.dim(`  Would delete: ${relativePath}`));
      } else {
        const deleteSpinner = createSpinner(`Deleting ${relativePath}`).start();
        await rm(path, { recursive: true, force: true });
        deleteSpinner.succeed(`Deleted ${relativePath}`);
      }
    }

    console.log(color.green("\nClean complete!\n"));
  },
});

async function findTargets(
  dir: string,
  targets: CleanupTarget[],
  found: string[],
  depth: number,
): Promise<void> {
  if (depth > 3) return;

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullPath = join(dir, entry.name);

      if (targets.includes(entry.name as CleanupTarget)) {
        found.push(fullPath);
      } else {
        await findTargets(fullPath, targets, found, depth + 1);
      }
    }
  } catch {
    // Ignore permission errors
  }
}
