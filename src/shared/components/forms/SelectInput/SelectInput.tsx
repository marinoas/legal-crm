import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  SelectProps,
  Chip,
  Box,
  ListSubheader
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check as CheckIcon } from '@mui/icons-material';

// Styled Select with enhanced styling
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
        borderWidth: '2px',
      },
    },
    
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      },
    },
    
    '&.Mui-error': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
        borderWidth: '2px',
      },
      
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          boxShadow: `0 0 0 3px ${theme.palette.error.main}20`,
        },
      },
    },
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: theme.palette.text.secondary,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.25, 1),
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '10',
  },
  
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '20',
    color: theme.palette.primary.main,
    fontWeight: 500,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '30',
    },
  },
}));

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectInputProps extends Omit<SelectProps, 'variant'> {
  /** Select label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Required field indicator */
  required?: boolean;
  /** Select options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Enable multiple selection */
  multiple?: boolean;
  /** Show chips for multiple selection */
  showChips?: boolean;
  /** Input size */
  inputSize?: 'small' | 'medium';
  /** Full width select */
  fullWidth?: boolean;
  /** Enable search/filter */
  searchable?: boolean;
}

/**
 * Select Input Component
 * 
 * A professional select input with enhanced styling and multiple selection support.
 * Used for dropdown selections in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <SelectInput
 *   label="Κατάσταση Υπόθεσης"
 *   options={statusOptions}
 *   value={status}
 *   onChange={handleStatusChange}
 *   required
 * />
 * ```
 */
export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  helperText,
  error = false,
  errorMessage,
  required = false,
  options,
  placeholder,
  multiple = false,
  showChips = true,
  inputSize = 'medium',
  fullWidth = true,
  value,
  sx,
  ...props
}) => {
  const displayHelperText = error && errorMessage ? errorMessage : helperText;
  
  // Group options by group property
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];
    
    options.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });
    
    return { groups, ungrouped };
  }, [options]);

  const renderValue = (selected: any) => {
    if (!multiple) {
      const option = options.find(opt => opt.value === selected);
      return option ? option.label : '';
    }
    
    if (!Array.isArray(selected) || selected.length === 0) {
      return placeholder || '';
    }
    
    if (showChips) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Chip
                key={val}
                label={option?.label || val}
                size="small"
                sx={{ height: 24 }}
              />
            );
          })}
        </Box>
      );
    }
    
    return selected
      .map((val: any) => {
        const option = options.find(opt => opt.value === val);
        return option?.label || val;
      })
      .join(', ');
  };

  const renderMenuItems = () => {
    const items: React.ReactNode[] = [];
    
    // Add ungrouped options first
    groupedOptions.ungrouped.forEach(option => {
      items.push(
        <StyledMenuItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {multiple && Array.isArray(value) && value.includes(option.value) && (
            <CheckIcon sx={{ mr: 1, fontSize: 20 }} />
          )}
          {option.label}
        </StyledMenuItem>
      );
    });
    
    // Add grouped options
    Object.entries(groupedOptions.groups).forEach(([groupName, groupOptions]) => {
      items.push(
        <ListSubheader key={groupName} sx={{ fontWeight: 600 }}>
          {groupName}
        </ListSubheader>
      );
      
      groupOptions.forEach(option => {
        items.push(
          <StyledMenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            sx={{ pl: 3 }}
          >
            {multiple && Array.isArray(value) && value.includes(option.value) && (
              <CheckIcon sx={{ mr: 1, fontSize: 20 }} />
            )}
            {option.label}
          </StyledMenuItem>
        );
      });
    });
    
    return items;
  };

  return (
    <StyledFormControl
      fullWidth={fullWidth}
      error={error}
      size={inputSize}
      sx={sx}
    >
      {label && (
        <InputLabel>
          {required ? `${label} *` : label}
        </InputLabel>
      )}
      <Select
        {...props}
        value={value}
        multiple={multiple}
        renderValue={renderValue}
        displayEmpty={!!placeholder}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: 'grey.200',
            },
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
        }}
      >
        {placeholder && !value && (
          <MenuItem disabled value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {renderMenuItems()}
      </Select>
      {displayHelperText && (
        <FormHelperText>
          {displayHelperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default SelectInput;

