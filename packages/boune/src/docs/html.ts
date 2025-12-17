import type { ArgumentInfo, CliInfo, CommandInfo, OptionInfo } from "./types.ts";

/**
 * CSS variables for theming docs
 * Can be overridden by the dashboard's own theme
 */
export const docsThemeStyles = `
:root {
  --docs-bg: #0a0a0a;
  --docs-bg-secondary: #141414;
  --docs-bg-tertiary: #1a1a1a;
  --docs-text: #fafafa;
  --docs-text-secondary: #a1a1a1;
  --docs-text-tertiary: #6b6b6b;
  --docs-accent: #3b82f6;
  --docs-accent-hover: #2563eb;
  --docs-border: #262626;
  --docs-success: #22c55e;
  --docs-warning: #eab308;
  --docs-error: #ef4444;
}

@media (prefers-color-scheme: light) {
  :root {
    --docs-bg: #ffffff;
    --docs-bg-secondary: #f5f5f5;
    --docs-bg-tertiary: #e5e5e5;
    --docs-text: #171717;
    --docs-text-secondary: #525252;
    --docs-text-tertiary: #a3a3a3;
    --docs-border: #e5e5e5;
  }
}
`;

/**
 * CSS styles for docs content (commands, tables, badges, etc.)
 * Uses CSS variables from docsThemeStyles
 */
export const docsContentStyles = `
.docs-content {
  color: var(--docs-text);
  line-height: 1.6;
}

.docs-hero {
  margin-bottom: 48px;
}

.docs-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.docs-hero p {
  color: var(--docs-text-secondary);
  font-size: 1.125rem;
}

.docs-section {
  margin-bottom: 48px;
}

.docs-section h2 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--docs-border);
}

.docs-command {
  background: var(--docs-bg-secondary);
  border: 1px solid var(--docs-border);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}

.docs-command h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.docs-command h3 code {
  background: var(--docs-bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
}

.docs-command .docs-description {
  color: var(--docs-text-secondary);
  margin-bottom: 16px;
}

.docs-command .docs-aliases {
  font-size: 0.875rem;
  color: var(--docs-text-tertiary);
  margin-bottom: 16px;
}

.docs-usage {
  background: var(--docs-bg);
  border: 1px solid var(--docs-border);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.docs-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-top: 16px;
}

.docs-content th {
  text-align: left;
  padding: 12px;
  background: var(--docs-bg-tertiary);
  border-bottom: 1px solid var(--docs-border);
  font-weight: 600;
}

.docs-content td {
  padding: 12px;
  border-bottom: 1px solid var(--docs-border);
}

.docs-content td code {
  background: var(--docs-bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SF Mono", Monaco, monospace;
  font-size: 0.8125rem;
}

.docs-type {
  color: var(--docs-accent);
}

.docs-default {
  color: var(--docs-text-tertiary);
}

.docs-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.docs-badge.required {
  background: rgba(239, 68, 68, 0.1);
  color: var(--docs-error);
}

.docs-badge.optional {
  background: rgba(34, 197, 94, 0.1);
  color: var(--docs-success);
}

.docs-empty {
  color: var(--docs-text-tertiary);
  font-style: italic;
}

.docs-subheading {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.docs-subcommands-heading {
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}
`;

/**
 * CSS styles for the standalone page layout (sidebar + main)
 */
export const docsLayoutStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--docs-bg);
  color: var(--docs-text);
  line-height: 1.6;
}

.docs-layout {
  display: flex;
  min-height: 100vh;
}

.docs-sidebar {
  width: 280px;
  background: var(--docs-bg-secondary);
  border-right: 1px solid var(--docs-border);
  padding: 24px;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.docs-sidebar h1 {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.docs-sidebar .docs-version {
  font-size: 0.75rem;
  color: var(--docs-text-tertiary);
  margin-bottom: 24px;
}

.docs-sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.docs-sidebar a {
  color: var(--docs-text-secondary);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.docs-sidebar a:hover {
  background: var(--docs-bg-tertiary);
  color: var(--docs-text);
}

.docs-sidebar a.active {
  background: var(--docs-accent);
  color: white;
}

.docs-main {
  flex: 1;
  margin-left: 280px;
  padding: 48px;
  max-width: 900px;
}

@media (max-width: 768px) {
  .docs-sidebar {
    display: none;
  }
  .docs-main {
    margin-left: 0;
    padding: 24px;
  }
}
`;

/**
 * Render the sidebar navigation for docs
 */
export function renderDocsSidebar(cli: CliInfo): string {
  return `
<aside class="docs-sidebar">
  <h1>${cli.name}</h1>
  <div class="docs-version">v${cli.version}</div>
  <nav>
    <a href="#overview" class="active">Overview</a>
    ${cli.globalOptions.length > 0 ? '<a href="#global-options">Global Options</a>' : ""}
    ${cli.commands.map((cmd) => `<a href="#${cmd.name}">${cmd.name}</a>`).join("\n    ")}
  </nav>
</aside>
  `.trim();
}

/**
 * Render the main docs content (without page wrapper or sidebar)
 * Use this when embedding docs in a dashboard
 */
export function renderDocsContent(cli: CliInfo): string {
  return `
<div class="docs-content">
  <div class="docs-hero" id="overview">
    <h1>${cli.name}</h1>
    <p>${cli.description || "CLI Documentation"}</p>
  </div>

  ${
    cli.globalOptions.length > 0
      ? `
  <div class="docs-section" id="global-options">
    <h2>Global Options</h2>
    <p style="color: var(--docs-text-secondary); margin-bottom: 16px;">These options are available for all commands.</p>
    ${renderOptionsTable(cli.globalOptions)}
  </div>
  `
      : ""
  }

  <div class="docs-section" id="commands">
    <h2>Commands</h2>
    ${cli.commands.map((cmd) => renderCommand(cmd, cli.name)).join("\n")}
  </div>
</div>
  `.trim();
}

/**
 * Render a single command block
 */
export function renderCommand(cmd: CommandInfo, cliName: string, depth = 0): string {
  const fullName = depth > 0 ? cmd.name : `${cliName} ${cmd.name}`;
  const usageParts = [fullName];

  for (const arg of cmd.arguments) {
    if (arg.variadic) {
      usageParts.push(arg.required ? `<${arg.name}...>` : `[${arg.name}...]`);
    } else {
      usageParts.push(arg.required ? `<${arg.name}>` : `[${arg.name}]`);
    }
  }

  if (cmd.options.length > 0) {
    usageParts.push("[options]");
  }

  return `
<div class="docs-command" id="${cmd.name}">
  <h3><code>${cmd.name}</code></h3>
  <p class="docs-description">${cmd.description || '<span class="docs-empty">No description</span>'}</p>
  ${cmd.aliases.length > 0 ? `<p class="docs-aliases">Aliases: ${cmd.aliases.map((a) => `<code>${a}</code>`).join(", ")}</p>` : ""}

  <div class="docs-usage">
    <span style="color: var(--docs-text-tertiary)">$</span> ${usageParts.join(" ")}
  </div>

  ${cmd.arguments.length > 0 ? `<h4 class="docs-subheading">Arguments</h4>${renderArgumentsTable(cmd.arguments)}` : ""}
  ${cmd.options.length > 0 ? `<h4 class="docs-subheading">Options</h4>${renderOptionsTable(cmd.options)}` : ""}
  ${cmd.subcommands.length > 0 ? `<h4 class="docs-subcommands-heading">Subcommands</h4>${cmd.subcommands.map((sub) => renderCommand(sub, cmd.name, depth + 1)).join("")}` : ""}
</div>
  `.trim();
}

/**
 * Render an arguments table
 */
export function renderArgumentsTable(args: ArgumentInfo[]): string {
  return `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    ${args
      .map(
        (arg) => `
    <tr>
      <td><code>${arg.name}${arg.variadic ? "..." : ""}</code></td>
      <td><span class="docs-type">${arg.type}</span></td>
      <td><span class="docs-badge ${arg.required ? "required" : "optional"}">${arg.required ? "required" : "optional"}</span></td>
      <td>${arg.description || "-"}${arg.default !== undefined ? ` <span class="docs-default">(default: ${JSON.stringify(arg.default)})</span>` : ""}</td>
    </tr>
    `,
      )
      .join("")}
  </tbody>
</table>
  `.trim();
}

/**
 * Render an options table
 */
export function renderOptionsTable(options: OptionInfo[]): string {
  return `
<table>
  <thead>
    <tr>
      <th>Flag</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    ${options
      .map(
        (opt) => `
    <tr>
      <td>
        <code>--${opt.name}</code>${opt.short ? `, <code>-${opt.short}</code>` : ""}
      </td>
      <td><span class="docs-type">${opt.type}</span></td>
      <td>
        ${opt.description || "-"}
        ${opt.default !== undefined ? `<span class="docs-default"> (default: ${JSON.stringify(opt.default)})</span>` : ""}
        ${opt.env ? `<br><span class="docs-default">env: ${opt.env}</span>` : ""}
        ${opt.required ? ' <span class="docs-badge required">required</span>' : ""}
      </td>
    </tr>
    `,
      )
      .join("")}
  </tbody>
</table>
  `.trim();
}

/**
 * JavaScript for standalone page interactivity
 */
export const docsScript = `
// Simple active link handling
document.querySelectorAll('.docs-sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.docs-sidebar a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Scroll spy
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.docs-sidebar a').forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[id]').forEach(el => observer.observe(el));
`;

/**
 * Generate a full standalone HTML documentation page
 *
 * @example
 * ```typescript
 * import { extractCliInfo, generateHtml } from "boune/docs";
 *
 * const info = extractCliInfo(cli);
 * const html = generateHtml(info);
 * await Bun.write("docs.html", html);
 * ```
 */
export function generateHtml(cli: CliInfo): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cli.name} - Documentation</title>
  <style>
${docsThemeStyles}
${docsLayoutStyles}
${docsContentStyles}
  </style>
</head>
<body>
  <div class="docs-layout">
    ${renderDocsSidebar(cli)}
    <main class="docs-main">
      ${renderDocsContent(cli)}
    </main>
  </div>
  <script>
${docsScript}
  </script>
</body>
</html>`;
}
