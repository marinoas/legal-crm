export interface PanelPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DockablePanel {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  position: PanelPosition;
  isMinimized: boolean;
  isPinned: boolean;
  isVisible: boolean;
  zIndex: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface DockingLayout {
  id: string;
  name: string;
  panels: DockablePanel[];
  gridCols: number;
  gridRows: number;
  createdAt: Date;
  isDefault?: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedPanel: string | null;
  dragOffset: { x: number; y: number };
  dropZones: DropZone[];
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isActive: boolean;
}

export interface ResizeState {
  isResizing: boolean;
  resizedPanel: string | null;
  resizeHandle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;
  startPosition: { x: number; y: number };
  startSize: { w: number; h: number };
}

export interface DockingContextType {
  panels: DockablePanel[];
  layout: DockingLayout;
  dragState: DragState;
  resizeState: ResizeState;
  addPanel: (panel: Omit<DockablePanel, 'position' | 'zIndex'>) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<DockablePanel>) => void;
  movePanel: (panelId: string, position: PanelPosition) => void;
  toggleMinimize: (panelId: string) => void;
  togglePin: (panelId: string) => void;
  bringToFront: (panelId: string) => void;
  saveLayout: (name: string) => void;
  loadLayout: (layoutId: string) => void;
  resetLayout: () => void;
}

