import React from 'react';
import { createRoot } from 'react-dom/client';
import ProfessionalAdminApp from './App.simple';
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
      <ProfessionalAdminApp />
    </React.StrictMode>
  );
} else {
  root.render(<ProfessionalAdminApp />);
}

