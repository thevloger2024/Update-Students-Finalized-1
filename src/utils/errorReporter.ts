/**
 * Client-side Error Reporter
 * Automatically captures JS errors and sends them to the server
 * for logging and admin email alerts.
 */

const REPORT_URL = '/api/errors/report';
let isInitialized = false;

export function initErrorReporter(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // Capture unhandled JavaScript errors
  window.addEventListener('error', (event: ErrorEvent) => {
    reportError({
      type: 'JavaScriptError',
      message: event.message || 'Unknown JS error',
      url: event.filename || window.location.href,
      stack: event.error?.stack,
    });
  });

  // Capture unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const message = event.reason instanceof Error
      ? event.reason.message
      : String(event.reason);
    reportError({
      type: 'UnhandledPromiseRejection',
      message,
      url: window.location.href,
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
  });

  console.log('[ErrorReporter] Initialized — monitoring for client-side errors');
}

interface ErrorReport {
  type: string;
  message: string;
  url?: string;
  stack?: string;
}

export async function reportError(error: ErrorReport): Promise<void> {
  try {
    // Don't report errors from browser extensions or external sources
    if (error.url && !error.url.includes(window.location.hostname) && !error.url.includes('localhost')) {
      return;
    }

    await fetch(REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...error,
        url: error.url || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
      // Use keepalive so the request survives page unloads
      keepalive: true,
    });
  } catch {
    // Silently fail — don't cause recursive error reporting
  }
}

/**
 * React Error Boundary helper — call this from componentDidCatch
 */
export function reportBoundaryError(error: Error, componentStack: string): void {
  reportError({
    type: 'ReactErrorBoundary',
    message: error.message,
    url: window.location.href,
    stack: `${error.stack}\n\nComponent Stack:\n${componentStack}`,
  });
}
