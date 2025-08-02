import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box,
  Collapse,
  Badge,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

// Styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.sidebar || '#1e293b',
    color: '#ffffff',
    borderRight: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  minHeight: 64,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  color: 'rgba(255, 255, 255, 0.8)',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    transform: 'translateX(4px)',
  },
  
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    
    '& .MuiListItemIcon-root': {
      color: '#ffffff',
    },
  },
  
  '& .MuiListItemIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 40,
    transition: 'color 0.2s ease-in-out',
  },
  
  '& .MuiListItemText-primary': {
    fontWeight: 500,
  },
}));

const CollapseToggle = styled(IconButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  padding: theme.spacing(0.5),
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
}));

// Types
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number | string;
  children?: SidebarItem[];
  disabled?: boolean;
}

export interface SidebarProps {
  /** Sidebar items */
  items: SidebarItem[];
  /** Currently selected item ID */
  selectedId?: string;
  /** Sidebar title */
  title?: string;
  /** Sidebar logo */
  logo?: React.ReactNode;
  /** Whether sidebar is open */
  open: boolean;
  /** Sidebar width when open */
  width?: number;
  /** Collapsed sidebar width */
  collapsedWidth?: number;
  /** Whether sidebar can be collapsed */
  collapsible?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (item: SidebarItem) => void;
  /** Callback when collapse state changes */
  onToggleCollapse?: () => void;
  /** Additional content at the bottom */
  bottomContent?: React.ReactNode;
}

/**
 * Sidebar Component
 * 
 * A professional sidebar navigation with collapsible support and nested items.
 * Used for main navigation in the Legal CRM portals.
 * 
 * @example
 * ```tsx
 * <Sidebar
 *   title="Legal CRM"
 *   items={navigationItems}
 *   selectedId="dashboard"
 *   open={sidebarOpen}
 *   onItemClick={handleNavigation}
 *   onToggleCollapse={toggleSidebar}
 * />
 * ```
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  selectedId,
  title,
  logo,
  open,
  width = 280,
  collapsedWidth = 64,
  collapsible = true,
  onItemClick,
  onToggleCollapse,
  bottomContent,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleItemClick = (item: SidebarItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      // Toggle expansion for items with children
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.id)) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else {
      // Navigate for items without children
      onItemClick?.(item);
    }
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isSelected = selectedId === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = level * 16 + 16;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <StyledListItemButton
            selected={isSelected}
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            sx={{ pl: `${paddingLeft}px` }}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  variant={typeof item.badge === 'number' ? 'standard' : 'dot'}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            
            {open && (
              <>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: level > 0 ? '0.875rem' : '0.9375rem',
                  }}
                />
                {hasChildren && (
                  <CollapseToggle size="small">
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </CollapseToggle>
                )}
              </>
            )}
          </StyledListItemButton>
        </ListItem>
        
        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderSidebarItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const sidebarContent = (
    <>
      <SidebarHeader>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {logo}
            {title && (
              <Typography variant="h6" fontWeight={600} noWrap>
                {title}
              </Typography>
            )}
          </Box>
        )}
        
        {collapsible && (
          <Tooltip title={open ? 'Σύμπτυξη' : 'Επέκταση'} placement="right">
            <IconButton
              onClick={onToggleCollapse}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
              }}
            >
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
        )}
      </SidebarHeader>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {items.map(item => renderSidebarItem(item))}
        </List>
      </Box>
      
      {bottomContent && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Box sx={{ p: 2 }}>
            {bottomContent}
          </Box>
        </>
      )}
    </>
  );

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? width : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? width : collapsedWidth,
        },
      }}
    >
      {sidebarContent}
    </StyledDrawer>
  );
};

export default Sidebar;

