import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Chip,
  styled,
  alpha
} from '@mui/material';
import { 
  Event,
  Person,
  AccessTime,
  LocationOn,
  VideoCall,
  Phone,
  Business
} from '@mui/icons-material';
import { appointments, getPriorityColor, getPriorityLabel } from '../../../../../data/mockData';

const PanelContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ItemsList = styled(List)(({ theme }) => ({
  flex: 1,
  padding: 0,
  overflow: 'auto',
}));

const AppointmentItem = styled(ListItem)<{ priority: string }>(({ theme, priority }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: '12px 0',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderLeft: `3px solid ${getPriorityColor(priority)}`,
  paddingLeft: 12,
  marginBottom: 8,
  backgroundColor: alpha(getPriorityColor(priority), 0.02),
  borderRadius: '0 4px 4px 0',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(getPriorityColor(priority), 0.05),
    transform: 'translateX(2px)',
  },
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0,
  },
}));

const ItemHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 8,
}));

const ItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  lineHeight: 1.3,
  flex: 1,
  marginRight: 8,
}));

const PriorityChip = styled(Chip)<{ priority: string }>(({ theme, priority }) => ({
  height: 20,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: alpha(getPriorityColor(priority), 0.1),
  color: getPriorityColor(priority),
  border: `1px solid ${alpha(getPriorityColor(priority), 0.3)}`,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const ItemDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
}));

const DetailIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 14,
  },
}));

const MeetingTypeChip = styled(Chip)<{ meetingType: string }>(({ theme, meetingType }) => {
  const getTypeColor = () => {
    switch (meetingType) {
      case 'video-call':
        return '#06b6d4';
      case 'phone-call':
        return '#10b981';
      case 'in-person':
        return '#6366f1';
      default:
        return theme.palette.primary.main;
    }
  };

  const color = getTypeColor();
  
  return {
    height: 18,
    fontSize: '0.7rem',
    fontWeight: 400,
    backgroundColor: alpha(color, 0.1),
    color: color,
    alignSelf: 'flex-start',
    marginTop: 4,
    '& .MuiChip-label': {
      padding: '0 4px',
    },
  };
});

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  padding: theme.spacing(3),
}));

interface AppointmentsPanelProps {
  panelId: string;
}

const AppointmentsPanel: React.FC<AppointmentsPanelProps> = ({ panelId }) => {
  const handleItemClick = (appointment: typeof appointments[0]) => {
    console.log('Appointment clicked:', appointment.title);
    // Here you would typically navigate to the appointment details or open a modal
  };

  const getMeetingIcon = (meetingType: string) => {
    switch (meetingType) {
      case 'video-call':
        return VideoCall;
      case 'phone-call':
        return Phone;
      case 'in-person':
        return Business;
      default:
        return Event;
    }
  };

  const getMeetingTypeLabel = (meetingType: string) => {
    switch (meetingType) {
      case 'video-call':
        return 'Τηλεδιάσκεψη';
      case 'phone-call':
        return 'Τηλεφωνική κλήση';
      case 'in-person':
        return 'Συνάντηση';
      default:
        return 'Ραντεβού';
    }
  };

  if (appointments.length === 0) {
    return (
      <PanelContainer>
        <EmptyState>
          <Event sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            Δεν υπάρχουν προγραμματισμένα ραντεβού
          </Typography>
        </EmptyState>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <ItemsList>
        {appointments.map((appointment) => {
          const IconComponent = getMeetingIcon(appointment.meetingType);
          
          return (
            <AppointmentItem
              key={appointment.id}
              priority={appointment.priority}
              onClick={() => handleItemClick(appointment)}
            >
              <ItemHeader>
                <ItemTitle>
                  {appointment.title}
                </ItemTitle>
                <PriorityChip
                  priority={appointment.priority}
                  label={getPriorityLabel(appointment.priority)}
                  size="small"
                />
              </ItemHeader>
              
              <ItemDetails>
                <DetailRow>
                  <DetailIcon>
                    <AccessTime />
                  </DetailIcon>
                  <Typography variant="caption">
                    {appointment.details}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <DetailIcon>
                    <Person />
                  </DetailIcon>
                  <Typography variant="caption">
                    Εντολέας: {appointment.client}
                  </Typography>
                </DetailRow>
                
                {appointment.location && (
                  <DetailRow>
                    <DetailIcon>
                      <LocationOn />
                    </DetailIcon>
                    <Typography variant="caption">
                      Τοποθεσία: {appointment.location}
                    </Typography>
                  </DetailRow>
                )}
                
                {appointment.duration && (
                  <DetailRow>
                    <DetailIcon>
                      <AccessTime />
                    </DetailIcon>
                    <Typography variant="caption">
                      Διάρκεια: {appointment.duration} λεπτά
                    </Typography>
                  </DetailRow>
                )}
                
                <MeetingTypeChip
                  meetingType={appointment.meetingType}
                  label={getMeetingTypeLabel(appointment.meetingType)}
                  size="small"
                />
              </ItemDetails>
            </AppointmentItem>
          );
        })}
      </ItemsList>
    </PanelContainer>
  );
};

export default AppointmentsPanel;

