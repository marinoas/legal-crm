import React from 'react';
import { Typography, Box } from '@mui/material';
import QuickActions from './QuickActions';
import UpcomingItems from './UpcomingItems';
import BusinessStats from './BusinessStats';

const DashboardView: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Επισκόπηση
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Γενική επισκόπηση των δραστηριοτήτων σας
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <QuickActions />
        <UpcomingItems />
        <BusinessStats />
      </Box>
    </Box>
  );
};

export default DashboardView;

