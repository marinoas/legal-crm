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
  Schedule,
  Assignment,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { deadlines, getPriorityColor, getPriorityLabel } from '../../../../../data/mockData';

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

const DeadlineItem = styled(ListItem)<{ priority: string }>(({ theme, priority }) => ({
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

const DaysRemaining = styled(Box)<{ urgent: boolean }>(({ theme, urgent }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 6px',
  borderRadius: 4,
  backgroundColor: urgent 
    ? alpha('#ef4444', 0.1) 
    : alpha('#10b981', 0.1),
  color: urgent ? '#ef4444' : '#10b981',
  fontSize: '0.75rem',
  fontWeight: 500,
  alignSelf: 'flex-start',
  marginTop: 4,
}));

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

interface DeadlinesPanelProps {
  panelId: string;
}

const DeadlinesPanel: React.FC<DeadlinesPanelProps> = ({ panelId }) => {
  const handleItemClick = (deadline: typeof deadlines[0]) => {
    console.log('Deadline clicked:', deadline.title);
    // Here you would typically navigate to the deadline details or open a modal
  };

  const getDeadlineIcon = (deadlineType: string) => {
    switch (deadlineType.toLowerCase()) {
      case 'ανακοπή':
        return Assignment;
      case 'αντίκρουση':
        return Assignment;
      case 'έρευνα':
        return Schedule;
      default:
        return Schedule;
    }
  };

  if (deadlines.length === 0) {
    return (
      <PanelContainer>
        <EmptyState>
          <Schedule sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            Δεν υπάρχουν επερχόμενες προθεσμίες
          </Typography>
        </EmptyState>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <ItemsList>
        {deadlines.map((deadline) => {
          const IconComponent = getDeadlineIcon(deadline.deadlineType);
          const isUrgent = deadline.daysRemaining <= 1;
          
          return (
            <DeadlineItem
              key={deadline.id}
              priority={deadline.priority}
              onClick={() => handleItemClick(deadline)}
            >
              <ItemHeader>
                <ItemTitle>
                  {deadline.title}
                </ItemTitle>
                <PriorityChip
                  priority={deadline.priority}
                  label={getPriorityLabel(deadline.priority)}
                  size="small"
                />
              </ItemHeader>
              
              <ItemDetails>
                <DetailRow>
                  <DetailIcon>
                    <Schedule />
                  </DetailIcon>
                  <Typography variant="caption">
                    {deadline.details}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <DetailIcon>
                    <IconComponent />
                  </DetailIcon>
                  <Typography variant="caption">
                    Τύπος: {deadline.deadlineType}
                  </Typography>
                </DetailRow>
                
                <DaysRemaining urgent={isUrgent}>
                  {isUrgent ? (
                    <Warning sx={{ fontSize: 12 }} />
                  ) : (
                    <CheckCircle sx={{ fontSize: 12 }} />
                  )}
                  {deadline.daysRemaining === 0 
                    ? 'Σήμερα' 
                    : deadline.daysRemaining === 1
                    ? 'Αύριο'
                    : `${deadline.daysRemaining} ημέρες`
                  }
                </DaysRemaining>
              </ItemDetails>
            </DeadlineItem>
          );
        })}
      </ItemsList>
    </PanelContainer>
  );
};

export default DeadlinesPanel;

