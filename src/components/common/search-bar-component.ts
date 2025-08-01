import React, { useState, useCallback, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Popper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Typography,
  Box,
  Chip,
  Divider,
  ClickAwayListener,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import GavelIcon from '@mui/icons-material/Gavel';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'client' | 'court' | 'document' | 'history' | 'trending';
  subtitle?: string;
  data?: any;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  autoFocus?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
  maxSuggestions?: number;
  searchDelay?: number;
  minSearchLength?: number;
  persistHistory?: boolean;
  sx?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Αναζήτηση...',
  onSearch,
  onSuggestionClick,
  suggestions = [],
  loading = false,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  autoFocus = false,
  showHistory = true,
  showTrending = false,
  maxSuggestions = 10,
  searchDelay = 300,
  minSearchLength = 2,
  persistHistory = true,
  sx = {},
}) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedValue = useDebounce(value, searchDelay);

  // Load search history from localStorage
  useEffect(() => {
    if (showHistory && persistHistory) {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, [showHistory, persistHistory]);

  // Save to search history
  const saveToHistory = (query: string) => {
    if (!showHistory || !persistHistory || !query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Handle search
  const handleSearch = useCallback((searchValue: string) => {
    if (searchValue.trim()) {
      onSearch(searchValue);
      saveToHistory(searchValue);
      setOpen(false);
    }
  }, [onSearch, searchHistory]);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedValue.length >= minSearchLength) {
      onSearch(debouncedValue);
      setOpen(true);
    } else if (debouncedValue.length === 0) {
      setOpen(false);
    }
  }, [debouncedValue, onSearch, minSearchLength]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    setSelectedIndex(-1);
    
    if (newValue.length === 0) {
      onSearch('');
    }
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget);
    if (value.length >= minSearchLength || (value.length === 0 && (showHistory || showTrending))) {
      setOpen(true);
    }
  };

  const handleClickAway = () => {
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'history') {
      setValue(suggestion.text);
      handleSearch(suggestion.text);
    } else {
      setValue(suggestion.text);
      if (onSuggestionClick) {
        onSuggestionClick(suggestion);
      } else {
        handleSearch(suggestion.text);
      }
    }
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const totalSuggestions = getSuggestions().length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalSuggestions);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalSuggestions) % totalSuggestions);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          const suggestions = getSuggestions();
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(value);
        }
        break;
      case 'Escape':
        setOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Get icon for suggestion type
  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'client':
        return <PersonIcon />;
      case 'court':
        return <GavelIcon />;
      case 'document':
        return <FolderIcon />;
      case 'history':
        return <HistoryIcon />;
      case 'trending':
        return <TrendingUpIcon />;
      default:
        return <SearchIcon />;
    }
  };

  // Get all suggestions including history and trending
  const getSuggestions = (): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];
    
    // Add search results
    if (suggestions.length > 0) {
      allSuggestions.push(...suggestions.slice(0, maxSuggestions));
    }
    
    // Add history if no search query
    if (value.length === 0 && showHistory && searchHistory.length > 0) {
      const historySuggestions = searchHistory.map(h => ({
        id: `history-${h}`,
        text: h,
        type: 'history' as const,
      }));
      allSuggestions.push(...historySuggestions);
    }
    
    return allSuggestions;
  };

  const allSuggestions = getSuggestions();

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto', ...sx }}>
        <TextField
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          autoFocus={autoFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SearchIcon color="action" />
                )}
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover': {
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            },
          }}
        />
        
        <Popper
          open={open && allSuggestions.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: theme.zIndex.modal }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <List dense>
              {value.length === 0 && showHistory && searchHistory.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                      Πρόσφατες αναζητήσεις
                    </Typography>
                  </ListItem>
                  <Divider />
                </>
              )}
              
              {allSuggestions.map((suggestion, index) => (
                <ListItem
                  key={suggestion.id}
                  button
                  selected={index === selectedIndex}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getIcon(suggestion.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {suggestion.text}
                        {suggestion.type !== 'history' && suggestion.type !== 'trending' && (
                          <Chip
                            label={
                              suggestion.type === 'client' ? 'Εντολέας' :
                              suggestion.type === 'court' ? 'Δικαστήριο' :
                              'Έγγραφο'
                            }
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={suggestion.subtitle}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: value && suggestion.text.toLowerCase().includes(value.toLowerCase()) ? 600 : 400,
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;