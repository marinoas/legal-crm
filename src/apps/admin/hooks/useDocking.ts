import { useState, useCallback, useEffect, useRef } from 'react';
import { DockablePanel, PanelPosition, DragState, ResizeState, DockingLayout } from '../../../types/docking';
import { DockingEngine } from '../../../docking/DockingEngine';
import { StorageManager } from '../../../docking/StorageManager';

export const useDocking = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [panels, setPanels] = useState<DockablePanel[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPanel: null,
    dragOffset: { x: 0, y: 0 },
    dropZones: [],
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizedPanel: null,
    resizeHandle: null,
    startPosition: { x: 0, y: 0 },
    startSize: { w: 0, h: 0 },
  });

  const dockingEngine = useRef<DockingEngine | null>(null);

  // Initialize docking engine
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dockingEngine.current = new DockingEngine(rect.width, rect.height);
      
      // Load saved layout or use default
      const savedPanels = StorageManager.loadCurrentLayout();
      if (savedPanels) {
        setPanels(savedPanels);
      } else {
        const defaultLayout = StorageManager.getDefaultLayout();
        setPanels(defaultLayout.panels);
      }
    }
  }, [containerRef]);

  // Update container size on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && dockingEngine.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dockingEngine.current.updateContainer(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  // Save layout when panels change
  useEffect(() => {
    if (panels.length > 0) {
      StorageManager.saveCurrentLayout(panels);
    }
  }, [panels]);

  const addPanel = useCallback((panelData: Omit<DockablePanel, 'position' | 'zIndex'>) => {
    if (!dockingEngine.current) return;

    const position = dockingEngine.current.findAvailablePosition(300, 200, panels);
    const maxZ = Math.max(0, ...panels.map(p => p.zIndex));

    const newPanel: DockablePanel = {
      ...panelData,
      position,
      zIndex: maxZ + 1,
    };

    setPanels(prev => [...prev, newPanel]);
  }, [panels]);

  const removePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
  }, []);

  const updatePanel = useCallback((panelId: string, updates: Partial<DockablePanel>) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, ...updates } : p));
  }, []);

  const movePanel = useCallback((panelId: string, position: PanelPosition) => {
    if (!dockingEngine.current) return;

    const snappedPosition = dockingEngine.current.snapToGrid(position);
    if (dockingEngine.current.isValidPosition(snappedPosition)) {
      updatePanel(panelId, { position: snappedPosition });
    }
  }, [updatePanel]);

  const toggleMinimize = useCallback((panelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, isMinimized: !p.isMinimized } : p
    ));
  }, []);

  const togglePin = useCallback((panelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, isPinned: !p.isPinned } : p
    ));
  }, []);

  const bringToFront = useCallback((panelId: string) => {
    const maxZ = Math.max(0, ...panels.map(p => p.zIndex));
    updatePanel(panelId, { zIndex: maxZ + 1 });
  }, [panels, updatePanel]);

  const startDrag = useCallback((panelId: string, offset: { x: number; y: number }) => {
    if (!dockingEngine.current) return;

    const panel = panels.find(p => p.id === panelId);
    if (!panel || panel.isPinned) return;

    const dropZones = dockingEngine.current.generateDropZones(panel, panels);
    
    setDragState({
      isDragging: true,
      draggedPanel: panelId,
      dragOffset: offset,
      dropZones,
    });

    bringToFront(panelId);
  }, [panels, bringToFront]);

  const updateDrag = useCallback((mousePosition: { x: number; y: number }) => {
    if (!dragState.isDragging || !dragState.draggedPanel || !dockingEngine.current) return;

    const panel = panels.find(p => p.id === dragState.draggedPanel);
    if (!panel) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const relativeX = mousePosition.x - containerRect.left - dragState.dragOffset.x;
    const relativeY = mousePosition.y - containerRect.top - dragState.dragOffset.y;

    const gridPosition = dockingEngine.current.pixelsToGrid(
      relativeX,
      relativeY,
      panel.position.w * (containerRect.width / 12),
      panel.position.h * (containerRect.height / 8)
    );

    updatePanel(dragState.draggedPanel, { position: gridPosition });
  }, [dragState, panels, containerRef, updatePanel]);

  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedPanel || !dockingEngine.current) return;

    const panel = panels.find(p => p.id === dragState.draggedPanel);
    if (panel) {
      const snappedPosition = dockingEngine.current.snapToGrid(panel.position);
      updatePanel(dragState.draggedPanel, { position: snappedPosition });
    }

    setDragState({
      isDragging: false,
      draggedPanel: null,
      dragOffset: { x: 0, y: 0 },
      dropZones: [],
    });
  }, [dragState, panels, updatePanel]);

  const saveLayout = useCallback((name: string) => {
    const layout: DockingLayout = {
      id: `layout-${Date.now()}`,
      name,
      panels: [...panels],
      gridCols: 12,
      gridRows: 8,
      createdAt: new Date(),
    };

    StorageManager.saveLayout(layout);
  }, [panels]);

  const loadLayout = useCallback((layoutId: string) => {
    const layout = StorageManager.loadLayout(layoutId);
    if (layout) {
      setPanels(layout.panels);
    }
  }, []);

  const resetLayout = useCallback(() => {
    const defaultLayout = StorageManager.getDefaultLayout();
    setPanels(defaultLayout.panels);
  }, []);

  const autoArrange = useCallback(() => {
    if (!dockingEngine.current) return;
    
    const arrangedPanels = dockingEngine.current.autoArrange(panels);
    setPanels(arrangedPanels);
  }, [panels]);

  return {
    panels,
    dragState,
    resizeState,
    addPanel,
    removePanel,
    updatePanel,
    movePanel,
    toggleMinimize,
    togglePin,
    bringToFront,
    startDrag,
    updateDrag,
    endDrag,
    saveLayout,
    loadLayout,
    resetLayout,
    autoArrange,
    dockingEngine: dockingEngine.current,
  };
};

