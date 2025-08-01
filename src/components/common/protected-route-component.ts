import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../contexts/PermissionContext';
import LoadingScreen from './LoadingScreen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo,
}) => {
  const { user, loading: authLoading, logout } = useAuth();
  const { hasPermission, hasRole } = usePermission();
  const location = useLocation();

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingScreen message="Έλεγχος πρόσβασης..." />;
  }

  // Not authenticated
  if (!user) {
    const loginPath = `/${location.pathname.split('/')[1]}/login`;
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 3,
            p: 3,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h5" gutterBottom>
            Δεν έχετε πρόσβαση
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Δεν έχετε τα απαραίτητα δικαιώματα για να δείτε αυτή τη σελίδα.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.history.back()}
            >
              Επιστροφή
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                const loginPath = `/${location.pathname.split('/')[1]}/login`;
                window.location.href = loginPath;
              }}
            >
              Αποσύνδεση
            </Button>
          </Box>
        </Box>
      );
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
          p: 3,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h5" gutterBottom>
          Δεν επιτρέπεται η πρόσβαση
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Δεν έχετε την απαραίτητη άδεια "{requiredPermission}" για αυτή την ενέργεια.
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center">
          Εάν πιστεύετε ότι πρόκειται για λάθος, επικοινωνήστε με τον διαχειριστή.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              if (redirectTo) {
                window.location.href = redirectTo;
              } else {
                window.history.back();
              }
            }}
          >
            Επιστροφή
          </Button>
          <Button
            variant="text"
            onClick={() => window.location.href = `/${user.role}`}
          >
            Αρχική Σελίδα
          </Button>
        </Box>
      </Box>
    );
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;