import type { Cli } from "../runtime/cli.ts";

export type DevToolsOptions = {
  /** Server port (default: 4000) */
  port?: number;
  /** Open browser automatically */
  open?: boolean;
  /** Enable event capture */
  capture?: boolean;
};

export type DevToolsPage = "overview" | "docs" | "events";

export type EventType =
  | "command:start"
  | "command:end"
  | "command:error"
  | "request:in"
  | "request:out"
  | "log:info"
  | "log:warn"
  | "log:error";

export type DevToolsEvent = {
  id: string;
  type: EventType;
  timestamp: number;
  data: Record<string, unknown>;
};

export type DevToolsContext = {
  cli: Cli;
  options: Required<DevToolsOptions>;
  events: DevToolsEvent[];
};

export type CaptureMiddlewareOptions = {
  /** DevTools server URL (default: http://localhost:4000) */
  url?: string;
  /** Only capture in development mode (default: true) */
  devOnly?: boolean;
  /** Capture command start events (default: true) */
  captureStart?: boolean;
  /** Capture command end events (default: true) */
  captureEnd?: boolean;
  /** Capture command error events (default: true) */
  captureErrors?: boolean;
  /** Custom metadata to include with all events */
  metadata?: Record<string, unknown>;
  /** Silence connection errors (default: true) */
  silent?: boolean;
};

export type HttpInterceptorOptions = {
  /** DevTools server URL (default: http://localhost:4000) */
  url?: string;
  /** Only intercept in development mode (default: true) */
  devOnly?: boolean;
  /** Capture request headers (default: false for privacy) */
  captureHeaders?: boolean;
  /** Capture request body (default: false for privacy) */
  captureBody?: boolean;
  /** Capture response body (default: false for privacy) */
  captureResponseBody?: boolean;
  /** Max body size to capture in bytes (default: 10KB) */
  maxBodySize?: number;
  /** URL patterns to ignore (e.g., devtools server itself) */
  ignoreUrls?: (string | RegExp)[];
  /** Custom metadata to include with all events */
  metadata?: Record<string, unknown>;
  /** Silence connection errors (default: true) */
  silent?: boolean;
};

export type HttpRequestInfo = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
};

export type HttpResponseInfo = {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  body?: string;
  duration: number;
};
