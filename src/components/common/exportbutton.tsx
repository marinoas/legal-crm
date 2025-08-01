import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Divider,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportColumn {
  id: string;
  label: string;
  exportable?: boolean;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  includeTimestamp?: boolean;
  dateFormat?: string;
  selectedColumns?: string[];
  customHeader?: string[];
  customFooter?: string[];
}

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  onExport?: (format: string, data: any[]) => void;
  options?: ExportOptions;
  formats?: ('excel' | 'csv' | 'pdf' | 'json')[];
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  onExport,
  options = {},
  formats = ['excel', 'csv', 'pdf', 'json'],
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  label = 'Εξαγωγή',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    options.selectedColumns || columns.filter(col => col.exportable !== false).map(col => col.id)
  );
  const [includeHeaders, setIncludeHeaders] = useState(options.includeHeaders !== false);
  const [includeTimestamp, setIncludeTimestamp] = useState(options.includeTimestamp !== false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsOpen = () => {
    handleClose();
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const generateFilename = (extension: string) => {
    const baseFilename = options.filename || 'export';
    if (includeTimestamp) {
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss', { locale: el });
      return `${baseFilename}_${timestamp}.${extension}`;
    }
    return `${baseFilename}.${extension}`;
  };

  const prepareData = () => {
    const exportColumns = columns.filter(col => selectedColumns.includes(col.id));
    
    return data.map(row => {
      const exportRow: any = {};
      exportColumns.forEach(col => {
        const value = row[col.id];
        exportRow[col.label] = col.format ? col.format(value) : value;
      });
      return exportRow;
    });
  };

  const exportToExcel = () => {
    const exportData = prepareData();
    const ws = XLSX.utils.json_to_sheet(exportData, { header: includeHeaders ? undefined : [] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Sheet1');
    
    // Add custom header if provided
    if (options.customHeader && options.customHeader.length > 0) {
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      options.customHeader.forEach((headerLine, index) => {
        XLSX.utils.sheet_add_aoa(ws, [[headerLine]], { origin: { r: index, c: 0 } });
      });
    }
    
    XLSX.writeFile(wb, generateFilename('xlsx'));
    handleClose();
    onExport?.('excel', exportData);
  };

  const exportToCSV = () => {
    const exportData = prepareData();
    const headers = includeHeaders ? Object.keys(exportData[0] || {}) : [];
    const csvContent = [
      ...(options.customHeader || []),
      ...(includeHeaders ? [headers.join(',')] : []),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
      ...(options.customFooter || []),
    ].join('\n');
    
    // Add BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = generateFilename('csv');
    link.click();
    
    handleClose();
    onExport?.('csv', exportData);
  };

  const exportToPDF = () => {
    const exportData = prepareData();
    const doc = new jsPDF();
    
    // Add custom header
    let yPosition = 20;
    if (options.customHeader) {
      doc.setFontSize(16);
      options.customHeader.forEach(line => {
        doc.text(line, 14, yPosition);
        yPosition += 10;
      });
    }
    
    // Add title
    doc.setFontSize(14);
    doc.text(options.filename || 'Εξαγωγή Δεδομένων', 14, yPosition);
    yPosition += 10;
    
    // Add timestamp if enabled
    if (includeTimestamp) {
      doc.setFontSize(10);
      doc.text(
        `Ημερομηνία εξαγωγής: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: el })}`,
        14,
        yPosition
      );
      yPosition += 10;
    }
    
    // Prepare table data
    const headers = Object.keys(exportData[0] || {});
    const rows = exportData.map(row => headers.map(header => row[header]));
    
    // Add table
    doc.autoTable({
      head: includeHeaders ? [headers] : [],
      body: rows,
      startY: yPosition,
      styles: {
        font: 'helvetica',
        fontSize: 10,
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
    
    // Add custom footer
    if (options.customFooter) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      options.customFooter.forEach((line, index) => {
        doc.text(line, 14, finalY + (index * 5));
      });
    }
    
    doc.save(generateFilename('pdf'));
    handleClose();
    onExport?.('pdf', exportData);
  };

  const exportToJSON = () => {
    const exportData = prepareData();
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = generateFilename('json');
    link.click();
    
    handleClose();
    onExport?.('json', exportData);
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'json':
        exportToJSON();
        break;
    }
  };

  const formatIcons = {
    excel: <TableChartIcon />,
    csv: <DescriptionIcon />,
    pdf: <PictureAsPdfIcon />,
    json: <CodeIcon />,
  };

  const formatLabels = {
    excel: 'Excel (.xlsx)',
    csv: 'CSV (.csv)',
    pdf: 'PDF (.pdf)',
    json: 'JSON (.json)',
  };

  if (iconOnly) {
    return (
      <>
        <Tooltip title={label}>
          <IconButton
            onClick={handleClick}
            disabled={disabled || loading || data.length === 0}
            color={color}
            size={size}
          >
            {loading ? <CircularProgress size={24} /> : <GetAppIcon />}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {formats.map(format => (
            <MenuItem key={format} onClick={() => handleExport(format)}>
              <ListItemIcon>{formatIcons[format]}</ListItemIcon>
              <ListItemText>{formatLabels[format]}</ListItemText>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleSettingsOpen}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText>Ρυθμίσεις εξαγωγής</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        color={color}
        onClick={handleClick}
        disabled={disabled || loading || data.length === 0}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} /> : <GetAppIcon />}
      >
        {label}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {formats.map(format => (
          <MenuItem key={format} onClick={() => handleExport(format)}>
            <ListItemIcon>{formatIcons[format]}</ListItemIcon>
            <ListItemText>{formatLabels[format]}</ListItemText>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleSettingsOpen}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText>Ρυθμίσεις εξαγωγής</ListItemText>
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ρυθμίσεις Εξαγωγής</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Επιλογή στηλών
            </Typography>
            {columns.map(column => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleColumnToggle(column.id)}
                    disabled={column.exportable === false}
                  />
                }
                label={column.label}
                sx={{ display: 'block', mb: 0.5 }}
              />
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Επιλογές
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                />
              }
              label="Συμπερίληψη επικεφαλίδων"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                />
              }
              label="Προσθήκη ημερομηνίας/ώρας στο όνομα αρχείου"
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

export default ExportButton;
