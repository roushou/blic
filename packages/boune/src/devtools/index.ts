// Types
export type {
  DevToolsOptions,
  DevToolsEvent,
  DevToolsPage,
  EventType,
  DevToolsContext,
  CaptureMiddlewareOptions,
  HttpInterceptorOptions,
  HttpRequestInfo,
  HttpResponseInfo,
} from "./types.ts";

export type { StorageOptions, EventFilter } from "./storage.ts";
export type { DevServerOptions } from "./server.ts";

// Server
export { createDevServer, serveDevTools } from "./server.ts";

// Storage
export { DevToolsStorage, getDefaultStorage, captureToStorage } from "./storage.ts";

// Capture middleware
export {
  createCaptureMiddleware,
  createDevToolsLogger,
  captureEvent,
  getSharedStorage,
} from "./capture.ts";

// HTTP interceptor
export { wrapFetch, createHttpClient, installHttpInterceptor } from "./http.ts";

// Styles (for customization)
export {
  devtoolsStyles,
  devtoolsThemeStyles,
  devtoolsBaseStyles,
  devtoolsLayoutStyles,
  devtoolsCardStyles,
  devtoolsEventStyles,
} from "./styles.ts";

// Pages (for customization)
export {
  renderLayout,
  renderSidebar,
  renderOverviewPage,
  renderOverviewContent,
  renderDocsPage,
  renderDocsPageContent,
  renderEventsPage,
  renderEventsContent,
} from "./pages/index.ts";
