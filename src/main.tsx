const originalConsoleError = console.error;
console.error = function (...args) {
  if (args[0] === 'Script error.' || (args[0] && args[0].toString().includes('Script error'))) return;
  originalConsoleError.apply(console, args);
};

const originalOnError = window.onerror;
window.onerror = function (msg, url, line, col, error) {
  if (msg === 'Script error.' || (msg && msg.toString().includes('Script error'))) return true;
  if (originalOnError) return originalOnError(msg, url, line, col, error);
  return false;
};

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('ResizeObserver') || e.message === 'Script error.' || e.message.includes('Script error'))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true); // Use capture phase

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && (e.reason.message === 'Script error.' || e.reason.message.includes('Script error'))) {
    e.preventDefault();
  }
});

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initErrorReporter } from './utils/errorReporter.ts';

// 🚨 F6D: Initialize client-side error reporter
// This captures JS errors and sends them to server → admin email alerts
initErrorReporter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
