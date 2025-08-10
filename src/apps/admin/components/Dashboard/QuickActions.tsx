import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  alpha,
  styled
} from '@mui/material';
import {
  PersonAdd,
  Gavel,
  Schedule,
  Assignment,
  Event,
  Payment
} from '@mui/icons-material';
import { quickActions } from '../../../../data/mockData';

const QuickActionsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
}));

const ActionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 25px rgba(0, 0, 0, 0.1)'
      : '0 8px 25px rgba(0, 0, 0, 0.4)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease-in-out',
  },
  '&:hover::before': {
    backgroundColor: 'var(--action-color)',
  },
}));

const ActionContent = styled(CardContent)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  justifyContent: 'center',
}));

const ActionIcon = styled(IconButton)<{ actionColor: string }>(({ theme, actionColor }) => ({
  backgroundColor: actionColor,
  color: 'white',
  marginBottom: theme.spacing(2),
  width: 56,
  height: 56,
  boxShadow: `0 4px 12px ${alpha(actionColor, 0.3)}`,
  '&:hover': {
    backgroundColor: actionColor,
    transform: 'scale(1.05)',
    boxShadow: `0 6px 16px ${alpha(actionColor, 0.4)}`,
  },
}));

const ActionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
  textAlign: 'center',
  fontSize: '0.875rem',
}));

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'person_add':
      return PersonAdd;
    case 'gavel':
      return Gavel;
    case 'schedule':
      return Schedule;
    case 'assignment':
      return Assignment;
    case 'event':
      return Event;
    case 'payment':
      return Payment;
    default:
      return PersonAdd;
  }
};

const QuickActions: React.FC = () => {
  const handleActionClick = (action: typeof quickActions[0]) => {
    console.log(`Quick action clicked: ${action.id}`);
    action.action();
  };

  return (
    <QuickActionsContainer>
      <SectionTitle>
        Γρήγορες Ενέργειες
      </SectionTitle>
      
      <Grid container spacing={2}>
        {quickActions.map((action) => {
          const IconComponent = getIconComponent(action.icon);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={action.id}>
              <ActionCard 
                onClick={() => handleActionClick(action)}
                sx={{
                  '--action-color': action.color,
                }}
              >
                <ActionContent>
                  <ActionIcon actionColor={action.color}>
                    <IconComponent sx={{ fontSize: 28 }} />
                  </ActionIcon>
                  
                  <ActionTitle>
                    {action.title}
                  </ActionTitle>
                </ActionContent>
              </ActionCard>
            </Grid>
          );
        })}
      </Grid>
    </QuickActionsContainer>
  );
};

export default QuickActions;

