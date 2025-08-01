import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  TextField,
  Typography,
  Divider,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import elLocale from 'date-fns/locale/el';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  isValid,
  isBefore,
  isAfter,
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PresetPeriod {
  label: string;
  getValue: () => DateRange;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onApply?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  showPresets?: boolean;
  customPresets?: PresetPeriod[];
  format?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'inherit';
  sx?: any;
}

const defaultPresets: PresetPeriod[] = [
  {
    label: 'Σήμερα',
    getValue: () => ({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
    }),
  },
  {
    label: 'Χθες',
    getValue: () => ({
      startDate: startOfDay(subDays(new Date(), 1)),
      endDate: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: 'Τελευταίες 7 ημέρες',
    getValue: () => ({
      startDate: startOfDay(subDays(new Date(), 6)),
      endDate: endOfDay(new Date()),
    }),
  },
  {
    label: 'Τελευταίες 30 ημέρες',
    getValue: () => ({
      startDate: startOfDay(subDays(new Date(), 29)),
      endDate: endOfDay(new Date()),
    }),
  },
  {
    label: 'Αυτή την εβδομάδα',
    getValue: () => ({
      startDate: startOfWeek(new Date(), { locale: elLocale }),
      endDate: endOfWeek(new Date(), { locale: elLocale }),
    }),
  },
  {
    label: 'Προηγούμενη εβδομάδα',
    getValue: () => ({
      startDate: startOfWeek(subDays(new Date(), 7), { locale: elLocale }),
      endDate: endOfWeek(subDays(new Date(), 7), { locale: elLocale }),
    }),
  },
  {
    label: 'Αυτός ο μήνας',
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Προηγούμενος μήνας',
    getValue: () => ({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'Αυτό το τρίμηνο',
    getValue: () => ({
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    }),
  },
  {
    label: 'Προηγούμενο τρίμηνο',
    getValue: () => ({
      startDate: startOfQuarter(subMonths(new Date(), 3)),
      endDate: endOfQuarter(subMonths(new Date(), 3)),
    }),
  },
  {
    label: 'Φέτος',
    getValue: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
    }),
  },
  {
    label: 'Πέρυσι',
    getValue: () => ({
      startDate: startOfYear(subYears(new Date(), 1)),
      endDate: endOfYear(subYears(new Date(), 1)),
    }),
  },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  onApply,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  helperText,
  showPresets = true,
  customPresets,
  format: dateFormat = 'dd/MM/yyyy',
  placeholder = 'Επιλογή περιόδου',
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  color = 'primary',
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  
  const presets = customPresets || defaultPresets;
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setTempRange(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onChange(tempRange);
    onApply?.(tempRange);
    handleClose();
  };

  const handleCancel = () => {
    setTempRange(value);
    handleClose();
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date && tempRange.endDate && isAfter(date, tempRange.endDate)) {
      setTempRange({ startDate: date, endDate: null });
    } else {
      setTempRange({ ...tempRange, startDate: date });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && tempRange.startDate && isBefore(date, tempRange.startDate)) {
      setTempRange({ startDate: null, endDate: date });
    } else {
      setTempRange({ ...tempRange, endDate: date });
    }
  };

  const handlePresetClick = (preset: PresetPeriod) => {
    const range = preset.getValue();
    setTempRange(range);
    onChange(range);
    onApply?.(range);
    handleClose();
  };

  const formatDateRange = () => {
    if (!value.startDate && !value.endDate) {
      return placeholder;
    }
    
    const start = value.startDate ? format(value.startDate, dateFormat) : '...';
    const end = value.endDate ? format(value.endDate, dateFormat) : '...';
    
    if (value.startDate && value.endDate && 
        format(value.startDate, 'dd/MM/yyyy') === format(value.endDate, 'dd/MM/yyyy')) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const getActivePreset = () => {
    if (!value.startDate || !value.endDate) return null;
    
    return presets.find(preset => {
      const range = preset.getValue();
      return (
        range.startDate && range.endDate &&
        format(range.startDate, 'yyyy-MM-dd') === format(value.startDate!, 'yyyy-MM-dd') &&
        format(range.endDate, 'yyyy-MM-dd') === format(value.endDate!, 'yyyy-MM-dd')
      );
    });
  };

  const activePreset = getActivePreset();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={elLocale}>
      <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>
        <Button
          onClick={handleClick}
          disabled={disabled}
          variant={variant}
          color={error ? 'error' : color}
          size={size}
          fullWidth={fullWidth}
          startIcon={<DateRangeIcon />}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            fontWeight: 400,
            color: error ? 'error.main' : 'text.primary',
            borderColor: error ? 'error.main' : undefined,
            '& .MuiButton-endIcon': {
              ml: 'auto',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {formatDateRange()}
            {activePreset && (
              <Chip 
                label={activePreset.label} 
                size="small" 
                color="primary"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Button>
        
        {helperText && (
          <Typography
            variant="caption"
            color={error ? 'error' : 'text.secondary'}
            sx={{ ml: 1.75, mt: 0.5, display: 'block' }}
          >
            {helperText}
          </Typography>
        )}

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: isMobile ? '90vw' : 580,
            },
          }}
        >
          <Box sx={{ display: 'flex', height: isMobile ? 'auto' : 400 }}>
            {/* Presets Panel */}
            {showPresets && (
              <Box
                sx={{
                  width: isMobile ? '100%' : 200,
                  borderRight: isMobile ? 0 : 1,
                  borderColor: 'divider',
                  p: 2,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Γρήγορη επιλογή
                </Typography>
                <Stack spacing={0.5}>
                  {presets.map((preset, index) => {
                    const presetRange = preset.getValue();
                    const isActive = 
                      tempRange.startDate && tempRange.endDate &&
                      presetRange.startDate && presetRange.endDate &&
                      format(presetRange.startDate, 'yyyy-MM-dd') === format(tempRange.startDate, 'yyyy-MM-dd') &&
                      format(presetRange.endDate, 'yyyy-MM-dd') === format(tempRange.endDate, 'yyyy-MM-dd');
                    
                    return (
                      <Button
                        key={index}
                        size="small"
                        variant={isActive ? 'contained' : 'text'}
                        onClick={() => handlePresetClick(preset)}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          fontWeight: 400,
                        }}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Custom Date Selection */}
            <Box sx={{ flex: 1, p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Προσαρμοσμένη περίοδος
              </Typography>
              
              <Stack spacing={3} sx={{ mt: 2 }}>
                <DatePicker
                  label="Από"
                  value={tempRange.startDate}
                  onChange={handleStartDateChange}
                  minDate={minDate}
                  maxDate={tempRange.endDate || maxDate}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: error,
                    },
                  }}
                />
                
                <DatePicker
                  label="Έως"
                  value={tempRange.endDate}
                  onChange={handleEndDateChange}
                  minDate={tempRange.startDate || minDate}
                  maxDate={maxDate}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: error,
                    },
                  }}
                />
              </Stack>

              {/* Selected Range Display */}
              {tempRange.startDate && tempRange.endDate && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Επιλεγμένη περίοδος
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {format(tempRange.startDate, 'dd MMMM yyyy', { locale: elLocale })} - {' '}
                    {format(tempRange.endDate, 'dd MMMM yyyy', { locale: elLocale })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({Math.ceil((tempRange.endDate.getTime() - tempRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} ημέρες)
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleCancel}>
                  Ακύρωση
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApply}
                  disabled={!tempRange.startDate || !tempRange.endDate}
                >
                  Εφαρμογή
                </Button>
              </Box>
            </Box>
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
