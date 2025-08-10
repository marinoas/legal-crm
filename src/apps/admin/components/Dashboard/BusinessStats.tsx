import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const BusinessStats: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Επιχειρηματικά Στατιστικά
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Στατιστικά στοιχεία θα εμφανιστούν εδώ...
        </Typography>
      </Paper>
    </Box>
  );
};

export default BusinessStats;

