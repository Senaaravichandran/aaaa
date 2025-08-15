import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ReportViewer = ({ report }) => {
  if (!report) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Audio Enhancement Report
      </Typography>
      <Box sx={{ whiteSpace: 'pre-wrap' }}>
        <Typography variant="body1">
          {report}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReportViewer;
