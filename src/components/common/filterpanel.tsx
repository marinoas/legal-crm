import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  Chip,
  Stack,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import elLocale from 'date-fns/locale/el';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'radio' | 'daterange' | 'number' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  defaultExpanded?: boolean;
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
  title?: string;
  anchor?: 'left' | 'right';
  width?: number | string;
  showApplyButton?: boolean;
  autoApply?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  open,
  onClose,
  filters,
  values,
  onChange,
  onApply,
  onClear,
  title = 'Φίλτρα',
  anchor = 'right',
  width = 320,
  showApplyButton = true,
  autoApply = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedPanels, setExpandedPanels] = useState<string[]>(
    filters.filter(f => f.defaultExpanded).map(f => f.id)
  );

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const handleFilterChange = (filterId: string, value: any) => {
    const newValues = { ...values, [filterId]: value };
    onChange(newValues);
    
    if (autoApply) {
      onApply(newValues);
    }
  };

  const handleClearFilter = (filterId: string) => {
    const newValues = { ...values };
    delete newValues[filterId];
    onChange(newValues);
    
    if (autoApply) {
      onApply(newValues);
    }
  };

  const handleClearAll = () => {
    onClear();
    if (autoApply) {
      onApply({});
    }
  };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  const getActiveFiltersCount = () => {
    return Object.keys(values).filter(key => {
      const value = values[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value.from === undefined) return false;
      return value !== undefined && value !== '' && value !== null;
    }).length;
  };

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            InputProps={{
              endAdornment: value && (
                <IconButton
                  size="small"
                  onClick={() => handleClearFilter(filter.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Όλα</em>
              </MenuItem>
              {filter.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <Chip label={option.count} size="small" sx={{ ml: 1, height: 20 }} />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <Box>
            {filter.options?.map(option => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      handleFilterChange(filter.id, newValues);
                    }}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <Chip label={option.count} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                }
                sx={{ width: '100%', mb: 0.5 }}
              />
            ))}
          </Box>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          >
            <FormControlLabel value="" control={<Radio size="small" />} label="Όλα" />
            {filter.options?.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        );

      case 'daterange':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={elLocale}>
            <Stack spacing={2}>
              <DatePicker
                label="Από"
                value={value?.from || null}
                onChange={(date) => handleFilterChange(filter.id, { ...value, from: date })}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
              <DatePicker
                label="Έως"
                value={value?.to || null}
                onChange={(date) => handleFilterChange(filter.id, { ...value, to: date })}
                minDate={value?.from || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        );

      case 'number':
        return (
          <Stack direction="row" spacing={2}>
            <TextField
              type="number"
              size="small"
              placeholder="Από"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, min: e.target.value })}
              inputProps={{ min: filter.min, max: filter.max }}
              fullWidth
            />
            <TextField
              type="number"
              size="small"
              placeholder="Έως"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, max: e.target.value })}
              inputProps={{ min: value?.min || filter.min, max: filter.max }}
              fullWidth
            />
          </Stack>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
              />
            }
            label={filter.placeholder || 'Ενεργό'}
          />
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : width,
          maxWidth: '100%',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
          {activeFiltersCount > 0 && (
            <Badge badgeContent={activeFiltersCount} color="primary" />
          )}
        </Box>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />

      {/* Filters */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {activeFiltersCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<ClearAllIcon />}
              onClick={handleClearAll}
              size="small"
              fullWidth
            >
              Καθαρισμός όλων ({activeFiltersCount})
            </Button>
          </Box>
        )}

        {filters.map((filter) => (
          <Accordion
            key={filter.id}
            expanded={expandedPanels.includes(filter.id)}
            onChange={handlePanelChange(filter.id)}
            elevation={0}
            sx={{
              '&:before': {
                display: 'none',
              },
              '&.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 0,
                '& .MuiAccordionSummary-content': {
                  my: 1,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography>{filter.label}</Typography>
                {values[filter.id] !== undefined && values[filter.id] !== '' && (
                  <Chip
                    label={
                      Array.isArray(values[filter.id])
                        ? values[filter.id].length
                        : typeof values[filter.id] === 'object'
                        ? '✓'
                        : values[filter.id]
                    }
                    size="small"
                    color="primary"
                    sx={{ height: 20 }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              {renderFilter(filter)}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Footer */}
      {showApplyButton && !autoApply && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleApply}
              disabled={activeFiltersCount === 0}
            >
              Εφαρμογή φίλτρων
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

// Filter button component for easy integration
export const FilterButton: React.FC<{
  onClick: () => void;
  count?: number;
}> = ({ onClick, count = 0 }) => (
  <Tooltip title="Φίλτρα">
    <IconButton onClick={onClick}>
      <Badge badgeContent={count} color="primary">
        <FilterListIcon />
      </Badge>
    </IconButton>
  </Tooltip>
);

export default FilterPanel;
