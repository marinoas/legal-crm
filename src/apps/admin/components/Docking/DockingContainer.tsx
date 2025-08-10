import React, { useRef, useEffect, useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { useDocking } from '../../hooks/useDocking';
import DockablePanel from './DockablePanel';
import { DockablePanel as DockablePanelType } from '../../../../types/docking';

const DockingGrid = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '600px',
  background: theme.palette.background.default,
  overflow: 'hidden',
  userSelect: 'none',
}));

const GridOverlay = styled(Box)<{ show: boolean }>(({ theme, show }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  opacity: show ? 0.1 : 0,
  transition: 'opacity 0.2s ease',
  backgroundImage: `
    linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
    linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)
  `,
  backgroundSize: 'calc(100% / 12) calc(100% / 8)',
}));

interface DockingContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const DockingContainer: React.FC<DockingContainerProps> = ({ 
  children, 
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    panels,
    dragState,
    updateDrag,
    endDrag,
    dockingEngine,
  } = useDocking(containerRef);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (dragState.isDragging) {
      updateDrag({ x: event.clientX, y: event.clientY });
    }
  }, [dragState.isDragging, updateDrag]);

  // Handle mouse up for ending drag
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      endDrag();
    }
  }, [dragState.isDragging, endDrag]);

  // Add global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Convert grid position to pixel position
  const getPixelPosition = (panel: DockablePanelType) => {
    if (!dockingEngine || !containerRef.current) {
      return { x: 0, y: 0, width: 300, height: 200 };
    }

    return dockingEngine.gridToPixels(panel.position);
  };

  return (
    <DockingGrid ref={containerRef} className={className}>
      {/* Grid overlay - shows during dragging */}
      <GridOverlay show={dragState.isDragging} />
      
      {/* Render all visible panels */}
      {panels
        .filter(panel => panel.isVisible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(panel => {
          const pixelPos = getPixelPosition(panel);
          
          return (
            <DockablePanel
              key={panel.id}
              panel={panel}
              style={{
                position: 'absolute',
                left: pixelPos.x,
                top: pixelPos.y,
                width: pixelPos.width,
                height: pixelPos.height,
                zIndex: panel.zIndex,
              }}
              isDragging={dragState.draggedPanel === panel.id}
            />
          );
        })}
      
      {/* Custom children (like QuickActions) */}
      {children}
    </DockingGrid>
  );
};

export default DockingContainer;

