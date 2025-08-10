import React, { useCallback } from 'react';
import { 
  Paper, 
  Box, 
  IconButton, 
  Typography, 
  styled,
  alpha 
} from '@mui/material';
import {
  DragIndicator,
  Minimize,
  Close,
  PushPin,
  PushPinOutlined,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { DockablePanel as DockablePanelType } from '../../../../types/docking';
import { useDocking } from '../../hooks/useDocking';

const PanelContainer = styled(Paper)<{ 
  isDragging: boolean; 
  isMinimized: boolean;
  isPinned: boolean;
}>(({ theme, isDragging, isMinimized, isPinned }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  overflow: 'hidden',
  transition: isDragging ? 'none' : 'all 0.2s ease',
  transform: isDragging ? 'rotate(2deg)' : 'none',
  boxShadow: isDragging 
    ? `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`
    : theme.shadows[2],
  opacity: isDragging ? 0.9 : 1,
  cursor: isDragging ? 'grabbing' : 'default',
  ...(isPinned && {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }),
  ...(isMinimized && {
    height: '48px !important',
    minHeight: '48px !important',
  }),
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: 48,
  cursor: 'grab',
  userSelect: 'none',
  '&:active': {
    cursor: 'grabbing',
  },
}));

const PanelTitle = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const PanelContent = styled(Box)<{ isMinimized: boolean }>(({ isMinimized }) => ({
  flex: 1,
  padding: isMinimized ? 0 : '16px',
  overflow: 'auto',
  display: isMinimized ? 'none' : 'block',
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  marginLeft: 4,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

interface DockablePanelProps {
  panel: DockablePanelType;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

const DockablePanel: React.FC<DockablePanelProps> = ({ 
  panel, 
  style,
  isDragging = false 
}) => {
  const {
    toggleMinimize,
    togglePin,
    removePanel,
    bringToFront,
    startDrag,
  } = useDocking(React.createRef());

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click
    
    event.preventDefault();
    bringToFront(panel.id);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    startDrag(panel.id, offset);
  }, [panel.id, bringToFront, startDrag]);

  const handleMinimize = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    toggleMinimize(panel.id);
  }, [panel.id, toggleMinimize]);

  const handlePin = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    togglePin(panel.id);
  }, [panel.id, togglePin]);

  const handleClose = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    removePanel(panel.id);
  }, [panel.id, removePanel]);

  const handlePanelClick = useCallback(() => {
    bringToFront(panel.id);
  }, [panel.id, bringToFront]);

  // Render panel content based on component
  const renderContent = () => {
    if (!panel.component) {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Panel content not available
          </Typography>
        </Box>
      );
    }

    const Component = panel.component;
    return <Component panelId={panel.id} />;
  };

  return (
    <PanelContainer
      style={style}
      isDragging={isDragging}
      isMinimized={panel.isMinimized}
      isPinned={panel.isPinned}
      onClick={handlePanelClick}
      elevation={isDragging ? 8 : 2}
    >
      <PanelHeader onMouseDown={handleMouseDown}>
        <DragIndicator 
          sx={{ 
            color: 'text.secondary', 
            fontSize: 16, 
            mr: 1,
            cursor: 'grab'
          }} 
        />
        
        <PanelTitle variant="subtitle2">
          {panel.title}
        </PanelTitle>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ControlButton
            size="small"
            onClick={handlePin}
            title={panel.isPinned ? 'Unpin panel' : 'Pin panel'}
          >
            {panel.isPinned ? (
              <PushPin sx={{ fontSize: 16 }} />
            ) : (
              <PushPinOutlined sx={{ fontSize: 16 }} />
            )}
          </ControlButton>
          
          <ControlButton
            size="small"
            onClick={handleMinimize}
            title={panel.isMinimized ? 'Restore panel' : 'Minimize panel'}
          >
            {panel.isMinimized ? (
              <FullscreenExit sx={{ fontSize: 16 }} />
            ) : (
              <Minimize sx={{ fontSize: 16 }} />
            )}
          </ControlButton>
          
          <ControlButton
            size="small"
            onClick={handleClose}
            title="Close panel"
            sx={{ 
              '&:hover': { 
                backgroundColor: alpha('#ef4444', 0.1),
                color: '#ef4444'
              } 
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </ControlButton>
        </Box>
      </PanelHeader>
      
      <PanelContent isMinimized={panel.isMinimized}>
        {renderContent()}
      </PanelContent>
    </PanelContainer>
  );
};

export default DockablePanel;

