import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Card, 
  CardContent,
  Stack,
  alpha
} from '@mui/material';
import { 
  Gavel, 
  Schedule, 
  Assignment, 
  Event 
} from '@mui/icons-material';
import { 
  upcomingItems, 
  getUpcomingItemsByType, 
  getPriorityColor, 
  getPriorityLabel,
  UpcomingItem 
} from '../../../../data/dashboardData';

const sectionConfig = [
  {
    type: 'court' as const,
    title: 'Επερχόμενα Δικαστήρια',
    icon: Gavel,
    color: '#8b5cf6'
  },
  {
    type: 'deadline' as const,
    title: 'Επερχόμενες Προθεσμίες',
    icon: Schedule,
    color: '#06b6d4'
  },
  {
    type: 'pending' as const,
    title: 'Εκκρεμότητες',
    icon: Assignment,
    color: '#10b981'
  },
  {
    type: 'appointment' as const,
    title: 'Προγραμματισμένα Ραντεβού',
    icon: Event,
    color: '#f59e0b'
  }
];

interface UpcomingItemCardProps {
  item: UpcomingItem;
}

const UpcomingItemCard: React.FC<UpcomingItemCardProps> = ({ item }) => {
  const priorityColor = getPriorityColor(item.priority);
  
  return (
    <Card 
      sx={{ 
        mb: 1.5, 
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: (theme) => theme.palette.mode === 'light'
            ? '0 4px 12px rgba(0, 0, 0, 0.1)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderColor: alpha(priorityColor, 0.5),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: priorityColor,
        }
      }}
    >
      <CardContent sx={{ py: 2, pl: 3, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3
            }}
          >
            {item.title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {item.details}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Chip
              label={getPriorityLabel(item.priority)}
              size="small"
              sx={{
                backgroundColor: priorityColor,
                color: 'white',
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-label': {
                  px: 1.5,
                }
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface UpcomingSectionProps {
  type: UpcomingItem['type'];
  title: string;
  icon: React.ComponentType;
  color: string;
}

const UpcomingSection: React.FC<UpcomingSectionProps> = ({ 
  type, 
  title, 
  icon: Icon, 
  color 
}) => {
  const items = getUpcomingItemsByType(type);

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: 'fit-content',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: color,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: alpha(color, 0.1),
            borderRadius: '50%',
            p: 1,
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color, fontSize: 20 }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '1rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <Stack spacing={0}>
        {items.length > 0 ? (
          items.map((item) => (
            <UpcomingItemCard key={item.id} item={item} />
          ))
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}
          >
            <Icon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ opacity: 0.7 }}
            >
              Δεν υπάρχουν επερχόμενα στοιχεία
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

const UpcomingItems: React.FC = () => {
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
        Επερχόμενα (5 Εργάσιμες Ημέρες)
      </Typography>
      
      <Grid container spacing={3}>
        {sectionConfig.map((section) => (
          <Grid item xs={12} md={6} lg={3} key={section.type}>
            <UpcomingSection
              type={section.type}
              title={section.title}
              icon={section.icon}
              color={section.color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UpcomingItems;

