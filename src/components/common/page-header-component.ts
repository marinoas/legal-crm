import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Action[];
  backButton?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  onHelp?: () => void;
  loading?: boolean;
  status?: {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  sx?: any;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  backButton = false,
  onBack,
  onRefresh,
  onHelp,
  loading = false,
  status,
  sx = {},
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mb: 3, ...sx }}>
        <Skeleton variant="text" width={200} height={32} />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Skeleton variant="text" width={300} height={20} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3, ...sx }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" variant="body2">
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbClick(crumb.path);
                }}
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                variant="body2"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Main Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {backButton && (
            <Tooltip title="Πίσω">
              <IconButton onClick={handleBack} size="small">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4" component="h1">
                {title}
              </Typography>
              {status && (
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                />
              )}
            </Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right Section - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRefresh && (
            <Tooltip title="Ανανέωση">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onHelp && (
            <Tooltip title="Βοήθεια">
              <IconButton onClick={onHelp} size="small">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
              onClick={action.onClick}
              disabled={action.disabled}
              startIcon={action.icon}
              size="medium"
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;