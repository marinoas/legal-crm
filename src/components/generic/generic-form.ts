// src/components/generic/GenericForm.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Autocomplete,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as ResetIcon,
  ExpandMore as ExpandIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AttachFile as AttachFileIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  FormConfig, 
  FieldConfig, 
  ActionConfig,
  validateFormValues,
  defaultValidationMessages 
} from './GenericConfig';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { usePermissions } from '../../hooks/usePermissions';
import { formatCurrency, formatPhone, formatAFM } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

interface GenericFormProps {
  config: FormConfig;
  initialValues?: Record<string, any>;
  loading?: boolean;
  error?: Error | null;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  onChange?: (values: Record<string, any>, changedField: string) => void;
  mode?: 'create' | 'edit' | 'view';
}

const GenericForm: React.FC<GenericFormProps> = ({
  config,
  initialValues = {},
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  onChange,
  mode = 'create'
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize expanded sections
  useEffect(() => {
    if (config.sections) {
      const defaultExpanded = new Set(
        config.sections
          .filter(section => section.defaultExpanded !== false)
          .map((_, index) => `section-${index}`)
      );
      setExpandedSections(defaultExpanded);
    }
  }, [config.sections]);

  // Build validation schema
  const validationSchema = useMemo(() => {
    const shape: Record<string, any> = {};
    
    config.fields.forEach(field => {
      let schema: any = Yup.mixed();
      
      // Type-based validation
      switch (field.type) {
        case 'text':
        case 'textarea':
          schema = Yup.string();
          if (field.validation?.minLength) {
            schema = schema.min(field.validation.minLength, 
              defaultValidationMessages.minLength(field.validation.minLength));
          }
          if (field.validation?.maxLength) {
            schema = schema.max(field.validation.maxLength,
              defaultValidationMessages.maxLength(field.validation.maxLength));
          }
          if (field.validation?.pattern) {
            schema = schema.matches(field.validation.pattern, 
              defaultValidationMessages.pattern);
          }
          break;
          
        case 'number':
        case 'currency':
          schema = Yup.number();
          if (field.validation?.min !== undefined) {
            schema = schema.min(field.validation.min,
              defaultValidationMessages.min(field.validation.min));
          }
          if (field.validation?.max !== undefined) {
            schema = schema.max(field.validation.max,
              defaultValidationMessages.max(field.validation.max));
          }
          break;
          
        case 'email':
          schema = Yup.string().email(defaultValidationMessages.email);
          break;
          
        case 'phone':
          schema = Yup.string().matches(/^(\+30)?[0-9]{10}$/, 
            defaultValidationMessages.phone);
          break;
          
        case 'date':
        case 'datetime':
          schema = Yup.date();
          break;
          
        case 'boolean':
          schema = Yup.boolean();
          break;
          
        case 'file':
          schema = Yup.mixed();
          break;
      }
      
      // Required validation
      if (field.required) {
        schema = schema.required(defaultValidationMessages.required);
      }
      
      // Custom validation
      if (field.validation?.custom) {
        schema = schema.test('custom', defaultValidationMessages.custom, 
          (value) => !field.validation!.custom!(value));
      }
      
      shape[field.name] = schema;
    });
    
    return Yup.object().shape(shape);
  }, [config.fields]);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      ...config.defaultValues,
      ...initialValues
    },
    validationSchema,
    validateOnChange: config.validateOnChange !== false,
    validateOnBlur: config.validateOnBlur !== false,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const transformedValues = config.transformOnSubmit 
          ? config.transformOnSubmit(values) 
          : values;
        await onSubmit(transformedValues);
        showSnackbar(
          mode === 'create' ? t('common.createSuccess') : t('common.updateSuccess'), 
          'success'
        );
      } catch (error) {
        showSnackbar(t('common.error'), 'error');
        console.error('Form submission error:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Handle field change
  const handleFieldChange = useCallback((field: string, value: any) => {
    formik.setFieldValue(field, value);
    if (onChange) {
      onChange({ ...formik.values, [field]: value }, field);
    }
  }, [formik, onChange]);

  // Handle cancel
  const handleCancel = () => {
    if (formik.dirty && config.confirmOnCancel !== false) {
      setConfirmDialog(true);
    } else {
      onCancel ? onCancel() : navigate(-1);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Check field visibility
  const isFieldVisible = (field: FieldConfig): boolean => {
    if (field.hidden) return false;
    if (field.visibleWhen) {
      return field.visibleWhen(formik.values);
    }
    if (field.dependsOn) {
      return Boolean(formik.values[field.dependsOn]);
    }
    return true;
  };

  // Get field value
  const getFieldValue = (field: FieldConfig): any => {
    const value = formik.values[field.name];
    return value !== undefined ? value : field.defaultValue || '';
  };

  // Render field
  const renderField = (field: FieldConfig): React.ReactNode => {
    if (!isFieldVisible(field)) return null;
    
    const isReadOnly = mode === 'view' || field.disabled;
    const error = formik.touched[field.name] && formik.errors[field.name];
    const value = getFieldValue(field);
    
    // Custom component
    if (field.customComponent) {
      return (
        <field.customComponent
          field={field}
          value={value}
          onChange={(val: any) => handleFieldChange(field.name, val)}
          error={error}
          readOnly={isReadOnly}
          formValues={formik.values}
        />
      );
    }
    
    // Common props
    const commonProps = {
      fullWidth: true,
      label: field.label + (field.required ? ' *' : ''),
      error: Boolean(error),
      helperText: error || field.helperText,
      disabled: isReadOnly,
      InputProps: {
        startAdornment: field.startAdornment,
        endAdornment: field.endAdornment,
      }
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            inputProps={{
              maxLength: field.validation?.maxLength
            }}
          />
        );
        
      case 'password':
        return (
          <TextField
            {...commonProps}
            type={showPassword[field.name] ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            InputProps={{
              ...commonProps.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword({
                      ...showPassword,
                      [field.name]: !showPassword[field.name]
                    })}
                    edge="end"
                    disabled={isReadOnly}
                  >
                    {showPassword[field.name] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        );
        
      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value))}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max
            }}
          />
        );
        
      case 'currency':
        return (
          <TextField
            {...commonProps}
            value={formatCurrency(value)}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value.replace(/[^0-9.-]/g, ''));
              handleFieldChange(field.name, isNaN(numValue) ? 0 : numValue);
            }}
            InputProps={{
              ...commonProps.InputProps,
              startAdornment: <InputAdornment position="start">€</InputAdornment>
            }}
          />
        );
        
      case 'phone':
        return (
          <TextField
            {...commonProps}
            value={formatPhone(value)}
            onChange={(e) => handleFieldChange(field.name, e.target.value.replace(/\D/g, ''))}
            placeholder={field.placeholder || '+30 XXX XXX XXXX'}
          />
        );
        
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={field.rows || 4}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
        
      case 'select':
        return (
          <FormControl fullWidth error={Boolean(error)}>
            <InputLabel>{field.label + (field.required ? ' *' : '')}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              label={field.label + (field.required ? ' *' : '')}
              disabled={isReadOnly}
              multiple={field.multiple}
            >
              {field.options?.map(option => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helperText) && (
              <FormHelperText>{error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'multiselect':
        return (
          <Autocomplete
            multiple
            value={value || []}
            onChange={(_, newValue) => handleFieldChange(field.name, newValue)}
            options={field.options?.map(opt => opt.value) || []}
            getOptionLabel={(option) => {
              const opt = field.options?.find(o => o.value === option);
              return opt?.label || option.toString();
            }}
            disabled={isReadOnly}
            renderInput={(params) => (
              <TextField
                {...params}
                {...commonProps}
                placeholder={field.placeholder}
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const opt = field.options?.find(o => o.value === option);
                return (
                  <Chip
                    label={opt?.label || option}
                    {...getTagProps({ index })}
                    disabled={isReadOnly}
                  />
                );
              })
            }
          />
        );
        
      case 'autocomplete':
        return (
          <Autocomplete
            value={value}
            onChange={(_, newValue) => handleFieldChange(field.name, newValue)}
            options={field.options?.map(opt => opt.value) || []}
            getOptionLabel={(option) => {
              const opt = field.options?.find(o => o.value === option);
              return opt?.label || option.toString();
            }}
            disabled={isReadOnly}
            renderInput={(params) => (
              <TextField
                {...params}
                {...commonProps}
                placeholder={field.placeholder}
              />
            )}
          />
        );
        
      case 'boolean':
      case 'switch':
        return (
          <FormControlLabel
            control={
              field.type === 'switch' ? (
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  disabled={isReadOnly}
                />
              ) : (
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  disabled={isReadOnly}
                />
              )
            }
            label={field.label}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            label={field.label + (field.required ? ' *' : '')}
            value={value ? new Date(value) : null}
            onChange={(newValue) => handleFieldChange(field.name, newValue)}
            disabled={isReadOnly}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(error),
                helperText: error || field.helperText
              }
            }}
          />
        );
        
      case 'datetime':
        return (
          <DateTimePicker
            label={field.label + (field.required ? ' *' : '')}
            value={value ? new Date(value) : null}
            onChange={(newValue) => handleFieldChange(field.name, newValue)}
            disabled={isReadOnly}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(error),
                helperText: error || field.helperText
              }
            }}
          />
        );
        
      case 'file':
        return (
          <Box>
            <input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  handleFieldChange(
                    field.name, 
                    field.multiple ? Array.from(files) : files[0]
                  );
                }
              }}
              disabled={isReadOnly}
              style={{ display: 'none' }}
              id={`file-input-${field.name}`}
            />
            <label htmlFor={`file-input-${field.name}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                disabled={isReadOnly}
                fullWidth
              >
                {value ? (
                  field.multiple 
                    ? `${value.length} αρχεία επιλεγμένα`
                    : value.name || 'Αρχείο επιλεγμένο'
                ) : field.placeholder || 'Επιλογή αρχείου'}
              </Button>
            </label>
            {error && (
              <FormHelperText error>{error}</FormHelperText>
            )}
          </Box>
        );
        
      default:
        return (
          <TextField
            {...commonProps}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Render form content
  const renderFormContent = () => {
    if (config.sections) {
      return config.sections.map((section, sectionIndex) => {
        const sectionId = `section-${sectionIndex}`;
        const sectionFields = section.fields
          .map(fieldName => config.fields.find(f => f.name === fieldName))
          .filter(Boolean) as FieldConfig[];
        
        if (section.collapsible) {
          return (
            <Accordion
              key={sectionId}
              expanded={expandedSections.has(sectionId)}
              onChange={() => handleSectionToggle(sectionId)}
            >
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Typography variant="h6">{section.title}</Typography>
                {section.subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    {section.subtitle}
                  </Typography>
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {sectionFields.map(field => (
                    <Grid 
                      key={field.name} 
                      item 
                      xs={12} 
                      sm={config.layout === 'grid' ? 6 : 12}
                      md={config.layout === 'grid' ? (12 / (config.columns || 2)) : 12}
                    >
                      {renderField(field)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        }
        
        return (
          <Box key={sectionId} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>
            {section.subtitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {section.subtitle}
              </Typography>
            )}
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {sectionFields.map(field => (
                <Grid 
                  key={field.name} 
                  item 
                  xs={12} 
                  sm={config.layout === 'grid' ? 6 : 12}
                  md={config.layout === 'grid' ? (12 / (config.columns || 2)) : 12}
                >
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      });
    }
    
    // No sections - render all fields
    return (
      <Grid container spacing={2}>
        {config.fields.map(field => (
          <Grid 
            key={field.name} 
            item 
            xs={12} 
            sm={config.layout === 'grid' ? 6 : 12}
            md={config.layout === 'grid' ? (12 / (config.columns || 2)) : 12}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render actions
  const renderActions = () => {
    const actions = [];
    
    // Submit button
    if (mode !== 'view') {
      actions.push(
        <Button
          key="submit"
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={submitting || loading || (config.validateOnChange && !formik.isValid)}
          size={isMobile ? 'small' : 'medium'}
        >
          {config.submitLabel || (mode === 'create' ? t('common.create') : t('common.save'))}
        </Button>
      );
    }
    
    // Reset button
    if (config.showReset && mode !== 'view') {
      actions.push(
        <Button
          key="reset"
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={() => formik.resetForm()}
          disabled={!formik.dirty || submitting || loading}
          size={isMobile ? 'small' : 'medium'}
        >
          {config.resetLabel || t('common.reset')}
        </Button>
      );
    }
    
    // Cancel button
    actions.push(
      <Button
        key="cancel"
        variant="outlined"
        startIcon={<CancelIcon />}
        onClick={handleCancel}
        disabled={submitting}
        size={isMobile ? 'small' : 'medium'}
      >
        {config.cancelLabel || t('common.cancel')}
      </Button>
    );
    
    // Custom actions
    if (config.customActions) {
      config.customActions.forEach((action, index) => {
        if (action.hidden || (action.permission && !hasPermission(action.permission))) {
          return;
        }
        
        const Icon = action.icon;
        actions.push(
          <Button
            key={`custom-${index}`}
            variant={action.variant || 'outlined'}
            color={action.color || 'primary'}
            startIcon={Icon && <Icon />}
            onClick={() => action.handler?.(formik.values)}
            disabled={action.disabled === true}
            size={isMobile ? 'small' : 'medium'}
          >
            {action.label}
          </Button>
        );
      });
    }
    
    return actions;
  };

  return (
    <Paper 
      component="form" 
      onSubmit={formik.handleSubmit}
      sx={{ p: { xs: 2, sm: 3 } }}
      onKeyDown={(e) => {
        if (config.submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          formik.handleSubmit();
        }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {config.title}
        </Typography>
        {config.subtitle && (
          <Typography variant="body2" color="text.secondary">
            {config.subtitle}
          </Typography>
        )}
      </Box>
      
      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || t('common.error')}
        </Alert>
      )}
      
      {/* Debug info */}
      {config.debug && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <pre>{JSON.stringify(formik.values, null, 2)}</pre>
          <Divider sx={{ my: 1 }} />
          <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
        </Alert>
      )}
      
      {/* Form content */}
      {renderFormContent()}
      
      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {renderActions()}
      </Box>
      
      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog}
        title={t('common.cancelConfirmTitle')}
        content={t('common.cancelConfirmMessage')}
        onConfirm={() => {
          setConfirmDialog(false);
          onCancel ? onCancel() : navigate(-1);
        }}
        onCancel={() => setConfirmDialog(false)}
      />
    </Paper>
  );
};

export default GenericForm;