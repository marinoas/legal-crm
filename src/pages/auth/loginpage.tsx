import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  Gavel,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { validators } from '../../utils/validators';

interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe: boolean;
}

interface LocationState {
  from?: string;
}

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const state = location.state as LocationState;
  const from = state?.from || '/';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const result = await login({
        email: data.email,
        password: data.password,
        twoFactorCode: requires2FA ? data.twoFactorCode : undefined,
        rememberMe: data.rememberMe,
      });

      if (result.requires2FA && !requires2FA) {
        setRequires2FA(true);
        showSnackbar(t('auth.twoFactorRequired'), 'info');
      } else if (result.success) {
        showSnackbar(t('auth.loginSuccess'), 'success');
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      setLoginAttempts(prev => prev + 1);
      
      if (error.response?.status === 401) {
        if (error.response.data.attemptsLeft) {
          setError('root', {
            message: t('auth.invalidCredentialsWithAttempts', {
              attempts: error.response.data.attemptsLeft,
            }),
          });
        } else if (error.response.data.locked) {
          setError('root', {
            message: t('auth.accountLocked', {
              minutes: error.response.data.lockDuration,
            }),
          });
        } else {
          setError('root', { message: t('auth.invalidCredentials') });
        }
      } else {
        setError('root', { message: t('common.error.generic') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo/Icon */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Gavel sx={{ color: 'white', fontSize: 40 }} />
          </Box>

          {/* Title */}
          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.login')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {t('auth.loginSubtitle')}
          </Typography>

          {/* Error Alert */}
          {errors.root && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          {/* Too Many Attempts Warning */}
          {loginAttempts >= 3 && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              {t('auth.tooManyAttempts')}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: validators.email,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('common.email')}
                  type="email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              rules={{
                required: t('validation.required'),
                minLength: {
                  value: 6,
                  message: t('validation.minLength', { min: 6 }),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('common.password')}
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* 2FA Code Field (conditional) */}
            {requires2FA && (
              <Controller
                name="twoFactorCode"
                control={control}
                rules={{
                  required: t('validation.required'),
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: t('auth.invalid2FACode'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.twoFactorCode')}
                    type="text"
                    margin="normal"
                    error={!!errors.twoFactorCode}
                    helperText={errors.twoFactorCode?.message}
                    autoComplete="one-time-code"
                    inputProps={{ maxLength: 6 }}
                    placeholder="000000"
                  />
                )}
              />
            )}

            {/* Remember Me */}
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label={t('auth.rememberMe')}
                  sx={{ mt: 1 }}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.loginButton')
              )}
            </Button>

            {/* Links */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link to="/auth/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  {t('auth.forgotPassword')}
                </Typography>
              </Link>
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  {t('auth.noAccount')}
                </Typography>
              </Link>
            </Box>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }} />

          {/* Footer */}
          <Typography variant="caption" color="text.secondary" align="center">
            {t('auth.securityNote')}
          </Typography>
        </Paper>

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} {t('common.companyName')}. {t('common.allRightsReserved')}
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
