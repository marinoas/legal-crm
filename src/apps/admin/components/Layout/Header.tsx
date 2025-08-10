import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 600
          }}
        >
          Πύλη Δικηγόρου - Μάριος Μαρινάκος
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Add header actions here if needed */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

