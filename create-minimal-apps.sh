#!/bin/bash

echo "🚀 Creating minimal working apps for all portals..."

# Admin App.tsx
cat > src/apps/admin/App.tsx << 'EOF'
import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1976d2' }}>🎉 Legal CRM - Admin Portal</h1>
      <p>✅ Το frontend λειτουργεί!</p>
      <p>📊 Portal: ADMIN (Port 3001)</p>
    </div>
  );
};

export default App;
EOF

# Admin index.tsx
cat > src/apps/admin/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Supervisor App.tsx
cat > src/apps/supervisor/App.tsx << 'EOF'
import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#e8f5e9',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#388e3c' }}>👮 Legal CRM - Supervisor Portal</h1>
      <p>✅ Το frontend λειτουργεί!</p>
      <p>📊 Portal: SUPERVISOR (Port 3002)</p>
    </div>
  );
};

export default App;
EOF

# Supervisor index.tsx
cat > src/apps/supervisor/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Secretary App.tsx
cat > src/apps/secretary/App.tsx << 'EOF'
import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f3e5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#7b1fa2' }}>📝 Legal CRM - Secretary Portal</h1>
      <p>✅ Το frontend λειτουργεί!</p>
      <p>📊 Portal: SECRETARY (Port 3003)</p>
    </div>
  );
};

export default App;
EOF

# Secretary index.tsx
cat > src/apps/secretary/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Client App.tsx
cat > src/apps/client/App.tsx << 'EOF'
import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#e1f5fe',
      fontFamily: 'Arial, sans-serif',
      userSelect: 'none'
    }}>
      <h1 style={{ color: '#0288d1' }}>👤 Legal CRM - Client Portal</h1>
      <p>✅ Το frontend λειτουργεί!</p>
      <p>�� Portal: CLIENT (Port 3004)</p>
      <p style={{ color: '#666' }}>🔒 Read-only access</p>
    </div>
  );
};

export default App;
EOF

# Client index.tsx
cat > src/apps/client/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

echo "✅ All minimal apps created!"
