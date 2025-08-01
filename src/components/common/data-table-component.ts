import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';

type Order = 'asc' | 'desc';

interface Column<T> {
  id: keyof T | string;
  label: string;
  numeric?: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  actions?: Action<T>[];
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  onExport?: () => void;
  onPrint?: () => void;
  onFilter?: () => void;
  stickyHeader?: boolean;
  defaultOrderBy?: keyof T | string;
  defaultOrder?: Order;
  rowsPerPageOptions?: number[];
  getRowId?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectedRows?: (string | number)[];
  title?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  actions = [],
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = 'Δεν βρέθηκαν εγγραφές',
  searchable = true,
  onSearch,
  searchPlaceholder = 'Αναζήτηση...',
  onExport,
  onPrint,
  onFilter,
  stickyHeader = true,
  defaultOrderBy,
  defaultOrder = 'asc',
  rowsPerPageOptions = [5, 10, 25, 50],
  getRowId = (row) => row.id || row._id,
  onRowClick,
  selectedRows = [],
  title,
}: DataTableProps<T>) {
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = useState<keyof T | string>(defaultOrderBy || columns[0]?.id || '');
  const [selected, setSelected] = useState<(string | number)[]>(selectedRows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);

  const handleRequestSort = (property: keyof T | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => getRowId(row));
      setSelected(newSelected);
      onSelectionChange?.(rows);
      return;
    }
    setSelected([]);
    onSelectionChange?.([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, row: T) => {
    if (!selectable) return;
    
    const id = getRowId(row);
    const selectedIndex = selected.indexOf(id);
    let newSelected: (string | number)[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
    const selectedRows = rows.filter(row => newSelected.includes(getRowId(row)));
    onSelectionChange?.(selectedRows);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, row: T) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleActionItemClick = (action: Action<T>) => {
    if (activeRow) {
      action.onClick(activeRow);
    }
    handleActionClose();
  };

  const isSelected = (id: string | number) => selected.indexOf(id) !== -1;

  // Sort function
  function descendingComparator<T>(a: T, b: T, orderBy: keyof T | string) {
    const aValue = orderBy.includes('.') 
      ? orderBy.split('.').reduce((obj: any, key) => obj?.[key], a)
      : a[orderBy as keyof T];
    const bValue = orderBy.includes('.')
      ? orderBy.split('.').reduce((obj: any, key) => obj?.[key], b)
      : b[orderBy as keyof T];

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const sortedRows = React.useMemo(
    () => [...rows].sort(getComparator(order, orderBy as keyof T)),
    [order, orderBy, rows]
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {title && (
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          )}
          {selected.length > 0 && (
            <Chip
              label={`${selected.length} επιλεγμένα`}
              color="primary"
              size="small"
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
          )}
          {onFilter && (
            <Tooltip title="Φίλτρα">
              <IconButton onClick={onFilter}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
          {onExport && (
            <Tooltip title="Εξαγωγή">
              <IconButton onClick={onExport}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
          )}
          {onPrint && (
            <Tooltip title="Εκτύπωση">
              <IconButton onClick={onPrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {loading && <LinearProgress />}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id as string}
                  align={column.align || (column.numeric ? 'right' : 'left')}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" style={{ width: 50 }}>
                  Ενέργειες
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const rowId = getRowId(row);
                const isItemSelected = isSelected(rowId);

                return (
                  <TableRow
                    hover
                    onClick={(event) => {
                      if (onRowClick) {
                        onRowClick(row);
                      } else if (selectable) {
                        handleClick(event, row);
                      }
                    }}
                    role={selectable ? 'checkbox' : undefined}
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={rowId}
                    selected={isItemSelected}
                    sx={{ cursor: onRowClick || selectable ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => handleClick(event, row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = column.id.includes('.')
                        ? column.id.split('.').reduce((obj: any, key) => obj?.[key], row)
                        : row[column.id as keyof T];
                      
                      return (
                        <TableCell key={column.id as string} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    {actions.length > 0 && (
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} />
              </TableRow>
            )}
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Εγγραφές ανά σελίδα:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} από ${count}`}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleActionItemClick(action)}
            disabled={activeRow ? action.disabled?.(activeRow) : false}
          >
            {action.icon && (
              <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                {action.icon}
              </Box>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

export default DataTable;