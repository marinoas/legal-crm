import React from 'react';
import { createRoot } from 'react-dom/client';
import WorkingAdminApp from './App.working';
import '../../styles/global.css';

// Get root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root and render
const root = createRoot(container);

console.log('Loading Professional Admin Portal...');

if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <WorkingAdminApp />
    </React.StrictMode>
  );
} else {
  root.render(<WorkingAdminApp />);
}

