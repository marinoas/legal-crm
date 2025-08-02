import { Components, Theme } from '@mui/material/styles';
import { colors } from './colors';
import { spacing } from './spacing';
import { customShadows } from './shadows';

// MUI Component overrides for Legal CRM
export const components: Components<Omit<Theme, 'components'>> = {
  // Button overrides
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: spacing.borderRadius,
        padding: `${spacing.sm}px ${spacing.md}px`,
        boxShadow: customShadows.button.rest,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: customShadows.button.hover,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          boxShadow: customShadows.button.active,
          transform: 'translateY(0)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: customShadows.button.hover,
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
      sizeSmall: {
        padding: `${spacing.xs}px ${spacing.sm}px`,
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: `${spacing.md}px ${spacing.lg}px`,
        fontSize: '1rem',
      },
    },
  },

  // Card overrides
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadius,
        boxShadow: customShadows.card.rest,
        border: `1px solid ${colors.grey[200]}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: customShadows.card.hover,
          transform: 'translateY(-2px)',
        },
      },
    },
  },

  // Paper overrides
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadius,
      },
      elevation1: {
        boxShadow: customShadows.card.rest,
      },
      elevation2: {
        boxShadow: customShadows.card.hover,
      },
    },
  },

  // TextField overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: spacing.borderRadius,
          transition: 'all 0.2s ease-in-out',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary.light,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: colors.primary.main,
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
          '&.Mui-focused': {
            color: colors.primary.main,
          },
        },
      },
    },
  },

  // Select overrides
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadius,
      },
    },
  },

  // Chip overrides
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadiusSmall,
        fontWeight: 500,
      },
      filled: {
        '&.MuiChip-colorPrimary': {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
        },
        '&.MuiChip-colorSecondary': {
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrastText,
        },
      },
    },
  },

  // AppBar overrides
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: customShadows.header,
        backgroundColor: colors.background.header,
        color: colors.text.primary,
      },
    },
  },

  // Drawer overrides
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: colors.background.sidebar,
        color: colors.text.inverse,
        borderRight: 'none',
      },
    },
  },

  // List overrides
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadiusSmall,
        margin: `${spacing.xs}px 0`,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadiusSmall,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },

  // Table overrides
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: colors.grey[50],
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: colors.text.primary,
          borderBottom: `2px solid ${colors.grey[200]}`,
        },
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: colors.grey[50],
        },
        '&:last-child td': {
          borderBottom: 'none',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: `${spacing.sm}px ${spacing.md}px`,
        borderBottom: `1px solid ${colors.grey[200]}`,
      },
    },
  },

  // Dialog overrides
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: spacing.borderRadiusLarge,
        boxShadow: customShadows.dialog,
      },
    },
  },

  // Menu overrides
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: spacing.borderRadius,
        boxShadow: customShadows.menu,
        border: `1px solid ${colors.grey[200]}`,
        marginTop: spacing.xs,
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadiusSmall,
        margin: `${spacing.xs}px ${spacing.xs}px`,
        '&:hover': {
          backgroundColor: colors.grey[100],
        },
        '&.Mui-selected': {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
      },
    },
  },

  // Tooltip overrides
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: colors.grey[800],
        color: colors.text.inverse,
        fontSize: '0.8125rem',
        borderRadius: spacing.borderRadiusSmall,
        padding: `${spacing.xs}px ${spacing.sm}px`,
      },
      arrow: {
        color: colors.grey[800],
      },
    },
  },

  // Tabs overrides
  MuiTabs: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${colors.grey[200]}`,
      },
      indicator: {
        backgroundColor: colors.primary.main,
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9375rem',
        minHeight: 48,
        '&:hover': {
          color: colors.primary.main,
          backgroundColor: colors.grey[50],
        },
        '&.Mui-selected': {
          color: colors.primary.main,
          fontWeight: 600,
        },
      },
    },
  },

  // Accordion overrides
  MuiAccordion: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadius,
        border: `1px solid ${colors.grey[200]}`,
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },

  // Snackbar overrides
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          borderRadius: spacing.borderRadius,
          fontWeight: 500,
        },
      },
    },
  },

  // Alert overrides
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: spacing.borderRadius,
        fontWeight: 500,
      },
      standardSuccess: {
        backgroundColor: colors.success.light,
        color: colors.success.dark,
      },
      standardError: {
        backgroundColor: colors.error.light,
        color: colors.error.dark,
      },
      standardWarning: {
        backgroundColor: colors.warning.light,
        color: colors.warning.dark,
      },
      standardInfo: {
        backgroundColor: colors.info.light,
        color: colors.info.dark,
      },
    },
  },

  // Breadcrumbs overrides
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
        '& .MuiBreadcrumbs-separator': {
          color: colors.grey[400],
        },
      },
    },
  },

  // Pagination overrides
  MuiPagination: {
    styleOverrides: {
      root: {
        '& .MuiPaginationItem-root': {
          borderRadius: spacing.borderRadiusSmall,
          '&:hover': {
            backgroundColor: colors.grey[100],
          },
          '&.Mui-selected': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
          },
        },
      },
    },
  },
};

export default components;

