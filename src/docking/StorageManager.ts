import { DockingLayout, DockablePanel } from '../types/docking';

export class StorageManager {
  private static readonly STORAGE_KEY = 'legal-crm-layouts';
  private static readonly CURRENT_LAYOUT_KEY = 'legal-crm-current-layout';

  // Save layout to localStorage
  static saveLayout(layout: DockingLayout): void {
    try {
      const existingLayouts = this.getAllLayouts();
      const updatedLayouts = existingLayouts.filter(l => l.id !== layout.id);
      updatedLayouts.push(layout);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLayouts));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }

  // Load specific layout
  static loadLayout(layoutId: string): DockingLayout | null {
    try {
      const layouts = this.getAllLayouts();
      return layouts.find(l => l.id === layoutId) || null;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    }
  }

  // Get all saved layouts
  static getAllLayouts(): DockingLayout[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get layouts:', error);
      return [];
    }
  }

  // Delete layout
  static deleteLayout(layoutId: string): void {
    try {
      const layouts = this.getAllLayouts();
      const filtered = layouts.filter(l => l.id !== layoutId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete layout:', error);
    }
  }

  // Save current layout state
  static saveCurrentLayout(panels: DockablePanel[]): void {
    try {
      const currentLayout: DockingLayout = {
        id: 'current',
        name: 'Current Layout',
        panels,
        gridCols: 12,
        gridRows: 8,
        createdAt: new Date(),
      };
      
      localStorage.setItem(this.CURRENT_LAYOUT_KEY, JSON.stringify(currentLayout));
    } catch (error) {
      console.error('Failed to save current layout:', error);
    }
  }

  // Load current layout state
  static loadCurrentLayout(): DockablePanel[] | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_LAYOUT_KEY);
      if (stored) {
        const layout: DockingLayout = JSON.parse(stored);
        return layout.panels;
      }
      return null;
    } catch (error) {
      console.error('Failed to load current layout:', error);
      return null;
    }
  }

  // Get default dashboard layout
  static getDefaultLayout(): DockingLayout {
    return {
      id: 'default-dashboard',
      name: 'Default Dashboard',
      panels: [
        {
          id: 'courts',
          title: 'Επερχόμενα Δικαστήρια',
          component: null as any,
          position: { x: 0, y: 0, w: 3, h: 4 },
          isMinimized: false,
          isPinned: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: 'deadlines',
          title: 'Επερχόμενες Προθεσμίες',
          component: null as any,
          position: { x: 3, y: 0, w: 3, h: 4 },
          isMinimized: false,
          isPinned: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: 'pending',
          title: 'Εκκρεμότητες',
          component: null as any,
          position: { x: 6, y: 0, w: 3, h: 4 },
          isMinimized: false,
          isPinned: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: 'appointments',
          title: 'Προγραμματισμένα Ραντεβού',
          component: null as any,
          position: { x: 9, y: 0, w: 3, h: 4 },
          isMinimized: false,
          isPinned: false,
          isVisible: true,
          zIndex: 1,
        },
      ],
      gridCols: 12,
      gridRows: 8,
      createdAt: new Date(),
      isDefault: true,
    };
  }

  // Clear all stored data
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.CURRENT_LAYOUT_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

