import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  Email,
  Phone,
  Business,
  Person,
  Folder,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Euro,
  Assignment,
  Gavel,
  Print,
  PersonAdd,
  Close,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericList } from '../../components/generic/GenericList';
import { GenericForm } from '../../components/generic/GenericForm';
import { GenericDetail } from '../../components/generic/GenericDetail';
import { clientService } from '../../services/clientService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatPhone } from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/export';
import { printData } from '../../utils/print';
import { clientConfig } from './clientConfig';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  email: string;
  phone: string;
  mobile: string;
  vatNumber?: string;
  folderNumber: string;
  type: 'individual' | 'company';
  companyName?: string;
  status: 'active' | 'inactive' | 'archived';
  address?: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
  };
  financialSummary?: {
    balance: number;
    totalCharges: number;
    totalPayments: number;
  };
  statistics?: {
    totalCases: number;
    activeCases: number;
    wonCases: number;
  };
  createdAt: string;
  portalAccess?: {
    hasAccess: boolean;
    invitationSent?: string;
  };
}

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Generate list config based on user role
  const getListConfig = () => {
    const baseConfig = { ...clientConfig.list };
    
    // Remove financial columns for secretary
    if (user?.role === 'secretary') {
      baseConfig.columns = baseConfig.columns.filter(
        col => !['balance', 'totalCharges', 'totalPayments'].includes(col.field)
      );
    }
    
    return baseConfig;
  };

  // Generate form config based on user role
  const getFormConfig = () => {
    const baseConfig = { ...clientConfig.form };
    
    // Secretary cannot see financial fields in form
    if (user?.role === 'secretary') {
      baseConfig.sections = baseConfig.sections.filter(
        section => section.title !== t('client.financialInfo')
      );
    }
    
    return baseConfig;
  };

  // Generate detail config based on user role
  const getDetailConfig = () => {
    const baseConfig = { ...clientConfig.detail };
    
    // Secretary cannot see financial section
    if (user?.role === 'secretary') {
      baseConfig.sections = baseConfig.sections.filter(
        section => section.title !== t('client.financialSummary')
      );
    }
    
    return baseConfig;
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setShowDetail(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    
    try {
      await clientService.delete(selectedClient.id);
      showSnackbar(t('client.deleteSuccess'), 'success');
      setShowDeleteDialog(false);
      setSelectedClient(null);
    } catch (error) {
      showSnackbar(t('client.deleteError'), 'error');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, data);
        showSnackbar(t('client.updateSuccess'), 'success');
      } else {
        await clientService.create(data);
        showSnackbar(t('client.createSuccess'), 'success');
      }
      setShowForm(false);
      setSelectedClient(null);
    } catch (error) {
      showSnackbar(t('common.error.save'), 'error');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, clientId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClientId('');
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const data = await clientService.getAll({ 
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType 
      });
      
      if (format === 'excel') {
        exportToExcel(data.items, 'clients', getListConfig().columns);
      } else {
        exportToPDF(data.items, 'clients', getListConfig().columns);
      }
      
      showSnackbar(t('common.exportSuccess'), 'success');
    } catch (error) {
      showSnackbar(t('common.exportError'), 'error');
    }
  };

  const handlePrint = async () => {
    try {
      const data = await clientService.getAll({ 
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType 
      });
      
      printData(data.items, t('client.listTitle'), getListConfig().columns);
    } catch (error) {
      showSnackbar(t('common.printError'), 'error');
    }
  };

  const handleSendPortalInvite = async (clientId: string) => {
    try {
      await clientService.sendPortalInvite(clientId);
      showSnackbar(t('client.portalInviteSent'), 'success');
      handleMenuClose();
    } catch (error) {
      showSnackbar(t('client.portalInviteError'), 'error');
    }
  };

  const renderListActions = () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {/* Search */}
      <TextField
        size="small"
        placeholder={t('common.search')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ width: 300 }}
      />
      
      {/* Filter by Type */}
      <TextField
        select
        size="small"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value as any)}
        sx={{ width: 150 }}
      >
        <MenuItem value="all">{t('common.all')}</MenuItem>
        <MenuItem value="individual">{t('client.type.individual')}</MenuItem>
        <MenuItem value="company">{t('client.type.company')}</MenuItem>
      </TextField>
      
      {/* Export Actions */}
      <Tooltip title={t('common.export')}>
        <IconButton onClick={() => handleExport('excel')}>
          <Download />
        </IconButton>
      </Tooltip>
      
      <Tooltip title={t('common.print')}>
        <IconButton onClick={handlePrint}>
          <Print />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderRowActions = (row: Client) => (
    <>
      <Tooltip title={t('common.view')}>
        <IconButton size="small" onClick={() => handleView(row)}>
          <Visibility />
        </IconButton>
      </Tooltip>
      
      {hasPermission('clients.update') && (
        <Tooltip title={t('common.edit')}>
          <IconButton size="small" onClick={() => handleEdit(row)}>
            <Edit />
          </IconButton>
        </Tooltip>
      )}
      
      <IconButton size="small" onClick={(e) => handleMenuClick(e, row.id)}>
        <MoreVert />
      </IconButton>
    </>
  );

  const renderCustomCell = (column: any, value: any, row: Client) => {
    switch (column.field) {
      case 'fullName':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {row.type === 'company' ? <Business /> : <Person />}
            </Avatar>
            <Box>
              <Typography variant="body2">
                {row.lastName} {row.firstName}
              </Typography>
              {row.companyName && (
                <Typography variant="caption" color="text.secondary">
                  {row.companyName}
                </Typography>
              )}
            </Box>
          </Box>
        );
        
      case 'folderNumber':
        return (
          <Chip
            icon={<Folder />}
            label={value}
            size="small"
            variant="outlined"
          />
        );
        
      case 'contact':
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone fontSize="small" />
              <Typography variant="caption">{formatPhone(row.phone)}</Typography>
            </Box>
            {row.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="small" />
                <Typography variant="caption">{row.email}</Typography>
              </Box>
            )}
          </Box>
        );
        
      case 'status':
        return (
          <Chip
            label={t(`common.status.${value}`)}
            size="small"
            color={
              value === 'active' ? 'success' :
              value === 'inactive' ? 'warning' : 'default'
            }
          />
        );
        
      case 'statistics':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('client.activeCases')}>
              <Badge badgeContent={row.statistics?.activeCases || 0} color="primary">
                <Gavel fontSize="small" />
              </Badge>
            </Tooltip>
            <Tooltip title={t('client.totalCases')}>
              <Badge badgeContent={row.statistics?.totalCases || 0} color="default">
                <Assignment fontSize="small" />
              </Badge>
            </Tooltip>
          </Box>
        );
        
      case 'portalAccess':
        return row.portalAccess?.hasAccess ? (
          <Chip
            label={t('client.hasPortalAccess')}
            size="small"
            color="success"
            variant="outlined"
          />
        ) : (
          <Chip
            label={t('client.noPortalAccess')}
            size="small"
            color="default"
            variant="outlined"
          />
        );
        
      default:
        return value;
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('client.listTitle')}</Typography>
        {hasPermission('clients.create') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            {t('client.addNew')}
          </Button>
        )}
      </Box>

      {/* Client List */}
      <Card>
        <CardContent>
          <GenericList
            config={getListConfig()}
            service={clientService}
            filters={{ 
              search: searchTerm,
              type: filterType === 'all' ? undefined : filterType 
            }}
            actions={renderListActions()}
            rowActions={renderRowActions}
            customCellRenderer={renderCustomCell}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedClient ? t('client.edit') : t('client.create')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={getFormConfig()}
            initialData={selectedClient}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('client.details')}
            <Box>
              {hasPermission('clients.update') && (
                <IconButton onClick={() => {
                  setShowDetail(false);
                  handleEdit(selectedClient!);
                }}>
                  <Edit />
                </IconButton>
              )}
              <IconButton onClick={() => setShowDetail(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedClient && (
            <GenericDetail
              config={getDetailConfig()}
              data={selectedClient}
              actions={
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    startIcon={<Gavel />}
                    onClick={() => navigate(`/courts?clientId=${selectedClient.id}`)}
                  >
                    {t('client.viewCourts')}
                  </Button>
                  <Button
                    startIcon={<Assignment />}
                    onClick={() => navigate(`/documents?clientId=${selectedClient.id}`)}
                  >
                    {t('client.viewDocuments')}
                  </Button>
                  {!selectedClient.portalAccess?.hasAccess && hasPermission('clients.sendPortalInvite') && (
                    <Button
                      startIcon={<PersonAdd />}
                      onClick={() => handleSendPortalInvite(selectedClient.id)}
                      color="success"
                    >
                      {t('client.sendPortalInvite')}
                    </Button>
                  )}
                </Box>
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('client.deleteConfirmation', {
              name: selectedClient ? `${selectedClient.lastName} ${selectedClient.firstName}` : ''
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const client = clientService.getById(selectedClientId);
          handleMenuClose();
          navigate(`/communications?clientId=${selectedClientId}`);
        }}>
          <Phone fontSize="small" sx={{ mr: 1 }} />
          {t('client.viewCommunications')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate(`/financial?clientId=${selectedClientId}`);
        }}>
          <Euro fontSize="small" sx={{ mr: 1 }} />
          {t('client.viewFinancials')}
        </MenuItem>
        
        {hasPermission('clients.delete') && (
          <MenuItem onClick={() => {
            const client = clientService.getById(selectedClientId);
            setSelectedClient(client);
            setShowDeleteDialog(true);
            handleMenuClose();
          }} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            {t('common.delete')}
          </MenuItem>
        )}
      </Menu>

      {/* FAB for mobile */}
      {hasPermission('clients.create') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
          onClick={handleCreate}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default ClientsPage;
