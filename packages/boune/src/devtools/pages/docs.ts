import type { CliInfo } from "../../docs/types.ts";
import { renderDocsContent } from "../../docs/html.ts";
import { renderLayout } from "./layout.ts";

/**
 * Render the docs page content
 * Reuses the docs content renderer from boune/docs
 */
export function renderDocsPageContent(cli: CliInfo): string {
  return `
<div class="dt-page" style="max-width: 900px;">
  ${renderDocsContent(cli)}
</div>
  `.trim();
}

/**
 * Render the full docs page
 */
export function renderDocsPage(cli: CliInfo): string {
  return renderLayout(cli, "docs", renderDocsPageContent(cli));
}
