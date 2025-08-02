import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Sidebar, SidebarProps } from '../../navigation/Sidebar/Sidebar';
import { Header, HeaderProps } from '../../navigation/Header/Header';

// Styled components
const LayoutRoot = styled(Box)({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
});

const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sidebarOpen' && prop !== 'sidebarWidth',
})<{ sidebarOpen: boolean; sidebarWidth: number; collapsedWidth: number }>(
  ({ theme, sidebarOpen, sidebarWidth, collapsedWidth }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: sidebarOpen ? sidebarWidth : collapsedWidth,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflow: 'hidden',
  })
);

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // Header height
  overflow: 'auto',
  backgroundColor: theme.palette.background.default,
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const MobileOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: theme.zIndex.drawer - 1,
  display: 'none',
  
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

// Types
export interface PageLayoutProps {
  /** Sidebar configuration */
  sidebar?: Omit<SidebarProps, 'open' | 'onToggleCollapse'>;
  /** Header configuration */
  header?: HeaderProps;
  /** Page content */
  children: React.ReactNode;
  /** Initial sidebar state */
  defaultSidebarOpen?: boolean;
  /** Whether to show sidebar */
  showSidebar?: boolean;
  /** Whether to show header */
  showHeader?: boolean;
  /** Custom sidebar width */
  sidebarWidth?: number;
  /** Custom collapsed sidebar width */
  collapsedSidebarWidth?: number;
  /** Page background color */
  backgroundColor?: string;
  /** Content padding */
  contentPadding?: number | string;
}

/**
 * Page Layout Component
 * 
 * A complete page layout with sidebar, header, and content area.
 * Provides responsive behavior and mobile-friendly navigation.
 * 
 * @example
 * ```tsx
 * <PageLayout
 *   sidebar={{
 *     title: "Legal CRM",
 *     items: navigationItems,
 *     selectedId: "dashboard"
 *   }}
 *   header={{
 *     title: "Επισκόπηση",
 *     user: { name: "Μάριος Μαρινάκος" }
 *   }}
 * >
 *   <YourPageContent />
 * </PageLayout>
 * ```
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  sidebar,
  header,
  children,
  defaultSidebarOpen = true,
  showSidebar = true,
  showHeader = true,
  sidebarWidth = 280,
  collapsedSidebarWidth = 64,
  backgroundColor,
  contentPadding,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(
    isMobile ? false : defaultSidebarOpen
  );

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Adjust sidebar behavior for mobile
  const effectiveSidebarWidth = isMobile ? sidebarWidth : sidebarWidth;
  const effectiveCollapsedWidth = isMobile ? 0 : collapsedSidebarWidth;

  return (
    <LayoutRoot>
      <CssBaseline />
      
      {showSidebar && sidebar && (
        <>
          <Sidebar
            {...sidebar}
            open={sidebarOpen}
            width={effectiveSidebarWidth}
            collapsedWidth={effectiveCollapsedWidth}
            onToggleCollapse={handleToggleSidebar}
          />
          
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <MobileOverlay onClick={handleMobileOverlayClick} />
          )}
        </>
      )}

      <MainContent
        sidebarOpen={showSidebar ? sidebarOpen : false}
        sidebarWidth={showSidebar ? effectiveSidebarWidth : 0}
        collapsedWidth={showSidebar ? effectiveCollapsedWidth : 0}
      >
        {showHeader && header && (
          <Header
            {...header}
            actions={
              <>
                {header.actions}
                {/* Add mobile menu button if needed */}
              </>
            }
          />
        )}

        <ContentArea
          sx={{
            backgroundColor: backgroundColor || theme.palette.background.default,
            padding: contentPadding !== undefined ? contentPadding : undefined,
            marginTop: showHeader ? 64 : 0,
          }}
        >
          {children}
        </ContentArea>
      </MainContent>
    </LayoutRoot>
  );
};

export default PageLayout;

