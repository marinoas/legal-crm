import React from 'react';
import { createRoot } from 'react-dom/client';
import { getAppComponent } from './config/app.config';
import { registerServiceWorker } from './config/service-worker.config';
import './styles/global.css';

// Get app component based on port
const AppComponent = getAppComponent();

// Get root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root and render
const root = createRoot(container);

if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <AppComponent />
    </React.StrictMode>
  );
} else {
  root.render(<AppComponent />);
}

// Register service worker
registerServiceWorker();

