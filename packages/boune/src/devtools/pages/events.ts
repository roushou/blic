import type { CliInfo } from "../../docs/types.ts";
import type { DevToolsEvent } from "../types.ts";
import { renderLayout } from "./layout.ts";

/**
 * Client-side script for live event updates
 */
const eventsPageScript = `
<script>
(function() {
  let eventCount = 0;

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

  function createEventRow(event) {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const typeClass = getTypeClass(event.type);

    const div = document.createElement('div');
    div.className = 'dt-event dt-event-new';
    div.innerHTML =
      '<span class="dt-event-time">' + time + '</span>' +
      '<span class="dt-event-type ' + typeClass + '">' + event.type + '</span>' +
      '<span class="dt-event-content">' + formatEventData(event) + '</span>';

    // Remove animation class after animation completes
    setTimeout(() => div.classList.remove('dt-event-new'), 500);

    return div;
  }

  function updateEventCount(count) {
    eventCount = count;
    const counter = document.getElementById('dt-event-count');
    if (counter) {
      counter.textContent = count + ' events captured';
    }
  }

  function showEmptyState() {
    const container = document.getElementById('dt-events-container');
    if (container) {
      container.innerHTML =
        '<div class="dt-empty">' +
        '  <div class="dt-empty-icon">📭</div>' +
        '  <div>No events captured yet</div>' +
        '  <div style="font-size: 0.75rem; margin-top: 4px;">Run commands in your CLI to see events appear here</div>' +
        '</div>';
    }
  }

  function ensureEventsContainer() {
    const container = document.getElementById('dt-events-container');
    if (container && container.querySelector('.dt-empty')) {
      container.innerHTML = '<div class="dt-events" id="dt-events-list"></div>';
    }
    return document.getElementById('dt-events-list');
  }

  // Handle initial events from WebSocket
  window.dtHandleInit = function(events) {
    updateEventCount(events.length);
    if (events.length === 0) {
      showEmptyState();
      return;
    }

    const list = ensureEventsContainer();
    if (!list) return;

    list.innerHTML = '';
    // Show events in reverse order (newest first)
    const reversed = [...events].reverse();
    reversed.forEach(function(event) {
      const row = createEventRow(event);
      row.classList.remove('dt-event-new'); // Don't animate initial load
      list.appendChild(row);
    });
  };

  // Handle new event from WebSocket
  window.dtHandleEvent = function(event) {
    updateEventCount(eventCount + 1);

    const list = ensureEventsContainer();
    if (!list) return;

    const row = createEventRow(event);
    // Insert at the top (newest first)
    list.insertBefore(row, list.firstChild);
  };

  // Handle clear events
  window.dtHandleClear = function() {
    updateEventCount(0);
    showEmptyState();
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
 * Render the events page content
 */
export function renderEventsContent(cli: CliInfo, events: DevToolsEvent[]): string {
  const reversedEvents = [...events].reverse();

  return `
<div class="dt-page">
  <div class="dt-page-header">
    <h1>Events</h1>
    <p>Real-time event stream from your CLI</p>
  </div>

  <div class="dt-card">
    <div class="dt-card-header">
      <div class="dt-card-title">Event Stream</div>
      <div id="dt-event-count" style="font-size: 0.75rem; color: var(--dt-text-tertiary);">
        ${events.length} events captured
      </div>
    </div>
    <div id="dt-events-container">
    ${
      reversedEvents.length > 0
        ? `
      <div class="dt-events" id="dt-events-list">
        ${reversedEvents.map((event) => renderEventRow(event)).join("")}
      </div>
    `
        : `
      <div class="dt-empty">
        <div class="dt-empty-icon">📭</div>
        <div>No events captured yet</div>
        <div style="font-size: 0.75rem; margin-top: 4px;">Run commands in your CLI to see events appear here</div>
      </div>
    `
    }
    </div>
  </div>
</div>
${eventsPageScript}
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

  // Format based on event type
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
 * Render the full events page with live updates enabled
 */
export function renderEventsPage(cli: CliInfo, events: DevToolsEvent[]): string {
  return renderLayout(cli, "events", renderEventsContent(cli, events), { liveUpdates: true });
}
