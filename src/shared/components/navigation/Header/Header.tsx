import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Breadcrumbs,
  Link,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.header || '#ffffff',
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  minHeight: 64,
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.grey[400],
  },
  '& .MuiBreadcrumbs-li': {
    fontSize: '0.875rem',
  },
}));

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface UserMenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
}

export interface HeaderProps {
  /** Page title */
  title?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** User information */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  /** Notification count */
  notificationCount?: number;
  /** User menu actions */
  userMenuActions?: UserMenuAction[];
  /** Notification click handler */
  onNotificationClick?: () => void;
  /** Additional header actions */
  actions?: React.ReactNode;
  /** Whether to show user menu */
  showUserMenu?: boolean;
  /** Whether to show notifications */
  showNotifications?: boolean;
}

/**
 * Header Component
 * 
 * A professional header with breadcrumbs, notifications, and user menu.
 * Used as the top navigation in the Legal CRM portals.
 * 
 * @example
 * ```tsx
 * <Header
 *   title="Επισκόπηση"
 *   breadcrumbs={[
 *     { label: 'Αρχική', href: '/' },
 *     { label: 'Επισκόπηση' }
 *   ]}
 *   user={{ name: 'Μάριος Μαρινάκος', role: 'Δικηγόρος' }}
 *   notificationCount={3}
 * />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs,
  user,
  notificationCount = 0,
  userMenuActions,
  onNotificationClick,
  actions,
  showUserMenu = true,
  showNotifications = true,
}) => {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUserMenuAction = (action: UserMenuAction) => {
    action.onClick();
    handleUserMenuClose();
  };

  const defaultUserMenuActions: UserMenuAction[] = [
    {
      id: 'profile',
      label: 'Προφίλ',
      icon: <PersonIcon />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      id: 'settings',
      label: 'Ρυθμίσεις',
      icon: <SettingsIcon />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'help',
      label: 'Βοήθεια',
      icon: <HelpIcon />,
      onClick: () => console.log('Help clicked'),
      divider: true,
    },
    {
      id: 'logout',
      label: 'Αποσύνδεση',
      icon: <LogoutIcon />,
      onClick: () => console.log('Logout clicked'),
    },
  ];

  const menuActions = userMenuActions || defaultUserMenuActions;

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        {/* Left section - Title and Breadcrumbs */}
        <Box>
          {title && (
            <Typography variant="h5" fontWeight={600} gutterBottom={!!breadcrumbs}>
              {title}
            </Typography>
          )}
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <StyledBreadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                if (isLast || (!item.href && !item.onClick)) {
                  return (
                    <Typography
                      key={index}
                      color="text.secondary"
                      fontSize="0.875rem"
                    >
                      {item.label}
                    </Typography>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    color="inherit"
                    href={item.href}
                    onClick={item.onClick}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </StyledBreadcrumbs>
          )}
        </Box>

        {/* Right section - Actions and User */}
        <UserSection>
          {actions}
          
          {showNotifications && (
            <IconButton
              color="inherit"
              onClick={onNotificationClick}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}

          {showUserMenu && user && (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={500} noWrap>
                  {user.name}
                </Typography>
                {user.role && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user.role}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user && (
              <>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {user.name}
                  </Typography>
                  {user.email && (
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  )}
                  {user.role && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {user.role}
                    </Typography>
                  )}
                </Box>
                <Divider />
              </>
            )}
            
            {menuActions.map((action) => (
              <React.Fragment key={action.id}>
                {action.divider && <Divider />}
                <MenuItem
                  onClick={() => handleUserMenuAction(action)}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {action.icon}
                  </ListItemIcon>
                  <ListItemText primary={action.label} />
                </MenuItem>
              </React.Fragment>
            ))}
          </Menu>
        </UserSection>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header;

