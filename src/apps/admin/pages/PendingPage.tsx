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
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { pendingData } from '../../../data/dashboardData';

const PendingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = pendingData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEmail = (pendingId: string) => {
    console.log('Sending email for pending:', pendingId);
  };

  const handleEdit = (pendingId: string) => {
    console.log('Editing pending:', pendingId);
  };

  // Calculate statistics
  const totalPending = pendingData.length;
  const urgentPending = pendingData.filter(item => item.priority === 'Επείγον').length;
  const activePending = pendingData.filter(item => item.status === 'Ενεργό').length;
  const completedPending = pendingData.filter(item => item.status === 'Ολοκληρώθηκε').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Επείγον': return 'error';
      case 'Ενεργό': return 'primary';
      case 'Ολοκληρώθηκε': return 'success';
      case 'Εορτή': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Δικόγραφο': return 'primary';
      case 'Συλλογή Στοιχείων': return 'info';
      case 'Επικοινωνία': return 'secondary';
      case 'Έρευνα': return 'warning';
      case 'Ανάλυση': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Επείγον': return 'error';
      case 'Υψηλή': return 'warning';
      case 'Μεσαία': return 'info';
      case 'Χαμηλή': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AssignmentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Εκκρεμότητες
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Διαχείριση εκκρεμών εργασιών και καθηκόντων
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
                {totalPending}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικές Εκκρεμότητες
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
                {urgentPending}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Επείγουσες
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
                {activePending}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ενεργές
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
                {completedPending}
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
          placeholder="Αναζήτηση εκκρεμοτήτων..."
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τίτλος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ανατέθηκε σε</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ημερομηνία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Εκτιμώμενος Χρόνος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τύπος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατάσταση</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Προτεραιότητα</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((pending) => (
              <TableRow 
                key={pending.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&:nth-of-type(odd)': { backgroundColor: 'action.selected' }
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {pending.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pending.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{pending.assignedTo}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{pending.date}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {pending.estimatedTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={pending.type}
                    color={getTypeColor(pending.type) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={pending.status}
                    color={getStatusColor(pending.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={pending.priority}
                    color={getPriorityColor(pending.priority) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmail(pending.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Επεξεργασία">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(pending.id)}
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

export default PendingPage;

