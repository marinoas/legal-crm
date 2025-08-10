import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Box,
  Avatar,
  Badge,
  Divider,
  Button,
  ButtonGroup,
  styled,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Gavel,
  Schedule,
  Assignment,
  Event,
  People,
  Contacts,
  Receipt,
  Settings,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { navigationItems, userProfile } from '../../../../data/navigationData';
import { useTheme } from '../../../../providers/ThemeProvider';

const DRAWER_WIDTH = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    borderRight: 'none',
    color: 'white',
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  margin: '0 auto 12px',
  backgroundColor: '#6366f1',
  fontSize: '1.25rem',
  fontWeight: 600,
}));

const NavigationList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
}));

const NavListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(0.5),
}));

const NavButton = styled(ListItemButton)<{ isActive?: boolean }>(({ theme, isActive }) => ({
  borderRadius: 8,
  margin: '0 8px',
  padding: '12px 16px',
  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: isActive 
      ? 'rgba(99, 102, 241, 0.3)' 
      : 'rgba(99, 102, 241, 0.1)',
  },
  '& .MuiListItemIcon-root': {
    color: isActive ? '#6366f1' : 'rgba(255,255,255,0.7)',
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.875rem',
  },
}));

const ThemeToggleSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(255,255,255,0.1)',
}));

const ThemeButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiButton-root': {
    flex: 1,
    padding: '8px 12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      color: 'white',
    },
    '&.active': {
      backgroundColor: '#6366f1',
      color: 'white',
      '&:hover': {
        backgroundColor: '#5856eb',
      },
    },
  },
}));

const VersionInfo = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.75rem',
  marginTop: theme.spacing(1),
}));

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'dashboard':
      return Dashboard;
    case 'gavel':
      return Gavel;
    case 'schedule':
      return Schedule;
    case 'assignment':
      return Assignment;
    case 'event':
      return Event;
    case 'people':
      return People;
    case 'contacts':
      return Contacts;
    case 'receipt':
      return Receipt;
    case 'settings':
      return Settings;
    default:
      return Dashboard;
  }
};

const getBadgeColor = (badgeType?: string) => {
  switch (badgeType) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode, isDark } = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleThemeChange = (newMode: 'light' | 'dark') => {
    setMode(newMode);
  };

  return (
    <StyledDrawer variant="permanent">
      {/* User Profile Section */}
      <UserSection>
        <UserAvatar>
          {userProfile.initials}
        </UserAvatar>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5
          }}
        >
          {userProfile.fullName}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.875rem'
          }}
        >
          {userProfile.role}
        </Typography>
      </UserSection>

      {/* Navigation Menu */}
      <NavigationList>
        {navigationItems.map((item) => {
          const IconComponent = getIconComponent(item.icon);
          const isActive = location.pathname === item.path;
          
          return (
            <NavListItem key={item.id}>
              <NavButton
                isActive={isActive}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge 
                      badgeContent={item.badge > 99 ? '99+' : item.badge} 
                      color={getBadgeColor(item.badgeType) as any}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          height: 18,
                          minWidth: 18,
                          fontWeight: 600
                        }
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20 }} />
                    </Badge>
                  ) : (
                    <IconComponent sx={{ fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </NavButton>
            </NavListItem>
          );
        })}
      </NavigationList>

      {/* Theme Toggle Section */}
      <ThemeToggleSection>
        <ThemeButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<LightMode sx={{ fontSize: 16 }} />}
            className={mode === 'light' ? 'active' : ''}
            onClick={() => handleThemeChange('light')}
          >
            Light
          </Button>
          <Button
            startIcon={<DarkMode sx={{ fontSize: 16 }} />}
            className={mode === 'dark' ? 'active' : ''}
            onClick={() => handleThemeChange('dark')}
          >
            Dark
          </Button>
        </ThemeButtonGroup>
        
        <VersionInfo>
          Legal CRM v2.0
        </VersionInfo>
      </ThemeToggleSection>
    </StyledDrawer>
  );
};

export default Sidebar;

