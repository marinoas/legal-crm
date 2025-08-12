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
  Card,
  CardContent,
  Grid,
  alpha
} from '@mui/material';
import {
  Search,
  Print,
  Email,
  Edit,
  Schedule,
  CalendarToday,
  Person,
  Assignment,
  Warning,
  CheckCircle
} from '@mui/icons-material';

interface Deadline {
  id: string;
  title: string;
  client: string;
  caseNumber: string;
  dueDate: string;
  dueTime: string;
  type: 'filing' | 'response' | 'research' | 'hearing' | 'payment';
  status: 'pending' | 'completed' | 'overdue' | 'urgent';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description: string;
  assignedTo: string;
  daysRemaining: number;
}

const mockDeadlines: Deadline[] = [
  {
    id: '1',
    title: 'Κατάθεση Ανακοπής',
    client: 'Μάριος Μαρινάκος',
    caseNumber: 'ΠΡΩ-2024-001',
    dueDate: '2024-08-12',
    dueTime: '17:00',
    type: 'filing',
    status: 'urgent',
    priority: 'urgent',
    description: 'Κατάθεση ανακοπής κατά της απόφασης του Πρωτοδικείου',
    assignedTo: 'Μάριος Μαρινάκος',
    daysRemaining: 0
  },
  {
    id: '2',
    title: 'Προσθήκη Αντίκρουση',
    client: 'Γιάννης Παπαδόπουλος',
    caseNumber: 'ΕΙΡ-2024-045',
    dueDate: '2024-08-13',
    dueTime: '12:00',
    type: 'response',
    status: 'pending',
    priority: 'high',
    description: 'Προσθήκη αντίκρουσης στην αγωγή του εναγομένου',
    assignedTo: 'Μάριος Μαρινάκος',
    daysRemaining: 1
  },
  {
    id: '3',
    title: 'Έρευνα Κτηματολογίου',
    client: 'Μαρία Κωνσταντίνου',
    caseNumber: 'ΕΦΕ-2024-123',
    dueDate: '2024-08-14',
    dueTime: '09:00',
    type: 'research',
    status: 'pending',
    priority: 'medium',
    description: 'Έρευνα στο κτηματολόγιο για τα ακίνητα του εναγομένου',
    assignedTo: 'Μάριος Μαρινάκος',
    daysRemaining: 2
  },
  {
    id: '4',
    title: 'Πληρωμή Δικαστικών Εξόδων',
    client: 'Δημήτρης Αντωνίου',
    caseNumber: 'ΠΡΩ-2024-067',
    dueDate: '2024-08-15',
    dueTime: '16:00',
    type: 'payment',
    status: 'pending',
    priority: 'high',
    description: 'Πληρωμή δικαστικών εξόδων για την έφεση',
    assignedTo: 'Μάριος Μαρινάκος',
    daysRemaining: 3
  },
  {
    id: '5',
    title: 'Προετοιμασία Μαρτύρων',
    client: 'Ελένη Παπαδημητρίου',
    caseNumber: 'ΑΣΤ-2024-089',
    dueDate: '2024-08-16',
    dueTime: '14:30',
    type: 'hearing',
    status: 'completed',
    priority: 'medium',
    description: 'Προετοιμασία μαρτύρων για τη δικάσιμο',
    assignedTo: 'Μάριος Μαρινάκος',
    daysRemaining: 4
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'filing':
      return '#3b82f6';
    case 'response':
      return '#10b981';
    case 'research':
      return '#f59e0b';
    case 'hearing':
      return '#8b5cf6';
    case 'payment':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'filing':
      return 'Κατάθεση';
    case 'response':
      return 'Απάντηση';
    case 'research':
      return 'Έρευνα';
    case 'hearing':
      return 'Ακρόαση';
    case 'payment':
      return 'Πληρωμή';
    default:
      return type;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'completed':
      return '#10b981';
    case 'overdue':
      return '#ef4444';
    case 'urgent':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Εκκρεμεί';
    case 'completed':
      return 'Ολοκληρώθηκε';
    case 'overdue':
      return 'Εκπρόθεσμο';
    case 'urgent':
      return 'Επείγον';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return '#dc2626';
    case 'high':
      return '#ea580c';
    case 'medium':
      return '#ca8a04';
    case 'low':
      return '#65a30d';
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

const DeadlinesPage: React.FC = () => {
  const [deadlines] = useState<Deadline[]>(mockDeadlines);
  const [filteredDeadlines, setFilteredDeadlines] = useState<Deadline[]>(mockDeadlines);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = deadlines.filter(
      (deadline) =>
        deadline.title.toLowerCase().includes(term) ||
        deadline.client.toLowerCase().includes(term) ||
        deadline.caseNumber.toLowerCase().includes(term) ||
        deadline.description.toLowerCase().includes(term)
    );
    
    setFilteredDeadlines(filtered);
    setPage(0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailClick = (deadline: Deadline) => {
    alert(`📧 Email για: ${deadline.title}\n👤 Παραλήπτης: ${deadline.client}\n📅 Προθεσμία: ${deadline.dueDate} ${deadline.dueTime}\n📝 Θέμα: Υπενθύμιση προθεσμίας`);
  };

  const handleEditClick = (deadline: Deadline) => {
    alert(`✏️ Επεξεργασία προθεσμίας: ${deadline.title}`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDeadlines = filteredDeadlines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Statistics
  const totalDeadlines = deadlines.length;
  const pendingDeadlines = deadlines.filter(d => d.status === 'pending').length;
  const urgentDeadlines = deadlines.filter(d => d.status === 'urgent').length;
  const completedDeadlines = deadlines.filter(d => d.status === 'completed').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Schedule sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Προθεσμίες
          </Typography>
        </Stack>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Διαχείριση προθεσμιών και υπενθυμίσεων
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {totalDeadlines}
                </Typography>
                <Typography variant="body2">
                  Συνολικές Προθεσμίες
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {urgentDeadlines}
                </Typography>
                <Typography variant="body2">
                  Επείγουσες
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {pendingDeadlines}
                </Typography>
                <Typography variant="body2">
                  Εκκρεμείς
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {completedDeadlines}
                </Typography>
                <Typography variant="body2">
                  Ολοκληρωμένες
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Αναζήτηση προθεσμιών..."
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
                <TableCell sx={{ fontWeight: 600 }}>Τίτλος</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Εντολέας</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Υπόθεση</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Προθεσμία</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Τύπος</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Κατάσταση</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Προτεραιότητα</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ημέρες</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDeadlines.map((deadline) => (
                <TableRow
                  key={deadline.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#6366f1', 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {deadline.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {deadline.description}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {deadline.client}
                      </Typography>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {deadline.caseNumber}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2">
                          {new Date(deadline.dueDate).toLocaleDateString('el-GR')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {deadline.dueTime}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getTypeLabel(deadline.type)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getTypeColor(deadline.type), 0.1),
                        color: getTypeColor(deadline.type),
                        border: `1px solid ${alpha(getTypeColor(deadline.type), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusLabel(deadline.status)}
                      size="small"
                      icon={deadline.status === 'completed' ? <CheckCircle /> : 
                            deadline.status === 'urgent' ? <Warning /> : undefined}
                      sx={{
                        backgroundColor: alpha(getStatusColor(deadline.status), 0.1),
                        color: getStatusColor(deadline.status),
                        border: `1px solid ${alpha(getStatusColor(deadline.status), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(deadline.priority)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getPriorityColor(deadline.priority), 0.1),
                        color: getPriorityColor(deadline.priority),
                        border: `1px solid ${alpha(getPriorityColor(deadline.priority), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: deadline.daysRemaining <= 1 ? 'error.main' : 
                               deadline.daysRemaining <= 3 ? 'warning.main' : 'text.primary'
                      }}
                    >
                      {deadline.daysRemaining === 0 ? 'Σήμερα' : 
                       deadline.daysRemaining === 1 ? 'Αύριο' : 
                       `${deadline.daysRemaining} ημέρες`}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Αποστολή Email">
                        <IconButton
                          size="small"
                          onClick={() => handleEmailClick(deadline)}
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
                      <Tooltip title="Επεξεργασία">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(deadline)}
                          sx={{
                            color: 'secondary.main',
                            '&:hover': {
                              backgroundColor: alpha('#ec4899', 0.1),
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDeadlines.length}
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

export default DeadlinesPage;

