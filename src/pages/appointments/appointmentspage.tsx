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
  RadioGroup,
  Radio,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Event,
  ViewList,
  CalendarMonth,
  Email,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  MoreVert,
  Person,
  VideoCall,
  LocationOn,
  AccessTime,
  Euro,
  CreditCard,
  Info,
  Schedule,
  Today,
  NavigateBefore,
  NavigateNext,
  ViewWeek,
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
import { appointmentService } from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { appointmentConfig } from './appointmentConfig';

// Setup date localizer for calendar
const locales = { el };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Appointment {
  id: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  date: string;
  time: string;
  duration: number; // minutes
  type: 'in-person' | 'online';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  paid: boolean;
  paymentId?: string;
  meetingLink?: string;
  notes?: string;
  privateNotes?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

const AppointmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<View>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'online'>('in-person');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get client ID from URL params
  const clientId = searchParams.get('clientId');
  const isClientPortal = user?.role === 'client';

  const bookingSteps = [
    t('appointment.selectDateTime'),
    t('appointment.selectType'),
    t('appointment.payment'),
    t('appointment.confirmation'),
  ];

  useEffect(() => {
    if (showBookingDialog && bookingStep === 0) {
      loadAvailableSlots();
    }
  }, [showBookingDialog, bookingStep, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      const slots = await appointmentService.getAvailableSlots(selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      showSnackbar(t('appointment.slotsLoadError'), 'error');
    }
  };

  const handleCreate = () => {
    if (isClientPortal) {
      setShowBookingDialog(true);
      setBookingStep(0);
    } else {
      setSelectedAppointment(null);
      setShowForm(true);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    
    try {
      await appointmentService.cancel(selectedAppointment.id, {
        reason: t('appointment.cancelledByUser'),
        refund: selectedAppointment.paid,
      });
      
      showSnackbar(t('appointment.cancelSuccess'), 'success');
      setShowCancelDialog(false);
      
      // Send cancellation email
      const template = await emailService.getTemplate('appointment_cancelled', {
        clientName: `${selectedAppointment.client.lastName} ${selectedAppointment.client.firstName}`,
        appointmentDate: formatDate(selectedAppointment.date),
        appointmentTime: selectedAppointment.time,
        refundInfo: selectedAppointment.paid ? t('appointment.refundProcessing') : '',
      });
      
      await emailService.send({
        to: selectedAppointment.client.email,
        subject: t('appointment.email.cancelled.subject'),
        body: template,
      });
    } catch (error) {
      showSnackbar(t('appointment.cancelError'), 'error');
    }
  };

  const handleBookingNext = async () => {
    if (bookingStep === 2) {
      // Process payment
      setIsProcessingPayment(true);
      
      try {
        const paymentResult = await paymentService.processAppointmentPayment({
          amount: 50, // Get from settings
          appointmentDetails: {
            date: selectedSlot!.date,
            time: selectedSlot!.time,
            type: appointmentType,
          },
        });
        
        if (paymentResult.success) {
          // Create appointment
          const appointment = await appointmentService.create({
            clientId: user!.id,
            date: selectedSlot!.date,
            time: selectedSlot!.time,
            type: appointmentType,
            duration: 30, // Get from settings
            paid: true,
            paymentId: paymentResult.paymentId,
          });
          
          showSnackbar(t('appointment.bookingSuccess'), 'success');
          setBookingStep(3);
        }
      } catch (error) {
        showSnackbar(t('appointment.paymentError'), 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      setBookingStep(bookingStep + 1);
    }
  };

  const handleBookingBack = () => {
    setBookingStep(bookingStep - 1);
  };

  const getEventStyle = (event: any) => {
    const appointment = event.resource as Appointment;
    let backgroundColor = '#1976d2'; // default blue
    
    switch (appointment.status) {
      case 'confirmed':
        backgroundColor = '#4caf50'; // green
        break;
      case 'completed':
        backgroundColor = '#9e9e9e'; // grey
        break;
      case 'cancelled':
        backgroundColor = '#f44336'; // red
        break;
      case 'no-show':
        backgroundColor = '#ff9800'; // orange
        break;
    }
    
    return { style: { backgroundColor } };
  };

  const calendarEvents = (appointments: Appointment[]) => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.client.lastName} - ${appointment.type === 'online' ? '🎥' : '🏢'}`,
      start: new Date(`${appointment.date} ${appointment.time}`),
      end: new Date(new Date(`${appointment.date} ${appointment.time}`).getTime() + appointment.duration * 60000),
      resource: appointment,
    }));
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 0: // Select Date & Time
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('appointment.selectAvailableSlot')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <IconButton onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedDate(newDate);
              }}>
                <NavigateBefore />
              </IconButton>
              
              <TextField
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
              
              <IconButton onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedDate(newDate);
              }}>
                <NavigateNext />
              </IconButton>
            </Box>
            
            <Grid container spacing={1}>
              {availableSlots.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {t('appointment.noSlotsAvailable')}
                  </Alert>
                </Grid>
              ) : (
                availableSlots.map((slot) => (
                  <Grid item xs={6} sm={4} md={3} key={`${slot.date}-${slot.time}`}>
                    <Card
                      sx={{
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        opacity: slot.available ? 1 : 0.5,
                        border: selectedSlot === slot ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="body2">
                          {formatDate(slot.date)}
                        </Typography>
                        <Typography variant="h6">
                          {slot.time}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        );
        
      case 1: // Select Type
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('appointment.selectMeetingType')}
            </Typography>
            
            <RadioGroup
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as any)}
            >
              <Paper sx={{ p: 2, mb: 2 }}>
                <FormControlLabel
                  value="in-person"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationOn color="primary" />
                      <Box>
                        <Typography variant="body1">
                          {t('appointment.type.inPerson')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('appointment.inPersonDescription')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Paper>
              
              <Paper sx={{ p: 2 }}>
                <FormControlLabel
                  value="online"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <VideoCall color="primary" />
                      <Box>
                        <Typography variant="body1">
                          {t('appointment.type.online')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('appointment.onlineDescription')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Paper>
            </RadioGroup>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('appointment.selectedSlot', {
                date: selectedSlot ? formatDate(selectedSlot.date) : '',
                time: selectedSlot?.time,
              })}
            </Alert>
          </Box>
        );
        
      case 2: // Payment
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('appointment.paymentRequired')}
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" paragraph>
                {t('appointment.paymentNotice')}
              </Typography>
              <Typography variant="body2">
                {t('appointment.legalNotice')}
              </Typography>
            </Alert>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('appointment.summary')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('appointment.date')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {selectedSlot && formatDate(selectedSlot.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('appointment.time')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {selectedSlot?.time}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('appointment.type')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {t(`appointment.type.${appointmentType}`)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('appointment.duration')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    30 {t('common.minutes')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    {t('appointment.total')}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(50)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CreditCard />}
              onClick={handleBookingNext}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('appointment.proceedToPayment')
              )}
            </Button>
          </Box>
        );
        
      case 3: // Confirmation
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {t('appointment.bookingConfirmed')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('appointment.confirmationMessage')}
            </Typography>
            
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.100' }}>
              <Typography variant="body2">
                {t('appointment.confirmationDetails', {
                  date: selectedSlot && formatDate(selectedSlot.date),
                  time: selectedSlot?.time,
                  type: t(`appointment.type.${appointmentType}`),
                })}
              </Typography>
            </Paper>
            
            {appointmentType === 'online' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('appointment.meetingLinkInfo')}
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  const renderListView = () => (
    <Card>
      <CardContent>
        <GenericList
          config={appointmentConfig.list}
          service={appointmentService}
          filters={{ clientId }}
          rowActions={(row) => (
            <>
              <Tooltip title={t('common.view')}>
                <IconButton size="small" onClick={() => handleView(row)}>
                  <Event />
                </IconButton>
              </Tooltip>
              {hasPermission('appointments.update') && row.status === 'scheduled' && (
                <Tooltip title={t('common.edit')}>
                  <IconButton size="small" onClick={() => handleEdit(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'scheduled' && (
                <>
                  <Tooltip title={t('appointment.markCompleted')}>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => {
                        appointmentService.markAsCompleted(row.id);
                        showSnackbar(t('appointment.markedCompleted'), 'success');
                      }}
                    >
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('appointment.cancel')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedAppointment(row);
                        setShowCancelDialog(true);
                      }}
                    >
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              
              <IconButton
                size="small"
                onClick={(e) => {
                  setSelectedAppointment(row);
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
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
                      {row.time} ({row.duration} {t('common.minutes')})
                    </Typography>
                  </Box>
                );
                
              case 'type':
                return (
                  <Chip
                    icon={row.type === 'online' ? <VideoCall /> : <LocationOn />}
                    label={t(`appointment.type.${row.type}`)}
                    size="small"
                    variant="outlined"
                  />
                );
                
              case 'status':
                return (
                  <Chip
                    label={t(`appointment.status.${value}`)}
                    size="small"
                    color={
                      value === 'confirmed' ? 'success' :
                      value === 'completed' ? 'default' :
                      value === 'cancelled' ? 'error' :
                      value === 'no-show' ? 'warning' : 'primary'
                    }
                  />
                );
                
              case 'paid':
                return row.paid ? (
                  <Chip
                    icon={<Euro />}
                    label={t('appointment.paid')}
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    label={t('appointment.unpaid')}
                    size="small"
                    color="default"
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
          noEventsInRange: t('appointment.noAppointmentsInRange'),
        }}
      />
    </Paper>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('appointment.listTitle')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!isClientPortal && (
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
          )}
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            {isClientPortal ? t('appointment.bookNew') : t('appointment.addNew')}
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      {view === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Booking Dialog (for clients) */}
      <Dialog
        open={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('appointment.bookAppointment')}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={bookingStep} sx={{ mb: 3 }}>
            {bookingSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderBookingStep()}
        </DialogContent>
        <DialogActions>
          {bookingStep > 0 && bookingStep < 3 && (
            <Button onClick={handleBookingBack}>
              {t('common.back')}
            </Button>
          )}
          {bookingStep < 3 ? (
            <Button
              variant="contained"
              onClick={handleBookingNext}
              disabled={
                (bookingStep === 0 && !selectedSlot) ||
                isProcessingPayment
              }
            >
              {bookingStep === 2 ? t('appointment.pay') : t('common.next')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                setShowBookingDialog(false);
                setBookingStep(0);
              }}
            >
              {t('common.close')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Form Dialog (for staff) */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAppointment ? t('appointment.edit') : t('appointment.create')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={appointmentConfig.form}
            initialData={selectedAppointment}
            onSubmit={async (data) => {
              try {
                if (selectedAppointment) {
                  await appointmentService.update(selectedAppointment.id, data);
                  showSnackbar(t('appointment.updateSuccess'), 'success');
                } else {
                  await appointmentService.create(data);
                  showSnackbar(t('appointment.createSuccess'), 'success');
                }
                setShowForm(false);
              } catch (error) {
                showSnackbar(t('common.error.save'), 'error');
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>{t('appointment.cancelTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('appointment.cancelConfirmation', {
              client: selectedAppointment ? 
                `${selectedAppointment.client.lastName} ${selectedAppointment.client.firstName}` : '',
              date: selectedAppointment ? formatDate(selectedAppointment.date) : '',
              time: selectedAppointment?.time,
            })}
          </Typography>
          {selectedAppointment?.paid && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('appointment.refundNotice')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            {t('common.no')}
          </Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            {t('common.yes')}
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
        <DialogTitle>{t('appointment.details')}</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <GenericDetail
              config={appointmentConfig.detail}
              data={selectedAppointment}
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
        {selectedAppointment?.type === 'online' && selectedAppointment.meetingLink && (
          <MenuItem onClick={() => {
            window.open(selectedAppointment.meetingLink, '_blank');
            setAnchorEl(null);
          }}>
            <VideoCall fontSize="small" sx={{ mr: 1 }} />
            {t('appointment.joinMeeting')}
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          emailService.getTemplate('appointment_reminder', {
            clientName: `${selectedAppointment!.client.lastName} ${selectedAppointment!.client.firstName}`,
            appointmentDate: formatDate(selectedAppointment!.date),
            appointmentTime: selectedAppointment!.time,
            appointmentType: t(`appointment.type.${selectedAppointment!.type}`),
          }).then(template => {
            // Send email
          });
          setAnchorEl(null);
        }}>
          <Email fontSize="small" sx={{ mr: 1 }} />
          {t('appointment.sendReminder')}
        </MenuItem>
      </Menu>

      {/* FAB for mobile */}
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
    </Box>
  );
};

export default AppointmentsPage;
