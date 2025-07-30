#!/usr/bin/env node

/**
 * Setup script for Legal CRM Frontend
 * Creates the complete folder structure
 */

const fs = require('fs');
const path = require('path');

// Define the complete folder structure
const folderStructure = {
  src: {
    apps: {
      admin: ['App.tsx', 'index.tsx', 'routes', 'layouts'],
      supervisor: ['App.tsx', 'index.tsx', 'routes', 'layouts'],
      secretary: ['App.tsx', 'index.tsx', 'routes', 'layouts'],
      client: ['App.tsx', 'index.tsx', 'routes', 'layouts'],
    },
    shared: {
      components: {
        buttons: ['PrimaryButton', 'SecondaryButton', 'IconButton'],
        forms: ['TextField', 'DatePicker', 'Select', 'FileUpload'],
        modals: ['ConfirmationModal', 'FormModal', 'InfoModal'],
        cards: ['CourtCard', 'DeadlineCard', 'ClientCard', 'AppointmentCard'],
        tables: ['DataTable', 'FinancialTable', 'SortableTable'],
        navigation: ['Sidebar', 'TopBar', 'Breadcrumbs'],
        feedback: ['Toast', 'LoadingSpinner', 'ProgressBar'],
      },
      hooks: [
        'useAuth.ts',
        'useSocket.ts',
        'useNotifications.ts',
        'usePermissions.ts',
        'useGreekLocale.ts',
      ],
      utils: {
        api: ['client.ts', 'interceptors.ts'],
        dates: ['formatters.ts', 'validators.ts'],
        validation: ['schemas.ts', 'rules.ts'],
        formatters: ['currency.ts', 'text.ts'],
        constants: ['routes.ts', 'permissions.ts'],
      },
      services: {
        auth: ['auth.service.ts'],
        courts: ['courts.service.ts'],
        clients: ['clients.service.ts'],
        deadlines: ['deadlines.service.ts'],
        appointments: ['appointments.service.ts'],
        financial: ['financial.service.ts'],
      },
      types: ['models.ts', 'api.ts', 'components.ts'],
    },
    features: {
      courts: {
        components: ['CourtForm', 'CourtList', 'CourtCalendar', 'CourtActions'],
        hooks: [],
        store: [],
        types: [],
      },
      clients: {
        components: ['ClientForm', 'ClientList', 'ClientProfile', 'FolderNumbers'],
        hooks: [],
        store: [],
        types: [],
      },
      deadlines: {
        components: ['DeadlineForm', 'DeadlineList', 'DeadlineReminders'],
        hooks: [],
        store: [],
        types: [],
      },
      appointments: {
        components: ['BookingCalendar', 'PaymentForm', 'AvailabilitySettings'],
        hooks: [],
        store: [],
        types: [],
      },
      financial: {
        components: ['TransactionList', 'FinancialSummary', 'InvoiceGenerator'],
        hooks: [],
        store: [],
        types: [],
      },
      documents: {
        components: ['DocumentUpload', 'DocumentViewer', 'WatermarkedViewer'],
        hooks: [],
        store: [],
        types: [],
      },
      settings: {
        components: ['GeneralSettings', 'UserManagement', 'RolePermissions', 'EmailTemplates'],
        hooks: [],
        store: [],
        types: [],
      },
      dashboard: {
        components: ['OverviewCards', 'QuickActions', 'Statistics'],
        hooks: [],
        store: [],
        types: [],
      },
    },
    store: {
      slices: [
        'auth.slice.ts',
        'courts.slice.ts',
        'clients.slice.ts',
        'notifications.slice.ts',
        'ui.slice.ts',
      ],
      middleware: ['api.ts', 'socket.ts'],
      'index.ts': '',
      'rootReducer.ts': '',
    },
    theme: ['index.ts', 'palette.ts', 'typography.ts', 'components.ts', 'greekLocale.ts'],
    locales: {
      el: ['common.json', 'courts.json', 'clients.json', 'legal.json', 'errors.json'],
      'index.ts': '',
    },
    config: ['api.config.ts', 'socket.config.ts', 'routes.config.ts', 'permissions.config.ts'],
  },
  public: {
    assets: ['images', 'fonts'],
    locales: {
      el: [],
    },
    'favicon.ico': '',
    'manifest.json': '',
    'robots.txt': '',
  },
  webpack: [],
  scripts: [],
  tests: {
    mocks: ['styleMock.js', 'fileMock.js'],
    utils: [],
    'setup.ts': '',
  },
};

// Create folder/file recursively
function createStructure(basePath, structure) {
  Object.entries(structure).forEach(([key, value]) => {
    const fullPath = path.join(basePath, key);

    if (Array.isArray(value)) {
      // Create directory
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${fullPath}`);
      }

      // Create files in the directory
      value.forEach((file) => {
        if (typeof file === 'string' && file.includes('.')) {
          const filePath = path.join(fullPath, file);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, getFileContent(file), 'utf8');
            console.log(`📄 Created file: ${filePath}`);
          }
        } else if (typeof file === 'string') {
          // Create subdirectory for components
          const componentPath = path.join(fullPath, file);
          if (!fs.existsSync(componentPath)) {
            fs.mkdirSync(componentPath, { recursive: true });
            createComponentFiles(componentPath, file);
          }
        }
      });
    } else if (typeof value === 'object') {
      // Create directory and recurse
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${fullPath}`);
      }
      createStructure(fullPath, value);
    } else if (typeof key === 'string' && key.includes('.')) {
      // Create file
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, getFileContent(key), 'utf8');
        console.log(`📄 Created file: ${fullPath}`);
      }
    }
  });
}

// Create component files
function createComponentFiles(componentPath, componentName) {
  const files = [
    { name: 'index.tsx', content: `export { ${componentName} } from './${componentName}';\n` },
    { name: `${componentName}.tsx`, content: getComponentContent(componentName) },
    { name: `${componentName}.styles.ts`, content: getStylesContent(componentName) },
    { name: `${componentName}.test.tsx`, content: getTestContent(componentName) },
  ];

  files.forEach(({ name, content }) => {
    const filePath = path.join(componentPath, name);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📄 Created file: ${filePath}`);
  });
}

// Get file content based on file type
function getFileContent(filename) {
  if (filename.endsWith('.json')) {
    return '{}';
  } else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    return '// TODO: Implement\n';
  } else {
    return '';
  }
}

// Get component content
function getComponentContent(componentName) {
  return `import React from 'react';
import { ${componentName}Props } from './${componentName}.types';
import { use${componentName}Styles } from './${componentName}.styles';

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  const classes = use${componentName}Styles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ${componentName} */}
    </div>
  );
};
`;
}

// Get styles content
function getStylesContent(componentName) {
  return `import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const use${componentName}Styles = makeStyles((theme: Theme) => ({
  root: {
    // TODO: Add styles
  },
}));
`;
}

// Get test content
function getTestContent(componentName) {
  return `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    // TODO: Add test assertions
  });
});
`;
}

// Main execution
console.log('🚀 Setting up Legal CRM Frontend project structure...\n');

// Create root directories
const rootDirs = ['src', 'public', 'webpack', 'scripts', 'tests'];
rootDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create the structure
createStructure('.', folderStructure);

console.log('\n✅ Project structure created successfully!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm install');
console.log('2. Copy .env.example to .env');
console.log('3. Start development: npm run dev:all');
console.log('\n🎉 Happy coding!');
