import React, { useState, useRef } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Box,
  Typography,
  Divider,
  Paper,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface PrintColumn {
  id: string;
  label: string;
  printable?: boolean;
  format?: (value: any) => string;
  width?: string;
}

interface PrintOptions {
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  includeHeaders?: boolean;
  includeFooters?: boolean;
  includePageNumbers?: boolean;
  includeTimestamp?: boolean;
  selectedColumns?: string[];
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  fontSize?: 'small' | 'normal' | 'large';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

interface PrintButtonProps {
  data: any[];
  columns: PrintColumn[];
  options?: PrintOptions;
  onPrint?: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  label?: string;
  children?: React.ReactNode; // Custom content to print
}

// Print component wrapper
const PrintContent = React.forwardRef<HTMLDivElement, {
  data: any[];
  columns: PrintColumn[];
  options: PrintOptions;
  children?: React.ReactNode;
}>(({ data, columns, options, children }, ref) => {
  const selectedColumns = columns.filter(col => 
    options.selectedColumns?.includes(col.id) ?? col.printable !== false
  );

  const fontSizeMap = {
    small: '12px',
    normal: '14px',
    large: '16px',
  };

  return (
    <div ref={ref} style={{ display: 'none' }}>
      <style>
        {`
          @media print {
            @page {
              size: ${options.pageSize || 'A4'} ${options.orientation || 'portrait'};
              margin: ${options.margins?.top || '20mm'} ${options.margins?.right || '20mm'} 
                      ${options.margins?.bottom || '20mm'} ${options.margins?.left || '20mm'};
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: ${fontSizeMap[options.fontSize || 'normal']};
              color: #000;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .print-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .print-timestamp {
              font-size: 12px;
              color: #999;
              margin-bottom: 20px;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            .print-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .print-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .print-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            
            .page-number {
              position: fixed;
              bottom: 10mm;
              right: 10mm;
              font-size: 12px;
              color: #999;
            }
            
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      {/* Custom content if provided */}
      {children ? (
        <div className="print-content">{children}</div>
      ) : (
        <>
          {/* Header */}
          {(options.title || options.subtitle || options.includeTimestamp || options.customHeader) && (
            <div className="print-header">
              {options.customHeader}
              {options.title && <div className="print-title">{options.title}</div>}
              {options.subtitle && <div className="print-subtitle">{options.subtitle}</div>}
              {options.includeTimestamp && (
                <div className="print-timestamp">
                  Εκτυπώθηκε: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: el })}
                </div>
              )}
            </div>
          )}
          
          {/* Table */}
          <table className="print-table">
            {options.includeHeaders !== false && (
              <thead>
                <tr>
                  {selectedColumns.map(column => (
                    <th key={column.id} style={{ width: column.width }}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {selectedColumns.map(column => {
                    const value = row[column.id];
                    const displayValue = column.format ? column.format(value) : value;
                    return (
                      <td key={column.id}>
                        {displayValue || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Footer */}
          {(options.includeFooters || options.customFooter) && (
            <div className="print-footer">
              {options.customFooter}
            </div>
          )}
          
          {/* Page numbers */}
          {options.includePageNumbers && (
            <div className="page-number">
              Σελίδα <span className="pageNumber"></span> από <span className="totalPages"></span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

PrintContent.displayName = 'PrintContent';

const PrintButton: React.FC<PrintButtonProps> = ({
  data,
  columns,
  options = {},
  onPrint,
  variant = 'outlined',
  size = 'medium',
  color = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  label = 'Εκτύπωση',
  children,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    orientation: 'portrait',
    pageSize: 'A4',
    includeHeaders: true,
    includeTimestamp: true,
    fontSize: 'normal',
    selectedColumns: columns.filter(col => col.printable !== false).map(col => col.id),
    ...options,
  });
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: printOptions.title || 'Εκτύπωση',
    onAfterPrint: () => {
      onPrint?.();
    },
    pageStyle: `
      @page {
        size: ${printOptions.pageSize} ${printOptions.orientation};
      }
    `,
  });

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleOptionChange = (key: keyof PrintOptions, value: any) => {
    setPrintOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleColumnToggle = (columnId: string) => {
    setPrintOptions(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns?.includes(columnId)
        ? prev.selectedColumns.filter(id => id !== columnId)
        : [...(prev.selectedColumns || []), columnId],
    }));
  };

  const handlePrintClick = () => {
    if (data.length === 0 && !children) return;
    handlePrint();
  };

  const ButtonComponent = iconOnly ? (
    <Tooltip title={label}>
      <span>
        <IconButton
          onClick={handlePrintClick}
          disabled={disabled || loading || (data.length === 0 && !children)}
          color={color}
          size={size}
        >
          {loading ? <CircularProgress size={24} /> : <PrintIcon />}
        </IconButton>
      </span>
    </Tooltip>
  ) : (
    <Button
      variant={variant}
      size={size}
      color={color}
      onClick={handlePrintClick}
      disabled={disabled || loading || (data.length === 0 && !children)}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={20} /> : <PrintIcon />}
    >
      {label}
    </Button>
  );

  return (
    <>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {ButtonComponent}
        <Tooltip title="Ρυθμίσεις εκτύπωσης">
          <IconButton
            size="small"
            onClick={handleSettingsOpen}
            disabled={disabled || loading}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Print Content (hidden) */}
      <PrintContent
        ref={printRef}
        data={data}
        columns={columns}
        options={printOptions}
      >
        {children}
      </PrintContent>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ρυθμίσεις Εκτύπωσης</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Orientation */}
            <FormControl>
              <FormLabel>Προσανατολισμός</FormLabel>
              <RadioGroup
                row
                value={printOptions.orientation}
                onChange={(e) => handleOptionChange('orientation', e.target.value)}
              >
                <FormControlLabel value="portrait" control={<Radio />} label="Κατακόρυφα" />
                <FormControlLabel value="landscape" control={<Radio />} label="Οριζόντια" />
              </RadioGroup>
            </FormControl>

            {/* Page Size */}
            <FormControl>
              <FormLabel>Μέγεθος χαρτιού</FormLabel>
              <RadioGroup
                row
                value={printOptions.pageSize}
                onChange={(e) => handleOptionChange('pageSize', e.target.value)}
              >
                <FormControlLabel value="A4" control={<Radio />} label="A4" />
                <FormControlLabel value="A3" control={<Radio />} label="A3" />
                <FormControlLabel value="Letter" control={<Radio />} label="Letter" />
              </RadioGroup>
            </FormControl>

            {/* Font Size */}
            <FormControl>
              <FormLabel>Μέγεθος γραμματοσειράς</FormLabel>
              <RadioGroup
                row
                value={printOptions.fontSize}
                onChange={(e) => handleOptionChange('fontSize', e.target.value)}
              >
                <FormControlLabel value="small" control={<Radio />} label="Μικρό" />
                <FormControlLabel value="normal" control={<Radio />} label="Κανονικό" />
                <FormControlLabel value="large" control={<Radio />} label="Μεγάλο" />
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* Column Selection */}
            {!children && (
              <>
                <Typography variant="subtitle2">Επιλογή στηλών</Typography>
                {columns.map(column => (
                  <FormControlLabel
                    key={column.id}
                    control={
                      <Checkbox
                        checked={printOptions.selectedColumns?.includes(column.id) || false}
                        onChange={() => handleColumnToggle(column.id)}
                        disabled={column.printable === false}
                      />
                    }
                    label={column.label}
                  />
                ))}
                <Divider />
              </>
            )}

            {/* Options */}
            <Typography variant="subtitle2">Επιλογές</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={printOptions.includeHeaders || false}
                  onChange={(e) => handleOptionChange('includeHeaders', e.target.checked)}
                />
              }
              label="Εμφάνιση επικεφαλίδων"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={printOptions.includeTimestamp || false}
                  onChange={(e) => handleOptionChange('includeTimestamp', e.target.checked)}
                />
              }
              label="Εμφάνιση ημερομηνίας/ώρας εκτύπωσης"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={printOptions.includePageNumbers || false}
                  onChange={(e) => handleOptionChange('includePageNumbers', e.target.checked)}
                />
              }
              label="Εμφάνιση αριθμών σελίδας"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Ακύρωση</Button>
          <Button onClick={handleSettingsClose} variant="contained">
            Αποθήκευση
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PrintButton;
