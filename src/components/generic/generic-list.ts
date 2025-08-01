// src/components/generic/GenericList.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Toolbar,
  Typography,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  InputAdornment,
  Collapse,
  Alert,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ListConfig, 
  ActionConfig, 
  FilterConfig, 
  ColumnConfig,
  SortDirection 
} from './GenericConfig';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToExcel, exportToCSV } from '../../utils/export';
import { printElement } from '../../utils/print';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';

interface GenericListProps {
  config: ListConfig;
  data: any[];
  totalCount: number;
  loading?: boolean;
  error?: Error | null;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: string, direction: SortDirection) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch: (query: string) => void;
  onAction?: (action: ActionConfig, data?: any) => void;
  onSelectionChange?: (selected: any[]) => void;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: SortDirection;
  filters?: Record<string, any>;
  searchQuery?: string;
}

const GenericList: React.FC<GenericListProps> = ({
  config,
  data,
  totalCount,
  loading = false,
  error = null,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  onSearch,
  onAction,
  onSelectionChange,
  page = 0,
  pageSize = 10,
  sortField = config.defaultSort?.field,
  sortDirection = config.defaultSort?.direction || 'asc',
  filters = {},
  searchQuery = ''
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [selected, setSelected] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: ActionConfig;
    data?: any;
  }>({ open: false });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Debounced search
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Effects
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, onSearch]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Memoized values
  const visibleColumns = useMemo(
    () => config.columns.filter(col => !col.hidden),
    [config.columns]
  );

  const isAllSelected = useMemo(
    () => data.length > 0 && selected.length === data.length,
    [data.length, selected.length]
  );

  const isIndeterminate = useMemo(
    () => selected.length > 0 && selected.length < data.length,
    [data.length, selected.length]
  );

  // Handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.filter(row => 
        !config.isRowSelectable || config.isRowSelectable(row)
      );
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: any) => {
    const selectedIndex = selected.findIndex(item => 
      config.getRowId ? config.getRowId(item) === config.getRowId(row) : item === row
    );
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((_, index) => index !== selectedIndex);
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSort = (field: string) => {
    const isCurrentSort = sortField === field;
    const newDirection: SortDirection = 
      isCurrentSort && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  };

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
    if (!value) {
      delete newFilters[field];
    }
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const handleAction = async (action: ActionConfig, rowData?: any) => {
    if (action.confirmRequired) {
      setConfirmDialog({ open: true, action, data: rowData });
    } else {
      executeAction(action, rowData);
    }
  };

  const executeAction = async (action: ActionConfig, rowData?: any) => {
    try {
      if (action.handler) {
        await action.handler(rowData);
      } else if (onAction) {
        onAction(action, rowData);
      }
      
      // Default actions
      switch (action.type) {
        case 'view':
          navigate(`${config.entity}/${config.getRowId?.(rowData) || rowData.id}`);
          break;
        case 'edit':
          navigate(`${config.entity}/${config.getRowId?.(rowData) || rowData.id}/edit`);
          break;
        case 'delete':
          showSnackbar(t('common.deleteSuccess'), 'success');
          onRefresh();
          break;
        case 'print':
          printElement(`${config.entity}-list`, { title: config.title });
          break;
      }
    } catch (error) {
      showSnackbar(t('common.error'), 'error');
      console.error('Action error:', error);
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    const exportData = selected.length > 0 ? selected : data;
    const fileName = `${config.entity}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      exportToExcel(exportData, visibleColumns, fileName);
    } else {
      exportToCSV(exportData, visibleColumns, fileName);
    }
    
    showSnackbar(t('common.exportSuccess'), 'success');
  };

  const handleRowClick = (row: any) => {
    if (config.onRowClick) {
      config.onRowClick(row);
    }
  };

  const handleGroupToggle = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Render functions
  const renderToolbar = () => (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selected.length > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {selected.length > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {t('common.selected', { count: selected.length })}
        </Typography>
      ) : (
        <>
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {config.title}
          </Typography>
          {config.subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: '1 1 100%', mt: 0.5 }}
            >
              {config.subtitle}
            </Typography>
          )}
        </>
      )}

      <Stack direction="row" spacing={1}>
        {/* Search */}
        {config.searchable !== false && (
          <TextField
            size="small"
            placeholder={t('common.search')}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: localSearchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setLocalSearchQuery('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 150, sm: 250 } }}
          />
        )}

        {/* Filters */}
        {config.filters && config.filters.length > 0 && (
          <Tooltip title={t('common.filters')}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={Object.keys(localFilters).length > 0 ? 'primary' : 'default'}
            >
              <FilterIcon />
              {Object.keys(localFilters).length > 0 && (
                <Chip
                  label={Object.keys(localFilters).length}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    height: 20,
                    minWidth: 20,
                  }}
                />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Actions */}
        {config.actions?.map((action, index) => {
          if (action.hidden || (action.permission && !hasPermission(action.permission))) {
            return null;
          }

          const Icon = action.icon;
          return (
            <Tooltip key={index} title={action.label}>
              <IconButton
                onClick={() => handleAction(action)}
                color={action.color || 'default'}
                disabled={action.disabled === true}
              >
                {Icon && <Icon />}
              </IconButton>
            </Tooltip>
          );
        })}

        {/* Export */}
        {config.exportable !== false && (
          <Tooltip title={t('common.export')}>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Refresh */}
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        {/* Add new */}
        {hasPermission(`${config.entity}.create`) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`${config.entity}/new`)}
            size="small"
          >
            {isMobile ? '' : t('common.addNew')}
          </Button>
        )}
      </Stack>

      {/* Export menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { handleExport('excel'); setAnchorEl(null); }}>
          {t('common.exportExcel')}
        </MenuItem>
        <MenuItem onClick={() => { handleExport('csv'); setAnchorEl(null); }}>
          {t('common.exportCSV')}
        </MenuItem>
        {hasPermission(`${config.entity}.print`) && (
          <MenuItem onClick={() => { 
            printElement(`${config.entity}-list`, { title: config.title }); 
            setAnchorEl(null); 
          }}>
            <PrintIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.print')}
          </MenuItem>
        )}
      </Menu>
    </Toolbar>
  );

  const renderFilters = () => {
    if (!config.filters || config.filters.length === 0) return null;

    return (
      <Collapse in={showFilters}>
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">{t('common.filters')}</Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              flexWrap="wrap"
            >
              {config.filters.map((filter) => (
                <TextField
                  key={filter.field}
                  label={filter.label}
                  value={localFilters[filter.field] || filter.defaultValue || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  placeholder={filter.placeholder}
                  select={filter.type === 'select'}
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  {filter.type === 'select' && filter.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={applyFilters}
              >
                {t('common.apply')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                disabled={Object.keys(localFilters).length === 0}
              >
                {t('common.clear')}
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Divider />
      </Collapse>
    );
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        {config.selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={isIndeterminate}
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
          </TableCell>
        )}
        {visibleColumns.map((column) => (
          <TableCell
            key={column.field}
            align={column.align || 'left'}
            padding={config.dense ? 'none' : 'normal'}
            sortDirection={sortField === column.field ? sortDirection : false}
            className={column.headerClassName}
            style={{
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
            }}
          >
            {column.sortable !== false ? (
              <TableSortLabel
                active={sortField === column.field}
                direction={sortField === column.field ? sortDirection : 'asc'}
                onClick={() => handleSort(column.field)}
              >
                {column.headerName}
              </TableSortLabel>
            ) : (
              column.headerName
            )}
          </TableCell>
        ))}
        {config.rowActions && config.rowActions.length > 0 && (
          <TableCell align="right" padding="none" sx={{ width: 50 }}>
            {t('common.actions')}
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );

  const renderCellValue = (column: ColumnConfig, row: any) => {
    const value = column.valueGetter ? column.valueGetter(row) : row[column.field];
    
    if (column.renderCell) {
      return column.renderCell({ value, row });
    }
    
    if (column.format) {
      return column.format(value, row);
    }
    
    // Default formatting
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (value instanceof Date) return value.toLocaleDateString('el-GR');
    
    return value.toString();
  };

  const renderTableRow = (row: any, index: number) => {
    const rowId = config.getRowId ? config.getRowId(row) : row.id || index;
    const isItemSelected = selected.some(item => 
      config.getRowId ? config.getRowId(item) === rowId : item === row
    );
    const isSelectable = !config.isRowSelectable || config.isRowSelectable(row);
    const rowClassName = config.getRowClassName?.(row);

    return (
      <TableRow
        key={rowId}
        hover
        onClick={() => handleRowClick(row)}
        selected={isItemSelected}
        sx={{
          cursor: config.onRowClick ? 'pointer' : 'default',
          ...(config.striped && index % 2 === 1 && {
            bgcolor: 'action.hover',
          }),
        }}
        className={rowClassName}
      >
        {config.selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={isItemSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectRow(row);
              }}
              disabled={!isSelectable}
            />
          </TableCell>
        )}
        {visibleColumns.map((column) => (
          <TableCell
            key={column.field}
            align={column.align || 'left'}
            padding={config.dense ? 'none' : 'normal'}
            className={
              typeof column.cellClassName === 'function'
                ? column.cellClassName({ value: row[column.field], row })
                : column.cellClassName
            }
          >
            {renderCellValue(column, row)}
          </TableCell>
        ))}
        {config.rowActions && config.rowActions.length > 0 && (
          <TableCell align="right" padding="none">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRow(row);
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    );
  };

  const renderContent = () => {
    if (loading && data.length === 0) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error.message || t('common.error')}
        </Alert>
      );
    }

    if (data.length === 0) {
      return (
        <Box sx={{ p: 4 }}>
          {config.customEmpty ? (
            <config.customEmpty />
          ) : (
            <EmptyState
              message={config.emptyMessage || t('common.noData')}
              action={
                hasPermission(`${config.entity}.create`) && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`${config.entity}/new`)}
                  >
                    {t('common.addNew')}
                  </Button>
                )
              }
            />
          )}
        </Box>
      );
    }

    return (
      <>
        <TableContainer
          sx={{
            maxHeight: config.maxHeight,
            position: 'relative',
          }}
          id={`${config.entity}-list`}
        >
          {loading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
              }}
            />
          )}
          <Table
            stickyHeader={config.stickyHeader}
            size={config.dense ? 'small' : 'medium'}
          >
            {renderTableHeader()}
            <TableBody>
              {data.map((row, index) => renderTableRow(row, index))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={config.pageSizeOptions || [10, 25, 50, 100]}
          labelRowsPerPage={t('common.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            t('common.displayedRows', { from, to, count })
          }
        />
      </>
    );
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', mb: 2 }}>
      {config.customToolbar ? (
        <config.customToolbar />
      ) : (
        renderToolbar()
      )}
      {renderFilters()}
      <Divider />
      {renderContent()}

      {/* Row actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && Boolean(selectedRow)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedRow(null);
        }}
      >
        {config.rowActions?.map((action, index) => {
          const isHidden = typeof action.hidden === 'function'
            ? action.hidden(selectedRow)
            : action.hidden;
          
          const isDisabled = typeof action.disabled === 'function'
            ? action.disabled(selectedRow)
            : action.disabled;

          if (isHidden || (action.permission && !hasPermission(action.permission))) {
            return null;
          }

          const Icon = action.icon;
          
          return (
            <MenuItem
              key={index}
              onClick={() => {
                handleAction(action, selectedRow);
                setAnchorEl(null);
                setSelectedRow(null);
              }}
              disabled={isDisabled}
            >
              {Icon && <Icon fontSize="small" sx={{ mr: 1 }} />}
              {action.label}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action?.confirmTitle || t('common.confirm')}
        content={confirmDialog.action?.confirmMessage || t('common.confirmMessage')}
        onConfirm={() => {
          if (confirmDialog.action) {
            executeAction(confirmDialog.action, confirmDialog.data);
          }
          setConfirmDialog({ open: false });
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </Paper>
  );
};

export default GenericList;