import type { CliInfo } from "../../docs/types.ts";
import type { DevToolsPage } from "../types.ts";
import { devtoolsStyles } from "../styles.ts";
import { docsContentStyles } from "../../docs/html.ts";

const icons = {
  overview: `<svg class="dt-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  docs: `<svg class="dt-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  events: `<svg class="dt-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
};

/**
 * WebSocket client script for live updates
 */
export const websocketClientScript = `
<script>
(function() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = wsProtocol + '//' + window.location.host + '/ws';

  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelay = 1000;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = function() {
      console.log('[DevTools] Connected to WebSocket');
      reconnectAttempts = 0;
      updateConnectionStatus(true);
    };

    ws.onclose = function() {
      console.log('[DevTools] WebSocket closed');
      updateConnectionStatus(false);

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(connect, reconnectDelay * reconnectAttempts);
      }
    };

    ws.onerror = function(err) {
      console.error('[DevTools] WebSocket error:', err);
    };

    ws.onmessage = function(e) {
      try {
        const data = JSON.parse(e.data);
        handleMessage(data);
      } catch (err) {
        console.error('[DevTools] Failed to parse message:', err);
      }
    };
  }

  function handleMessage(data) {
    if (data.type === 'init') {
      // Initial events load
      if (window.dtHandleInit) {
        window.dtHandleInit(data.events);
      }
    } else if (data.type === 'event') {
      // New event
      if (window.dtHandleEvent) {
        window.dtHandleEvent(data.event);
      }
    } else if (data.type === 'clear') {
      // Events cleared
      if (window.dtHandleClear) {
        window.dtHandleClear();
      }
    }
  }

  function updateConnectionStatus(connected) {
    const indicator = document.getElementById('dt-connection-status');
    if (indicator) {
      indicator.className = 'dt-connection-status ' + (connected ? 'connected' : 'disconnected');
      indicator.title = connected ? 'Connected' : 'Disconnected';
    }
  }

  // Start connection
  connect();

  // Expose for debugging
  window.dtWebSocket = ws;
})();
</script>
`;

/**
 * Render the sidebar navigation
 */
export function renderSidebar(cli: CliInfo, activePage: DevToolsPage): string {
  const navItems: { id: DevToolsPage; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: icons.overview },
    { id: "docs", label: "Documentation", icon: icons.docs },
    { id: "events", label: "Events", icon: icons.events },
  ];

  return `
<aside class="dt-sidebar">
  <div class="dt-sidebar-header">
    <h1>
      ${cli.name}
      <span class="dt-badge">dev</span>
    </h1>
  </div>
  <nav class="dt-sidebar-nav">
    ${navItems
      .map(
        (item) => `
    <a href="/${item.id === "overview" ? "" : item.id}" class="dt-nav-item${activePage === item.id ? " active" : ""}">
      ${item.icon}
      <span>${item.label}</span>
    </a>
    `,
      )
      .join("")}
  </nav>
  <div class="dt-sidebar-footer">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span id="dt-connection-status" class="dt-connection-status" title="Connecting..."></span>
      <span>v${cli.version}</span>
    </div>
    <div style="margin-top: 4px;">Powered by boune</div>
  </div>
</aside>
  `.trim();
}

/**
 * Connection status indicator styles
 */
const connectionStatusStyles = `
.dt-connection-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dt-warning);
  transition: background 0.2s;
}
.dt-connection-status.connected {
  background: var(--dt-success);
}
.dt-connection-status.disconnected {
  background: var(--dt-error);
}
`;

/**
 * Render the full page layout with content
 */
export function renderLayout(
  cli: CliInfo,
  activePage: DevToolsPage,
  content: string,
  options: { liveUpdates?: boolean } = {},
): string {
  const { liveUpdates = false } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cli.name} - DevTools</title>
  <style>
${devtoolsStyles}
${docsContentStyles}
${connectionStatusStyles}
  </style>
</head>
<body>
  <div class="dt-layout">
    ${renderSidebar(cli, activePage)}
    <main class="dt-main">
      ${content}
    </main>
  </div>
  ${liveUpdates ? websocketClientScript : ""}
</body>
</html>`;
}
