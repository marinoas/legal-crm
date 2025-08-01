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
  Badge,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  ViewList,
  ViewWeek,
  Today,
  Gavel,
  Email,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Cancel,
  MoreVert,
  NavigateBefore,
  NavigateNext,
  Event,
  LocationOn,
  Person,
  Business,
  AccessTime,
  Visibility,
  Description,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { el } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import { GenericList } from '../../components/generic/GenericList';
import { GenericForm } from '../../components/generic/GenericForm';
import { GenericDetail } from '../../components/generic/GenericDetail';
import { courtService } from '../../services/courtService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate } from '../../utils/formatters';
import { courtConfig } from './courtConfig';

// Setup date localizer for calendar
const locales = { el };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Court {
  id: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  court: string;
  level: string;
  composition: string;
  city: string;
  date: string;
  time: string;
  hearing: string;
  type: string;
  opponent: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  result?: 'won' | 'lost' | 'settled' | 'pending';
  notes?: string;
  documents?: string[];
  relatedDeadlines?: string[];
  postponements?: Array<{
    originalDate: string;
    newDate: string;
    reason: string;
  }>;
}

interface CourtAction {
  type: 'discuss' | 'postpone' | 'cancel';
  court: Court;
}

const CourtsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<CourtAction | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [autoCreateDeadlines, setAutoCreateDeadlines] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get client ID from URL params if coming from client page
  const clientId = searchParams.get('clientId');

  useEffect(() => {
    if (clientId) {
      // Pre-filter by client if coming from client page
    }
  }, [clientId]);

  const handleCreate = () => {
    setSelectedCourt(null);
    setShowForm(true);
  };

  const handleEdit = (court: Court) => {
    setSelectedCourt(court);
    setShowForm(true);
  };

  const handleView = (court: Court) => {
    setSelectedCourt(court);
    setShowDetail(true);
  };

  const handleAction = (action: 'discuss' | 'postpone' | 'cancel', court: Court) => {
    setCurrentAction({ type: action, court });
    setShowActionDialog(true);
  };

  const handleActionConfirm = async () => {
    if (!currentAction) return;
    
    try {
      const { type, court } = currentAction;
      
      switch (type) {
        case 'discuss':
          await courtService.markAsDiscussed(court.id, {
            autoCreateDeadlines,
          });
          showSnackbar(t('court.discussSuccess'), 'success');
          break;
          
        case 'postpone':
          // This will open a new form for postponement
          setShowActionDialog(false);
          setSelectedCourt(court);
          setShowForm(true);
          return;
          
        case 'cancel':
          await courtService.markAsCancelled(court.id, {
            autoCreateDeadlines,
          });
          showSnackbar(t('court.cancelSuccess'), 'success');
          break;
      }
      
      setShowActionDialog(false);
      setCurrentAction(null);
      
      // Show email dialog
      const template = await emailService.getTemplate(`court_${type}`, {
        clientName: `${court.client.lastName} ${court.client.firstName}`,
        courtType: court.type,
        courtDate: formatDate(court.date),
        courtName: court.court,
      });
      setEmailTemplate(template);
      setShowEmailDialog(true);
    } catch (error) {
      showSnackbar(t('common.error.generic'), 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!currentAction?.court) return;
    
    try {
      await emailService.send({
        to: currentAction.court.client.email,
        subject: t(`court.email.${currentAction.type}.subject`),
        body: emailTemplate,
      });
      showSnackbar(t('common.emailSent'), 'success');
      setShowEmailDialog(false);
    } catch (error) {
      showSnackbar(t('common.emailError'), 'error');
    }
  };

  const getEventStyle = (event: any) => {
    const court = event.resource as Court;
    let backgroundColor = '#1976d2'; // default blue
    
    switch (court.status) {
      case 'completed':
        backgroundColor = '#4caf50'; // green
        break;
      case 'postponed':
        backgroundColor = '#ff9800'; // orange
        break;
      case 'cancelled':
        backgroundColor = '#9e9e9e'; // grey
        break;
    }
    
    return { style: { backgroundColor } };
  };

  const calendarEvents = (courts: Court[]) => {
    return courts.map(court => ({
      id: court.id,
      title: `${court.client.lastName} - ${court.type}`,
      start: new Date(`${court.date} ${court.time}`),
      end: new Date(`${court.date} ${court.time}`),
      resource: court,
    }));
  };

  const renderCalendarEvent = ({ event }: any) => {
    const court = event.resource as Court;
    return (
      <Box sx={{ fontSize: '0.75rem', p: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {court.time} - {court.client.lastName}
        </Typography>
        <Typography variant="caption" display="block">
          {court.type}
        </Typography>
      </Box>
    );
  };

  const renderActionButtons = (court: Court) => {
    if (court.status !== 'scheduled') {
      return (
        <Chip
          label={t(`court.status.${court.status}`)}
          size="small"
          color={
            court.status === 'completed' ? 'success' :
            court.status === 'postponed' ? 'warning' : 'default'
          }
        />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title={t('court.markDiscussed')}>
          <IconButton
            size="small"
            color="success"
            onClick={() => handleAction('discuss', court)}
          >
            <CheckCircle />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('court.markPostponed')}>
          <IconButton
            size="small"
            color="warning"
            onClick={() => handleAction('postpone', court)}
          >
            <Schedule />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('court.markCancelled')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleAction('cancel', court)}
          >
            <Cancel />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('court.sendEmail')}>
          <IconButton
            size="small"
            onClick={() => {
              setCurrentAction({ type: 'discuss', court });
              emailService.getTemplate('court_reminder', {
                clientName: `${court.client.lastName} ${court.client.firstName}`,
                courtType: court.type,
                courtDate: formatDate(court.date),
                courtTime: court.time,
                courtName: court.court,
              }).then(template => {
                setEmailTemplate(template);
                setShowEmailDialog(true);
              });
            }}
          >
            <Email />
          </IconButton>
        </Tooltip>
        
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Box>
    );
  };

  const renderListView = () => (
    <Card>
      <CardContent>
        <GenericList
          config={courtConfig.list}
          service={courtService}
          filters={{ clientId }}
          rowActions={(row) => (
            <>
              <Tooltip title={t('common.view')}>
                <IconButton size="small" onClick={() => handleView(row)}>
                  <Visibility />
                </IconButton>
              </Tooltip>
              {hasPermission('courts.update') && row.status === 'scheduled' && (
                <Tooltip title={t('common.edit')}>
                  <IconButton size="small" onClick={() => handleEdit(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              {renderActionButtons(row)}
            </>
          )}
          customCellRenderer={(column, value, row) => {
            switch (column.field) {
              case 'client':
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <Person />
                    </Avatar>
                    <Typography variant="body2">
                      {row.client.lastName} {row.client.firstName}
                    </Typography>
                  </Box>
                );
                
              case 'dateTime':
                return (
                  <Box>
                    <Typography variant="body2">
                      {formatDate(row.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.time}
                    </Typography>
                  </Box>
                );
                
              case 'court':
                return (
                  <Box>
                    <Typography variant="body2">{row.court}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.level} - {row.composition} - {row.city}
                    </Typography>
                  </Box>
                );
                
              case 'type':
                return (
                  <Chip
                    label={value}
                    size="small"
                    variant="outlined"
                  />
                );
                
              case 'hearing':
                return (
                  <Chip
                    label={value}
                    size="small"
                    color={value.includes('α\'') ? 'primary' : 'secondary'}
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

  const renderCalendarView = () => (
    <Paper sx={{ height: '75vh', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={calendarView}
          exclusive
          onChange={(e, newView) => newView && setCalendarView(newView)}
          size="small"
        >
          <ToggleButton value="month">
            <CalendarMonth />
          </ToggleButton>
          <ToggleButton value="week">
            <ViewWeek />
          </ToggleButton>
          <ToggleButton value="day">
            <Today />
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setSelectedDate(new Date())}>
            <Today />
          </IconButton>
          <Typography variant="h6">
            {format(selectedDate, 'MMMM yyyy', { locale: el })}
          </Typography>
        </Box>
      </Box>
      
      <Calendar
        localizer={localizer}
        events={calendarEvents([])} // Will be populated by data
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 60px)' }}
        view={calendarView}
        onView={setCalendarView}
        date={selectedDate}
        onNavigate={setSelectedDate}
        eventPropGetter={getEventStyle}
        components={{
          event: renderCalendarEvent,
        }}
        onSelectEvent={(event) => handleView(event.resource)}
        messages={{
          today: t('common.today'),
          previous: t('common.previous'),
          next: t('common.next'),
          month: t('common.month'),
          week: t('common.week'),
          day: t('common.day'),
          agenda: t('common.agenda'),
          date: t('common.date'),
          time: t('common.time'),
          event: t('common.event'),
          noEventsInRange: t('court.noEventsInRange'),
        }}
      />
    </Paper>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('court.listTitle')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
          >
            <ToggleButton value="calendar">
              <CalendarMonth />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
          
          {hasPermission('courts.create') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
            >
              {t('court.addNew')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      {view === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCourt ? t('court.edit') : t('court.create')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={courtConfig.form}
            initialData={selectedCourt}
            onSubmit={async (data) => {
              try {
                if (selectedCourt) {
                  await courtService.update(selectedCourt.id, data);
                  showSnackbar(t('court.updateSuccess'), 'success');
                } else {
                  await courtService.create(data);
                  showSnackbar(t('court.createSuccess'), 'success');
                }
                setShowForm(false);
              } catch (error) {
                showSnackbar(t('common.error.save'), 'error');
              }
            }}
            onCancel={() => setShowForm(false)}
          />
          
          {/* Auto-create deadlines option */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoCreateDeadlines}
                  onChange={(e) => setAutoCreateDeadlines(e.target.checked)}
                />
              }
              label={t('court.autoCreateDeadlines')}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)}>
        <DialogTitle>
          {currentAction && t(`court.confirm.${currentAction.type}`)}
        </DialogTitle>
        <DialogContent>
          {currentAction && (
            <>
              <Typography>
                {t(`court.confirm.${currentAction.type}Message`, {
                  court: currentAction.court.court,
                  client: `${currentAction.court.client.lastName} ${currentAction.court.client.firstName}`,
                  opponent: currentAction.court.opponent,
                  date: formatDate(currentAction.court.date),
                })}
              </Typography>
              
              {currentAction.type === 'discuss' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t('court.discussDeadlineInfo')}
                </Alert>
              )}
              
              {currentAction.type === 'cancel' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {t('court.cancelDeadlineInfo')}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleActionConfirm} variant="contained">
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('court.sendEmail')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            startIcon={<Email />}
          >
            {t('common.send')}
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
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('court.details')}
            {selectedCourt && renderActionButtons(selectedCourt)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourt && (
            <GenericDetail
              config={courtConfig.detail}
              data={selectedCourt}
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
          handleEdit(selectedCourt!);
          setAnchorEl(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          navigate(`/documents?courtId=${selectedCourt?.id}`);
          setAnchorEl(null);
        }}>
          <Description fontSize="small" sx={{ mr: 1 }} />
          {t('court.viewDocuments')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          navigate(`/deadlines?courtId=${selectedCourt?.id}`);
          setAnchorEl(null);
        }}>
          <Schedule fontSize="small" sx={{ mr: 1 }} />
          {t('court.viewDeadlines')}
        </MenuItem>
      </Menu>

      {/* FAB for mobile */}
      {hasPermission('courts.create') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
          onClick={handleCreate}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default CourtsPage;
