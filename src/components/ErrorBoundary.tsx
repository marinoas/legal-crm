import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh" 
          p={2}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Κάτι πήγε στραβά
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.
            </Typography>
            <Button 
              variant="contained" 
              onClick={this.handleReset} 
              sx={{ mt: 2 }}
            >
              Δοκιμάστε ξανά
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

