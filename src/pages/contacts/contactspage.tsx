import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  BusinessCard as BusinessCardIcon,
  Cake as CakeIcon,
  Celebration as CelebrationIcon,
  Category as CategoryIcon,
  SwapHoriz as SwapHorizIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Send as SendIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  LocalHospital as LocalHospitalIcon,
  Engineering as EngineeringIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format, isSameDay, addDays, differenceInDays } from 'date-fns';
import { el } from 'date-fns/locale';
import { useSnackbar } from 'notistack';

import GenericList from '../../components/generic/GenericList';
import GenericForm from '../../components/generic/GenericForm';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import contactsService from '../../services/contactsService';
import { contactConfig } from './contactConfig';
import { handleApiError } from '../../utils/errorHandler';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  type: 'personal' | 'professional' | 'authority' | 'expert' | 'other';
  profession?: string;
  company?: {
    name: string;
    position: string;
    department?: string;
  };
  email: string;
  phone: string;
  mobile?: string;
  isClient: boolean;
  clientId?: string;
  categories: string[];
  nameDay?: {
    month: number;
    day: number;
    name?: string;
  };
  birthday?: {
    month: number;
    day: number;
    year?: number;
    sendWishes: boolean;
  };
  lastContactDate?: Date;
  importance: number;
  status: 'active' | 'inactive' | 'archived';
  communicationLog?: Array<{
    date: Date;
    type: string;
    direction: string;
    subject: string;
    notes?: string;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} p={2}>
    {value === index && children}
  </Box>
);

const categoryIcons: Record<string, React.ReactElement> = {
  'Δικηγόρος': <GavelIcon />,
  'Δικαστικός': <AccountBalanceIcon />,
  'Συμβολαιογράφος': <DescriptionIcon />,
  'Λογιστής': <BusinessIcon />,
  'Μηχανικός': <EngineeringIcon />,
  'Ιατρός': <LocalHospitalIcon />,
  'Πραγματογνώμονας': <BusinessCardIcon />,
  'Μάρτυρας': <PersonIcon />,
  'Συνεργάτης': <GroupsIcon />,
  'Προμηθευτής': <BusinessIcon />,
  'Δημόσια Υπηρεσία': <AccountBalanceIcon />,
  'Τράπεζα': <AccountBalanceIcon />,
  'Ασφαλιστική': <BusinessIcon />,
  'Άλλο': <CategoryIcon />,
};

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openCommunication, setOpenCommunication] = useState(false);
  const [openConvert, setOpenConvert] = useState(false);
  const [openWishes, setOpenWishes] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [celebrations, setCelebrations] = useState<Contact[]>([]);
  const [wishesTemplate, setWishesTemplate] = useState('');
  const [selectedCelebrants, setSelectedCelebrants] = useState<string[]>([]);

  useEffect(() => {
    fetchContacts();
    checkCelebrations();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsService.getAll();
      setContacts(response.data);
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    } finally {
      setLoading(false);
    }
  };

  const checkCelebrations = () => {
    const today = new Date();
    const upcoming = contacts.filter(contact => {
      // Check nameday
      if (contact.nameDay) {
        const nameDayDate = new Date(today.getFullYear(), contact.nameDay.month - 1, contact.nameDay.day);
        const daysUntil = differenceInDays(nameDayDate, today);
        if (daysUntil >= 0 && daysUntil <= 7) return true;
      }
      // Check birthday
      if (contact.birthday && contact.birthday.sendWishes) {
        const birthdayDate = new Date(today.getFullYear(), contact.birthday.month - 1, contact.birthday.day);
        const daysUntil = differenceInDays(birthdayDate, today);
        if (daysUntil >= 0 && daysUntil <= 7) return true;
      }
      return false;
    });
    setCelebrations(upcoming);
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.mobile?.includes(searchTerm)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(contact =>
        contact.categories.includes(filterCategory)
      );
    }

    // Tab filter
    switch (tabValue) {
      case 1: // Clients
        filtered = filtered.filter(contact => contact.isClient);
        break;
      case 2: // Professionals
        filtered = filtered.filter(contact => contact.type === 'professional');
        break;
      case 3: // Celebrations
        filtered = celebrations;
        break;
    }

    return filtered;
  }, [contacts, searchTerm, filterCategory, tabValue, celebrations]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (selectedContact) {
        await contactsService.update(selectedContact._id, data);
        enqueueSnackbar(t('contact.updateSuccess'), { variant: 'success' });
      } else {
        await contactsService.create(data);
        enqueueSnackbar(t('contact.createSuccess'), { variant: 'success' });
      }
      setOpenForm(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) return;
    try {
      await contactsService.delete(selectedContact._id);
      enqueueSnackbar(t('contact.deleteSuccess'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedContact) return;
    try {
      await contactsService.convertToClient(selectedContact._id);
      enqueueSnackbar(t('contact.convertSuccess'), { variant: 'success' });
      setOpenConvert(false);
      fetchContacts();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleSendWishes = async () => {
    try {
      const data = {
        contactIds: selectedCelebrants,
        template: wishesTemplate,
        type: 'nameday', // or birthday
      };
      await contactsService.sendWishes(data);
      enqueueSnackbar(t('contact.wishesSuccess'), { variant: 'success' });
      setOpenWishes(false);
      setSelectedCelebrants([]);
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const handleLogCommunication = async (data: any) => {
    if (!selectedContact) return;
    try {
      await contactsService.logCommunication(selectedContact._id, data);
      enqueueSnackbar(t('contact.communicationLogged'), { variant: 'success' });
      setOpenCommunication(false);
      fetchContacts();
    } catch (error) {
      handleApiError(error, enqueueSnackbar, t);
    }
  };

  const getNextCelebration = (contact: Contact): { type: string; date: Date; daysUntil: number } | null => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let celebrations: Array<{ type: string; date: Date }> = [];

    if (contact.nameDay) {
      celebrations.push({
        type: 'nameday',
        date: new Date(currentYear, contact.nameDay.month - 1, contact.nameDay.day),
      });
    }

    if (contact.birthday) {
      celebrations.push({
        type: 'birthday',
        date: new Date(currentYear, contact.birthday.month - 1, contact.birthday.day),
      });
    }

    // Find next celebration
    let nextCelebration = null;
    let minDays = 366;

    celebrations.forEach(celebration => {
      let daysUntil = differenceInDays(celebration.date, today);
      if (daysUntil < 0) {
        // If passed this year, check next year
        celebration.date.setFullYear(currentYear + 1);
        daysUntil = differenceInDays(celebration.date, today);
      }
      if (daysUntil < minDays) {
        minDays = daysUntil;
        nextCelebration = { ...celebration, daysUntil };
      }
    });

    return nextCelebration;
  };

  const renderContactCard = (contact: Contact) => {
    const celebration = getNextCelebration(contact);
    const isToday = celebration && celebration.daysUntil === 0;
    const isUpcoming = celebration && celebration.daysUntil <= 7;

    return (
      <Card
        key={contact._id}
        sx={{
          mb: 2,
          borderLeft: isToday ? `4px solid ${theme.palette.error.main}` :
                      isUpcoming ? `4px solid ${theme.palette.warning.main}` : 'none',
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {contact.firstName[0]}{contact.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                {contact.lastName} {contact.firstName}
                {contact.isClient && (
                  <Chip
                    label={t('contact.client')}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contact.profession || contact.company?.position}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                {contact.categories.map(cat => (
                  <Chip
                    key={cat}
                    icon={categoryIcons[cat] || <CategoryIcon />}
                    label={cat}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" gap={1}>
                <Tooltip title={contact.phone}>
                  <IconButton size="small" href={`tel:${contact.phone}`}>
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={contact.email}>
                  <IconButton size="small" href={`mailto:${contact.email}`}>
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
                {celebration && (
                  <Tooltip
                    title={`${celebration.type === 'nameday' ? t('contact.nameday') : t('contact.birthday')} 
                            ${celebration.daysUntil === 0 ? t('today') : 
                              t('inDays', { days: celebration.daysUntil })}`}
                  >
                    <IconButton size="small" color={isToday ? 'error' : 'warning'}>
                      {celebration.type === 'nameday' ? <CelebrationIcon /> : <CakeIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setSelectedContact(contact);
                    setAnchorEl(e.currentTarget);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <PageHeader
        title={t('contacts.title')}
        subtitle={t('contacts.subtitle')}
        icon={<ContactPhoneIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedContact(null);
              setOpenForm(true);
            }}
          >
            {t('contact.new')}
          </Button>
        }
      />

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t('contact.totalContacts')}
              </Typography>
              <Typography variant="h4">{contacts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t('contact.clients')}
              </Typography>
              <Typography variant="h4">
                {contacts.filter(c => c.isClient).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t('contact.professionals')}
              </Typography>
              <Typography variant="h4">
                {contacts.filter(c => c.type === 'professional').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t('contact.upcomingCelebrations')}
              </Typography>
              <Typography variant="h4" color="warning.main">
                {celebrations.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Celebrations Alert */}
      {celebrations.filter(c => {
        const celebration = getNextCelebration(c);
        return celebration && celebration.daysUntil === 0;
      }).length > 0 && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setTabValue(3);
                setOpenWishes(true);
              }}
            >
              {t('contact.sendWishes')}
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {t('contact.todaysCelebrations', {
            count: celebrations.filter(c => {
              const celebration = getNextCelebration(c);
              return celebration && celebration.daysUntil === 0;
            }).length,
          })}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        {/* Search and Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('contact.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('contact.category')}</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label={t('contact.category')}
                >
                  <MenuItem value="all">{t('all')}</MenuItem>
                  {Object.keys(categoryIcons).map(category => (
                    <MenuItem key={category} value={category}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {categoryIcons[category]}
                        {category}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CelebrationIcon />}
                onClick={() => setOpenWishes(true)}
                disabled={celebrations.length === 0}
              >
                {t('contact.wishes')}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('contact.all')} />
          <Tab
            label={
              <Badge badgeContent={contacts.filter(c => c.isClient).length} color="primary">
                {t('contact.clients')}
              </Badge>
            }
          />
          <Tab label={t('contact.professionals')} />
          <Tab
            label={
              <Badge badgeContent={celebrations.length} color="warning">
                {t('contact.celebrations')}
              </Badge>
            }
          />
        </Tabs>

        {/* Contact List */}
        <TabPanel value={tabValue} index={tabValue}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>{t('loading')}</Typography>
            </Box>
          ) : filteredContacts.length === 0 ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography color="text.secondary">{t('noData')}</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {filteredContacts.map(renderContactCard)}
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenForm(true);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          {t('edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenCommunication(true);
          }}
        >
          <MessageIcon sx={{ mr: 1 }} />
          {t('contact.logCommunication')}
        </MenuItem>
        {selectedContact && !selectedContact.isClient && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setOpenConvert(true);
            }}
          >
            <SwapHorizIcon sx={{ mr: 1 }} />
            {t('contact.convertToClient')}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setDeleteDialogOpen(true);
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          {t('delete')}
        </MenuItem>
      </Menu>

      {/* Contact Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedContact(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedContact ? t('contact.edit') : t('contact.new')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={contactConfig}
            initialData={selectedContact}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setOpenForm(false);
              setSelectedContact(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Communication Log Dialog */}
      <Dialog
        open={openCommunication}
        onClose={() => setOpenCommunication(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('contact.logCommunication')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleLogCommunication({
              type: formData.get('type'),
              direction: formData.get('direction'),
              subject: formData.get('subject'),
              notes: formData.get('notes'),
            });
          }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('contact.communicationType')}</InputLabel>
                  <Select name="type" defaultValue="phone" label={t('contact.communicationType')}>
                    <MenuItem value="phone">{t('contact.phone')}</MenuItem>
                    <MenuItem value="email">{t('contact.email')}</MenuItem>
                    <MenuItem value="meeting">{t('contact.meeting')}</MenuItem>
                    <MenuItem value="sms">{t('contact.sms')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('contact.direction')}</InputLabel>
                  <Select name="direction" defaultValue="outbound" label={t('contact.direction')}>
                    <MenuItem value="inbound">{t('contact.inbound')}</MenuItem>
                    <MenuItem value="outbound">{t('contact.outbound')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="subject"
                  label={t('contact.subject')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label={t('contact.notes')}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommunication(false)}>{t('cancel')}</Button>
          <Button type="submit" variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Send Wishes Dialog */}
      <Dialog
        open={openWishes}
        onClose={() => setOpenWishes(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('contact.sendWishes')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('contact.selectCelebrants')}
            </Typography>
            <List>
              {celebrations.map(contact => {
                const celebration = getNextCelebration(contact);
                return (
                  <ListItem key={contact._id}>
                    <ListItemAvatar>
                      <Avatar>
                        {contact.firstName[0]}{contact.lastName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${contact.lastName} ${contact.firstName}`}
                      secondary={
                        celebration ? 
                        `${celebration.type === 'nameday' ? t('contact.nameday') : t('contact.birthday')} - 
                         ${format(celebration.date, 'dd/MM', { locale: el })}` : ''
                      }
                    />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={selectedCelebrants.includes(contact._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCelebrants([...selectedCelebrants, contact._id]);
                          } else {
                            setSelectedCelebrants(selectedCelebrants.filter(id => id !== contact._id));
                          }
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('contact.wishesTemplate')}
              value={wishesTemplate}
              onChange={(e) => setWishesTemplate(e.target.value)}
              placeholder={t('contact.wishesPlaceholder')}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWishes(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendWishes}
            disabled={selectedCelebrants.length === 0}
          >
            {t('send')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert to Client Dialog */}
      <Dialog
        open={openConvert}
        onClose={() => setOpenConvert(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('contact.convertToClient')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('contact.convertConfirm', {
              name: selectedContact ? `${selectedContact.lastName} ${selectedContact.firstName}` : '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConvert(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleConvertToClient}>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('contact.deleteTitle')}
        content={t('contact.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* FAB for Quick Add */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => {
          setSelectedContact(null);
          setOpenForm(true);
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ContactsPage;
