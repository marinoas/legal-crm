import React from 'react';
import { Box, Typography } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
        🎉 TEST PAGE WORKS!
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Το routing λειτουργεί σωστά!
      </Typography>
      <Typography variant="body1">
        Αυτή είναι μια απλή test σελίδα για να επιβεβαιώσω ότι το routing λειτουργεί.
        Αν βλέπεις αυτό το μήνυμα, σημαίνει ότι το πρόβλημα είναι στο DeadlinesPage component.
      </Typography>
    </Box>
  );
};

export default TestPage;

