import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const CourtsView: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Δικαστήρια
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Δικαστήρια view - θα υλοποιηθεί σύντομα...
        </Typography>
      </Paper>
    </Box>
  );
};

export default CourtsView;

