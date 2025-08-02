import React from 'react';
import { Tabs, Tab, Badge, Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.background.paper,
  
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.9375rem',
  minHeight: 48,
  padding: theme.spacing(1, 2),
  borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
  transition: 'all 0.2s ease-in-out',
  color: theme.palette.text.secondary,
  
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[50],
  },
  
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: theme.palette.background.paper,
  },
  
  '&.Mui-disabled': {
    opacity: 0.5,
  },
  
  // Mobile styles
  [theme.breakpoints.down('md')]: {
    fontSize: '0.875rem',
    minWidth: 'auto',
    padding: theme.spacing(1, 1.5),
  },
}));

const TabContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

// Types
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabNavigationProps {
  /** Tab items */
  tabs: TabItem[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether tabs are scrollable */
  scrollable?: boolean;
  /** Scroll buttons behavior */
  scrollButtons?: 'auto' | 'desktop' | 'on' | 'off';
  /** Tab variant */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** Show tab content */
  showContent?: boolean;
  /** Custom tab content */
  customContent?: React.ReactNode;
  /** Additional styling */
  sx?: any;
}

/**
 * Tab Navigation Component
 * 
 * A professional tab navigation with badge support and responsive behavior.
 * Used for section navigation in the Legal CRM portals.
 * 
 * @example
 * ```tsx
 * <TabNavigation
 *   tabs={[
 *     { id: 'overview', label: 'Επισκόπηση', icon: <DashboardIcon /> },
 *     { id: 'clients', label: 'Εντολείς', badge: 5 },
 *     { id: 'cases', label: 'Υποθέσεις' }
 *   ]}
 *   activeTab="overview"
 *   onTabChange={handleTabChange}
 * />
 * ```
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'horizontal',
  scrollable = true,
  scrollButtons = 'auto',
  variant = 'scrollable',
  showContent = true,
  customContent,
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  const renderTabLabel = (tab: TabItem) => {
    const labelContent = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {tab.icon}
        <span>{tab.label}</span>
      </Box>
    );

    if (tab.badge) {
      return (
        <Badge
          badgeContent={tab.badge}
          color="error"
          variant={typeof tab.badge === 'number' ? 'standard' : 'dot'}
          sx={{
            '& .MuiBadge-badge': {
              right: -8,
              top: -4,
            },
          }}
        >
          {labelContent}
        </Badge>
      );
    }

    return labelContent;
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <Box sx={sx}>
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        orientation={orientation}
        variant={isMobile ? 'scrollable' : variant}
        scrollButtons={scrollButtons}
        allowScrollButtonsMobile
        aria-label="navigation tabs"
      >
        {tabs.map((tab) => (
          <StyledTab
            key={tab.id}
            value={tab.id}
            label={renderTabLabel(tab)}
            disabled={tab.disabled}
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
          />
        ))}
      </StyledTabs>

      {showContent && (
        <TabContent
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {customContent || activeTabContent}
        </TabContent>
      )}
    </Box>
  );
};

export default TabNavigation;

