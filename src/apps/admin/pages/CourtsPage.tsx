import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import {
  Search,
  Print,
  FilterList,
  Gavel,
  CalendarToday,
  LocationOn,
  Person,
  Email
} from '@mui/icons-material';

interface CourtCase {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  court: string;
  date: string;
  time: string;
  status: 'scheduled' | 'postponed' | 'completed' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  judge: string;
  location: string;
}

const mockCases: CourtCase[] = [
  {
    id: '1',
    caseNumber: 'ΑΠ 1234/2024',
    title: 'Μαρινάκος κατά Δήμου Αθηναίων',
    client: 'Μάριος Μαρινάκος',
    court: 'Πρωτοδικείο Αθηνών',
    date: '2024-08-15',
    time: '09:00',
    status: 'scheduled',
    priority: 'urgent',
    judge: 'Κωνσταντίνα Παπαδοπούλου',
    location: 'Αίθουσα 12'
  },
  {
    id: '2',
    caseNumber: 'ΕΦ 5678/2024',
    title: 'Παπαδόπουλος κατά Τράπεζας Πειραιώς',
    client: 'Γιάννης Παπαδόπουλος',
    court: 'Εφετείο Αθηνών',
    date: '2024-08-16',
    time: '11:30',
    status: 'postponed',
    priority: 'high',
    judge: 'Μαρία Κωνσταντίνου',
    location: 'Αίθουσα 5'
  },
  {
    id: '3',
    caseNumber: 'ΠΠ 9012/2024',
    title: 'Κωνσταντίνου κατά Ασφαλιστικής',
    client: 'Ελένη Κωνσταντίνου',
    court: 'Πολυμελές Πρωτοδικείο',
    date: '2024-08-17',
    time: '14:00',
    status: 'completed',
    priority: 'medium',
    judge: 'Δημήτρης Αντωνίου',
    location: 'Αίθουσα 8'
  },
  {
    id: '4',
    caseNumber: 'ΑΠ 3456/2024',
    title: 'Γεωργίου κατά Εργοδότη',
    client: 'Νίκος Γεωργίου',
    court: 'Πρωτοδικείο Πειραιά',
    date: '2024-08-18',
    time: '10:15',
    status: 'scheduled',
    priority: 'low',
    judge: 'Σοφία Μιχαήλ',
    location: 'Αίθουσα 3'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return '#10b981';
    case 'postponed':
      return '#f59e0b';
    case 'completed':
      return '#6366f1';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'Προγραμματισμένη';
    case 'postponed':
      return 'Αναβλήθηκε';
    case 'completed':
      return 'Ολοκληρώθηκε';
    case 'cancelled':
      return 'Ακυρώθηκε';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return '#ef4444';
    case 'high':
      return '#f59e0b';
    case 'medium':
      return '#10b981';
    case 'low':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'Επείγον';
    case 'high':
      return 'Υψηλή';
    case 'medium':
      return 'Μέτρια';
    case 'low':
      return 'Χαμηλή';
    default:
      return priority;
  }
};

const CourtsPage: React.FC = () => {
  const [cases] = useState<CourtCase[]>(mockCases);
  const [filteredCases, setFilteredCases] = useState<CourtCase[]>(mockCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = cases.filter(
      (courtCase) =>
        courtCase.title.toLowerCase().includes(term) ||
        courtCase.client.toLowerCase().includes(term) ||
        courtCase.caseNumber.toLowerCase().includes(term) ||
        courtCase.court.toLowerCase().includes(term) ||
        courtCase.judge.toLowerCase().includes(term)
    );
    
    setFilteredCases(filtered);
    setPage(0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailClick = (courtCase: CourtCase) => {
    alert(`📧 Email για: ${courtCase.title}\n👤 Παραλήπτης: ${courtCase.client}\n📅 Δικάσιμος: ${courtCase.date} ${courtCase.time}\n🏛️ Δικαστήριο: ${courtCase.court}\n📝 Θέμα: Ενημέρωση για δικάσιμο`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCases = filteredCases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Gavel sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Δικαστήρια
          </Typography>
        </Stack>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Διαχείριση δικαστικών υποθέσεων και δικασίμων
        </Typography>

        {/* Controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Αναζήτηση υποθέσεων..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ minWidth: 120 }}
          >
            Φίλτρα
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ minWidth: 120 }}
          >
            Εκτύπωση
          </Button>
        </Stack>
      </Box>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Αριθμός Υπόθεσης</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Τίτλος</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Εντολέας</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Δικαστήριο</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ημερομηνία</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Κατάσταση</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Προτεραιότητα</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCases.map((courtCase) => (
                <TableRow
                  key={courtCase.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#6366f1', 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {courtCase.caseNumber}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {courtCase.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<Person />}
                        label={courtCase.judge}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip
                        icon={<LocationOn />}
                        label={courtCase.location}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {courtCase.client}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {courtCase.court}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(courtCase.date).toLocaleDateString('el-GR')}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {courtCase.time}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusLabel(courtCase.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(courtCase.status), 0.1),
                        color: getStatusColor(courtCase.status),
                        border: `1px solid ${alpha(getStatusColor(courtCase.status), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(courtCase.priority)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getPriorityColor(courtCase.priority), 0.1),
                        color: getPriorityColor(courtCase.priority),
                        border: `1px solid ${alpha(getPriorityColor(courtCase.priority), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Tooltip title="Αποστολή Email">
                      <IconButton
                        size="small"
                        onClick={() => handleEmailClick(courtCase)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: alpha('#6366f1', 0.1),
                          },
                        }}
                      >
                        <Email />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCases.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Γραμμές ανά σελίδα:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} από ${count !== -1 ? count : `περισσότερα από ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};

export default CourtsPage;

