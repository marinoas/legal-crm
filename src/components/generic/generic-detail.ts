// src/components/generic/GenericDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  Stack,
  Chip,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { 
  DetailConfig, 
  ActionConfig,
  EntityConfig 
} from './GenericConfig';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { usePermissions } from '../../hooks/usePermissions';
import { printElement } from '../../utils/print';
import { copyToClipboard } from '../../utils/clipboard';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import GenericList from './GenericList';

interface GenericDetailProps {
  config: DetailConfig;
  entityConfig?: EntityConfig;
  data: any;
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onAction?: (action: ActionConfig, data: any) => void;
  onTabChange?: (tab: number) => void;
  currentTab?: number;
}

const GenericDetail: React.FC<GenericDetailProps> = ({
  config,
  entityConfig,
  data,
  loading = false,
  error = null,
  onRefresh,
  onAction,
  onTabChange,
  currentTab = 0
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [activeTab, setActiveTab] = useState(currentTab);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: ActionConfig;
  }>({ open: false });
  const [refreshing, setRefreshing] = useState(false);

  // Initialize expanded sections
  useEffect(() => {
    const defaultExpanded = new Set(
      config.sections
        .filter(section => section.defaultExpanded !== false)
        .map((_, index) => `section-${index}`)
    );
    setExpandedSections(defaultExpanded);
  }, [config.sections]);

  // Auto-refresh
  useEffect(() => {
    if (config.refreshInterval && onRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, config.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, onRefresh]);

  // Computed values
  const title = useMemo(() => {
    if (typeof config.title === 'function') {
      return config.title(data);
    }
    return config.title;
  }, [config.title, data]);

  const subtitle = useMemo(() => {
    if (typeof config.subtitle === 'function') {
      return config.subtitle(data);
    }
    return config.subtitle;
  }, [config.subtitle, data]);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    onTabChange?.(newValue);
  };

  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAction = async (action: ActionConfig) => {
    if (action.confirmRequired) {
      setConfirmDialog({ open: true, action });
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: ActionConfig) => {
    try {
      if (action.handler) {
        await action.handler(data);
      } else if (onAction) {
        onAction(action, data);
      }
      
      // Default actions
      switch (action.type) {
        case 'edit':
          navigate(`${location.pathname}/edit`);
          break;
        case 'delete':
          showSnackbar(t('common.deleteSuccess'), 'success');
          navigate(-1);
          break;
        case 'print':
          printElement('detail-content', { 
            title: title,
            watermark: config.entity === 'documents' ? { text: 'ΑΝΤΙΓΡΑΦΟ' } : undefined
          });
          break;
        case 'email':
          navigate(`/communications/email/new?entity=${config.entity}&id=${data.id}`);
          break;
      }
    } catch (error) {
      showSnackbar(t('common.error'), 'error');
      console.error('Action error:', error);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
      showSnackbar(t('common.refreshSuccess'), 'success');
    }
  };

  const handleCopy = (value: string, label: string) => {
    copyToClipboard(value);
    showSnackbar(t('common.copySuccess', { item: label }), 'success');
  };

  // Check field visibility
  const isFieldVisible = (field: any, section: any): boolean => {
    if (field.hidden === true) return false;
    if (typeof field.hidden === 'function' && field.hidden(data)) return false;
    return true;
  };

  const isSectionVisible = (section: any): boolean => {
    if (section.hidden === true) return false;
    if (typeof section.hidden === 'function' && section.hidden(data)) return false;
    // Check if any field in section is visible
    return section.fields.some((field: any) => isFieldVisible(field, section));
  };

  // Render functions
  const renderBreadcrumbs = () => {
    if (!config.breadcrumbs) return null;
    
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: t('common.home'), path: '/' },
      ...paths.map((path, index) => ({
        label: t(`entities.${path}`, { defaultValue: path }),
        path: '/' + paths.slice(0, index + 1).join('/')
      }))
    ];
    
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography key={crumb.path} color="text.primary">
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              color="inherit"
              href={crumb.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.path);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const renderHeader = () => {
    if (config.customHeader) {
      return <config.customHeader data={data} />;
    }
    
    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body1" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            {/* Actions */}
            {config.actions?.map((action, index) => {
              if (action.hidden || (action.permission && !hasPermission(action.permission))) {
                return null;
              }
              
              const Icon = action.icon;
              
              if (isMobile) {
                return null; // Will be shown in menu
              }
              
              return (
                <Button
                  key={index}
                  variant={action.variant || 'outlined'}
                  color={action.color || 'primary'}
                  startIcon={Icon && <Icon />}
                  onClick={() => handleAction(action)}
                  disabled={action.disabled === true}
                  size="small"
                >
                  {action.label}
                </Button>
              );
            })}
            
            {/* Refresh */}
            {onRefresh && (
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing || loading}
              >
                <RefreshIcon />
              </IconButton>
            )}
            
            {/* Mobile menu */}
            {isMobile && config.actions && config.actions.length > 0 && (
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>
    );
  };

  const renderFieldValue = (field: any, value: any): React.ReactNode => {
    if (field.component) {
      return <field.component value={value} data={data} field={field} />;
    }
    
    if (field.format) {
      return field.format(value, data);
    }
    
    // Default formatting
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (value instanceof Date) {
      return format(value, 'dd/MM/yyyy HH:mm', { locale: el });
    }
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <Chip key={index} label={item} size="small" sx={{ mr: 0.5 }} />
      ));
    }
    
    return value.toString();
  };

  const renderField = (field: any) => {
    if (!isFieldVisible(field, null)) return null;
    
    const value = data[field.name];
    const displayValue = renderFieldValue(field, value);
    const isLink = field.link === true || (typeof field.link === 'function' && field.link(value, data));
    
    return (
      <Box key={field.name} sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {field.label}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1" component="div">
            {isLink ? (
              <Link
                href={typeof field.link === 'function' ? field.link(value, data) : '#'}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof field.link === 'function') {
                    navigate(field.link(value, data));
                  }
                }}
                sx={{ cursor: 'pointer' }}
              >
                {displayValue}
                <LaunchIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
              </Link>
            ) : (
              displayValue
            )}
          </Typography>
          {field.copyable && value && (
            <IconButton
              size="small"
              onClick={() => handleCopy(value.toString(), field.label)}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>
    );
  };

  const renderSection = (section: any, sectionIndex: number) => {
    if (!isSectionVisible(section)) return null;
    
    const sectionId = `section-${sectionIndex}`;
    const content = (
      <Grid container spacing={3}>
        {section.fields.map((field: any) => (
          <Grid
            key={field.name}
            item
            xs={12}
            sm={section.grid?.sm || 6}
            md={section.grid?.md || 4}
            lg={section.grid?.lg || 3}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    );
    
    if (section.collapsible) {
      return (
        <Accordion
          key={sectionId}
          expanded={expandedSections.has(sectionId)}
          onChange={() => handleSectionToggle(sectionId)}
        >
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="h6">{section.title}</Typography>
            {section.subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {section.subtitle}
              </Typography>
            )}
          </AccordionSummary>
          <AccordionDetails>{content}</AccordionDetails>
        </Accordion>
      );
    }
    
    return (
      <Box key={sectionId} sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        {section.subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {section.subtitle}
          </Typography>
        )}
        <Divider sx={{ mb: 2 }} />
        {content}
      </Box>
    );
  };

  const renderTimestamps = () => {
    if (!config.showTimestamps) return null;
    
    return (
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            {t('common.metadata')}
          </Typography>
          <Stack spacing={1}>
            {data.createdAt && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('common.createdAt')}: {format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm', { locale: el })}
                </Typography>
              </Stack>
            )}
            {config.showCreatedBy && data.createdBy && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('common.createdBy')}: {data.createdBy.name || data.createdBy}
                </Typography>
              </Stack>
            )}
            {data.updatedAt && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('common.updatedAt')}: {format(new Date(data.updatedAt), 'dd/MM/yyyy HH:mm', { locale: el })}
                </Typography>
              </Stack>
            )}
            {config.showModifiedBy && data.updatedBy && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('common.updatedBy')}: {data.updatedBy.name || data.updatedBy}
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const renderRelatedList = (relatedList: any) => {
    const filter = relatedList.filter(data);
    const listConfig = {
      ...relatedList.config,
      entity: relatedList.entity,
      title: relatedList.title
    };
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {relatedList.title}
        </Typography>
        <GenericList
          config={listConfig}
          data={[]} // Should be fetched based on filter
          totalCount={0}
          onRefresh={() => {}}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onSortChange={() => {}}
          onFilterChange={() => {}}
          onSearch={() => {}}
        />
      </Box>
    );
  };

  const renderContent = () => {
    if (loading && !data) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.message || t('common.error')}
        </Alert>
      );
    }
    
    if (!data) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('common.noData')}
        </Alert>
      );
    }
    
    return (
      <Box id="detail-content">
        {config.tabs && config.tabs.length > 0 ? (
          <>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              {config.tabs.map((tab, index) => {
                const isHidden = tab.hidden === true || 
                  (typeof tab.hidden === 'function' && tab.hidden(data)) ||
                  (tab.permission && !hasPermission(tab.permission));
                
                if (isHidden) return null;
                
                const Icon = tab.icon;
                return (
                  <Tab
                    key={index}
                    label={tab.label}
                    icon={Icon ? <Icon /> : undefined}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>
            
            {/* Main content in first tab */}
            {activeTab === 0 && (
              <>
                {config.sections.map(renderSection)}
                {renderTimestamps()}
              </>
            )}
            
            {/* Other tabs */}
            {config.tabs.map((tab, index) => {
              if (index === 0) return null; // First tab is main content
              
              const isHidden = tab.hidden === true || 
                (typeof tab.hidden === 'function' && tab.hidden(data)) ||
                (tab.permission && !hasPermission(tab.permission));
              
              if (isHidden) return null;
              
              return activeTab === index ? (
                <Box key={index}>
                  <tab.component {...(tab.props || {})} data={data} />
                </Box>
              ) : null;
            })}
          </>
        ) : (
          <>
            {config.sections.map(renderSection)}
            {renderTimestamps()}
            {config.relatedLists?.map(renderRelatedList)}
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      {renderBreadcrumbs()}
      <Paper sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
        {(loading || refreshing) && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          />
        )}
        
        {renderHeader()}
        <Divider sx={{ my: 2 }} />
        {renderContent()}
        
        {config.customFooter && (
          <>
            <Divider sx={{ my: 2 }} />
            <config.customFooter data={data} />
          </>
        )}
      </Paper>
      
      {/* Actions menu for mobile */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {config.actions?.map((action, index) => {
          if (action.hidden || (action.permission && !hasPermission(action.permission))) {
            return null;
          }
          
          const Icon = action.icon;
          return (
            <MenuItem
              key={index}
              onClick={() => {
                handleAction(action);
                setAnchorEl(null);
              }}
              disabled={action.disabled === true}
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
            executeAction(confirmDialog.action);
          }
          setConfirmDialog({ open: false });
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </>
  );
};

export default GenericDetail;