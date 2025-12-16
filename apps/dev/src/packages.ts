import { resolve } from "node:path";

export type Package = {
  name: string;
  dir: string;
};

// Resolve monorepo root from apps/cli/src -> ../../..
const ROOT = resolve(import.meta.dirname, "../../..");

export const PACKAGES: Package[] = [
  { name: "boune", dir: resolve(ROOT, "packages/boune") },
  { name: "create-boune", dir: resolve(ROOT, "packages/create-boune") },
];

export const MONOREPO_ROOT = ROOT;

export function resolvePackages(names?: string[]): Package[] {
  if (!names || names.length === 0 || names.includes("all")) {
    return PACKAGES;
  }

  const resolved: Package[] = [];

  for (const name of names) {
    const pkg = PACKAGES.find((p) => p.name === name);
    if (pkg) {
      resolved.push(pkg);
    }
  }

  return resolved;
}
