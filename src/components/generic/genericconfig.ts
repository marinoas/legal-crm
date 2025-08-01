// src/components/generic/GenericConfig.ts
import { ReactNode } from 'react';
import { SvgIconComponent } from '@mui/icons-material';

// Entity types
export type EntityType = 
  | 'clients' 
  | 'courts' 
  | 'deadlines' 
  | 'pendings'
  | 'appointments' 
  | 'financial' 
  | 'documents' 
  | 'contacts'
  | 'users';

// Field types
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime' 
  | 'select' 
  | 'multiselect'
  | 'boolean' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'currency'
  | 'file' 
  | 'autocomplete' 
  | 'custom';

// Column alignment
export type ColumnAlign = 'left' | 'center' | 'right';

// Action types
export type ActionType = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'print' 
  | 'email' 
  | 'download'
  | 'complete' 
  | 'postpone' 
  | 'cancel' 
  | 'custom';

// Filter operators
export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan' 
  | 'lessThan' 
  | 'between' 
  | 'in' 
  | 'notIn';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Field configuration
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  placeholder?: string;
  helperText?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  rows?: number; // for textarea
  accept?: string; // for file input
  format?: string; // for date/time formatting
  mask?: string; // for input masking
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  dependsOn?: string; // field dependency
  visibleWhen?: (values: any) => boolean;
  transform?: (value: any) => any; // value transformation
  customComponent?: React.ComponentType<any>;
}

// Column configuration for lists
export interface ColumnConfig {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  align?: ColumnAlign;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  format?: (value: any, row: any) => string | ReactNode;
  renderCell?: (params: any) => ReactNode;
  valueGetter?: (row: any) => any;
  cellClassName?: string | ((params: any) => string);
  headerClassName?: string;
}

// Action configuration
export interface ActionConfig {
  type: ActionType;
  label: string;
  icon?: SvgIconComponent;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'text' | 'outlined' | 'contained';
  confirmRequired?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  permission?: string;
  hidden?: boolean | ((row: any) => boolean);
  disabled?: boolean | ((row: any) => boolean);
  handler?: (row: any) => void | Promise<void>;
  component?: React.ComponentType<any>;
}

// Filter configuration
export interface FilterConfig {
  field: string;
  label: string;
  type: FieldType;
  operator?: FilterOperator;
  defaultValue?: any;
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  placeholder?: string;
}

// List configuration
export interface ListConfig {
  entity: EntityType;
  title: string;
  subtitle?: string;
  columns: ColumnConfig[];
  actions?: ActionConfig[];
  rowActions?: ActionConfig[];
  filters?: FilterConfig[];
  defaultSort?: {
    field: string;
    direction: SortDirection;
  };
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  refreshInterval?: number; // in seconds
  emptyMessage?: string;
  loadingMessage?: string;
  dense?: boolean;
  striped?: boolean;
  showBorder?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selected: any[]) => void;
  customToolbar?: React.ComponentType<any>;
  customEmpty?: React.ComponentType<any>;
  groupBy?: string;
  summaryRow?: boolean;
  getRowId?: (row: any) => string | number;
  getRowClassName?: (row: any) => string;
  isRowSelectable?: (row: any) => boolean;
}

// Form configuration
export interface FormConfig {
  entity: EntityType;
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  sections?: Array<{
    title: string;
    subtitle?: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }>;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  confirmOnCancel?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debug?: boolean;
  defaultValues?: Record<string, any>;
  onSubmit?: (values: any) => void | Promise<void>;
  onCancel?: () => void;
  onChange?: (values: any, changedField: string) => void;
  transformOnSubmit?: (values: any) => any;
  customActions?: ActionConfig[];
  submitOnEnter?: boolean;
}

// Detail view configuration
export interface DetailConfig {
  entity: EntityType;
  title: string | ((data: any) => string);
  subtitle?: string | ((data: any) => string);
  sections: Array<{
    title: string;
    subtitle?: string;
    fields: Array<{
      name: string;
      label: string;
      format?: (value: any, data: any) => string | ReactNode;
      hidden?: boolean | ((data: any) => boolean);
      copyable?: boolean;
      link?: boolean | ((value: any, data: any) => string);
      component?: React.ComponentType<any>;
    }>;
    grid?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
    };
    collapsible?: boolean;
    defaultExpanded?: boolean;
    hidden?: boolean | ((data: any) => boolean);
  }>;
  actions?: ActionConfig[];
  tabs?: Array<{
    label: string;
    icon?: SvgIconComponent;
    component: React.ComponentType<any>;
    props?: any;
    permission?: string;
    hidden?: boolean | ((data: any) => boolean);
  }>;
  relatedLists?: Array<{
    title: string;
    entity: EntityType;
    filter: (data: any) => any;
    config: Partial<ListConfig>;
  }>;
  showTimestamps?: boolean;
  showCreatedBy?: boolean;
  showModifiedBy?: boolean;
  refreshInterval?: number;
  customHeader?: React.ComponentType<any>;
  customFooter?: React.ComponentType<any>;
  breadcrumbs?: boolean;
}

// Entity configuration
export interface EntityConfig {
  name: EntityType;
  label: string;
  labelPlural: string;
  icon?: SvgIconComponent;
  apiEndpoint: string;
  primaryKey: string;
  displayField: string;
  searchFields?: string[];
  permissions?: {
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
    export?: string;
    import?: string;
  };
  features?: {
    softDelete?: boolean;
    versioning?: boolean;
    audit?: boolean;
    attachments?: boolean;
    comments?: boolean;
    tags?: boolean;
    sharing?: boolean;
  };
  validation?: {
    unique?: string[];
    required?: string[];
    immutable?: string[];
  };
  hooks?: {
    beforeCreate?: (data: any) => any | Promise<any>;
    afterCreate?: (data: any) => void | Promise<void>;
    beforeUpdate?: (data: any) => any | Promise<any>;
    afterUpdate?: (data: any) => void | Promise<void>;
    beforeDelete?: (id: any) => void | Promise<void>;
    afterDelete?: (id: any) => void | Promise<void>;
  };
}

// Page configuration
export interface PageConfig {
  entity: EntityType;
  entityConfig: EntityConfig;
  listConfig?: ListConfig;
  formConfig?: FormConfig;
  detailConfig?: DetailConfig;
  customComponents?: {
    list?: React.ComponentType<any>;
    form?: React.ComponentType<any>;
    detail?: React.ComponentType<any>;
  };
  routes?: {
    list?: string;
    create?: string;
    edit?: string;
    detail?: string;
  };
  defaultView?: 'list' | 'grid' | 'calendar' | 'timeline' | 'kanban';
  viewOptions?: Array<'list' | 'grid' | 'calendar' | 'timeline' | 'kanban'>;
}

// Greek specific configurations
export interface GreekLegalConfig {
  courtTypes: Array<{ value: string; label: string }>;
  courtCompositions: Array<{ value: string; label: string }>;
  courtCities: Array<{ value: string; label: string }>;
  caseTypes: Array<{ value: string; label: string }>;
  deadlineTypes: Array<{ value: string; label: string }>;
  documentTypes: Array<{ value: string; label: string }>;
  legalArticles: Array<{ code: string; description: string }>;
}

// Validation messages
export interface ValidationMessages {
  required: string;
  email: string;
  phone: string;
  afm: string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  min: (min: number) => string;
  max: (max: number) => string;
  pattern: string;
  unique: string;
  custom: string;
}

// Default validation messages in Greek
export const defaultValidationMessages: ValidationMessages = {
  required: 'Το πεδίο είναι υποχρεωτικό',
  email: 'Παρακαλώ εισάγετε έγκυρο email',
  phone: 'Παρακαλώ εισάγετε έγκυρο τηλέφωνο',
  afm: 'Παρακαλώ εισάγετε έγκυρο ΑΦΜ (9 ψηφία)',
  minLength: (min: number) => `Τουλάχιστον ${min} χαρακτήρες`,
  maxLength: (max: number) => `Μέχρι ${max} χαρακτήρες`,
  min: (min: number) => `Η τιμή πρέπει να είναι τουλάχιστον ${min}`,
  max: (max: number) => `Η τιμή δεν μπορεί να υπερβαίνει το ${max}`,
  pattern: 'Μη έγκυρη μορφή',
  unique: 'Η τιμή υπάρχει ήδη',
  custom: 'Μη έγκυρη τιμή'
};

// Helper type for form values
export type FormValues<T extends FormConfig> = {
  [K in T['fields'][number]['name']]: any;
};

// Helper type for filter values
export type FilterValues<T extends FilterConfig[]> = {
  [K in T[number]['field']]?: any;
};

// Helper function to get entity config
export const getEntityConfig = (configs: EntityConfig[], entity: EntityType): EntityConfig | undefined => {
  return configs.find(config => config.name === entity);
};

// Helper function to validate form values
export const validateFormValues = (
  values: Record<string, any>,
  fields: FieldConfig[],
  messages: ValidationMessages = defaultValidationMessages
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const value = values[field.name];

    // Required validation
    if (field.required && !value) {
      errors[field.name] = messages.required;
      return;
    }

    // Skip validation if field is empty and not required
    if (!value && !field.required) return;

    // Type-specific validation
    if (field.validation) {
      const { min, max, minLength, maxLength, pattern, custom } = field.validation;

      if (minLength && value.length < minLength) {
        errors[field.name] = messages.minLength(minLength);
      } else if (maxLength && value.length > maxLength) {
        errors[field.name] = messages.maxLength(maxLength);
      } else if (min !== undefined && value < min) {
        errors[field.name] = messages.min(min);
      } else if (max !== undefined && value > max) {
        errors[field.name] = messages.max(max);
      } else if (pattern && !pattern.test(value)) {
        errors[field.name] = messages.pattern;
      } else if (custom) {
        const customError = custom(value);
        if (customError) {
          errors[field.name] = customError;
        }
      }
    }

    // Field type validation
    switch (field.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field.name] = messages.email;
        }
        break;
      case 'phone':
        if (!/^(\+30)?[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
          errors[field.name] = messages.phone;
        }
        break;
    }
  });

  return errors;
};
