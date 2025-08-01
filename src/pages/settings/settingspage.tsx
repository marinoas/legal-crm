import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  InputAdornment,
  useTheme,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Check as CheckIcon,
  Euro as EuroIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import settingsService from '../../services/settingsService';
import usersService from '../../services/usersService';
import { handleApiError } from '../../utils/errorHandler';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
}

interface Settings {
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    logo?: string;
  };
  appointments: {
    duration: number;
    bufferTime: number;
    price: number;
    workingDays: number[];
    workingHours: {
      start: string;
      end: string;
    };
    breakTime?: {
      start: string;
      end: string;
    };
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    from: string;
  };
  payment: {
    stripe: {
      enabled: boolean;
      publishableKey: string;
    };
    viva: {
      enabled: boolean;
      merchantId: string;
      apiKey: string;
    };
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderDays: number[];
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retentionDays: number;
    autoBackupTime: string;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  system: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    folderNumberStart: number;
  };
}

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchEmailTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersService.getAll();
      setUsers(response.data);
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await settingsService.getEmailTemplates();
      setEmailTemplates(response.data);
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleSaveSettings = async (section: keyof Settings, data: any) => {
    try {
      setSaving(true);
      await settingsService.updateSettings(section, data);
      enqueueSnackbar(t('settings.saveSuccess'), { variant: 'success' });
      fetchSettings();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await settingsService.createBackup();
      enqueueSnackbar(t('settings.backupSuccess'), { variant: 'success' });
      // Download backup file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleRestore = async (file: File) => {
    try {
      await settingsService.restoreBackup(file);
      enqueueSnackbar(t('settings.restoreSuccess'), { variant: 'success' });
      window.location.reload();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  // Business Settings Form
  const businessForm = useFormik({
    initialValues: settings?.business || {
      name: '',
      address: '',
      phone: '',
      email: '',
      taxId: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required(t('required')),
      email: Yup.string().email(t('invalidEmail')).required(t('required')),
      phone: Yup.string().required(t('required')),
      taxId: Yup.string().required(t('required')),
    }),
    onSubmit: (values) => handleSaveSettings('business', values),
  });

  // Appointment Settings Form
  const appointmentForm = useFormik({
    initialValues: settings?.appointments || {
      duration: 30,
      bufferTime: 15,
      price: 50,
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '18:00' },
    },
    enableReinitialize: true,
    onSubmit: (values) => handleSaveSettings('appointments', values),
  });

  // User Form
  const userForm = useFormik({
    initialValues: {
      firstName: selectedUser?.firstName || '',
      lastName: selectedUser?.lastName || '',
      email: selectedUser?.email || '',
      role: selectedUser?.role || 'secretary',
      password: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      firstName: Yup.string().required(t('required')),
      lastName: Yup.string().required(t('required')),
      email: Yup.string().email(t('invalidEmail')).required(t('required')),
      role: Yup.string().required(t('required')),
      password: selectedUser ? Yup.string() : Yup.string().min(8).required(t('required')),
      confirmPassword: selectedUser
        ? Yup.string()
        : Yup.string()
            .oneOf([Yup.ref('password')], t('passwordsMustMatch'))
            .required(t('required')),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedUser) {
          await usersService.update(selectedUser._id, values);
          enqueueSnackbar(t('settings.userUpdateSuccess'), { variant: 'success' });
        } else {
          await usersService.create(values);
          enqueueSnackbar(t('settings.userCreateSuccess'), { variant: 'success' });
        }
        setOpenUserDialog(false);
        setSelectedUser(null);
        fetchUsers();
        userForm.resetForm();
      } catch (error) {
        handleApiError(error, enqueueSnackbar, t);
      }
    },
  });

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await usersService.delete(selectedUser._id);
      enqueueSnackbar(t('settings.userDeleteSuccess'), { variant: 'success' });
      setDeleteUserDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersService.update(userId, { isActive });
      enqueueSnackbar(
        isActive ? t('settings.userActivated') : t('settings.userDeactivated'),
        { variant: 'success' }
      );
      fetchUsers();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const renderBusinessSettings = () => (
    <form onSubmit={businessForm.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('settings.businessInfo')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="name"
            label={t('settings.businessName')}
            value={businessForm.values.name}
            onChange={businessForm.handleChange}
            error={businessForm.touched.name && Boolean(businessForm.errors.name)}
            helperText={businessForm.touched.name && businessForm.errors.name}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="taxId"
            label={t('settings.taxId')}
            value={businessForm.values.taxId}
            onChange={businessForm.handleChange}
            error={businessForm.touched.taxId && Boolean(businessForm.errors.taxId)}
            helperText={businessForm.touched.taxId && businessForm.errors.taxId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="address"
            label={t('settings.address')}
            value={businessForm.values.address}
            onChange={businessForm.handleChange}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="phone"
            label={t('settings.phone')}
            value={businessForm.values.phone}
            onChange={businessForm.handleChange}
            error={businessForm.touched.phone && Boolean(businessForm.errors.phone)}
            helperText={businessForm.touched.phone && businessForm.errors.phone}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="email"
            label={t('settings.email')}
            value={businessForm.values.email}
            onChange={businessForm.handleChange}
            error={businessForm.touched.email && Boolean(businessForm.errors.email)}
            helperText={businessForm.touched.email && businessForm.errors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {t('save')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderAppointmentSettings = () => (
    <form onSubmit={appointmentForm.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('settings.appointmentSettings')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            name="duration"
            label={t('settings.appointmentDuration')}
            value={appointmentForm.values.duration}
            onChange={appointmentForm.handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">{t('minutes')}</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            name="bufferTime"
            label={t('settings.bufferTime')}
            value={appointmentForm.values.bufferTime}
            onChange={appointmentForm.handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">{t('minutes')}</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            name="price"
            label={t('settings.appointmentPrice')}
            value={appointmentForm.values.price}
            onChange={appointmentForm.handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="time"
            name="workingHours.start"
            label={t('settings.workingHoursStart')}
            value={appointmentForm.values.workingHours.start}
            onChange={appointmentForm.handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="time"
            name="workingHours.end"
            label={t('settings.workingHoursEnd')}
            value={appointmentForm.values.workingHours.end}
            onChange={appointmentForm.handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            {t('settings.workingDays')}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {[
              { value: 1, label: t('monday') },
              { value: 2, label: t('tuesday') },
              { value: 3, label: t('wednesday') },
              { value: 4, label: t('thursday') },
              { value: 5, label: t('friday') },
              { value: 6, label: t('saturday') },
              { value: 0, label: t('sunday') },
            ].map((day) => (
              <Chip
                key={day.value}
                label={day.label}
                onClick={() => {
                  const days = appointmentForm.values.workingDays;
                  if (days.includes(day.value)) {
                    appointmentForm.setFieldValue(
                      'workingDays',
                      days.filter((d) => d !== day.value)
                    );
                  } else {
                    appointmentForm.setFieldValue('workingDays', [...days, day.value]);
                  }
                }}
                color={appointmentForm.values.workingDays.includes(day.value) ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {t('save')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderEmailTemplates = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('settings.emailTemplates')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedTemplate(null);
            setOpenTemplateDialog(true);
          }}
        >
          {t('settings.newTemplate')}
        </Button>
      </Box>
      <Grid container spacing={2}>
        {emailTemplates.map((template) => (
          <Grid item xs={12} md={6} key={template._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{t(`emailTemplate.${template.name}`)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.subject}
                    </Typography>
                    <Box display="flex" gap={0.5} mt={1}>
                      {template.variables.map((variable) => (
                        <Chip key={variable} label={`{{${variable}}}`} size="small" />
                      ))}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => {
                      setSelectedTemplate(template);
                      setOpenTemplateDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderUserManagement = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('settings.userManagement')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedUser(null);
            setOpenUserDialog(true);
          }}
        >
          {t('settings.newUser')}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('email')}</TableCell>
              <TableCell>{t('role')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('2fa')}</TableCell>
              <TableCell>{t('lastLogin')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{`${user.lastName} ${user.firstName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={t(`role.${user.role}`)} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.isActive}
                    onChange={(e) => handleToggleUserStatus(user._id, e.target.checked)}
                    disabled={user._id === user._id} // Can't deactivate self
                  />
                </TableCell>
                <TableCell>
                  {user.twoFactorEnabled ? (
                    <CheckIcon color="success" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    new Date(user.lastLogin).toLocaleDateString('el-GR')
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('never')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelectedUser(user);
                      setOpenUserDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedUser(user);
                      setDeleteUserDialog(true);
                    }}
                    disabled={user._id === user._id} // Can't delete self
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPaymentSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('settings.paymentGateways')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Stripe</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.payment.stripe.enabled || false}
                    onChange={(e) =>
                      handleSaveSettings('payment', {
                        ...settings?.payment,
                        stripe: { ...settings?.payment.stripe, enabled: e.target.checked },
                      })
                    }
                  />
                }
                label={t('enabled')}
              />
            </Box>
            <TextField
              fullWidth
              label={t('settings.stripePublishableKey')}
              value={settings?.payment.stripe.publishableKey || ''}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  payment: {
                    ...settings!.payment,
                    stripe: { ...settings!.payment.stripe, publishableKey: e.target.value },
                  },
                })
              }
              disabled={!settings?.payment.stripe.enabled}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => handleSaveSettings('payment', settings?.payment)}
              disabled={saving || !settings?.payment.stripe.enabled}
            >
              {t('save')}
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Viva Wallet</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.payment.viva.enabled || false}
                    onChange={(e) =>
                      handleSaveSettings('payment', {
                        ...settings?.payment,
                        viva: { ...settings?.payment.viva, enabled: e.target.checked },
                      })
                    }
                  />
                }
                label={t('enabled')}
              />
            </Box>
            <TextField
              fullWidth
              label={t('settings.vivaMerchantId')}
              value={settings?.payment.viva.merchantId || ''}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  payment: {
                    ...settings!.payment,
                    viva: { ...settings!.payment.viva, merchantId: e.target.value },
                  },
                })
              }
              disabled={!settings?.payment.viva.enabled}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('settings.vivaApiKey')}
              value={settings?.payment.viva.apiKey || ''}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  payment: {
                    ...settings!.payment,
                    viva: { ...settings!.payment.viva, apiKey: e.target.value },
                  },
                })
              }
              disabled={!settings?.payment.viva.enabled}
              type="password"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => handleSaveSettings('payment', settings?.payment)}
              disabled={saving || !settings?.payment.viva.enabled}
            >
              {t('save')}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBackupSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('settings.backupRestore')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('settings.automaticBackup')}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.backup.enabled || false}
                  onChange={(e) =>
                    handleSaveSettings('backup', {
                      ...settings?.backup,
                      enabled: e.target.checked,
                    })
                  }
                />
              }
              label={t('enabled')}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!settings?.backup.enabled}>
                  <InputLabel>{t('settings.backupFrequency')}</InputLabel>
                  <Select
                    value={settings?.backup.frequency || 'daily'}
                    onChange={(e) =>
                      setSettings({
                        ...settings!,
                        backup: { ...settings!.backup, frequency: e.target.value },
                      })
                    }
                  >
                    <MenuItem value="daily">{t('daily')}</MenuItem>
                    <MenuItem value="weekly">{t('weekly')}</MenuItem>
                    <MenuItem value="monthly">{t('monthly')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label={t('settings.backupTime')}
                  value={settings?.backup.autoBackupTime || '03:00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      backup: { ...settings!.backup, autoBackupTime: e.target.value },
                    })
                  }
                  disabled={!settings?.backup.enabled}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.retentionDays')}
                  value={settings?.backup.retentionDays || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      backup: {
                        ...settings!.backup,
                        retentionDays: parseInt(e.target.value),
                      },
                    })
                  }
                  disabled={!settings?.backup.enabled}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => handleSaveSettings('backup', settings?.backup)}
                  disabled={saving || !settings?.backup.enabled}
                >
                  {t('save')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('settings.manualBackup')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('settings.backupDescription')}
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<CloudDownloadIcon />}
                onClick={handleBackup}
              >
                {t('settings.createBackup')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                component="label"
              >
                {t('settings.restoreBackup')}
                <input
                  type="file"
                  hidden
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleRestore(file);
                  }}
                />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t('settings.securitySettings')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('settings.passwordPolicy')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.minPasswordLength')}
                  value={settings?.security.passwordPolicy.minLength || 8}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      security: {
                        ...settings!.security,
                        passwordPolicy: {
                          ...settings!.security.passwordPolicy,
                          minLength: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.passwordPolicy.requireUppercase || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings!,
                          security: {
                            ...settings!.security,
                            passwordPolicy: {
                              ...settings!.security.passwordPolicy,
                              requireUppercase: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                  }
                  label={t('settings.requireUppercase')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.passwordPolicy.requireNumbers || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings!,
                          security: {
                            ...settings!.security,
                            passwordPolicy: {
                              ...settings!.security.passwordPolicy,
                              requireNumbers: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                  }
                  label={t('settings.requireNumbers')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.passwordPolicy.requireSpecialChars || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings!,
                          security: {
                            ...settings!.security,
                            passwordPolicy: {
                              ...settings!.security.passwordPolicy,
                              requireSpecialChars: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                  }
                  label={t('settings.requireSpecialChars')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('settings.loginSecurity')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.twoFactorRequired || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings!,
                          security: {
                            ...settings!.security,
                            twoFactorRequired: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label={t('settings.require2FA')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.sessionTimeout')}
                  value={settings?.security.sessionTimeout || 60}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      security: {
                        ...settings!.security,
                        sessionTimeout: parseInt(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('minutes')}</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.maxLoginAttempts')}
                  value={settings?.security.maxLoginAttempts || 5}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      security: {
                        ...settings!.security,
                        maxLoginAttempts: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.lockoutDuration')}
                  value={settings?.security.lockoutDuration || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings!,
                      security: {
                        ...settings!.security,
                        lockoutDuration: parseInt(e.target.value),
                      },
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('minutes')}</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={() => handleSaveSettings('security', settings?.security)}
          disabled={saving}
        >
          {t('save')}
        </Button>
      </Grid>
    </Grid>
  );

  const renderSystemSettings = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSaveSettings('system', settings?.system);
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('settings.systemPreferences')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.language')}</InputLabel>
            <Select
              value={settings?.system.language || 'el'}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  system: { ...settings!.system, language: e.target.value },
                })
              }
            >
              <MenuItem value="el">Ελληνικά</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.timezone')}</InputLabel>
            <Select
              value={settings?.system.timezone || 'Europe/Athens'}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  system: { ...settings!.system, timezone: e.target.value },
                })
              }
            >
              <MenuItem value="Europe/Athens">Europe/Athens</MenuItem>
              <MenuItem value="Europe/London">Europe/London</MenuItem>
              <MenuItem value="America/New_York">America/New York</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.dateFormat')}</InputLabel>
            <Select
              value={settings?.system.dateFormat || 'DD/MM/YYYY'}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  system: { ...settings!.system, dateFormat: e.target.value },
                })
              }
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.currency')}</InputLabel>
            <Select
              value={settings?.system.currency || 'EUR'}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  system: { ...settings!.system, currency: e.target.value },
                })
              }
            >
              <MenuItem value="EUR">EUR (€)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="GBP">GBP (£)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('settings.folderNumberStart')}
            value={settings?.system.folderNumberStart || 1}
            onChange={(e) =>
              setSettings({
                ...settings!,
                system: {
                  ...settings!.system,
                  folderNumberStart: parseInt(e.target.value),
                },
              })
            }
            helperText={t('settings.folderNumberHelp')}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
            {t('save')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        icon={<SettingsIcon />}
      />

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<BusinessIcon />} label={t('settings.business')} />
          <Tab icon={<ScheduleIcon />} label={t('settings.appointments')} />
          <Tab icon={<EmailIcon />} label={t('settings.emailTemplates')} />
          <Tab icon={<PersonIcon />} label={t('settings.users')} />
          <Tab icon={<PaymentIcon />} label={t('settings.payment')} />
          <Tab icon={<BackupIcon />} label={t('settings.backup')} />
          <Tab icon={<SecurityIcon />} label={t('settings.security')} />
          <Tab icon={<LanguageIcon />} label={t('settings.system')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            {renderBusinessSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderAppointmentSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {renderEmailTemplates()}
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            {renderUserManagement()}
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            {renderPaymentSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={5}>
            {renderBackupSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={6}>
            {renderSecuritySettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={7}>
            {renderSystemSettings()}
          </TabPanel>
        </Box>
      </Paper>

      {/* User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={userForm.handleSubmit}>
          <DialogTitle>
            {selectedUser ? t('settings.editUser') : t('settings.newUser')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label={t('firstName')}
                  value={userForm.values.firstName}
                  onChange={userForm.handleChange}
                  error={userForm.touched.firstName && Boolean(userForm.errors.firstName)}
                  helperText={userForm.touched.firstName && userForm.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label={t('lastName')}
                  value={userForm.values.lastName}
                  onChange={userForm.handleChange}
                  error={userForm.touched.lastName && Boolean(userForm.errors.lastName)}
                  helperText={userForm.touched.lastName && userForm.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label={t('email')}
                  value={userForm.values.email}
                  onChange={userForm.handleChange}
                  error={userForm.touched.email && Boolean(userForm.errors.email)}
                  helperText={userForm.touched.email && userForm.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('role')}</InputLabel>
                  <Select
                    name="role"
                    value={userForm.values.role}
                    onChange={userForm.handleChange}
                    label={t('role')}
                  >
                    <MenuItem value="admin">{t('role.admin')}</MenuItem>
                    <MenuItem value="supervisor">{t('role.supervisor')}</MenuItem>
                    <MenuItem value="secretary">{t('role.secretary')}</MenuItem>
                    <MenuItem value="client">{t('role.client')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!selectedUser && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="password"
                      label={t('password')}
                      type={showPassword ? 'text' : 'password'}
                      value={userForm.values.password}
                      onChange={userForm.handleChange}
                      error={userForm.touched.password && Boolean(userForm.errors.password)}
                      helperText={userForm.touched.password && userForm.errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label={t('confirmPassword')}
                      type={showPassword ? 'text' : 'password'}
                      value={userForm.values.confirmPassword}
                      onChange={userForm.handleChange}
                      error={
                        userForm.touched.confirmPassword &&
                        Boolean(userForm.errors.confirmPassword)
                      }
                      helperText={
                        userForm.touched.confirmPassword && userForm.errors.confirmPassword
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUserDialog(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">
              {selectedUser ? t('update') : t('create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        open={openTemplateDialog}
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? t('settings.editTemplate') : t('settings.newTemplate')}
        </DialogTitle>
        <DialogContent>
          {/* Template form would go here */}
          <Typography>Template editing functionality to be implemented</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>{t('cancel')}</Button>
          <Button variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={deleteUserDialog}
        title={t('settings.deleteUser')}
        content={t('settings.deleteUserConfirm')}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUserDialog(false)}
      />
    </Box>
  );
};

export default SettingsPage;
