import React from 'react';
import { Box, styled } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 240;

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: `calc(100% - ${DRAWER_WIDTH}px)`,
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: 0, // Remove all padding for tighter layout
  overflow: 'auto',
}));

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <LayoutRoot>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutRoot>
  );
};

export default AdminLayout;

