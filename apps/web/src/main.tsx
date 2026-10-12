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

/*
 * basename must match Vite's base, or routing breaks in a way that looks like a content problem
 * rather than a configuration one.
 *
 * On a GitHub Pages project site the browser's pathname is `/DataGateways-Website-Hosting/about`,
 * while the routes here are declared as `/about`. Without a basename, React Router compares the
 * two, matches nothing, and renders the 404 page for every URL including the home page — a site
 * that looks deployed and is entirely unreachable.
 *
 * `BASE_URL` is whatever `base` was set to at build time, so the two cannot drift apart.
 */
createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
