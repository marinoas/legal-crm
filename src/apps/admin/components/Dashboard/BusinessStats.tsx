import React from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  alpha
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  Gavel,
  EuroSymbol,
  Phone,
  Event
} from '@mui/icons-material';
import { businessStats, BusinessStat } from '../../../../data/dashboardData';

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'gavel':
      return Gavel;
    case 'euro_symbol':
      return EuroSymbol;
    case 'phone':
      return Phone;
    case 'event':
      return Event;
    default:
      return TrendingUp;
  }
};

interface StatCardProps {
  stat: BusinessStat;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const IconComponent = getIconComponent(stat.icon);
  const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = stat.trend === 'up' ? '#10b981' : '#ef4444';
  const primaryColor = '#6366f1';

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.palette.mode === 'light'
            ? '0 8px 25px rgba(0, 0, 0, 0.1)'
            : '0 8px 25px rgba(0, 0, 0, 0.4)',
          borderColor: alpha(primaryColor, 0.5),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: primaryColor,
          transform: 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.2s ease-in-out',
        },
        '&:hover::before': {
          transform: 'scaleX(1)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Icon and Value */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: primaryColor,
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {stat.value}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: alpha(primaryColor, 0.1),
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(primaryColor, 0.15),
                  transform: 'scale(1.05)',
                }
              }}
            >
              <IconComponent 
                sx={{ 
                  color: primaryColor,
                  fontSize: 24
                }} 
              />
            </Box>
          </Box>

          {/* Label */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              lineHeight: 1.3,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {stat.title}
          </Typography>

          {/* Change Indicator */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(trendColor, 0.1),
              border: `1px solid ${alpha(trendColor, 0.2)}`,
            }}
          >
            <TrendIcon 
              sx={{ 
                color: trendColor,
                fontSize: 16
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {stat.change}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const BusinessStats: React.FC = () => {
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
        Επιχειρηματικά Στατιστικά
      </Typography>
      
      <Grid container spacing={3}>
        {businessStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BusinessStats;

