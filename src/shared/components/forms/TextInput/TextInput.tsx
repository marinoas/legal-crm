import React from 'react';
import { TextField, TextFieldProps, InputAdornment, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Text Input with enhanced styling
const StyledTextField = styled(TextField)(({ theme }) => ({
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
    
    '&.Mui-disabled': {
      backgroundColor: theme.palette.grey[100],
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[300],
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
  
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: theme.spacing(0.5),
    fontSize: '0.8125rem',
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  /** Input label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Required field indicator */
  required?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Maximum character count */
  maxLength?: number;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Input size */
  inputSize?: 'small' | 'medium';
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Text Input Component
 * 
 * A professional text input with enhanced styling and validation support.
 * Used for text input fields in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <TextInput
 *   label="Όνομα Εντολέα"
 *   placeholder="Εισάγετε το όνομα"
 *   required
 *   error={!!errors.name}
 *   errorMessage={errors.name?.message}
 * />
 * ```
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  helperText,
  error = false,
  errorMessage,
  required = false,
  startIcon,
  endIcon,
  type = 'text',
  maxLength,
  showCharacterCount = false,
  inputSize = 'medium',
  fullWidth = true,
  value,
  sx,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;
  const displayHelperText = error && errorMessage ? errorMessage : helperText;
  
  // Character count helper text
  const characterCountText = showCharacterCount && maxLength 
    ? `${currentLength}/${maxLength}`
    : undefined;
  
  const finalHelperText = characterCountText && displayHelperText
    ? `${displayHelperText} • ${characterCountText}`
    : characterCountText || displayHelperText;

  return (
    <StyledTextField
      {...props}
      variant="outlined"
      label={required ? `${label} *` : label}
      placeholder={placeholder}
      helperText={finalHelperText}
      error={error}
      type={type}
      size={inputSize}
      fullWidth={fullWidth}
      value={value}
      inputProps={{
        maxLength,
        ...props.inputProps,
      }}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ) : undefined,
        endAdornment: endIcon ? (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ) : undefined,
        ...props.InputProps,
      }}
      sx={{
        ...sx,
      }}
    />
  );
};

export default TextInput;

