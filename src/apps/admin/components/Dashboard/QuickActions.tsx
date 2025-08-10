import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  alpha
} from '@mui/material';
import {
  PersonAdd,
  Gavel,
  Schedule,
  Assignment,
  Event,
  Payment
} from '@mui/icons-material';
import { quickActions } from '../../../../data/dashboardData';

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
  const handleActionClick = (actionId: string) => {
    console.log(`Quick action clicked: ${actionId}`);
    // TODO: Implement navigation or modal opening based on action
    switch (actionId) {
      case 'client':
        // Navigate to new client form
        break;
      case 'court':
        // Navigate to new court case form
        break;
      case 'deadline':
        // Navigate to new deadline form
        break;
      case 'pending':
        // Navigate to new pending item form
        break;
      case 'appointment':
        // Navigate to new appointment form
        break;
      case 'payment':
        // Navigate to new payment form
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 3
        }}
      >
        Γρήγορες Ενέργειες
      </Typography>
      
      <Grid container spacing={2}>
        {quickActions.map((action) => {
          const IconComponent = getIconComponent(action.icon);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={action.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.palette.mode === 'light'
                      ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                      : '0 8px 25px rgba(0, 0, 0, 0.4)',
                    borderColor: action.color,
                  }
                }}
                onClick={() => handleActionClick(action.id)}
              >
                <CardContent 
                  sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: action.color,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '&:hover::before': {
                      transform: 'scaleX(1)',
                    }
                  }}
                >
                  <IconButton
                    sx={{
                      backgroundColor: action.color,
                      color: 'white',
                      mb: 2,
                      width: 56,
                      height: 56,
                      boxShadow: (theme) => `0 4px 12px ${alpha(action.color, 0.3)}`,
                      '&:hover': {
                        backgroundColor: action.color,
                        transform: 'scale(1.05)',
                        boxShadow: (theme) => `0 6px 16px ${alpha(action.color, 0.4)}`,
                      }
                    }}
                  >
                    <IconComponent sx={{ fontSize: 28 }} />
                  </IconButton>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary',
                      lineHeight: 1.3,
                      textAlign: 'center'
                    }}
                  >
                    {action.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuickActions;

