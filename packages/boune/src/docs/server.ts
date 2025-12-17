import type { Cli } from "../runtime/cli.ts";
import { color } from "../output/color.ts";
import { extractCliInfo } from "./extract.ts";
import { generateHtml } from "./html.ts";
import type { CliInfo, ServeDocsOptions } from "./types.ts";

/**
 * Serve interactive documentation for a CLI
 *
 * @example
 * ```typescript
 * import { defineCli } from "boune";
 * import { serveDocs } from "boune/docs";
 *
 * const cli = defineCli({ ... });
 *
 * // In development, serve docs
 * if (process.env.NODE_ENV === "development") {
 *   await serveDocs(cli, { port: 4000, open: true });
 * }
 * ```
 */
export async function serveDocs(cli: Cli, options: ServeDocsOptions = {}): Promise<void> {
  const cliInfo = extractCliInfo(cli);
  return serveDocsFromInfo(cliInfo, options);
}

/**
 * Serve interactive documentation from extracted CLI info
 *
 * Use this if you've already extracted the CLI info and want more control.
 */
export async function serveDocsFromInfo(
  cliInfo: CliInfo,
  options: ServeDocsOptions = {},
): Promise<void> {
  const html = generateHtml(cliInfo);
  const port = options.port ?? 4000;

  const server = Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response("Not found", { status: 404 });
    },
  });

  console.log("");
  console.log(color.green("  Documentation server running!"));
  console.log("");
  console.log(`  ${color.bold("Local:")}   ${server.hostname}:${server.port}`);
  console.log("");
  console.log(color.dim("  Press Ctrl+C to stop"));
  console.log("");

  if (options.open) {
    const openCmd =
      process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    Bun.spawn([openCmd, `http://${server.hostname}:${server.port}`]);
  }
}
