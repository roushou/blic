import { type TemplateFile, getFullTemplate, getMinimalTemplate } from "./templates.ts";

export interface GenerateOptions {
  name: string;
  template: "minimal" | "full";
  skipInstall?: boolean;
  skipGit?: boolean;
}

export async function generateProject(options: GenerateOptions): Promise<void> {
  const { name, template, skipInstall, skipGit } = options;

  // Check if directory exists
  const dir = `./${name}`;
  const exists = await Bun.file(dir).exists();
  if (exists) {
    throw new Error(`Directory "${name}" already exists`);
  }

  // Get template files
  const files: TemplateFile[] =
    template === "full" ? getFullTemplate(name) : getMinimalTemplate(name);

  // Create directory and files
  for (const file of files) {
    const filePath = `${dir}/${file.path}`;

    // Ensure parent directory exists
    const parentDir = filePath.split("/").slice(0, -1).join("/");
    if (parentDir) {
      await Bun.$`mkdir -p ${parentDir}`.quiet();
    }

    await Bun.write(filePath, file.content);
  }

  // Initialize git
  if (!skipGit) {
    try {
      await Bun.$`cd ${dir} && git init`.quiet();
    } catch {
      // Git not available, skip silently
    }
  }

  // Install dependencies
  if (!skipInstall) {
    try {
      await Bun.$`cd ${dir} && bun install`.quiet();
    } catch {
      // Install failed, user can run manually
    }
  }
}
