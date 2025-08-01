import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
  overlay?: boolean;
}

// Pulse animation for the logo/text
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Φόρτωση...',
  fullScreen = true,
  size = 40,
  overlay = false,
}) => {
  const theme = useTheme();

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    ...(fullScreen ? {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: theme.zIndex.modal + 1,
    } : {
      padding: 4,
      minHeight: 200,
    }),
    ...(overlay ? {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(3px)',
    } : {
      backgroundColor: theme.palette.background.default,
    }),
  };

  return (
    <Box sx={containerStyles}>
      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
        }}
      />
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            animation: `${pulse} 2s ease-in-out infinite`,
            mt: 1,
          }}
        >
          {message}
        </Typography>
      )}
      {fullScreen && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 20,
            color: theme.palette.text.disabled,
            fontSize: '0.7rem',
          }}
        >
          Legal CRM © {new Date().getFullYear()}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingScreen;