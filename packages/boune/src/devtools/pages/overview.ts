import type { CliInfo } from "../../docs/types.ts";
import type { DevToolsEvent } from "../types.ts";
import { renderLayout } from "./layout.ts";

/**
 * Client-side script for live overview updates
 */
const overviewPageScript = `
<script>
(function() {
  const MAX_RECENT_EVENTS = 5;
  let events = [];

  function getTypeClass(type) {
    if (type.includes('error')) return 'error';
    if (type.includes('warn')) return 'warning';
    if (type.includes('start') || type.includes('in')) return 'info';
    return 'success';
  }

  function formatEventData(event) {
    const data = event.data;
    const type = event.type;

    if (type === 'command:start' || type === 'command:end') {
      return 'Command: <code>' + (data.command || 'unknown') + '</code>';
    }
    if (type === 'command:error') {
      return 'Error: <code>' + (data.message || data.error || 'Unknown error') + '</code>';
    }
    if (type === 'request:in' || type === 'request:out') {
      const method = data.method || 'GET';
      const url = data.url || data.path || '/';
      return '<code>' + method + '</code> ' + url;
    }
    if (type.startsWith('log:')) {
      return String(data.message || JSON.stringify(data));
    }
    return JSON.stringify(data);
  }

  function createEventRow(event, animate) {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const typeClass = getTypeClass(event.type);

    const div = document.createElement('div');
    div.className = 'dt-event' + (animate ? ' dt-event-new' : '');
    div.innerHTML =
      '<span class="dt-event-time">' + time + '</span>' +
      '<span class="dt-event-type ' + typeClass + '">' + event.type + '</span>' +
      '<span class="dt-event-content">' + formatEventData(event) + '</span>';

    if (animate) {
      setTimeout(() => div.classList.remove('dt-event-new'), 500);
    }

    return div;
  }

  function updateEventCount(count) {
    const counter = document.getElementById('dt-events-stat');
    if (counter) {
      counter.textContent = count;
    }
  }

  function renderRecentEvents(animate) {
    const container = document.getElementById('dt-recent-events');
    if (!container) return;

    const recentEvents = events.slice(-MAX_RECENT_EVENTS).reverse();

    if (recentEvents.length === 0) {
      container.innerHTML =
        '<div class="dt-empty">' +
        '  <div class="dt-empty-icon">📭</div>' +
        '  <div>No events captured yet</div>' +
        '  <div style="font-size: 0.75rem; margin-top: 4px;">Events will appear here as your CLI runs</div>' +
        '</div>';
      return;
    }

    container.innerHTML = '<div class="dt-events" id="dt-recent-events-list"></div>';
    const list = document.getElementById('dt-recent-events-list');

    recentEvents.forEach(function(event, index) {
      // Only animate the newest event
      const row = createEventRow(event, animate && index === 0);
      list.appendChild(row);
    });
  }

  // Handle initial events from WebSocket
  window.dtHandleInit = function(initialEvents) {
    events = initialEvents;
    updateEventCount(events.length);
    renderRecentEvents(false);
  };

  // Handle new event from WebSocket
  window.dtHandleEvent = function(event) {
    events.push(event);
    updateEventCount(events.length);
    renderRecentEvents(true);
  };

  // Handle clear events
  window.dtHandleClear = function() {
    events = [];
    updateEventCount(0);
    renderRecentEvents(false);
  };
})();
</script>
<style>
@keyframes dt-event-flash {
  0% { background: var(--dt-accent); }
  100% { background: transparent; }
}
.dt-event-new {
  animation: dt-event-flash 0.5s ease-out;
}
</style>
`;

/**
 * Render the overview page content
 */
export function renderOverviewContent(cli: CliInfo, events: DevToolsEvent[]): string {
  const recentEvents = events.slice(-5).reverse();

  return `
<div class="dt-page">
  <div class="dt-page-header">
    <h1>Overview</h1>
    <p>Development dashboard for ${cli.name}</p>
  </div>

  <div class="dt-card-grid">
    <div class="dt-card">
      <div class="dt-stat">
        <div class="dt-stat-value">${cli.commands.length}</div>
        <div class="dt-stat-label">Commands</div>
      </div>
    </div>
    <div class="dt-card">
      <div class="dt-stat">
        <div class="dt-stat-value">${cli.globalOptions.length}</div>
        <div class="dt-stat-label">Global Options</div>
      </div>
    </div>
    <div class="dt-card">
      <div class="dt-stat">
        <div class="dt-stat-value" id="dt-events-stat">${events.length}</div>
        <div class="dt-stat-label">Events</div>
      </div>
    </div>
  </div>

  <div class="dt-card">
    <div class="dt-card-header">
      <div class="dt-card-title">Recent Events</div>
      <a href="/events" style="font-size: 0.875rem; color: var(--dt-accent);">View all</a>
    </div>
    <div id="dt-recent-events">
    ${
      recentEvents.length > 0
        ? `
      <div class="dt-events" id="dt-recent-events-list">
        ${recentEvents.map((event) => renderEventRow(event)).join("")}
      </div>
    `
        : `
      <div class="dt-empty">
        <div class="dt-empty-icon">📭</div>
        <div>No events captured yet</div>
        <div style="font-size: 0.75rem; margin-top: 4px;">Events will appear here as your CLI runs</div>
      </div>
    `
    }
    </div>
  </div>
</div>
${overviewPageScript}
  `.trim();
}

function renderEventRow(event: DevToolsEvent): string {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const typeClass = event.type.includes("error")
    ? "error"
    : event.type.includes("warn")
      ? "warning"
      : event.type.includes("start") || event.type.includes("in")
        ? "info"
        : "success";

  return `
<div class="dt-event">
  <span class="dt-event-time">${time}</span>
  <span class="dt-event-type ${typeClass}">${event.type}</span>
  <span class="dt-event-content">${formatEventData(event)}</span>
</div>
  `.trim();
}

function formatEventData(event: DevToolsEvent): string {
  const data = event.data;

  // Helper to safely stringify a value
  const str = (val: unknown, fallback: string): string => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
  };

  if (event.type === "command:start" || event.type === "command:end") {
    return `Command: <code>${str(data.command, "unknown")}</code>`;
  }

  if (event.type === "command:error") {
    return `Error: <code>${str(data.message ?? data.error, "Unknown error")}</code>`;
  }

  if (event.type === "request:in" || event.type === "request:out") {
    const method = str(data.method, "GET");
    const url = str(data.url ?? data.path, "/");
    return `<code>${method}</code> ${url}`;
  }

  if (event.type.startsWith("log:")) {
    return str(data.message, JSON.stringify(data));
  }

  return JSON.stringify(data);
}

/**
 * Render the full overview page with live updates enabled
 */
export function renderOverviewPage(cli: CliInfo, events: DevToolsEvent[]): string {
  return renderLayout(cli, "overview", renderOverviewContent(cli, events), { liveUpdates: true });
}
