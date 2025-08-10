import React from 'react';
import { Grid, Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import {
  PersonAdd,
  Gavel,
  Schedule,
  Assignment,
  Event,
  Payment
} from '@mui/icons-material';

const quickActions = [
  { id: 'client', title: 'Νέος Εντολέας', icon: PersonAdd, color: '#6366f1' },
  { id: 'court', title: 'Νέα Δικάσιμος', icon: Gavel, color: '#8b5cf6' },
  { id: 'deadline', title: 'Νέα Προθεσμία', icon: Schedule, color: '#06b6d4' },
  { id: 'pending', title: 'Νέα Εκκρεμότητα', icon: Assignment, color: '#10b981' },
  { id: 'appointment', title: 'Νέο Ραντεβού', icon: Event, color: '#f59e0b' },
  { id: 'payment', title: 'Νέα Συναλλαγή', icon: Payment, color: '#ef4444' },
];

const QuickActions: React.FC = () => {
  const handleActionClick = (actionId: string) => {
    console.log(`Quick action clicked: ${actionId}`);
    // TODO: Implement navigation or modal opening
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Γρήγορες Ενέργειες
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={action.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
                onClick={() => handleActionClick(action.id)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <IconButton
                    sx={{
                      backgroundColor: action.color,
                      color: 'white',
                      mb: 2,
                      '&:hover': {
                        backgroundColor: action.color,
                        opacity: 0.9,
                      }
                    }}
                  >
                    <Icon />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
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

