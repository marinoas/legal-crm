import { DockablePanel, PanelPosition, DockingLayout, DropZone } from '../types/docking';

export class DockingEngine {
  private gridCols: number = 12;
  private gridRows: number = 8;
  private cellWidth: number = 0;
  private cellHeight: number = 0;
  private containerWidth: number = 0;
  private containerHeight: number = 0;

  constructor(containerWidth: number, containerHeight: number) {
    this.updateContainer(containerWidth, containerHeight);
  }

  updateContainer(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
    this.cellWidth = width / this.gridCols;
    this.cellHeight = height / this.gridRows;
  }

  // Convert grid position to pixel position
  gridToPixels(position: PanelPosition): { x: number; y: number; width: number; height: number } {
    return {
      x: position.x * this.cellWidth,
      y: position.y * this.cellHeight,
      width: position.w * this.cellWidth,
      height: position.h * this.cellHeight,
    };
  }

  // Convert pixel position to grid position
  pixelsToGrid(x: number, y: number, width: number, height: number): PanelPosition {
    return {
      x: Math.round(x / this.cellWidth),
      y: Math.round(y / this.cellHeight),
      w: Math.max(1, Math.round(width / this.cellWidth)),
      h: Math.max(1, Math.round(height / this.cellHeight)),
    };
  }

  // Find available position for new panel
  findAvailablePosition(width: number, height: number, existingPanels: DockablePanel[]): PanelPosition {
    const gridW = Math.max(1, Math.ceil(width / this.cellWidth));
    const gridH = Math.max(1, Math.ceil(height / this.cellHeight));

    // Create occupancy grid
    const occupied = Array(this.gridRows).fill(null).map(() => Array(this.gridCols).fill(false));
    
    existingPanels.forEach(panel => {
      if (!panel.isVisible) return;
      
      for (let y = panel.position.y; y < panel.position.y + panel.position.h; y++) {
        for (let x = panel.position.x; x < panel.position.x + panel.position.w; x++) {
          if (y < this.gridRows && x < this.gridCols) {
            occupied[y][x] = true;
          }
        }
      }
    });

    // Find first available position
    for (let y = 0; y <= this.gridRows - gridH; y++) {
      for (let x = 0; x <= this.gridCols - gridW; x++) {
        let canPlace = true;
        
        for (let dy = 0; dy < gridH && canPlace; dy++) {
          for (let dx = 0; dx < gridW && canPlace; dx++) {
            if (occupied[y + dy][x + dx]) {
              canPlace = false;
            }
          }
        }
        
        if (canPlace) {
          return { x, y, w: gridW, h: gridH };
        }
      }
    }

    // If no space found, place at origin (will overlap)
    return { x: 0, y: 0, w: gridW, h: gridH };
  }

  // Check if position is valid (within bounds)
  isValidPosition(position: PanelPosition): boolean {
    return (
      position.x >= 0 &&
      position.y >= 0 &&
      position.x + position.w <= this.gridCols &&
      position.y + position.h <= this.gridRows &&
      position.w > 0 &&
      position.h > 0
    );
  }

  // Generate drop zones for dragging panel
  generateDropZones(draggedPanel: DockablePanel, existingPanels: DockablePanel[]): DropZone[] {
    const zones: DropZone[] = [];
    const otherPanels = existingPanels.filter(p => p.id !== draggedPanel.id && p.isVisible);

    // Add zones around existing panels
    otherPanels.forEach(panel => {
      // Left side
      if (panel.position.x > 0) {
        zones.push({
          id: `left-${panel.id}`,
          x: panel.position.x - 1,
          y: panel.position.y,
          w: 1,
          h: panel.position.h,
          isActive: false,
        });
      }

      // Right side
      if (panel.position.x + panel.position.w < this.gridCols) {
        zones.push({
          id: `right-${panel.id}`,
          x: panel.position.x + panel.position.w,
          y: panel.position.y,
          w: 1,
          h: panel.position.h,
          isActive: false,
        });
      }

      // Top side
      if (panel.position.y > 0) {
        zones.push({
          id: `top-${panel.id}`,
          x: panel.position.x,
          y: panel.position.y - 1,
          w: panel.position.w,
          h: 1,
          isActive: false,
        });
      }

      // Bottom side
      if (panel.position.y + panel.position.h < this.gridRows) {
        zones.push({
          id: `bottom-${panel.id}`,
          x: panel.position.x,
          y: panel.position.y + panel.position.h,
          w: panel.position.w,
          h: 1,
          isActive: false,
        });
      }
    });

    return zones;
  }

  // Snap position to grid
  snapToGrid(position: PanelPosition): PanelPosition {
    return {
      x: Math.max(0, Math.min(this.gridCols - position.w, Math.round(position.x))),
      y: Math.max(0, Math.min(this.gridRows - position.h, Math.round(position.y))),
      w: Math.max(1, Math.min(this.gridCols, Math.round(position.w))),
      h: Math.max(1, Math.min(this.gridRows, Math.round(position.h))),
    };
  }

  // Auto-arrange panels to minimize overlaps
  autoArrange(panels: DockablePanel[]): DockablePanel[] {
    const visiblePanels = panels.filter(p => p.isVisible);
    const arranged: DockablePanel[] = [];

    // Sort by area (larger panels first)
    const sortedPanels = [...visiblePanels].sort((a, b) => 
      (b.position.w * b.position.h) - (a.position.w * a.position.h)
    );

    sortedPanels.forEach(panel => {
      const newPosition = this.findAvailablePosition(
        panel.position.w * this.cellWidth,
        panel.position.h * this.cellHeight,
        arranged
      );
      
      arranged.push({
        ...panel,
        position: newPosition,
      });
    });

    return [...arranged, ...panels.filter(p => !p.isVisible)];
  }
}

