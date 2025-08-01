// src/utils/print.ts
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  watermark?: {
    text: string;
    opacity?: number;
    angle?: number;
    fontSize?: number;
  };
  header?: string;
  footer?: string;
  pageNumbers?: boolean;
  disableSelection?: boolean;
  disableContextMenu?: boolean;
}

interface PrintStyles {
  pageBreak: string;
  noBreak: string;
  hidePrint: string;
  onlyPrint: string;
  watermark: string;
  disableSelection: string;
}

// Print-specific CSS styles
export const printStyles: PrintStyles = {
  pageBreak: 'page-break-before: always;',
  noBreak: 'page-break-inside: avoid;',
  hidePrint: `
    @media print {
      display: none !important;
    }
  `,
  onlyPrint: `
    @media screen {
      display: none !important;
    }
    @media print {
      display: block !important;
    }
  `,
  watermark: `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 120px;
    color: rgba(0, 0, 0, 0.1);
    z-index: -1;
    user-select: none;
    pointer-events: none;
  `,
  disableSelection: `
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  `
};

// Generate print stylesheet
export const generatePrintStyles = (options: PrintOptions = {}): string => {
  const {
    orientation = 'portrait',
    format = 'a4',
    margins = { top: 20, right: 20, bottom: 20, left: 20 },
    watermark,
    header,
    footer,
    pageNumbers = true
  } = options;

  return `
    <style type="text/css" media="print">
      @page {
        size: ${format} ${orientation};
        margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: 'Roboto', 'Arial', sans-serif;
        color: #000;
        background: #fff;
      }

      /* Hide non-printable elements */
      .no-print,
      .MuiAppBar-root,
      .MuiDrawer-root,
      .MuiBottomNavigation-root,
      .MuiFab-root,
      .MuiSpeedDial-root,
      .MuiSnackbar-root,
      button:not(.print-button),
      input[type="file"],
      video,
      audio {
        display: none !important;
      }

      /* Ensure tables don't break */
      table {
        page-break-inside: avoid;
      }

      /* Keep headings with content */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }

      /* Avoid breaking inside elements */
      p, li, blockquote, div {
        page-break-inside: avoid;
      }

      /* Watermark */
      ${watermark ? `
        body::before {
          content: "${watermark.text}";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${watermark.angle || -45}deg);
          font-size: ${watermark.fontSize || 120}px;
          color: rgba(0, 0, 0, ${watermark.opacity || 0.1});
          z-index: -1;
          user-select: none;
          pointer-events: none;
        }
      ` : ''}

      /* Header */
      ${header ? `
        @page {
          @top-center {
            content: "${header}";
            font-size: 12px;
            color: #666;
          }
        }
      ` : ''}

      /* Footer with page numbers */
      ${footer || pageNumbers ? `
        @page {
          @bottom-center {
            content: "${footer || ''} ${pageNumbers ? 'Σελίδα ' counter(page) ' από ' counter(pages) : ''}";
            font-size: 10px;
            color: #666;
          }
        }
      ` : ''}

      /* Links */
      a {
        color: #000 !important;
        text-decoration: none !important;
      }

      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 80%;
        color: #666;
      }

      /* Images */
      img {
        max-width: 100% !important;
        page-break-inside: avoid;
      }

      /* Greek law specific styles */
      .legal-article {
        font-style: italic;
        margin: 10px 0;
      }

      .case-number {
        font-weight: bold;
        font-size: 14px;
      }

      .court-stamp {
        border: 2px solid #000;
        padding: 10px;
        text-align: center;
        page-break-inside: avoid;
      }
    </style>
  `;
};

// Print preview window
export const printPreview = (
  content: string, 
  options: PrintOptions = {}
): Window | null => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    console.error('Failed to open print preview window');
    return null;
  }

  const styles = generatePrintStyles(options);
  const preventCopyScript = options.disableSelection ? `
    <script>
      document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
      });
      
      document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
      });
      
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
      });
    </script>
  ` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="el">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.title || 'Προεπισκόπηση Εκτύπωσης'}</title>
      ${styles}
      <style>
        body {
          ${options.disableSelection ? printStyles.disableSelection : ''}
        }
      </style>
    </head>
    <body>
      ${content}
      ${preventCopyScript}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
  return printWindow;
};

// Print specific element
export const printElement = (
  elementId: string,
  options: PrintOptions = {}
): void => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const content = element.innerHTML;
  printPreview(content, options);
};

// Generate PDF from HTML
export const generatePDF = async (
  element: HTMLElement,
  options: PrintOptions = {}
): Promise<Blob | null> => {
  try {
    // Add watermark if specified
    let watermarkElement: HTMLDivElement | null = null;
    if (options.watermark) {
      watermarkElement = document.createElement('div');
      watermarkElement.style.cssText = printStyles.watermark;
      watermarkElement.style.fontSize = `${options.watermark.fontSize || 120}px`;
      watermarkElement.style.opacity = `${options.watermark.opacity || 0.1}`;
      watermarkElement.style.transform = `translate(-50%, -50%) rotate(${options.watermark.angle || -45}deg)`;
      watermarkElement.textContent = options.watermark.text;
      element.appendChild(watermarkElement);
    }

    // Convert element to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Remove watermark element
    if (watermarkElement) {
      element.removeChild(watermarkElement);
    }

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add page numbers if requested
    if (options.pageNumbers) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(
          `Σελίδα ${i} από ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    }

    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

// Download PDF
export const downloadPDF = async (
  element: HTMLElement,
  filename: string,
  options: PrintOptions = {}
): Promise<boolean> => {
  try {
    const blob = await generatePDF(element, options);
    
    if (!blob) {
      throw new Error('Failed to generate PDF');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};

// Apply copy protection to element
export const applyCopyProtection = (element: HTMLElement): void => {
  // Disable text selection
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  
  // Disable right-click context menu
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable copy keyboard shortcuts
  element.addEventListener('keydown', (e) => {
    if (
      (e.ctrlKey || e.metaKey) && 
      (e.key === 'c' || e.key === 'a' || e.key === 'x')
    ) {
      e.preventDefault();
      return false;
    }
  });
  
  // Disable text selection events
  element.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
};

// Remove copy protection from element
export const removeCopyProtection = (element: HTMLElement): void => {
  element.style.userSelect = '';
  element.style.webkitUserSelect = '';
  
  // Note: Event listeners cannot be easily removed without references
  // This is a limitation of this approach
};

// Create print-friendly table
export const createPrintTable = (
  headers: string[],
  rows: string[][],
  options: {
    title?: string;
    showBorders?: boolean;
    stripedRows?: boolean;
  } = {}
): string => {
  const {
    title,
    showBorders = true,
    stripedRows = true
  } = options;

  const borderStyle = showBorders ? 'border: 1px solid #000;' : '';
  const tableStyle = `
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    ${borderStyle}
  `;

  const cellStyle = `
    padding: 8px;
    text-align: left;
    ${borderStyle}
  `;

  const headerStyle = `
    ${cellStyle}
    background-color: #f0f0f0;
    font-weight: bold;
  `;

  let html = '';

  if (title) {
    html += `<h3 style="margin-bottom: 10px;">${title}</h3>`;
  }

  html += `<table style="${tableStyle}">`;
  
  // Headers
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="${headerStyle}">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Rows
  html += '<tbody>';
  rows.forEach((row, index) => {
    const rowStyle = stripedRows && index % 2 === 1 
      ? `background-color: #f9f9f9;` 
      : '';
    
    html += `<tr style="${rowStyle}">`;
    row.forEach(cell => {
      html += `<td style="${cellStyle}">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table>';
  
  return html;
};

// Format document for legal printing
export const formatLegalDocument = (
  content: string,
  metadata: {
    caseNumber?: string;
    court?: string;
    date?: string;
    parties?: {
      plaintiff?: string;
      defendant?: string;
    };
    documentType?: string;
    watermark?: string;
  } = {}
): string => {
  const {
    caseNumber,
    court,
    date,
    parties,
    documentType,
    watermark
  } = metadata;

  let formattedContent = '';

  // Header with court information
  if (court || caseNumber) {
    formattedContent += `
      <div class="court-stamp" style="margin-bottom: 30px;">
        ${court ? `<h2>${court}</h2>` : ''}
        ${caseNumber ? `<p class="case-number">Αριθμός Υπόθεσης: ${caseNumber}</p>` : ''}
        ${date ? `<p>Ημερομηνία: ${date}</p>` : ''}
      </div>
    `;
  }

  // Document type
  if (documentType) {
    formattedContent += `<h1 style="text-align: center; margin: 20px 0;">${documentType}</h1>`;
  }

  // Parties
  if (parties && (parties.plaintiff || parties.defendant)) {
    formattedContent += `
      <div style="margin: 20px 0;">
        ${parties.plaintiff ? `<p><strong>Ενάγων:</strong> ${parties.plaintiff}</p>` : ''}
        ${parties.defendant ? `<p><strong>Εναγόμενος:</strong> ${parties.defendant}</p>` : ''}
      </div>
      <hr style="margin: 20px 0;">
    `;
  }

  // Main content
  formattedContent += `<div style="text-align: justify;">${content}</div>`;

  // Signature area
  formattedContent += `
    <div style="margin-top: 50px; text-align: right;">
      <p>_______________________</p>
      <p>Υπογραφή</p>
    </div>
  `;

  return formattedContent;
};