import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface ClientDetailViewProps {
  open: boolean;
  onClose: () => void;
  client: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ open, onClose, client }) => {
  const [tabValue, setTabValue] = useState(0);
  const [phoneNotes, setPhoneNotes] = useState('');
  const [financialAmount, setFinancialAmount] = useState('');
  const [financialDescription, setFinancialDescription] = useState('');
  const [financialType, setFinancialType] = useState<'charge' | 'credit'>('charge');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddPhoneNote = () => {
    if (phoneNotes.trim()) {
      // TODO: Save to database with auto timestamp
      console.log('Adding phone note:', {
        clientId: client?.id,
        timestamp: new Date(),
        notes: phoneNotes
      });
      setPhoneNotes('');
    }
  };

  const handleAddFinancialEntry = () => {
    if (financialAmount && financialDescription) {
      // TODO: Save to database with auto timestamp
      console.log('Adding financial entry:', {
        clientId: client?.id,
        timestamp: new Date(),
        amount: parseFloat(financialAmount),
        description: financialDescription,
        type: financialType
      });
      setFinancialAmount('');
      setFinancialDescription('');
    }
  };

  if (!client) return null;

  // Mock data for demonstration
  const mockCourts = [
    {
      id: 1,
      case: 'Υπόθεση 1502α',
      court: 'Πρωτοδικείο Αθηνών',
      date: '2024-08-15',
      time: '10:00',
      status: 'Επείγον'
    },
    {
      id: 2,
      case: 'Υπόθεση 1502β',
      court: 'Ειρηνοδικείο Πειραιά',
      date: '2024-08-20',
      time: '14:30',
      status: 'Ενεργό'
    }
  ];

  const mockDeadlines = [
    {
      id: 1,
      case: 'Υπόθεση 1502α',
      title: 'Κατάθεση Ανακοπής',
      date: '2024-08-14',
      time: '17:00',
      status: 'Επείγον',
      daysRemaining: 2
    },
    {
      id: 2,
      case: 'Υπόθεση 1502β',
      title: 'Προσθήκη Αντίκρουση',
      date: '2024-08-18',
      time: '12:00',
      status: 'Ενεργό',
      daysRemaining: 6
    }
  ];

  const mockPending = [
    {
      id: 1,
      case: 'Υπόθεση 1502α',
      title: 'Προετοιμασία Δικογράφου',
      assignedTo: 'Μάριος Μαρινάκος',
      estimatedTime: '3h',
      status: 'Επείγον',
      type: 'Δικόγραφο'
    },
    {
      id: 2,
      case: 'Υπόθεση 1502β',
      title: 'Συλλογή Στοιχείων',
      assignedTo: 'Μάριος Μαρινάκος',
      estimatedTime: '2h',
      status: 'Ενεργό',
      type: 'Συλλογή Στοιχείων'
    }
  ];

  const mockAppointments = [
    {
      id: 1,
      title: 'Συνάντηση για Υπόθεση 1502α',
      date: '2024-08-13',
      time: '16:00',
      duration: '60 λεπτά',
      location: 'Γραφείο',
      type: 'Συνάντηση',
      status: 'Ενεργό'
    },
    {
      id: 2,
      title: 'Τηλεδιάσκεψη για Υπόθεση 1502β',
      date: '2024-08-16',
      time: '16:30',
      duration: '45 λεπτά',
      location: 'Online',
      type: 'Τηλεδιάσκεψη',
      status: 'Ενεργό'
    }
  ];

  const mockPhoneCalls = [
    {
      id: 1,
      date: '2024-08-12',
      time: '14:30',
      notes: 'Συζήτηση για την πρόοδο της υπόθεσης 1502α. Ο εντολέας ρώτησε για τις επόμενες ενέργειες.'
    },
    {
      id: 2,
      date: '2024-08-10',
      time: '11:15',
      notes: 'Ενημέρωση για την ημερομηνία δικασίμου. Συμφωνία για συνάντηση την επόμενη εβδομάδα.'
    }
  ];

  const mockFinancials = [
    {
      id: 1,
      date: '2024-08-01',
      description: 'Αμοιβή για Υπόθεση 1502α',
      amount: 2500.00,
      type: 'charge',
      balance: 2500.00
    },
    {
      id: 2,
      date: '2024-08-05',
      description: 'Προκαταβολή',
      amount: -1000.00,
      type: 'credit',
      balance: 1500.00
    },
    {
      id: 3,
      date: '2024-08-10',
      description: 'Έξοδα δικαστηρίου',
      amount: 150.00,
      type: 'charge',
      balance: 1650.00
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Επείγον': return 'error';
      case 'Ενεργό': return 'primary';
      case 'Κρίσιμο': return 'warning';
      case 'Ολοκληρώθηκε': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {client.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {client.profession} • {client.type}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab 
              icon={<GavelIcon />} 
              label="Επερχόμενα Δικαστήρια" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Επερχόμενες Προθεσμίες" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label="Εκκρεμότητες" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<EventIcon />} 
              label="Ραντεβού" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<PhoneIcon />} 
              label="Τηλεφωνική Επικοινωνία" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<AccountBalanceIcon />} 
              label="Οικονομικά" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>

        {/* Tab 1: Επερχόμενα Δικαστήρια */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{ mr: 1 }} />
            Επερχόμενα Δικαστήρια για {client.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Υπόθεση</TableCell>
                  <TableCell>Δικαστήριο</TableCell>
                  <TableCell>Ημερομηνία</TableCell>
                  <TableCell>Ώρα</TableCell>
                  <TableCell>Κατάσταση</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCourts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell>{court.case}</TableCell>
                    <TableCell>{court.court}</TableCell>
                    <TableCell>{court.date}</TableCell>
                    <TableCell>{court.time}</TableCell>
                    <TableCell>
                      <Chip 
                        label={court.status} 
                        color={getStatusColor(court.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Επερχόμενες Προθεσμίες */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            Επερχόμενες Προθεσμίες για {client.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Υπόθεση</TableCell>
                  <TableCell>Τίτλος</TableCell>
                  <TableCell>Ημερομηνία</TableCell>
                  <TableCell>Ώρα</TableCell>
                  <TableCell>Απομένουν</TableCell>
                  <TableCell>Κατάσταση</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockDeadlines.map((deadline) => (
                  <TableRow key={deadline.id}>
                    <TableCell>{deadline.case}</TableCell>
                    <TableCell>{deadline.title}</TableCell>
                    <TableCell>{deadline.date}</TableCell>
                    <TableCell>{deadline.time}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${deadline.daysRemaining} ημέρες`}
                        color={deadline.daysRemaining <= 3 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={deadline.status} 
                        color={getStatusColor(deadline.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 3: Εκκρεμότητες */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Εκκρεμότητες για {client.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Υπόθεση</TableCell>
                  <TableCell>Τίτλος</TableCell>
                  <TableCell>Ανατέθηκε σε</TableCell>
                  <TableCell>Εκτιμώμενος Χρόνος</TableCell>
                  <TableCell>Τύπος</TableCell>
                  <TableCell>Κατάσταση</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPending.map((pending) => (
                  <TableRow key={pending.id}>
                    <TableCell>{pending.case}</TableCell>
                    <TableCell>{pending.title}</TableCell>
                    <TableCell>{pending.assignedTo}</TableCell>
                    <TableCell>{pending.estimatedTime}</TableCell>
                    <TableCell>
                      <Chip 
                        label={pending.type}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={pending.status} 
                        color={getStatusColor(pending.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 4: Ραντεβού */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 1 }} />
            Ραντεβού για {client.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Τίτλος</TableCell>
                  <TableCell>Ημερομηνία</TableCell>
                  <TableCell>Ώρα</TableCell>
                  <TableCell>Διάρκεια</TableCell>
                  <TableCell>Τοποθεσία</TableCell>
                  <TableCell>Τύπος</TableCell>
                  <TableCell>Κατάσταση</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.duration}</TableCell>
                    <TableCell>{appointment.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.type}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status} 
                        color={getStatusColor(appointment.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 5: Τηλεφωνική Επικοινωνία */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ mr: 1 }} />
            Μητρώο Τηλεφωνικής Επικοινωνίας - {client.name}
          </Typography>
          
          {/* Add New Phone Note */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Νέα Καταχώρηση
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Σημειώσεις τηλεφωνικής επικοινωνίας"
                    value={phoneNotes}
                    onChange={(e) => setPhoneNotes(e.target.value)}
                    placeholder="Καταγράψτε τα σημεία της συνομιλίας..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddPhoneNote}
                    disabled={!phoneNotes.trim()}
                    sx={{ backgroundColor: 'success.main' }}
                  >
                    Αποθήκευση (Auto-save)
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Phone Call History */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ημερομηνία & Ώρα</TableCell>
                  <TableCell>Σημειώσεις</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPhoneCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {call.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {call.time}
                      </Typography>
                    </TableCell>
                    <TableCell>{call.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 6: Οικονομικά */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ mr: 1 }} />
            Οικονομικά - {client.name}
          </Typography>

          {/* Add New Financial Entry */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Νέα Οικονομική Καταχώρηση
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Τύπος"
                    value={financialType}
                    onChange={(e) => setFinancialType(e.target.value as 'charge' | 'credit')}
                    SelectProps={{ native: true }}
                  >
                    <option value="charge">Χρέωση</option>
                    <option value="credit">Πίστωση</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Ποσό (€)"
                    value={financialAmount}
                    onChange={(e) => setFinancialAmount(e.target.value)}
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Αιτία"
                    value={financialDescription}
                    onChange={(e) => setFinancialDescription(e.target.value)}
                    placeholder="Περιγραφή χρέωσης/πίστωσης..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddFinancialEntry}
                    disabled={!financialAmount || !financialDescription}
                    sx={{ backgroundColor: 'success.main' }}
                  >
                    Αποθήκευση (Auto-save)
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial History */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ημερομηνία</TableCell>
                  <TableCell>Αιτία</TableCell>
                  <TableCell>Ποσό</TableCell>
                  <TableCell>Τύπος</TableCell>
                  <TableCell>Υπόλοιπο</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockFinancials.map((financial) => (
                  <TableRow key={financial.id}>
                    <TableCell>{financial.date}</TableCell>
                    <TableCell>{financial.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {financial.type === 'charge' ? (
                          <TrendingUpIcon sx={{ mr: 1, color: 'error.main', fontSize: 16 }} />
                        ) : (
                          <TrendingDownIcon sx={{ mr: 1, color: 'success.main', fontSize: 16 }} />
                        )}
                        <Typography 
                          color={financial.type === 'charge' ? 'error.main' : 'success.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {financial.type === 'charge' ? '+' : ''}€{Math.abs(financial.amount).toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={financial.type === 'charge' ? 'Χρέωση' : 'Πίστωση'}
                        color={financial.type === 'charge' ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        €{financial.balance.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailView;

