/**
 * CSS variables for the devtools dashboard theme
 */
export const devtoolsThemeStyles = `
:root {
  --dt-bg: #09090b;
  --dt-bg-secondary: #18181b;
  --dt-bg-tertiary: #27272a;
  --dt-text: #fafafa;
  --dt-text-secondary: #a1a1aa;
  --dt-text-tertiary: #71717a;
  --dt-accent: #3b82f6;
  --dt-accent-hover: #2563eb;
  --dt-border: #27272a;
  --dt-success: #22c55e;
  --dt-warning: #eab308;
  --dt-error: #ef4444;
  --dt-info: #06b6d4;
}

@media (prefers-color-scheme: light) {
  :root {
    --dt-bg: #ffffff;
    --dt-bg-secondary: #f4f4f5;
    --dt-bg-tertiary: #e4e4e7;
    --dt-text: #09090b;
    --dt-text-secondary: #52525b;
    --dt-text-tertiary: #a1a1aa;
    --dt-border: #e4e4e7;
  }
}
`;

/**
 * Base styles for the devtools dashboard
 */
export const devtoolsBaseStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--dt-bg);
  color: var(--dt-text);
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

code {
  font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  font-size: 0.875em;
  background: var(--dt-bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}
`;

/**
 * Layout styles for the devtools shell
 */
export const devtoolsLayoutStyles = `
.dt-layout {
  display: flex;
  min-height: 100vh;
}

.dt-sidebar {
  width: 240px;
  background: var(--dt-bg-secondary);
  border-right: 1px solid var(--dt-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.dt-sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--dt-border);
}

.dt-sidebar-header h1 {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dt-sidebar-header .dt-badge {
  font-size: 0.625rem;
  padding: 2px 6px;
  background: var(--dt-accent);
  color: white;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.dt-sidebar-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--dt-text-secondary);
  transition: all 0.15s;
}

.dt-nav-item:hover {
  background: var(--dt-bg-tertiary);
  color: var(--dt-text);
}

.dt-nav-item.active {
  background: var(--dt-accent);
  color: white;
}

.dt-nav-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.dt-nav-item.active .dt-nav-icon {
  opacity: 1;
}

.dt-sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--dt-border);
  font-size: 0.75rem;
  color: var(--dt-text-tertiary);
}

.dt-main {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
}

.dt-page {
  padding: 32px;
  max-width: 1200px;
}

.dt-page-header {
  margin-bottom: 32px;
}

.dt-page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.dt-page-header p {
  color: var(--dt-text-secondary);
  font-size: 0.875rem;
}
`;

/**
 * Card component styles
 */
export const devtoolsCardStyles = `
.dt-card {
  background: var(--dt-bg-secondary);
  border: 1px solid var(--dt-border);
  border-radius: 8px;
  padding: 20px;
}

.dt-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.dt-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dt-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dt-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.dt-stat {
  text-align: center;
  padding: 16px;
}

.dt-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dt-text);
}

.dt-stat-label {
  font-size: 0.75rem;
  color: var(--dt-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
`;

/**
 * Events/log styles
 */
export const devtoolsEventStyles = `
.dt-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dt-event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--dt-bg-secondary);
  border: 1px solid var(--dt-border);
  border-radius: 6px;
  font-size: 0.875rem;
}

.dt-event-time {
  color: var(--dt-text-tertiary);
  font-family: "SF Mono", Monaco, monospace;
  font-size: 0.75rem;
  white-space: nowrap;
}

.dt-event-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.dt-event-type.info { background: rgba(6, 182, 212, 0.1); color: var(--dt-info); }
.dt-event-type.success { background: rgba(34, 197, 94, 0.1); color: var(--dt-success); }
.dt-event-type.warning { background: rgba(234, 179, 8, 0.1); color: var(--dt-warning); }
.dt-event-type.error { background: rgba(239, 68, 68, 0.1); color: var(--dt-error); }

.dt-event-content {
  flex: 1;
  color: var(--dt-text);
}

.dt-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--dt-text-tertiary);
}

.dt-empty-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  opacity: 0.5;
}
`;

/**
 * All devtools styles combined
 */
export const devtoolsStyles = `
${devtoolsThemeStyles}
${devtoolsBaseStyles}
${devtoolsLayoutStyles}
${devtoolsCardStyles}
${devtoolsEventStyles}
`;
