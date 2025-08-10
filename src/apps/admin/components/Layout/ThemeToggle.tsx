import React from 'react';
import { 
  Box, 
  ButtonGroup, 
  Button, 
  Paper,
  Tooltip,
  Fade
} from '@mui/material';
import { 
  LightMode, 
  DarkMode, 
  SettingsBrightness 
} from '@mui/icons-material';
import { useTheme } from '../../../../providers/ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { mode, setMode, isDark } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: LightMode,
      tooltip: 'Φωτεινό θέμα'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: DarkMode,
      tooltip: 'Σκούρο θέμα'
    },
    {
      value: 'auto' as const,
      label: 'Auto',
      icon: SettingsBrightness,
      tooltip: 'Αυτόματο (σύστημα)'
    }
  ];

  return (
    <Fade in timeout={300}>
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        <Paper 
          elevation={8}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            background: 'background.paper',
          }}
        >
          <ButtonGroup 
            variant="contained" 
            size="small"
            sx={{
              '& .MuiButton-root': {
                minWidth: 60,
                height: 40,
                borderRadius: 0,
                border: 'none',
                backgroundColor: 'transparent',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:not(:last-child)': {
                  borderRight: '1px solid',
                  borderRightColor: 'divider',
                },
              }
            }}
          >
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive = mode === option.value;
              
              return (
                <Tooltip 
                  key={option.value}
                  title={option.tooltip}
                  placement="top"
                  arrow
                >
                  <Button
                    onClick={() => setMode(option.value)}
                    className={isActive ? 'active' : ''}
                    startIcon={<IconComponent sx={{ fontSize: 18 }} />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 600 : 500,
                      textTransform: 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {option.label}
                  </Button>
                </Tooltip>
              );
            })}
          </ButtonGroup>
        </Paper>
      </Box>
    </Fade>
  );
};

export default ThemeToggle;

