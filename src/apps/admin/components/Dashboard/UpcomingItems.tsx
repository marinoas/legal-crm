import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const UpcomingItems: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Επερχόμενα (5 Εργάσιμες Ημέρες)
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Επερχόμενα στοιχεία θα εμφανιστούν εδώ...
        </Typography>
      </Paper>
    </Box>
  );
};

export default UpcomingItems;

