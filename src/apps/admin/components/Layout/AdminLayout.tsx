import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import ThemeToggle from './ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container 
          maxWidth={false} 
          sx={{ 
            flexGrow: 1, 
            py: 3,
            px: { xs: 2, sm: 3 }
          }}
        >
          {children}
        </Container>
        <ThemeToggle />
      </Box>
    </Box>
  );
};

export default AdminLayout;

