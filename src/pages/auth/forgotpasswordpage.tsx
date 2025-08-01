import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  VpnKey,
  CheckCircle,
  ArrowBack,
  MailOutline,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { validators } from '../../utils/validators';

interface ForgotPasswordFormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');
  
  const steps = [
    t('auth.forgotPassword.step1'),
    t('auth.forgotPassword.step2'),
    t('auth.forgotPassword.step3'),
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setError,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: searchParams.get('email') || '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('newPassword');

  const handleSendCode = async () => {
    const email = getValues('email');
    
    if (!email || !validators.email(email)) {
      setError('email', { message: t('validation.invalidEmail') });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.requestPasswordReset(email);
      setResetToken(response.token);
      setEmailSent(true);
      showSnackbar(t('auth.forgotPassword.codeSent'), 'success');
      setActiveStep(1);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('email', { message: t('auth.emailNotFound') });
      } else if (error.response?.status === 429) {
        showSnackbar(t('auth.tooManyRequests'), 'error');
      } else {
        showSnackbar(t('common.error.generic'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = getValues('code');
    
    if (!code) {
      setError('code', { message: t('validation.required') });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.verifyResetCode(resetToken, code);
      showSnackbar(t('auth.forgotPassword.codeVerified'), 'success');
      setActiveStep(2);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('code', { message: t('auth.forgotPassword.invalidCode') });
      } else if (error.response?.status === 410) {
        setError('code', { message: t('auth.forgotPassword.codeExpired') });
        setEmailSent(false);
        setActiveStep(0);
      } else {
        showSnackbar(t('common.error.generic'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      await authService.resetPassword(resetToken, data.code, data.newPassword);
      showSnackbar(t('auth.forgotPassword.passwordReset'), 'success');
      
      // Show success for 2 seconds then redirect
      setTimeout(() => {
        navigate('/auth/login', {
          state: { email: data.email },
        });
      }, 2000);
    } catch (error: any) {
      if (error.response?.status === 400) {
        showSnackbar(t('auth.forgotPassword.resetFailed'), 'error');
      } else {
        showSnackbar(t('common.error.generic'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <MailOutline sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {t('auth.forgotPassword.enterEmail')}
              </Typography>
            </Box>

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

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendCode}
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.forgotPassword.sendCode')
              )}
            </Button>
          </>
        );

      case 1:
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <VpnKey sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {t('auth.forgotPassword.enterCode')}
              </Typography>
              {emailSent && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  {t('auth.forgotPassword.checkEmail', { email: getValues('email') })}
                </Typography>
              )}
            </Box>

            <Controller
              name="code"
              control={control}
              rules={{
                required: t('validation.required'),
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: t('auth.forgotPassword.codeFormat'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.forgotPassword.verificationCode')}
                  type="text"
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  autoComplete="one-time-code"
                  inputProps={{ maxLength: 6 }}
                  placeholder="000000"
                  autoFocus
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setActiveStep(0);
                  setEmailSent(false);
                }}
              >
                {t('auth.forgotPassword.changeEmail')}
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('auth.forgotPassword.verifyCode')
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={handleSendCode}
                disabled={isLoading}
              >
                {t('auth.forgotPassword.resendCode')}
              </Button>
            </Box>
          </>
        );

      case 2:
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {t('auth.forgotPassword.createNewPassword')}
              </Typography>
            </Box>

            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: t('validation.required'),
                minLength: {
                  value: 8,
                  message: t('validation.minLength', { min: 8 }),
                },
                validate: validators.password,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
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

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) =>
                  value === watchPassword || t('auth.passwordsDoNotMatch'),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              {t('auth.passwordRequirements')}
            </Alert>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.forgotPassword.resetPassword')
              )}
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Link to="/auth/login" style={{ textDecoration: 'none' }}>
              <Button startIcon={<ArrowBack />} color="inherit">
                {t('auth.backToLogin')}
              </Button>
            </Link>
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {t('auth.forgotPassword.title')}
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <Box component="form">
            {renderStepContent()}
          </Box>

          {/* Success Message */}
          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                {t('auth.forgotPassword.successTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.forgotPassword.successMessage')}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Help Text */}
          <Typography variant="body2" color="text.secondary" align="center">
            {t('auth.forgotPassword.helpText')}
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

export default ForgotPasswordPage;
