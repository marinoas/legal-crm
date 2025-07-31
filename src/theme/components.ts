import { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: '#6b6b6b #2b2b2b',
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          backgroundColor: '#2b2b2b',
          width: '12px',
          height: '12px',
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: '#6b6b6b',
          minHeight: 24,
          border: '3px solid #2b2b2b',
        },
        '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
          backgroundColor: '#959595',
        },
        '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
          backgroundColor: '#959595',
        },
        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#959595',
        },
        '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
          backgroundColor: '#2b2b2b',
        },
      },
    },
  },
  
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        padding: '6px 16px',
        transition: 'all 0.2s ease-in-out',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      },
    },
  },
  
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      elevation2: {
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      },
      elevation3: {
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '& fieldset': {
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderWidth: 2,
          },
          '&.Mui-focused fieldset': {
            borderWidth: 2,
          },
        },
      },
    },
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
  },
  
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
        fontSize: '0.75rem',
      },
      filled: {
        backgroundColor: 'rgba(0,0,0,0.08)',
      },
    },
  },
  
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        padding: 8,
      },
    },
  },
  
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 600,
        paddingBottom: 8,
      },
    },
  },
  
  MuiDialogContent: {
    styleOverrides: {
      root: {
        paddingTop: 8,
      },
    },
  },
  
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
        gap: 8,
      },
    },
  },
  
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
      },
      head: {
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
  },
  
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        },
      },
    },
  },
  
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        marginRight: 16,
        minWidth: 0,
        padding: '6px 12px',
        '&.Mui-selected': {
          fontWeight: 600,
        },
      },
    },
  },
  
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontSize: '0.875rem',
      },
      standardSuccess: {
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        color: '#1b5e20',
      },
      standardError: {
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        color: '#c62828',
      },
      standardWarning: {
        backgroundColor: 'rgba(237, 108, 2, 0.1)',
        color: '#e65100',
      },
      standardInfo: {
        backgroundColor: 'rgba(2, 136, 209, 0.1)',
        color: '#01579b',
      },
    },
  },
  
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.75rem',
        padding: '4px 8px',
      },
    },
  },
  
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      colorDefault: {
        backgroundColor: '#1976d2',
        color: '#ffffff',
      },
    },
  },
  
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize: '0.75rem',
        height: 20,
        minWidth: 20,
        borderRadius: 10,
      },
    },
  },
  
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 6,
      },
      bar: {
        borderRadius: 4,
      },
    },
  },
  
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
  
  MuiDatePicker: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
        marginTop: 4,
      },
      listbox: {
        padding: 4,
        '& .MuiAutocomplete-option': {
          borderRadius: 4,
          margin: '2px 4px',
        },
      },
    },
  },
  
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
  },
  
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
  },
  
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
        marginTop: 4,
        minWidth: 180,
      },
      list: {
        padding: 4,
      },
    },
  },
  
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        margin: '2px 4px',
        padding: '8px 12px',
        fontSize: '0.875rem',
      },
    },
  },
};
