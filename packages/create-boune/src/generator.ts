import { type TemplateFile, getFullTemplate, getMinimalTemplate } from "./templates.ts";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";

export interface GenerateOptions {
  name: string;
  template: "minimal" | "full";
  skipInstall?: boolean;
  skipGit?: boolean;
}

const templates = {
  minimal: getMinimalTemplate,
  full: getFullTemplate,
} as const;

export async function generateProject(options: GenerateOptions): Promise<void> {
  const { name, template, skipInstall, skipGit } = options;
  const dir = `./${name}`;

  // Check if directory exists
  if (await Bun.file(dir).exists()) {
    throw new Error(`Directory "${name}" already exists`);
  }

  // Get and write template files
  const files: TemplateFile[] = templates[template](name);

  for (const file of files) {
    const filePath = `${dir}/${file.path}`;
    await mkdir(dirname(filePath), { recursive: true });
    await Bun.write(filePath, file.content);
  }

  // Initialize git
  if (!skipGit) {
    await Bun.$`git -C ${dir} init`.quiet().nothrow();
  }

  // Install dependencies
  if (!skipInstall) {
    await Bun.$`bun install --cwd ${dir}`.quiet().nothrow();
  }
}
