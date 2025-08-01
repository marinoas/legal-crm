import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { saveAs } from 'file-saver';

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: any;
  }
}

// Export types
export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export interface ExportOptions {
  filename?: string;
  title?: string;
  creator?: string;
  subject?: string;
  keywords?: string[];
  includeHeaders?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  orientation?: 'portrait' | 'landscape';
}

export interface ExcelExportOptions extends ExportOptions {
  sheetName?: string;
  autoWidth?: boolean;
  freeze?: { row?: number; col?: number };
  headerStyle?: any;
  rowStyle?: any;
}

export interface PDFExportOptions extends ExportOptions {
  fontSize?: number;
  fontFamily?: string;
  headerColor?: string;
  rowColors?: string[];
  logo?: string;
  watermark?: string;
}

// Greek fonts for PDF
const greekFonts = {
  addGreekFont: (doc: jsPDF) => {
    // In production, you would add a proper Greek font here
    // For now, using default font with UTF-8 support
    doc.setFont('helvetica');
  }
};

// Data formatting utilities
const formatters = {
  formatDate: (value: any, format: string = 'dd/MM/yyyy'): string => {
    if (!value) return '';
    try {
      const date = value instanceof Date ? value : new Date(value);
      return format(date, format, { locale: el });
    } catch {
      return String(value);
    }
  },

  formatNumber: (value: any, decimals: number = 2): string => {
    if (value === null || value === undefined) return '';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('el-GR', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  },

  formatCurrency: (value: any): string => {
    if (value === null || value === undefined) return '';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('el-GR', { 
      style: 'currency', 
      currency: 'EUR' 
    });
  },

  formatBoolean: (value: any): string => {
    if (value === null || value === undefined) return '';
    return value ? 'Ναι' : 'Όχι';
  }
};

// Excel export utilities
export const excelExport = {
  // Export data to Excel
  exportToExcel: (
    data: any[],
    columns: Array<{
      key: string;
      header: string;
      width?: number;
      type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
      format?: string;
    }>,
    options: ExcelExportOptions = {}
  ): void => {
    const {
      filename = `export_${Date.now()}`,
      title,
      sheetName = 'Δεδομένα',
      autoWidth = true,
      freeze,
      includeHeaders = true
    } = options;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data
    const wsData: any[][] = [];

    // Add title if provided
    if (title) {
      wsData.push([title]);
      wsData.push([]); // Empty row
    }

    // Add headers
    if (includeHeaders) {
      wsData.push(columns.map(col => col.header));
    }

    // Add data rows
    data.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        
        // Format based on type
        switch (col.type) {
          case 'date':
            return formatters.formatDate(value, col.format);
          case 'number':
            return value;
          case 'currency':
            return value;
          case 'boolean':
            return formatters.formatBoolean(value);
          default:
            return value || '';
        }
      });
      wsData.push(rowData);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply column widths
    if (autoWidth || columns.some(col => col.width)) {
      ws['!cols'] = columns.map(col => ({
        wch: col.width || (autoWidth ? Math.max(col.header.length, 15) : 10)
      }));
    }

    // Apply freeze panes
    if (freeze) {
      ws['!freeze'] = {
        xSplit: freeze.col || 0,
        ySplit: freeze.row || 0,
        topLeftCell: XLSX.utils.encode_cell({
          c: freeze.col || 0,
          r: freeze.row || 0
        })
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Set workbook properties
    if (wb.Props) {
      wb.Props.Title = title || 'Export';
      wb.Props.Creator = options.creator || 'Legal CRM';
      wb.Props.Subject = options.subject || 'Data Export';
      wb.Props.Keywords = options.keywords?.join(', ') || '';
    }

    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  },

  // Export multiple sheets
  exportMultipleSheets: (
    sheets: Array<{
      data: any[];
      columns: any[];
      sheetName: string;
      options?: ExcelExportOptions;
    }>,
    filename: string = `export_${Date.now()}`
  ): void => {
    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const wsData: any[][] = [];

      // Add headers
      if (sheet.options?.includeHeaders !== false) {
        wsData.push(sheet.columns.map(col => col.header));
      }

      // Add data
      sheet.data.forEach(row => {
        const rowData = sheet.columns.map(col => {
          const value = row[col.key];
          return value || '';
        });
        wsData.push(rowData);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
    });

    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
};

// PDF export utilities
export const pdfExport = {
  // Export data to PDF
  exportToPDF: (
    data: any[],
    columns: Array<{
      key: string;
      header: string;
      width?: number;
      align?: 'left' | 'center' | 'right';
      type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
      format?: string;
    }>,
    options: PDFExportOptions = {}
  ): void => {
    const {
      filename = `export_${Date.now()}`,
      title,
      orientation = 'portrait',
      fontSize = 10,
      fontFamily = 'helvetica',
      headerColor = '#1976d2',
      rowColors = ['#ffffff', '#f5f5f5'],
      logo,
      watermark,
      includeHeaders = true
    } = options;

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Add Greek font support
    greekFonts.addGreekFont(doc);

    // Add metadata
    doc.setProperties({
      title: title || 'Export',
      creator: options.creator || 'Legal CRM',
      subject: options.subject || 'Data Export',
      keywords: options.keywords?.join(', ') || ''
    });

    let yPosition = 20;

    // Add logo if provided
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', 15, 10, 30, 15);
        yPosition = 35;
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    }

    // Add title
    if (title) {
      doc.setFontSize(16);
      doc.setFont(fontFamily, 'bold');
      doc.text(title, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 15;
    }

    // Add date
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: el });
    doc.text(`Ημερομηνία: ${currentDate}`, 15, yPosition);
    yPosition += 10;

    // Prepare table data
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        
        switch (col.type) {
          case 'date':
            return formatters.formatDate(value, col.format);
          case 'number':
            return formatters.formatNumber(value);
          case 'currency':
            return formatters.formatCurrency(value);
          case 'boolean':
            return formatters.formatBoolean(value);
          default:
            return value || '';
        }
      })
    );

    // Add table
    doc.autoTable({
      head: includeHeaders ? [tableHeaders] : [],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        font: fontFamily,
        fontSize: fontSize,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: headerColor,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: rowColors[1]
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = {
          cellWidth: col.width || 'auto',
          halign: col.align || 'left'
        };
        return acc;
      }, {} as any),
      didDrawPage: (data: any) => {
        // Add watermark if provided
        if (watermark) {
          doc.setFontSize(50);
          doc.setTextColor(200);
          doc.setFont(fontFamily, 'bold');
          doc.text(
            watermark,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height / 2,
            {
              align: 'center',
              angle: 45
            }
          );
        }

        // Add page numbers
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont(fontFamily, 'normal');
        const pageCount = doc.getNumberOfPages();
        doc.text(
          `Σελίδα ${data.pageNumber} από ${pageCount}`,
          doc.internal.pageSize.width - 50,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
  },

  // Generate report PDF
  generateReport: (
    sections: Array<{
      title?: string;
      content?: string;
      table?: {
        data: any[];
        columns: any[];
      };
      pageBreak?: boolean;
    }>,
    options: PDFExportOptions = {}
  ): void => {
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    greekFonts.addGreekFont(doc);

    let isFirstSection = true;

    sections.forEach(section => {
      if (!isFirstSection && section.pageBreak) {
        doc.addPage();
      }

      let yPosition = isFirstSection ? 20 : doc.lastAutoTable?.finalY || 20;

      // Add section title
      if (section.title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 15, yPosition);
        yPosition += 10;
      }

      // Add section content
      if (section.content) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section.content, 180);
        doc.text(lines, 15, yPosition);
        yPosition += lines.length * 5 + 5;
      }

      // Add section table
      if (section.table) {
        doc.autoTable({
          head: [section.table.columns.map(col => col.header)],
          body: section.table.data.map(row =>
            section.table!.columns.map(col => row[col.key] || '')
          ),
          startY: yPosition,
          theme: 'grid'
        });
      }

      isFirstSection = false;
    });

    doc.save(`${options.filename || 'report'}.pdf`);
  }
};

// CSV export utilities
export const csvExport = {
  // Export to CSV
  exportToCSV: (
    data: any[],
    columns: Array<{
      key: string;
      header: string;
      type?: string;
      format?: string;
    }>,
    options: ExportOptions = {}
  ): void => {
    const {
      filename = `export_${Date.now()}`,
      includeHeaders = true
    } = options;

    const rows: string[][] = [];

    // Add headers
    if (includeHeaders) {
      rows.push(columns.map(col => col.header));
    }

    // Add data
    data.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        
        if (value === null || value === undefined) return '';
        
        // Format based on type
        switch (col.type) {
          case 'date':
            return formatters.formatDate(value, col.format);
          case 'number':
            return formatters.formatNumber(value);
          case 'currency':
            return formatters.formatCurrency(value);
          case 'boolean':
            return formatters.formatBoolean(value);
          default:
            // Escape quotes and commas
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }
      });
      rows.push(rowData);
    });

    // Convert to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Add BOM for Excel UTF-8 recognition
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    saveAs(blob, `${filename}.csv`);
  }
};

// JSON export utilities
export const jsonExport = {
  // Export to JSON
  exportToJSON: (
    data: any[],
    options: ExportOptions = {}
  ): void => {
    const {
      filename = `export_${Date.now()}`,
      title
    } = options;

    const exportData = {
      title: title || 'Export',
      exportDate: new Date().toISOString(),
      creator: options.creator || 'Legal CRM',
      data: data
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    saveAs(blob, `${filename}.json`);
  }
};

// Universal export function
export const exportData = (
  data: any[],
  columns: Array<{
    key: string;
    header: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
    format?: string;
  }>,
  format: ExportFormat,
  options: ExportOptions = {}
): void => {
  switch (format) {
    case 'excel':
      excelExport.exportToExcel(data, columns, options as ExcelExportOptions);
      break;
    case 'pdf':
      pdfExport.exportToPDF(data, columns, options as PDFExportOptions);
      break;
    case 'csv':
      csvExport.exportToCSV(data, columns, options);
      break;
    case 'json':
      jsonExport.exportToJSON(data, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Export templates for specific data types
export const exportTemplates = {
  // Export clients
  exportClients: (clients: any[], format: ExportFormat, options?: ExportOptions) => {
    const columns = [
      { key: 'folderNumber', header: 'Αρ. Φακέλου', width: 15 },
      { key: 'lastName', header: 'Επώνυμο', width: 20 },
      { key: 'firstName', header: 'Όνομα', width: 20 },
      { key: 'fatherName', header: 'Πατρώνυμο', width: 20 },
      { key: 'mobile', header: 'Κινητό', width: 15 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'afm', header: 'ΑΦΜ', width: 12 },
      { key: 'address.city', header: 'Πόλη', width: 15 },
      { key: 'clientSince', header: 'Πελάτης από', width: 15, type: 'date' }
    ];

    exportData(clients, columns, format, {
      filename: `clients_${format(new Date(), 'yyyyMMdd')}`,
      title: 'Κατάλογος Εντολέων',
      ...options
    });
  },

  // Export financial data
  exportFinancial: (transactions: any[], format: ExportFormat, options?: ExportOptions) => {
    const columns = [
      { key: 'date', header: 'Ημερομηνία', width: 15, type: 'date' },
      { key: 'client.displayName', header: 'Εντολέας', width: 25 },
      { key: 'type', header: 'Τύπος', width: 15 },
      { key: 'category', header: 'Κατηγορία', width: 20 },
      { key: 'description', header: 'Περιγραφή', width: 35 },
      { key: 'amount', header: 'Ποσό', width: 15, type: 'currency', align: 'right' },
      { key: 'vat.amount', header: 'ΦΠΑ', width: 12, type: 'currency', align: 'right' },
      { key: 'totalAmount', header: 'Σύνολο', width: 15, type: 'currency', align: 'right' }
    ];

    exportData(transactions, columns, format, {
      filename: `financial_${format(new Date(), 'yyyyMMdd')}`,
      title: 'Οικονομικές Κινήσεις',
      ...options
    });
  }
};

export default {
  exportData,
  excelExport,
  pdfExport,
  csvExport,
  jsonExport,
  exportTemplates
};