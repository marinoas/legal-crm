import React from 'react';
import { Box, ButtonGroup, Button } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../../../providers/ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { mode, setMode, isDark } = useTheme();

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000
      }}
    >
      <ButtonGroup variant="contained" size="small">
        <Button
          onClick={() => setMode('light')}
          startIcon={<LightMode />}
          variant={!isDark ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: !isDark ? 'primary.main' : 'transparent',
            color: !isDark ? 'primary.contrastText' : 'primary.main',
            '&:hover': {
              backgroundColor: !isDark ? 'primary.dark' : 'primary.light',
            }
          }}
        >
          Light
        </Button>
        <Button
          onClick={() => setMode('dark')}
          startIcon={<DarkMode />}
          variant={isDark ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: isDark ? 'primary.main' : 'transparent',
            color: isDark ? 'primary.contrastText' : 'primary.main',
            '&:hover': {
              backgroundColor: isDark ? 'primary.dark' : 'primary.light',
            }
          }}
        >
          Dark
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default ThemeToggle;

