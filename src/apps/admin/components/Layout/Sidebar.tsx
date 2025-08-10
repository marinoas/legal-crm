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
  Badge
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
  Settings
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const menuItems = [
  { path: '/', label: 'Επισκόπηση', icon: Dashboard },
  { path: '/courts', label: 'Δικαστήρια', icon: Gavel, badge: 3 },
  { path: '/deadlines', label: 'Προθεσμίες', icon: Schedule, badge: 7 },
  { path: '/pending', label: 'Εκκρεμότητες', icon: Assignment, badge: 12 },
  { path: '/appointments', label: 'Ραντεβού', icon: Event, badge: 5 },
  { path: '/clients', label: 'Εντολείς', icon: People, badge: '99+' },
  { path: '/contacts', label: 'Επαφές', icon: Contacts, badge: 156 },
  { path: '/financial', label: 'Οικονομικά', icon: Receipt, badge: 2 },
  { path: '/settings', label: 'Ρυθμίσεις', icon: Settings },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, bgcolor: '#6366f1' }}>
          ΜΜ
        </Avatar>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Μάριος Μαρινάκος
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Δικηγόρος
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#6366f1' : 'rgba(255,255,255,0.7)' }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      <Icon />
                    </Badge>
                  ) : (
                    <Icon />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Legal CRM v2.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

