import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Gavel,
  Schedule,
  Assignment,
  Event,
  Add,
  TrendingUp,
  TrendingDown,
  Euro,
  People,
  Description,
  Phone,
  Refresh,
  ArrowForward,
  CheckCircle,
  Warning,
  Error,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { el } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DashboardData {
  overview: {
    upcomingCourts: number;
    pendingDeadlines: number;
    activePendings: number;
    todayAppointments: number;
    weekAppointments: number;
    overdueItems: number;
  };
  courts: Array<{
    id: string;
    client: { firstName: string; lastName: string };
    court: string;
    type: string;
    date: string;
    time: string;
    status: string;
  }>;
  deadlines: Array<{
    id: string;
    name: string;
    client: { firstName: string; lastName: string };
    dueDate: string;
    priority: string;
    daysUntilDue: number;
  }>;
  pendings: Array<{
    id: string;
    name: string;
    client: { firstName: string; lastName: string };
    dueDate: string;
    priority: string;
    progress: number;
  }>;
  appointments: Array<{
    id: string;
    client: { firstName: string; lastName: string };
    date: string;
    time: string;
    type: string;
    status: string;
  }>;
  statistics: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    activeClients: number;
    completedCases: number;
    successRate: number;
    averageCallsPerClient: number;
    courtStats: {
      scheduled: number;
      completed: number;
      postponed: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    action: string;
    entity: string;
    timestamp: string;
    user: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData(selectedPeriod);
      setDashboardData(data);
    } catch (error) {
      showSnackbar(t('dashboard.loadError'), 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'overdue':
        return <Error color="error" />;
      case 'pending':
        return <Schedule color="warning" />;
      default:
        return <Assignment color="action" />;
    }
  };

  const renderOverviewCard = (
    title: string,
    value: number,
    icon: React.ReactNode,
    color: string,
    route: string
  ) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(route)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h4" component="div">
            {isLoading ? <Skeleton width={40} /> : value}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {!isLoading && dashboardData?.overview.overdueItems > 0 && title.includes(t('dashboard.deadlines')) && (
          <Chip 
            label={t('dashboard.overdue', { count: dashboardData.overview.overdueItems })}
            size="small"
            color="error"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => {
    const actions = [
      { label: t('dashboard.addCourt'), icon: <Gavel />, route: '/courts/new', color: 'primary' },
      { label: t('dashboard.addClient'), icon: <People />, route: '/clients/new', color: 'success' },
      { label: t('dashboard.addDeadline'), icon: <Schedule />, route: '/deadlines/new', color: 'warning' },
      { label: t('dashboard.addPending'), icon: <Assignment />, route: '/pendings/new', color: 'info' },
      { label: t('dashboard.addAppointment'), icon: <Event />, route: '/appointments/new', color: 'secondary' },
    ];

    // Filter actions based on user role
    const filteredActions = user?.role === 'client' 
      ? actions.filter(a => a.route === '/appointments/new')
      : actions;

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.quickActions')}
        </Typography>
        <Grid container spacing={2}>
          {filteredActions.map((action) => (
            <Grid item xs={6} sm={4} md={2.4} key={action.route}>
              <Button
                fullWidth
                variant="outlined"
                color={action.color as any}
                startIcon={action.icon}
                onClick={() => navigate(action.route)}
                sx={{ 
                  height: '100%',
                  flexDirection: 'column',
                  py: 2,
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  const renderUpcomingItems = () => (
    <Grid container spacing={3}>
      {/* Upcoming Courts */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('dashboard.upcomingCourts')}</Typography>
            <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/courts')}>
              {t('common.viewAll')}
            </Button>
          </Box>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <ListItem key={i}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </ListItem>
              ))
            ) : dashboardData?.courts.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary={t('dashboard.noCourts')}
                  secondary={t('dashboard.noCourtsDesc')}
                />
              </ListItem>
            ) : (
              dashboardData?.courts.map((court) => (
                <ListItem key={court.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Gavel />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${court.client.lastName} ${court.client.firstName}`}
                    secondary={
                      <>
                        {court.court} - {court.type}
                        <br />
                        {formatDate(court.date)} {court.time}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={isToday(new Date(court.date)) ? t('common.today') : 
                             isTomorrow(new Date(court.date)) ? t('common.tomorrow') :
                             `${differenceInDays(new Date(court.date), new Date())} ${t('common.days')}`}
                      size="small"
                      color={isToday(new Date(court.date)) ? 'error' : 'default'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Grid>

      {/* Upcoming Deadlines */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('dashboard.upcomingDeadlines')}</Typography>
            <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/deadlines')}>
              {t('common.viewAll')}
            </Button>
          </Box>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <ListItem key={i}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </ListItem>
              ))
            ) : dashboardData?.deadlines.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary={t('dashboard.noDeadlines')}
                  secondary={t('dashboard.noDeadlinesDesc')}
                />
              </ListItem>
            ) : (
              dashboardData?.deadlines.map((deadline) => (
                <ListItem key={deadline.id} divider>
                  <ListItemAvatar>
                    {getStatusIcon(deadline.daysUntilDue < 0 ? 'overdue' : 'pending')}
                  </ListItemAvatar>
                  <ListItemText
                    primary={deadline.name}
                    secondary={`${deadline.client.lastName} ${deadline.client.firstName} - ${formatDate(deadline.dueDate)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={deadline.priority}
                      size="small"
                      color={getPriorityColor(deadline.priority) as any}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderStatistics = () => {
    if (user?.role === 'client') return null;

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.statistics')}
        </Typography>
        <Grid container spacing={3}>
          {/* Financial Stats - Hidden for Secretary */}
          {user?.role !== 'secretary' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {isLoading ? <Skeleton width={100} /> : formatCurrency(dashboardData?.statistics.monthlyRevenue || 0)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.monthlyRevenue')}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                    <TrendingUp color="success" fontSize="small" />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +12.5%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {isLoading ? <Skeleton width={100} /> : formatCurrency(dashboardData?.statistics.monthlyExpenses || 0)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.monthlyExpenses')}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                    <TrendingDown color="error" fontSize="small" />
                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                      -5.2%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </>
          )}
          
          {/* Other Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {isLoading ? <Skeleton width={60} /> : dashboardData?.statistics.activeClients || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {t('dashboard.activeClients')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {isLoading ? <Skeleton width={60} /> : `${dashboardData?.statistics.successRate || 0}%`}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {t('dashboard.successRate')}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData?.statistics.successRate || 0}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
        
        {/* Court Statistics */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" gutterBottom>
          {t('dashboard.courtStatistics')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                {dashboardData?.statistics.courtStats.scheduled || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('court.status.scheduled')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {dashboardData?.statistics.courtStats.completed || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('court.status.completed')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {dashboardData?.statistics.courtStats.postponed || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('court.status.postponed')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('dashboard.welcome', { name: user?.firstName })}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: el })}
          </Typography>
        </Box>
        <Box>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading Progress */}
      {isRefreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderOverviewCard(
            t('dashboard.upcomingCourts'),
            dashboardData?.overview.upcomingCourts || 0,
            <Gavel />,
            'primary',
            '/courts'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderOverviewCard(
            t('dashboard.pendingDeadlines'),
            dashboardData?.overview.pendingDeadlines || 0,
            <Schedule />,
            'warning',
            '/deadlines'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderOverviewCard(
            t('dashboard.activePendings'),
            dashboardData?.overview.activePendings || 0,
            <Assignment />,
            'info',
            '/pendings'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderOverviewCard(
            t('dashboard.todayAppointments'),
            dashboardData?.overview.todayAppointments || 0,
            <Event />,
            'success',
            '/appointments'
          )}
        </Grid>
      </Grid>

      {/* Quick Actions - Not for clients */}
      {user?.role !== 'client' && renderQuickActions()}

      {/* Upcoming Items */}
      <Box sx={{ mt: 3 }}>
        {renderUpcomingItems()}
      </Box>

      {/* Statistics - Not for clients */}
      {renderStatistics()}
    </Box>
  );
};

export default DashboardPage;
