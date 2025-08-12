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
  Contacts as ContactsIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  AccountBalance as BankIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { contactsData } from '../../../data/dashboardData';

const ContactsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = contactsData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.organization.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEmail = (contactId: string) => {
    console.log('Sending email to contact:', contactId);
  };

  const handleEdit = (contactId: string) => {
    console.log('Editing contact:', contactId);
  };

  // Calculate statistics
  const totalContacts = contactsData.length;
  const legalContacts = contactsData.filter(item => item.category === 'Νομικός').length;
  const businessContacts = contactsData.filter(item => item.category === 'Επιχειρηματικός').length;
  const institutionalContacts = contactsData.filter(item => item.category === 'Θεσμικός').length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Νομικός': return 'primary';
      case 'Επιχειρηματικός': return 'info';
      case 'Θεσμικός': return 'secondary';
      case 'Ιατρικός': return 'success';
      case 'Ακαδημαϊκός': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ενεργός': return 'success';
      case 'Περιστασιακός': return 'info';
      case 'Αναστολή': return 'warning';
      case 'VIP': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Νομικός': return <GavelIcon fontSize="small" />;
      case 'Επιχειρηματικός': return <BusinessIcon fontSize="small" />;
      case 'Θεσμικός': return <BankIcon fontSize="small" />;
      case 'Ιατρικός': return <HospitalIcon fontSize="small" />;
      case 'Ακαδημαϊκός': return <PersonIcon fontSize="small" />;
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
          <ContactsIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Επαφές
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Διαχείριση επαγγελματικών επαφών και συνεργατών
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
                {totalContacts}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικές Επαφές
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
                {legalContacts}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Νομικές
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
                {businessContacts}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Επιχειρηματικές
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
                {institutionalContacts}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Θεσμικές
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Αναζήτηση επαφών..."
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Επαφή</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Οργανισμός</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Επικοινωνία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τοποθεσία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατηγορία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατάσταση</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((contact) => (
              <TableRow 
                key={contact.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&:nth-of-type(odd)': { backgroundColor: 'action.selected' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      {getInitials(contact.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {contact.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {contact.position}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{contact.organization}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2">{contact.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2">{contact.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{contact.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getCategoryIcon(contact.category)}
                    label={contact.category}
                    color={getCategoryColor(contact.category) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={contact.status}
                    color={getStatusColor(contact.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmail(contact.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Επεξεργασία">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(contact.id)}
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

export default ContactsPage;

