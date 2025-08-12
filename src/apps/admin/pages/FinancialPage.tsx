import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  TablePagination,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  AccountBalance as FinancialIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { financialData } from '../../../data/dashboardData';

const FinancialPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = financialData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = (transactionId: string) => {
    console.log('Sending email for transaction:', transactionId);
  };

  const handleEdit = (transactionId: string) => {
    console.log('Editing transaction:', transactionId);
  };

  // Calculate statistics
  const totalRevenue = financialData
    .filter(item => item.type === 'Είσπραξη')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpenses = financialData
    .filter(item => item.type === 'Έξοδο')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  
  const pendingPayments = financialData
    .filter(item => item.status === 'Εκκρεμεί')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  
  const completedTransactions = financialData.filter(item => item.status === 'Ολοκληρώθηκε').length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Είσπραξη': return 'success';
      case 'Έξοδο': return 'error';
      case 'Προκαταβολή': return 'info';
      case 'Επιστροφή': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ολοκληρώθηκε': return 'success';
      case 'Εκκρεμεί': return 'warning';
      case 'Ακυρώθηκε': return 'error';
      case 'Επεξεργασία': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Είσπραξη': return <TrendingUpIcon fontSize="small" />;
      case 'Έξοδο': return <TrendingDownIcon fontSize="small" />;
      case 'Προκαταβολή': return <WalletIcon fontSize="small" />;
      case 'Επιστροφή': return <PaymentIcon fontSize="small" />;
      default: return <ReceiptIcon fontSize="small" />;
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}€${Math.abs(amount).toLocaleString('el-GR', { minimumFractionDigits: 2 })}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FinancialIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Οικονομικά
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Διαχείριση οικονομικών συναλλαγών και εισπράξεων
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                €{totalRevenue.toLocaleString('el-GR')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικά Έσοδα
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                €{totalExpenses.toLocaleString('el-GR')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικά Έξοδα
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                €{pendingPayments.toLocaleString('el-GR')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Εκκρεμείς Πληρωμές
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {completedTransactions}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ολοκληρωμένες
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Αναζήτηση συναλλαγών..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ 
            minWidth: 120,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            }
          }}
        >
          Εκτύπωση
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Περιγραφή</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Εντολέας</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ημερομηνία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ποσό</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τύπος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Μέθοδος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατάσταση</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((transaction) => (
              <TableRow 
                key={transaction.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&:nth-of-type(odd)': { backgroundColor: 'action.selected' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transaction.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {transaction.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                      {getInitials(transaction.client)}
                    </Avatar>
                    <Typography variant="body2">{transaction.client}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{transaction.date}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EuroIcon sx={{ mr: 1, color: transaction.amount >= 0 ? 'success.main' : 'error.main', fontSize: 16 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: transaction.amount >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {formatAmount(transaction.amount)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(transaction.type)}
                    label={transaction.type}
                    color={getTypeColor(transaction.type) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{transaction.method}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmail(transaction.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Επεξεργασία">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(transaction.id)}
                        sx={{ color: 'secondary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Γραμμές ανά σελίδα:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} από ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default FinancialPage;

