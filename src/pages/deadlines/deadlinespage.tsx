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
  ListItemSecondaryAction,
  Badge,
  LinearProgress,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Add,
  Schedule,
  ViewList,
  Timeline as TimelineIcon,
  Email,
  Edit,
  Delete,
  CheckCircle,
  Extension,
  Cancel,
  MoreVert,
  Warning,
  Error as ErrorIcon,
  NotificationImportant,
  Gavel,
  Person,
  CalendarToday,
  AccessTime,
  Flag,
  Description,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GenericList } from '../../components/generic/GenericList';
import { GenericForm } from '../../components/generic/GenericForm';
import { GenericDetail } from '../../components/generic/GenericDetail';
import { deadlineService } from '../../services/deadlineService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatRelativeDate } from '../../utils/formatters';
import { deadlineConfig } from './deadlineConfig';

interface Deadline {
  id: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  court?: {
    id: string;
    type: string;
    date: string;
  };
  name: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'extended' | 'cancelled' | 'overdue';
  category: string;
  reminders: Array<{
    daysBefore: number;
    method: 'email' | 'sms' | 'notification' | 'all';
    sent: boolean;
    sentDate?: string;
  }>;
  extensions?: Array<{
    originalDate: string;
    newDate: string;
    reason: string;
    extendedBy: string;
    extendedAt: string;
  }>;
  workingDaysOnly: boolean;
  daysUntilDue?: number;
  workingDaysUntilDue?: number;
  completedDate?: string;
  completedBy?: string;
}

interface DeadlineAction {
  type: 'complete' | 'extend' | 'cancel';
  deadline: Deadline;
}

const DeadlinesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<DeadlineAction | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendData, setExtendData] = useState({ newDate: '', reason: '' });
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get client/court ID from URL params
  const clientId = searchParams.get('clientId');
  const courtId = searchParams.get('courtId');

  const handleCreate = () => {
    setSelectedDeadline(null);
    setShowForm(true);
  };

  const handleEdit = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowForm(true);
  };

  const handleView = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowDetail(true);
  };

  const handleAction = (action: 'complete' | 'extend' | 'cancel', deadline: Deadline) => {
    setCurrentAction({ type: action, deadline });
    
    if (action === 'extend') {
      setExtendData({ newDate: deadline.dueDate, reason: '' });
      setShowExtendDialog(true);
    } else {
      setShowActionDialog(true);
    }
  };

  const handleActionConfirm = async () => {
    if (!currentAction) return;
    
    try {
      const { type, deadline } = currentAction;
      
      switch (type) {
        case 'complete':
          await deadlineService.markAsCompleted(deadline.id);
          showSnackbar(t('deadline.completeSuccess'), 'success');
          break;
          
        case 'cancel':
          await deadlineService.cancel(deadline.id, {
            reason: t('deadline.cancelledByUser'),
          });
          showSnackbar(t('deadline.cancelSuccess'), 'success');
          break;
      }
      
      setShowActionDialog(false);
      setCurrentAction(null);
      
      // Show email dialog
      const template = await emailService.getTemplate(`deadline_${type}`, {
        clientName: `${deadline.client.lastName} ${deadline.client.firstName}`,
        deadlineName: deadline.name,
        dueDate: formatDate(deadline.dueDate),
      });
      setEmailTemplate(template);
      setShowEmailDialog(true);
    } catch (error) {
      showSnackbar(t('common.error.generic'), 'error');
    }
  };

  const handleExtendConfirm = async () => {
    if (!currentAction || !extendData.newDate || !extendData.reason) return;
    
    try {
      await deadlineService.extend(currentAction.deadline.id, {
        newDate: extendData.newDate,
        reason: extendData.reason,
      });
      
      showSnackbar(t('deadline.extendSuccess'), 'success');
      setShowExtendDialog(false);
      setCurrentAction(null);
      
      // Show email dialog
      const template = await emailService.getTemplate('deadline_extend', {
        clientName: `${currentAction.deadline.client.lastName} ${currentAction.deadline.client.firstName}`,
        deadlineName: currentAction.deadline.name,
        originalDate: formatDate(currentAction.deadline.dueDate),
        newDate: formatDate(extendData.newDate),
        reason: extendData.reason,
      });
      setEmailTemplate(template);
      setShowEmailDialog(true);
    } catch (error) {
      showSnackbar(t('common.error.generic'), 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!currentAction?.deadline) return;
    
    try {
      await emailService.send({
        to: currentAction.deadline.client.email,
        subject: t(`deadline.email.${currentAction.type}.subject`),
        body: emailTemplate,
      });
      showSnackbar(t('common.emailSent'), 'success');
      setShowEmailDialog(false);
    } catch (error) {
      showSnackbar(t('common.emailError'), 'error');
    }
  };

  const getPriorityColor = (priority: string): any => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (deadline: Deadline) => {
    if (deadline.status === 'completed') {
      return <CheckCircle color="success" />;
    }
    if (deadline.status === 'cancelled') {
      return <Cancel color="action" />;
    }
    if (deadline.status === 'overdue' || deadline.daysUntilDue! < 0) {
      return <ErrorIcon color="error" />;
    }
    if (deadline.daysUntilDue! <= 3) {
      return <Warning color="warning" />;
    }
    return <Schedule color="primary" />;
  };

  const renderActionButtons = (deadline: Deadline) => {
    if (deadline.status !== 'pending') {
      return (
        <Chip
          label={t(`deadline.status.${deadline.status}`)}
          size="small"
          color={
            deadline.status === 'completed' ? 'success' :
            deadline.status === 'extended' ? 'warning' : 'default'
          }
        />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title={t('deadline.markCompleted')}>
          <IconButton
            size="small"
            color="success"
            onClick={() => handleAction('complete', deadline)}
          >
            <CheckCircle />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('deadline.extend')}>
          <IconButton
            size="small"
            color="warning"
            onClick={() => handleAction('extend', deadline)}
          >
            <Extension />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('deadline.cancel')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleAction('cancel', deadline)}
          >
            <Cancel />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('deadline.sendEmail')}>
          <IconButton
            size="small"
            onClick={() => {
              setCurrentAction({ type: 'complete', deadline });
              emailService.getTemplate('deadline_reminder', {
                clientName: `${deadline.client.lastName} ${deadline.client.firstName}`,
                deadlineName: deadline.name,
                dueDate: formatDate(deadline.dueDate),
                daysLeft: deadline.daysUntilDue || 0,
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 150 }}
            label={t('common.status')}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="pending">{t('deadline.status.pending')}</MenuItem>
            <MenuItem value="completed">{t('deadline.status.completed')}</MenuItem>
            <MenuItem value="extended">{t('deadline.status.extended')}</MenuItem>
            <MenuItem value="overdue">{t('deadline.status.overdue')}</MenuItem>
          </TextField>
          
          <TextField
            select
            size="small"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            sx={{ width: 150 }}
            label={t('deadline.priority')}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="urgent">{t('deadline.priority.urgent')}</MenuItem>
            <MenuItem value="high">{t('deadline.priority.high')}</MenuItem>
            <MenuItem value="medium">{t('deadline.priority.medium')}</MenuItem>
            <MenuItem value="low">{t('deadline.priority.low')}</MenuItem>
          </TextField>
        </Box>
        
        <GenericList
          config={deadlineConfig.list}
          service={deadlineService}
          filters={{ 
            clientId,
            courtId,
            status: filterStatus === 'all' ? undefined : filterStatus,
            priority: filterPriority === 'all' ? undefined : filterPriority,
          }}
          rowActions={(row) => (
            <>
              <Tooltip title={t('common.view')}>
                <IconButton size="small" onClick={() => handleView(row)}>
                  <Schedule />
                </IconButton>
              </Tooltip>
              {hasPermission('deadlines.update') && row.status === 'pending' && (
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
              case 'name':
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(row)}
                    <Box>
                      <Typography variant="body2">{value}</Typography>
                      {row.court && (
                        <Typography variant="caption" color="text.secondary">
                          {row.court.type}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
                
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
                
              case 'dueDate':
                return (
                  <Box>
                    <Typography variant="body2">
                      {formatDate(value)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={row.daysUntilDue! < 0 ? 'error' : 'text.secondary'}
                    >
                      {formatRelativeDate(value)}
                    </Typography>
                  </Box>
                );
                
              case 'priority':
                return (
                  <Chip
                    icon={<Flag />}
                    label={t(`deadline.priority.${value}`)}
                    size="small"
                    color={getPriorityColor(value)}
                  />
                );
                
              case 'category':
                return (
                  <Chip
                    label={value}
                    size="small"
                    variant="outlined"
                  />
                );
                
              case 'reminders':
                const activeReminders = row.reminders.filter(r => !r.sent).length;
                return (
                  <Badge badgeContent={activeReminders} color="primary">
                    <NotificationImportant fontSize="small" />
                  </Badge>
                );
                
              default:
                return value;
            }
          }}
        />
      </CardContent>
    </Card>
  );

  const renderTimelineView = () => (
    <Paper sx={{ p: 3 }}>
      <Timeline position="alternate">
        {/* This would be populated with deadline data */}
        <TimelineItem>
          <TimelineOppositeContent color="text.secondary">
            {formatDate(new Date())}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="error">
              <ErrorIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Card>
              <CardContent>
                <Typography variant="h6">Κατάθεση Έφεσης</Typography>
                <Typography variant="body2" color="text.secondary">
                  Παπαδόπουλος Γεώργιος
                </Typography>
                <Chip label="Urgent" size="small" color="error" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </Paper>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('deadline.listTitle')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
          >
            <ToggleButton value="timeline">
              <TimelineIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
          
          {hasPermission('deadlines.create') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
            >
              {t('deadline.addNew')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Overdue Alert */}
      <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
        {t('deadline.overdueAlert', { count: 3 })}
      </Alert>

      {/* Main Content */}
      {view === 'timeline' ? renderTimelineView() : renderListView()}

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDeadline ? t('deadline.edit') : t('deadline.create')}
        </DialogTitle>
        <DialogContent>
          <GenericForm
            config={deadlineConfig.form}
            initialData={selectedDeadline}
            onSubmit={async (data) => {
              try {
                if (selectedDeadline) {
                  await deadlineService.update(selectedDeadline.id, data);
                  showSnackbar(t('deadline.updateSuccess'), 'success');
                } else {
                  await deadlineService.create(data);
                  showSnackbar(t('deadline.createSuccess'), 'success');
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

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)}>
        <DialogTitle>
          {currentAction && t(`deadline.confirm.${currentAction.type}`)}
        </DialogTitle>
        <DialogContent>
          {currentAction && (
            <Typography>
              {t(`deadline.confirm.${currentAction.type}Message`, {
                deadline: currentAction.deadline.name,
                client: `${currentAction.deadline.client.lastName} ${currentAction.deadline.client.firstName}`,
                dueDate: formatDate(currentAction.deadline.dueDate),
              })}
            </Typography>
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

      {/* Extend Dialog */}
      <Dialog open={showExtendDialog} onClose={() => setShowExtendDialog(false)}>
        <DialogTitle>{t('deadline.extendTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label={t('deadline.newDate')}
                value={extendData.newDate}
                onChange={(e) => setExtendData({ ...extendData, newDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('deadline.reason')}
                value={extendData.reason}
                onChange={(e) => setExtendData({ ...extendData, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExtendDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleExtendConfirm} 
            variant="contained"
            disabled={!extendData.newDate || !extendData.reason}
          >
            {t('deadline.extend')}
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
        <DialogTitle>{t('deadline.sendEmail')}</DialogTitle>
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
            {t('deadline.details')}
            {selectedDeadline && renderActionButtons(selectedDeadline)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDeadline && (
            <GenericDetail
              config={deadlineConfig.detail}
              data={selectedDeadline}
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
          handleEdit(selectedDeadline!);
          setAnchorEl(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        
        {selectedDeadline?.court && (
          <MenuItem onClick={() => {
            navigate(`/courts/${selectedDeadline.court!.id}`);
            setAnchorEl(null);
          }}>
            <Gavel fontSize="small" sx={{ mr: 1 }} />
            {t('deadline.viewCourt')}
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          navigate(`/documents?deadlineId=${selectedDeadline?.id}`);
          setAnchorEl(null);
        }}>
          <Description fontSize="small" sx={{ mr: 1 }} />
          {t('deadline.viewDocuments')}
        </MenuItem>
      </Menu>

      {/* FAB for mobile */}
      {hasPermission('deadlines.create') && (
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

export default DeadlinesPage;
