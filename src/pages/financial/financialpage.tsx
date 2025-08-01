import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Paper,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Add,
  Euro,
  TrendingUp,
  TrendingDown,
  Receipt,
  Payment,
  AccountBalance,
  Description,
  Email,
  Print,
  Download,
  MoreVert,
  CheckCircle,
  Cancel,
  Warning,
  FilterList,
  DateRange,
  Person,
  Business,
  AttachMoney,
  MoneyOff,
  CreditCard,
  LocalAtm,
  AccountBalanceWallet,
  Edit,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericList } from '../../components/generic/GenericList';
import { GenericForm } from '../../components/generic/GenericForm';
import { GenericDetail } from '../../components/generic/GenericDetail';
import { financialService } from '../../services/financialService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/export';
import { printData } from '../../utils/print';
import { financialConfig } from './financialConfig';

interface Financial {
  id: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    folderNumber: string;
  };
  type: 'charge' | 'payment' | 'expense' | 'refund';
  category: string;
  amount: number;
  vat: {
    percentage: number;
    amount: number;
  };
  includesVAT: boolean;
  netAmount: number;
  date: string;
  paymentMethod?: string;
  paymentReference?: string;
  description: string;
  notes?: string;
  invoice?: {
    number: string;
    series: string;
    issued: boolean;
    issuedDate?: string;
    dueDate?: string;
    paid: boolean;
    paidDate?: string;
    sentToClient: boolean;
  };
  receipt?: {
    number: string;
    vendor: string;
    description: string;
    file?: string;
  };
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  recurring?: {
    enabled: boolean;
    frequency: 'monthly' | 'quarterly' | 'annually';
    nextDate?: string;
  };
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalRefunds: number;
  unpaidInvoices: number;
  netProfit: number;
  vatCollected: number;
  vatPaid: number;
  periodComparison: {
    income: { current: number; previous: number; change: number };
    expenses: { current: number; previous: number; change: number };
  };
}

const FinancialPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFinancial, setSelectedFinancial] = useState<Financial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'transfer',
    paymentReference: '',
    paidDate: formatDate(new Date()),
  });
  
  // Get client ID from URL params
  const clientId = searchParams.get('clientId');

  // Check if user is secretary (no access to financial)
  useEffect(() => {
    if (user?.role === 'secretary') {
      showSnackbar(t('common.accessDenied'), 'error');
      navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    loadFinancialSummary();
  }, [dateRange, filterType]);

  const loadFinancialSummary = async () => {
    try {
      const summary = await financialService.getSummary({
        startDate: dateRange.start,
        endDate: dateRange.end,
        clientId,
      });
      setFinancialSummary(summary);
    } catch (error) {
      showSnackbar(t('financial.summaryLoadError'), 'error');
    }
  };

  const handleCreate = (type?: 'charge' | 'payment' | 'expense') => {
    setSelectedFinancial(type ? { type } as Financial : null);
    setShowForm(true);
  };

  const handleEdit = (financial: Financial) => {
    setSelectedFinancial(financial);
    setShowForm(true);
  };

  const handleView = (financial: Financial) => {
    setSelectedFinancial(financial);
    setShowDetail(true);
  };

  const handleIssueInvoice = async () => {
    if (!selectedFinancial) return;
    
    try {
      await financialService.issueInvoice(selectedFinancial.id);
      showSnackbar(t('financial.invoiceIssued'), 'success');
      setShowInvoiceDialog(false);
      
      // Send invoice email
      if (selectedFinancial.client) {
        const template = await emailService.getTemplate('invoice_issued', {
          clientName: `${selectedFinancial.client.lastName} ${selectedFinancial.client.firstName}`,
          invoiceNumber: selectedFinancial.invoice?.number,
          amount: formatCurrency(selectedFinancial.amount),
          dueDate: formatDate(selectedFinancial.invoice?.dueDate || ''),
        });
        
        await emailService.send({
          to: selectedFinancial.client.email,
          subject: t('financial.email.invoice.subject'),
          body: template,
          attachments: [`invoice_${selectedFinancial.invoice?.number}.pdf`],
        });
      }
    } catch (error) {
      showSnackbar(t('financial.invoiceError'), 'error');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedFinancial) return;
    
    try {
      await financialService.markAsPaid(selectedFinancial.id, paymentData);
      showSnackbar(t('financial.markedAsPaid'), 'success');
      setShowPaymentDialog(false);
      setPaymentData({ paymentMethod: 'transfer', paymentReference: '', paidDate: formatDate(new Date()) });
    } catch (error) {
      showSnackbar(t('financial.paymentError'), 'error');
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const data = await financialService.getAll({
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        startDate: dateRange.start,
        endDate: dateRange.end,
        clientId,
      });
      
      if (format === 'excel') {
        exportToExcel(data.items, 'financial', financialConfig.list.columns);
      } else {
        exportToPDF(data.items, 'financial', financialConfig.list.columns);
      }
      
      showSnackbar(t('common.exportSuccess'), 'success');
    } catch (error) {
      showSnackbar(t('common.exportError'), 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'charge':
        return <AttachMoney color="primary" />;
      case 'payment':
        return <Payment color="success" />;
      case 'expense':
        return <MoneyOff color="error" />;
      case 'refund':
        return <CreditCard color="warning" />;
      default:
        return <Euro />;
    }
  };

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  {t('financial.totalIncome')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(financialSummary?.totalIncome || 0)}
                </Typography>
                {financialSummary?.periodComparison.income && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {financialSummary.periodComparison.income.change > 0 ? (
                      <TrendingUp color="success" fontSize="small" />
                    ) : (
                      <TrendingDown color="error" fontSize="small" />
                    )}
                    <Typography variant="caption" color={financialSummary.periodComparison.income.change > 0 ? 'success.main' : 'error.main'}>
                      {financialSummary.periodComparison.income.change}%
                    </Typography>
                  </Box>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'success.light' }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  {t('financial.totalExpenses')}
                </Typography>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(financialSummary?.totalExpenses || 0)}
                </Typography>
                {financialSummary?.periodComparison.expenses && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {financialSummary.periodComparison.expenses.change < 0 ? (
                      <TrendingDown color="success" fontSize="small" />
                    ) : (
                      <TrendingUp color="error" fontSize="small" />
                    )}
                    <Typography variant="caption" color={financialSummary.periodComparison.expenses.change < 0 ? 'success.main' : 'error.main'}>
                      {financialSummary.periodComparison.expenses.change}%
                    </Typography>
                  </Box>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'error.light' }}>
                <MoneyOff />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  {t('financial.netProfit')}
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(financialSummary?.netProfit || 0)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <AccountBalanceWallet />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  {t('financial.unpaidInvoices')}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {formatCurrency(financialSummary?.unpaidInvoices || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('financial.overdueCount', { count: 3 })}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.light' }}>
                <Warning />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTransactionsList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ width: 150 }}
            label={t('financial.type')}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="charge">{t('financial.type.charge')}</MenuItem>
            <MenuItem value="payment">{t('financial.type.payment')}</MenuItem>
            <MenuItem value="expense">{t('financial.type.expense')}</MenuItem>
            <MenuItem value="refund">{t('financial.type.refund')}</MenuItem>
          </TextField>
          
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 150 }}
            label={t('common.status')}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="pending">{t('financial.status.pending')}</MenuItem>
            <MenuItem value="completed">{t('financial.status.completed')}</MenuItem>
            <MenuItem value="overdue">{t('financial.status.overdue')}</MenuItem>
          </TextField>
          
          <TextField
            type="date"
            size="small"
            label={t('common.startDate')}
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            type="date"
            size="small"
            label={t('common.endDate')}
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title={t('common.export')}>
              <IconButton onClick={() => handleExport('excel')}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.print')}>
              <IconButton onClick={() => printData([], t('financial.report'), financialConfig.list.columns)}>
                <Print />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <GenericList
          config={financialConfig.list}
          service={financialService}
          filters={{
            type: filterType === 'all' ? undefined : filterType,
            status: filterStatus === 'all' ? undefined : filterStatus,
            startDate: dateRange.start,
            endDate: dateRange.end,
            clientId,
          }}
          rowActions={(row) => (
            <>
              <Tooltip title={t('common.view')}>
                <IconButton size="small" onClick={() => handleView(row)}>
                  <Description />
                </IconButton>
              </Tooltip>
              {hasPermission('financial.update') && row.status === 'pending' && (
                <Tooltip title={t('common.edit')}>
                  <IconButton size="small" onClick={() => handleEdit(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Invoice Actions */}
              {row.type === 'charge' && !row.invoice?.issued && (
                <Tooltip title={t('financial.issueInvoice')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedFinancial(row);
                      setShowInvoiceDialog(true);
                    }}
                  >
                    <Receipt />
                  </IconButton>
                </Tooltip>
              )}
              
              {row.invoice?.issued && !row.invoice.paid && (
                <Tooltip title={t('financial.markAsPaid')}>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedFinancial(row);
                      setShowPaymentDialog(true);
                    }}
                  >
                    <Payment />
                  </IconButton>
                </Tooltip>
              )}
              
              <IconButton
                size="small"
                onClick={(e) => {
                  setSelectedFinancial(row);
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
            </>
          )}
          customCellRenderer={(column, value, row) => {
            switch (column.field) {
              case 'type':
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(value)}
                    <Typography variant="body2">
                      {t(`financial.type.${value}`)}
                    </Typography>
                  </Box>
                );
                
              case 'client':
                return row.client ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {row.client.lastName} {row.client.firstName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.client.folderNumber}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Chip label={t('financial.generalExpense')} size="small" />
                );
                
              case 'amount':
                return (
                  <Typography
                    variant="body2"
                    color={['charge', 'refund'].includes(row.type) ? 'primary' : 'error'}
                    fontWeight="bold"
                  >
                    {['payment', 'expense'].includes(row.type) && '-'}
                    {formatCurrency(value)}
                  </Typography>
                );
                
              case 'invoice':
                if (!row.invoice?.issued) return '-';
                return (
                  <Box>
                    <Typography variant="body2">
                      {row.invoice.number}
                    </Typography>
                    {row.invoice.paid ? (
                      <Chip
                        icon={<CheckCircle />}
                        label={t('financial.paid')}
                        size="small"
                        color="success"
                      />
                    ) : (
                      <Chip
                        label={t('financial.unpaid')}
                        size="small"
                        color={row.status === 'overdue' ? 'error' : 'warning'}
                      />
                    )}
                  </Box>
                );
                
              case 'status':
                return (
                  <Chip
                    label={t(`financial.status.${value}`)}
                    size="small"
                    color={
                      value === 'completed' ? 'success' :
                      value === 'overdue' ? 'error' :
                      value === 'cancelled' ? 'default' : 'warning'
                    }
                  />
                );
                
              default:
                return value;
            }
          }}
        />
      </CardContent>
    </Card>
  );

  const renderClientStatement = () => {
    if (!clientId) return null;
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.date')}</TableCell>
              <TableCell>{t('financial.description')}</TableCell>
              <TableCell align="right">{t('financial.charge')}</TableCell>
              <TableCell align="right">{t('financial.payment')}</TableCell>
              <TableCell align="right">{t('financial.balance')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Statement rows would be populated here */}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('financial.totals')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  {formatCurrency(1500)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="success.main" fontWeight="bold">
                  {formatCurrency(1000)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="error.main" fontWeight="bold">
                  {formatCurrency(500)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('financial.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {hasPermission('financial.create') && (
            <>
              <Button
                variant="outlined"
                startIcon={<MoneyOff />}
                onClick={() => handleCreate('expense')}
              >
                {t('financial.addExpense')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Payment />}
                onClick={() => handleCreate('payment')}
              >
                {t('financial.addPayment')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AttachMoney />}
                onClick={() => handleCreate('charge')}
              >
                {t('financial.addCharge')}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      {!clientId && renderSummaryCards()}

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
        <Tab label={t('financial.transactions')} />
        {clientId && <Tab label={t('financial.statement')} />}
        <Tab label={t('financial.recurring')} />
      </Tabs>

      {/* Tab Content */}
      {selectedTab === 0 && renderTransactionsList()}
      {selectedTab === 1 && clientId && renderClientStatement()}
      {selectedTab === 2 && (
        <Alert severity="info">
          {t('financial.recurringInfo')}
        </Alert>
      )}

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFinancial?.id ? t('financial.edit') : t('financial.create')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={financialConfig.form}
            initialData={selectedFinancial}
            onSubmit={async (data) => {
              try {
                if (selectedFinancial?.id) {
                  await financialService.update(selectedFinancial.id, data);
                  showSnackbar(t('financial.updateSuccess'), 'success');
                } else {
                  await financialService.create(data);
                  showSnackbar(t('financial.createSuccess'), 'success');
                }
                setShowForm(false);
                loadFinancialSummary();
              } catch (error) {
                showSnackbar(t('common.error.save'), 'error');
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Issue Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onClose={() => setShowInvoiceDialog(false)}>
        <DialogTitle>{t('financial.issueInvoice')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('financial.issueInvoiceConfirm', {
              amount: formatCurrency(selectedFinancial?.amount || 0),
              client: selectedFinancial?.client ? 
                `${selectedFinancial.client.lastName} ${selectedFinancial.client.firstName}` : '',
            })}
          </Typography>
          <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={t('financial.sendInvoiceEmail')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvoiceDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleIssueInvoice} variant="contained">
            {t('financial.issue')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>{t('financial.markAsPaid')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label={t('financial.paymentMethod')}
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              >
                <MenuItem value="cash">{t('financial.paymentMethod.cash')}</MenuItem>
                <MenuItem value="card">{t('financial.paymentMethod.card')}</MenuItem>
                <MenuItem value="transfer">{t('financial.paymentMethod.transfer')}</MenuItem>
                <MenuItem value="check">{t('financial.paymentMethod.check')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('financial.paymentReference')}
                value={paymentData.paymentReference}
                onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label={t('financial.paidDate')}
                value={paymentData.paidDate}
                onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleMarkAsPaid} variant="contained" color="success">
            {t('financial.confirmPayment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('financial.details')}</DialogTitle>
        <DialogContent>
          {selectedFinancial && (
            <GenericDetail
              config={financialConfig.detail}
              data={selectedFinancial}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          // Download invoice
          setAnchorEl(null);
        }}>
          <Download fontSize="small" sx={{ mr: 1 }} />
          {t('financial.downloadInvoice')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Send invoice email
          setAnchorEl(null);
        }}>
          <Email fontSize="small" sx={{ mr: 1 }} />
          {t('financial.sendInvoice')}
        </MenuItem>
        
        {selectedFinancial?.type === 'charge' && selectedFinancial.status !== 'cancelled' && (
          <MenuItem onClick={() => {
            // Cancel transaction
            setAnchorEl(null);
          }} sx={{ color: 'error.main' }}>
            <Cancel fontSize="small" sx={{ mr: 1 }} />
            {t('financial.cancel')}
          </MenuItem>
        )}
      </Menu>

      {/* FAB for mobile */}
      {hasPermission('financial.create') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
          onClick={() => handleCreate()}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default FinancialPage;
