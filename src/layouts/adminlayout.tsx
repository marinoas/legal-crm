import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  People,
  Event,
  EventBusy,
  Description,
  Euro,
  Contacts,
  Settings,
  SupervisorAccount,
  Analytics,
  ExpandLess,
  ExpandMore,
  Notifications,
  Logout,
  AccountCircle,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useTranslation } from 'react-i18next';

// Menu items configuration
const menuItems = [
  {
    id: 'dashboard',
    title: 'Επισκόπηση',
    icon: <Dashboard />,
    path: '/admin/dashboard',
  },
  {
    id: 'courts',
    title: 'Δικαστήρια',
    icon: <Gavel />,
    path: '/admin/courts',
  },
  {
    id: 'clients',
    title: 'Εντολείς',
    icon: <People />,
    path: '/admin/clients',
  },
  {
    id: 'deadlines',
    title: 'Προθεσμίες',
    icon: <Event />,
    path: '/admin/deadlines',
  },
  {
    id: 'appointments',
    title: 'Ραντεβού',
    icon: <EventBusy />,
    path: '/admin/appointments',
  },
  {
    id: 'documents',
    title: 'Έγγραφα',
    icon: <Description />,
    path: '/admin/documents',
  },
  {
    id: 'financial',
    title: 'Οικονομικά',
    icon: <Euro />,
    path: '/admin/financial',
    children: [
      { id: 'overview', title: 'Επισκόπηση', path: '/admin/financial/overview' },
      { id: 'invoices', title: 'Τιμολόγια', path: '/admin/financial/invoices' },
      { id: 'payments', title: 'Πληρωμές', path: '/admin/financial/payments' },
      { id: 'expenses', title: 'Έξοδα', path: '/admin/financial/expenses' },
    ],
  },
  {
    id: 'contacts',
    title: 'Επαφές',
    icon: <Contacts />,
    path: '/admin/contacts',
  },
  {
    id: 'analytics',
    title: 'Στατιστικά',
    icon: <Analytics />,
    path: '/admin/analytics',
  },
  {
    id: 'divider1',
    divider: true,
  },
  {
    id: 'users',
    title: 'Χρήστες',
    icon: <SupervisorAccount />,
    path: '/admin/users',
  },
  {
    id: 'settings',
    title: 'Ρυθμίσεις',
    icon: <Settings />,
    path: '/admin/settings',
  },
];

const drawerWidth = 280;

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const { t } = useTranslation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Legal CRM
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          if (item.divider) {
            return <Divider key={item.id} sx={{ my: 1 }} />;
          }

          const isExpanded = expandedItems.includes(item.id);
          const isActive = location.pathname.startsWith(item.path);

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => 
                    item.children 
                      ? handleExpandClick(item.id) 
                      : handleMenuClick(item.path)
                  }
                  selected={isActive}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {item.children && (
                    isExpanded ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              {item.children && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.id}
                        sx={{ pl: 4 }}
                        onClick={() => handleMenuClick(child.path)}
                        selected={location.pathname === child.path}
                      >
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {isConnected ? '🟢 Συνδεδεμένο' : '🔴 Αποσυνδεδεμένο'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.firstName} {user?.lastName} - Διαχειριστής
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/admin/profile');
        }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Προφίλ
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Αποσύνδεση
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Typography variant="h6" sx={{ p: 2 }}>
          Ειδοποιήσεις
        </Typography>
        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">
            Νέο δικαστήριο προστέθηκε
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">
            Προθεσμία λήγει σε 3 ημέρες
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
