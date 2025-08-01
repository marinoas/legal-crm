import React, { useState, useEffect } from 'react';
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
  useTheme,
  useMediaQuery,
  Paper,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  EventBusy,
  Description,
  Notifications,
  Logout,
  AccountCircle,
  ChevronLeft,
  Lock,
  Print,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useTranslation } from 'react-i18next';

// Limited menu items for clients
const menuItems = [
  {
    id: 'dashboard',
    title: 'Επισκόπηση',
    icon: <Dashboard />,
    path: '/client/dashboard',
  },
  {
    id: 'courts',
    title: 'Τα Δικαστήριά μου',
    icon: <Gavel />,
    path: '/client/courts',
  },
  {
    id: 'appointments',
    title: 'Ραντεβού',
    icon: <EventBusy />,
    path: '/client/appointments',
  },
  {
    id: 'documents',
    title: 'Τα Έγγραφά μου',
    icon: <Description />,
    path: '/client/documents',
  },
];

const drawerWidth = 280;

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const { t } = useTranslation();

  // Disable print except for documents
  useEffect(() => {
    const handleBeforePrint = (e: Event) => {
      if (!location.pathname.includes('/documents')) {
        e.preventDefault();
        e.stopPropagation();
        alert('Η εκτύπωση επιτρέπεται μόνο για έγγραφα');
        return false;
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
      
      {/* Security Notice */}
      <Paper sx={{ m: 2, p: 1.5, bgcolor: 'warning.light' }} elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock fontSize="small" />
          <Typography variant="caption">
            Ασφαλής σύνδεση
          </Typography>
        </Box>
      </Paper>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                selected={isActive}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Folder Number Display */}
      {user?.folderNumber && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Αρ. Φακέλου
            </Typography>
            <Typography variant="h6" color="primary">
              {user.folderNumber}
            </Typography>
          </Box>
        </>
      )}

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
          bgcolor: 'primary.dark',
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
            {user?.firstName} {user?.lastName} - Πύλη Εντολέα
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
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
            keepMounted: true,
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
          minHeight: '100vh',
          bgcolor: 'grey.50',
        }}
      >
        <Toolbar />
        
        {/* Read-Only Notice */}
        <Alert 
          severity="info" 
          icon={<Lock />}
          sx={{ mb: 2 }}
        >
          Αυτή είναι μια προβολή μόνο για ανάγνωση. Για αλλαγές, επικοινωνήστε με το δικηγορικό γραφείο.
        </Alert>

        {/* Print Notice for Documents */}
        {location.pathname.includes('/documents') && (
          <Alert 
            severity="success"
            icon={<Print />}
            sx={{ mb: 2 }}
          >
            Μπορείτε να εκτυπώσετε τα έγγραφά σας χρησιμοποιώντας το κουμπί εκτύπωσης.
          </Alert>
        )}

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
          navigate('/client/profile');
        }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Το Προφίλ μου
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Αποσύνδεση
        </MenuItem>
      </Menu>

      {/* Notifications Menu - Only client-relevant notifications */}
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
          Οι Ειδοποιήσεις μου
        </Typography>
        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">
            Το δικαστήριό σας ορίστηκε για 15/02/2025
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">
            Νέο έγγραφο διαθέσιμο για προβολή
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
