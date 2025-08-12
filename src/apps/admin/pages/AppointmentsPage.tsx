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
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { appointmentsData } from '../../../data/dashboardData';

const AppointmentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = appointmentsData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEmail = (appointmentId: string) => {
    console.log('Sending email for appointment:', appointmentId);
  };

  const handleEdit = (appointmentId: string) => {
    console.log('Editing appointment:', appointmentId);
  };

  // Calculate statistics
  const totalAppointments = appointmentsData.length;
  const todayAppointments = appointmentsData.filter(item => item.date === 'Σήμερα').length;
  const upcomingAppointments = appointmentsData.filter(item => item.status === 'Ενεργό').length;
  const completedAppointments = appointmentsData.filter(item => item.status === 'Ολοκληρώθηκε').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Επείγον': return 'error';
      case 'Ενεργό': return 'primary';
      case 'Ολοκληρώθηκε': return 'success';
      case 'Ακυρώθηκε': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Συνάντηση': return 'primary';
      case 'Τηλεδιάσκεψη': return 'info';
      case 'Τηλεφωνική': return 'secondary';
      case 'Συμβουλευτική': return 'success';
      case 'Δικάσιμος': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Συνάντηση': return <PersonIcon fontSize="small" />;
      case 'Τηλεδιάσκεψη': return <VideoCallIcon fontSize="small" />;
      case 'Τηλεφωνική': return <PhoneIcon fontSize="small" />;
      case 'Συμβουλευτική': return <PersonIcon fontSize="small" />;
      case 'Δικάσιμος': return <EventIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EventIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Ραντεβού
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Διαχείριση προγραμματισμένων συναντήσεων και ραντεβού
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
                {totalAppointments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Συνολικά Ραντεβού
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
                {todayAppointments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Σήμερα
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
                {upcomingAppointments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Επερχόμενα
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
                {completedAppointments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ολοκληρωμένα
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Αναζήτηση ραντεβού..."
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Εντολέας</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ημερομηνία & Ώρα</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Διάρκεια</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τοποθεσία</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Τύπος</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Κατάσταση</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((appointment) => (
              <TableRow 
                key={appointment.id}
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&:nth-of-type(odd)': { backgroundColor: 'action.selected' }
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {appointment.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {appointment.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{appointment.client}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Box>
                      <Typography variant="body2">{appointment.date}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.time}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {appointment.duration}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2">{appointment.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(appointment.type)}
                    label={appointment.type}
                    color={getTypeColor(appointment.type) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmail(appointment.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Επεξεργασία">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(appointment.id)}
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

export default AppointmentsPage;

