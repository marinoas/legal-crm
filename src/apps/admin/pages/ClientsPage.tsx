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
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { clientsData } from '../../../data/dashboardData';

const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = clientsData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEmail = (clientId: string) => {
    console.log('Sending email to client:', clientId);
  };

  const handleEdit = (clientId: string) => {
    console.log('Editing client:', clientId);
  };

  // Calculate statistics
  const totalClients = clientsData.length;
  const activeClients = clientsData.filter(item => item.status === 'Ενεργός').length;
  const corporateClients = clientsData.filter(item => item.type === 'Εταιρεία').length;
  const individualClients = clientsData.filter(item => item.type === 'Φυσικό Πρόσωπο').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ενεργός': return 'success';
      case 'Αναστολή': return 'warning';
      case 'Ανενεργός': return 'default';
      case 'VIP': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Φυσικό Πρόσωπο': return 'primary';
      case 'Εταιρεία': return 'info';
      case 'Οργανισμός': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Φυσικό Πρόσωπο': return <PersonIcon fontSize="small" />;
      case 'Εταιρεία': return <BusinessIcon fontSize="small" />;
      case 'Οργανισμός': return <AccountBalanceIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Εντολείς
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Διαχείριση πελατών και εντολέων του δικηγορικού γραφείου
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {totalClients}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικοί Εντολείς
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {activeClients}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ενεργοί
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
                {corporateClients}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Εταιρείες
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
                {individualClients}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Φυσικά Πρόσωπα
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Αναζήτηση εντολέων..."
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Εντολέας</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Επικοινωνία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τοποθεσία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τύπος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενεργές Υποθέσεις</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατάσταση</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((client) => (
              <TableRow 
                key={client.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&:nth-of-type(odd)': { backgroundColor: 'action.selected' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getInitials(client.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {client.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.profession}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2">{client.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2">{client.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Box>
                      <Typography variant="body2">{client.city}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.address}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(client.type)}
                    label={client.type}
                    color={getTypeColor(client.type) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {client.activeCases}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={client.status}
                    color={getStatusColor(client.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmail(client.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Επεξεργασία">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(client.id)}
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

export default ClientsPage;

