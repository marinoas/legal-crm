import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Business,
  Gavel,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { validators } from '../../utils/validators';
import { PhoneInput } from '../../components/common/PhoneInput';

interface RegisterFormData {
  // Step 1: Account Info
  email: string;
  password: string;
  confirmPassword: string;
  role: 'secretary' | 'client';
  
  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  fatherName?: string;
  phone: string;
  mobile: string;
  
  // Step 3: Professional Info (for secretary)
  specialization?: string;
  barNumber?: string;
  
  // Step 3: Company Info (for client)
  companyName?: string;
  vatNumber?: string;
  
  // Terms
  acceptTerms: boolean;
  acceptGDPR: boolean;
}

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const steps = [
    t('auth.register.step1'),
    t('auth.register.step2'),
    t('auth.register.step3'),
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      firstName: '',
      lastName: '',
      fatherName: '',
      phone: '',
      mobile: '',
      specialization: '',
      barNumber: '',
      companyName: '',
      vatNumber: '',
      acceptTerms: false,
      acceptGDPR: false,
    },
  });

  const watchRole = watch('role');
  const watchPassword = watch('password');

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['email', 'password', 'confirmPassword', 'role'];
        break;
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'phone', 'mobile'];
        break;
      case 2:
        if (watchRole === 'secretary') {
          fieldsToValidate = ['acceptTerms', 'acceptGDPR'];
        } else {
          fieldsToValidate = ['acceptTerms', 'acceptGDPR'];
        }
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (activeStep === steps.length - 1) {
        handleSubmit(onSubmit)();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const registrationData = {
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        fatherName: data.fatherName,
        phone: data.phone,
        mobile: data.mobile,
        ...(data.role === 'secretary' && {
          specialization: data.specialization,
          barNumber: data.barNumber,
        }),
        ...(data.role === 'client' && {
          companyName: data.companyName,
          vatNumber: data.vatNumber,
        }),
      };
      
      await authService.register(registrationData);
      
      showSnackbar(t('auth.registerSuccess'), 'success');
      navigate('/auth/login', {
        state: { email: data.email },
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        showSnackbar(t('auth.emailExists'), 'error');
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
            {/* Email */}
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

            {/* Password */}
            <Controller
              name="password"
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
                  label={t('common.password')}
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
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

            {/* Confirm Password */}
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

            {/* Role Selection */}
            <Controller
              name="role"
              control={control}
              rules={{ required: t('validation.required') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t('auth.accountType')}
                  margin="normal"
                  error={!!errors.role}
                  helperText={errors.role?.message}
                >
                  <MenuItem value="client">{t('roles.client')}</MenuItem>
                  <MenuItem value="secretary">{t('roles.secretary')}</MenuItem>
                </TextField>
              )}
            />
          </>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    autoComplete="given-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    autoComplete="family-name"
                  />
                )}
              />
            </Grid>

            {/* Father Name */}
            <Grid item xs={12}>
              <Controller
                name="fatherName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('common.fatherName')}
                    error={!!errors.fatherName}
                    helperText={errors.fatherName?.message}
                  />
                )}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: t('validation.required'),
                  validate: validators.phone,
                }}
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    fullWidth
                    label={t('common.phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            {/* Mobile */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="mobile"
                control={control}
                rules={{
                  required: t('validation.required'),
                  validate: validators.mobile,
                }}
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    fullWidth
                    label={t('common.mobile')}
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                    mobile
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <>
            {watchRole === 'secretary' ? (
              <>
                {/* Secretary specific fields */}
                <Controller
                  name="specialization"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.specialization')}
                      margin="normal"
                      error={!!errors.specialization}
                      helperText={errors.specialization?.message}
                    />
                  )}
                />
                
                <Controller
                  name="barNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.barNumber')}
                      margin="normal"
                      error={!!errors.barNumber}
                      helperText={errors.barNumber?.message}
                    />
                  )}
                />
              </>
            ) : (
              <>
                {/* Client specific fields */}
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.companyName')}
                      margin="normal"
                      error={!!errors.companyName}
                      helperText={errors.companyName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="vatNumber"
                  control={control}
                  rules={{
                    validate: (value) => 
                      !value || validators.vatNumber(value) || t('validation.invalidVat'),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('common.vatNumber')}
                      margin="normal"
                      error={!!errors.vatNumber}
                      helperText={errors.vatNumber?.message}
                    />
                  )}
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Terms and Conditions */}
            <Controller
              name="acceptTerms"
              control={control}
              rules={{
                required: t('auth.mustAcceptTerms'),
              }}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t('auth.acceptTerms')}{' '}
                      <Link to="/terms" target="_blank">
                        {t('auth.termsLink')}
                      </Link>
                    </Typography>
                  }
                />
              )}
            />
            {errors.acceptTerms && (
              <Typography color="error" variant="caption">
                {errors.acceptTerms.message}
              </Typography>
            )}

            {/* GDPR Consent */}
            <Controller
              name="acceptGDPR"
              control={control}
              rules={{
                required: t('auth.mustAcceptGDPR'),
              }}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t('auth.acceptGDPR')}{' '}
                      <Link to="/privacy" target="_blank">
                        {t('auth.privacyLink')}
                      </Link>
                    </Typography>
                  }
                />
              )}
            />
            {errors.acceptGDPR && (
              <Typography color="error" variant="caption">
                {errors.acceptGDPR.message}
              </Typography>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
            <Typography component="h1" variant="h5">
              {t('auth.register')}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {t('auth.registerSubtitle')}
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                {t('common.back')}
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === steps.length - 1 ? (
                  t('auth.registerButton')
                ) : (
                  t('common.next')
                )}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/auth/login" style={{ textDecoration: 'none' }}>
                <Typography component="span" variant="body2" color="primary">
                  {t('auth.loginHere')}
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} {t('common.companyName')}. {t('common.allRightsReserved')}
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
