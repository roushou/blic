export type { ArgumentInfo, CliInfo, CommandInfo, OptionInfo, ServeDocsOptions } from "./types.ts";

export { extractCliInfo, extractFromConfig } from "./extract.ts";

// Full page generation
export { generateHtml } from "./html.ts";

// Composable parts for embedding in dashboards
export {
  // CSS
  docsThemeStyles,
  docsContentStyles,
  docsLayoutStyles,
  docsScript,
  // Render functions
  renderDocsContent,
  renderDocsSidebar,
  renderCommand,
  renderArgumentsTable,
  renderOptionsTable,
} from "./html.ts";

export { serveDocs, serveDocsFromInfo } from "./server.ts";
