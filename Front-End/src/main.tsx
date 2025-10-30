import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://ce953782a2770563dac53b02ba4bc4bd@o4510032350085120.ingest.us.sentry.io/4510032360439808",
  sendDefaultPii: true,
  tracePropagationTargets: [
    import.meta.env.VITE_REACT_APP_API_URL,
    /^\//,
  ],
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  // Performance monitoring
  tracesSampleRate: 1.0,
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import SentryErrorBoundary from './components/SentryErrorBoundary.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
