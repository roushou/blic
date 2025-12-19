import { spawn } from "node:child_process";

export type OpenOptions = {
  /** Open with a specific app (macOS/Linux only) */
  app?: string;
  /** Arguments to pass to the app */
  args?: string[];
  /** Wait for the app to close before resolving */
  wait?: boolean;
  /** Open in background (macOS only) */
  background?: boolean;
};

type Platform = "darwin" | "linux" | "win32";

function getPlatform(): Platform {
  const platform = process.platform;
  if (platform === "darwin" || platform === "linux" || platform === "win32") {
    return platform;
  }
  throw new Error(`Unsupported platform: ${platform}`);
}

function buildCommand(
  target: string,
  platform: Platform,
  options: OpenOptions,
): { cmd: string; args: string[] } {
  switch (platform) {
    case "darwin": {
      const args: string[] = [];

      if (options.wait) {
        args.push("-W");
      }

      if (options.background) {
        args.push("-g");
      }

      if (options.app) {
        args.push("-a", options.app);
      }

      args.push(target);

      if (options.args?.length) {
        args.push("--args", ...options.args);
      }

      return { cmd: "open", args };
    }

    case "linux": {
      if (options.app) {
        return {
          cmd: options.app,
          args: [...(options.args ?? []), target],
        };
      }

      return { cmd: "xdg-open", args: [target] };
    }

    case "win32": {
      const args = ["/c", "start", '""', "/b"];

      if (options.wait) {
        args.push("/wait");
      }

      if (options.app) {
        args.push(options.app);
      }

      args.push(target.replace(/&/g, "^&"));

      if (options.args?.length) {
        args.push(...options.args);
      }

      return { cmd: "cmd", args };
    }
  }
}

/**
 * Open a URL or file in the default application
 *
 * @example
 * ```ts
 * import { open } from "boune/x/open";
 *
 * // Open URL in default browser
 * await open("https://example.com");
 *
 * // Open file in default app
 * await open("./document.pdf");
 *
 * // Open with specific app (macOS)
 * await open("./project", { app: "Visual Studio Code" });
 *
 * // Wait for app to close
 * await open("./file.txt", { wait: true });
 * ```
 */
export async function open(target: string, options: OpenOptions = {}): Promise<void> {
  const platform = getPlatform();
  const { cmd, args } = buildCommand(target, platform, options);

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "ignore",
      detached: !options.wait,
    });

    child.on("error", reject);

    if (options.wait) {
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });
    } else {
      child.unref();
      resolve();
    }
  });
}

/**
 * Open a URL in the default browser
 * Convenience wrapper around `open()` for URLs
 *
 * @example
 * ```ts
 * import { openBrowser } from "boune/x/open";
 *
 * await openBrowser("https://docs.myapp.com");
 * ```
 */
export async function openBrowser(url: string): Promise<void> {
  return open(url);
}

/**
 * Open a file or folder in the system file manager
 *
 * @example
 * ```ts
 * import { openInFileManager } from "boune/x/open";
 *
 * // Open folder
 * await openInFileManager("./dist");
 *
 * // Reveal file in file manager
 * await openInFileManager("./output.log");
 * ```
 */
export async function openInFileManager(path: string): Promise<void> {
  const platform = getPlatform();

  switch (platform) {
    case "darwin":
      return open(path, { app: "Finder" });
    case "linux":
      return open(path, { app: "xdg-open" });
    case "win32":
      return open(path, { app: "explorer" });
  }
}

/**
 * Open a file in a specific editor
 *
 * @example
 * ```ts
 * import { openInEditor } from "boune/x/open";
 *
 * await openInEditor("./src/index.ts", "code");      // VS Code
 * await openInEditor("./src/index.ts", "vim");       // Vim
 * await openInEditor("./src/index.ts", "subl");      // Sublime
 * ```
 */
export async function openInEditor(path: string, editor: string): Promise<void> {
  return open(path, { app: editor });
}
