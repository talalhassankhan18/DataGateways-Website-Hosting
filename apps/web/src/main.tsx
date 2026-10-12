import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initAnalytics } from './lib/analytics';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element missing from index.html');

/*
 * Before React, deliberately.
 *
 * Consent Mode defaults have to be on the dataLayer before gtag.js loads, and the first page view
 * is sent from a component effect. Booting here rather than from an effect keeps that order fixed
 * and keeps it out of StrictMode's double-invoked mount, where it would run twice.
 *
 * Inert unless VITE_GA_MEASUREMENT_ID holds a valid G- id, so a local checkout loads no script
 * and makes no request. See lib/analytics.ts.
 */
initAnalytics();

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
