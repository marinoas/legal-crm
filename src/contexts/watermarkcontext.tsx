import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Types
interface WatermarkOptions {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  rotation?: number;
  density?: 'low' | 'medium' | 'high';
}

interface WatermarkContextType {
  addWatermark: (element: HTMLElement, options?: WatermarkOptions) => void;
  removeWatermark: (element: HTMLElement) => void;
  addDocumentWatermark: (canvas: HTMLCanvasElement, options?: WatermarkOptions) => void;
  addPDFWatermark: (pdfDoc: any, options?: WatermarkOptions) => Promise<any>;
}

// Create Context
const WatermarkContext = createContext<WatermarkContextType | undefined>(undefined);

// Default watermark options
const defaultOptions: WatermarkOptions = {
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  color: '#000000',
  opacity: 0.1,
  rotation: -45,
  density: 'medium',
};

// Provider Component
export const WatermarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Generate watermark text
  const getWatermarkText = useCallback((customText?: string): string => {
    if (customText) return customText;
    
    const date = new Date().toLocaleDateString('el-GR');
    const time = new Date().toLocaleTimeString('el-GR');
    
    return `${user?.firstName} ${user?.lastName} - ${user?.email} - ${date} ${time}`;
  }, [user]);

  // Add watermark to HTML element
  const addWatermark = useCallback((element: HTMLElement, options?: WatermarkOptions) => {
    const config = { ...defaultOptions, ...options };
    const text = getWatermarkText(config.text);

    // Create watermark container
    const watermarkContainer = document.createElement('div');
    watermarkContainer.className = 'watermark-container';
    watermarkContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;

    // Calculate spacing based on density
    const spacing = {
      low: 200,
      medium: 150,
      high: 100,
    }[config.density || 'medium'];

    // Create watermark pattern
    const pattern = document.createElement('div');
    pattern.style.cssText = `
      position: absolute;
      width: 200%;
      height: 200%;
      top: -50%;
      left: -50%;
      transform: rotate(${config.rotation}deg);
    `;

    // Add watermark text elements
    for (let y = 0; y < 3000; y += spacing) {
      for (let x = 0; x < 3000; x += spacing * 2) {
        const watermarkText = document.createElement('div');
        watermarkText.textContent = text;
        watermarkText.style.cssText = `
          position: absolute;
          top: ${y}px;
          left: ${x}px;
          font-size: ${config.fontSize}px;
          font-family: ${config.fontFamily};
          color: ${config.color};
          opacity: ${config.opacity};
          white-space: nowrap;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        `;
        pattern.appendChild(watermarkText);
      }
    }

    watermarkContainer.appendChild(pattern);

    // Ensure element has relative positioning
    const currentPosition = window.getComputedStyle(element).position;
    if (currentPosition === 'static') {
      element.style.position = 'relative';
    }

    // Add watermark to element
    element.appendChild(watermarkContainer);
    element.setAttribute('data-watermarked', 'true');
  }, [getWatermarkText]);

  // Remove watermark from element
  const removeWatermark = useCallback((element: HTMLElement) => {
    const watermarkContainer = element.querySelector('.watermark-container');
    if (watermarkContainer) {
      watermarkContainer.remove();
      element.removeAttribute('data-watermarked');
    }
  }, []);

  // Add watermark to canvas (for images)
  const addDocumentWatermark = useCallback((canvas: HTMLCanvasElement, options?: WatermarkOptions) => {
    const config = { ...defaultOptions, ...options };
    const text = getWatermarkText(config.text);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Save current context state
    ctx.save();

    // Set watermark style
    ctx.font = `${config.fontSize}px ${config.fontFamily}`;
    ctx.fillStyle = config.color || '#000000';
    ctx.globalAlpha = config.opacity || 0.1;

    // Calculate spacing
    const spacing = {
      low: 200,
      medium: 150,
      high: 100,
    }[config.density || 'medium'];

    // Rotate context
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((config.rotation || -45) * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw watermark pattern
    for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
      for (let x = -canvas.width; x < canvas.width * 2; x += spacing * 2) {
        ctx.fillText(text, x, y);
      }
    }

    // Restore context state
    ctx.restore();
  }, [getWatermarkText]);

  // Add watermark to PDF using pdf-lib
  const addPDFWatermark = useCallback(async (pdfDoc: any, options?: WatermarkOptions) => {
    const config = { ...defaultOptions, ...options };
    const text = getWatermarkText(config.text);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Calculate spacing
      const spacing = {
        low: 200,
        medium: 150,
        high: 100,
      }[config.density || 'medium'];

      // Set text properties
      const fontSize = config.fontSize || 16;
      const opacity = config.opacity || 0.1;
      const rotation = (config.rotation || -45) * Math.PI / 180;

      // Draw watermark pattern
      for (let y = 0; y < height + 200; y += spacing) {
        for (let x = 0; x < width + 200; x += spacing * 2) {
          page.drawText(text, {
            x: x - 100,
            y: y - 100,
            size: fontSize,
            color: { red: 0, green: 0, blue: 0 },
            opacity: opacity,
            rotate: rotation,
          });
        }
      }
    }

    return pdfDoc;
  }, [getWatermarkText]);

  // Add watermark to all document viewers on mount
  useEffect(() => {
    const addWatermarksToDocuments = () => {
      // Find all document containers
      const documentContainers = document.querySelectorAll(
        '.document-viewer:not([data-watermarked]), ' +
        '.pdf-viewer:not([data-watermarked]), ' +
        '.image-viewer:not([data-watermarked])'
      );

      documentContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          addWatermark(container);
        }
      });
    };

    // Run immediately
    addWatermarksToDocuments();

    // Observe DOM changes
    const observer = new MutationObserver(() => {
      addWatermarksToDocuments();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [addWatermark]);

  // Prevent screenshots (best effort)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.keyCode === 44) {
        e.preventDefault();
        navigator.clipboard.writeText('');
        console.warn('Screenshot attempt blocked');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add CSS to prevent selection in watermarked elements
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-watermarked] {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      [data-watermarked] * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      @media print {
        .watermark-container {
          display: block !important;
          opacity: 0.2 !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const value: WatermarkContextType = {
    addWatermark,
    removeWatermark,
    addDocumentWatermark,
    addPDFWatermark,
  };

  return (
    <WatermarkContext.Provider value={value}>
      {children}
    </WatermarkContext.Provider>
  );
};

// Custom hook
export const useWatermark = () => {
  const context = useContext(WatermarkContext);
  if (context === undefined) {
    throw new Error('useWatermark must be used within a WatermarkProvider');
  }
  return context;
};
