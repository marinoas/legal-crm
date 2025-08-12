import React, { useState } from 'react';
import { Box, Typography, styled, Paper, IconButton } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import QuickActions from './QuickActions';
import BusinessStats from './BusinessStats';
import CourtsPanel from './Panels/CourtsPanel';
import DeadlinesPanel from './Panels/DeadlinesPanel';
import PendingPanel from './Panels/PendingPanel';
import AppointmentsPanel from './Panels/AppointmentsPanel';
import DateRangePicker from '../../../../components/DateRangePicker';
import { getWorkingDaysRange, formatDateRange } from '../../../../utils/dateUtils';

const DashboardContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

const PanelsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(2),
  flex: 1,
}));

const PanelCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '400px',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
}));

const PanelHeader = styled(Box)<{ color: string }>(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  backgroundColor: color,
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
}));

const PanelTitleBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const PanelTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.875rem',
  fontWeight: 600,
}));

const DateRangeText = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  opacity: 0.9,
  marginTop: theme.spacing(0.5),
}));

const DateRangeButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  width: 28,
  height: 28,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
}));

const DashboardView: React.FC = () => {
  // Initialize with 10 working days as default
  const today = new Date();
  const defaultRange = getWorkingDaysRange(today, 10);
  const [dateRanges, setDateRanges] = useState({
    courts: defaultRange,
    deadlines: defaultRange,
    pending: defaultRange,
    appointments: defaultRange,
  });

  const handleDateRangeChange = (panelType: string, startDate: Date, endDate: Date) => {
    setDateRanges(prev => ({
      ...prev,
      [panelType]: { start: startDate, end: endDate }
    }));
  };

  const formatDateRangeDisplay = (start: Date, end: Date) => {
    return formatDateRange(start, end);
  };

  const panels = [
    {
      id: 'courts',
      title: 'Επερχόμενα Δικαστήρια',
      component: CourtsPanel,
      color: '#8b5cf6',
    },
    {
      id: 'deadlines', 
      title: 'Επερχόμενες Προθεσμίες',
      component: DeadlinesPanel,
      color: '#06b6d4',
    },
    {
      id: 'pending',
      title: 'Εκκρεμότητες', 
      component: PendingPanel,
      color: '#ef4444',
    },
    {
      id: 'appointments',
      title: 'Προγραμματισμένα Ραντεβού',
      component: AppointmentsPanel,
      color: '#f59e0b',
    }
  ];

  return (
    <DashboardContainer>
      {/* Quick Actions Section */}
      <QuickActions />
      
      {/* Upcoming Items Section */}
      <Box>
        <SectionTitle>
          Επερχόμενα (10 Εργάσιμες Ημέρες)
        </SectionTitle>
        
        <PanelsGrid>
          {panels.map((panel) => {
            const PanelComponent = panel.component;
            const panelType = panel.id as keyof typeof dateRanges;
            
            return (
              <PanelCard key={panel.id} elevation={2}>
                <PanelHeader color={panel.color}>
                  <PanelTitleBox>
                    <PanelTitle>
                      <span>📋</span>
                      <span>{panel.title}</span>
                    </PanelTitle>
                    <DateRangeText>
                      {formatDateRangeDisplay(dateRanges[panelType].start, dateRanges[panelType].end)}
                    </DateRangeText>
                  </PanelTitleBox>
                  
                  <DateRangePicker
                    startDate={dateRanges[panelType].start}
                    endDate={dateRanges[panelType].end}
                    onDateRangeChange={(start, end) => handleDateRangeChange(panelType, start, end)}
                  >
                    <DateRangeButton>
                      <CalendarToday sx={{ fontSize: 14 }} />
                    </DateRangeButton>
                  </DateRangePicker>
                </PanelHeader>
                
                <PanelContent>
                  <PanelComponent 
                    panelId={panel.id}
                    startDate={dateRanges[panelType].start}
                    endDate={dateRanges[panelType].end}
                  />
                </PanelContent>
              </PanelCard>
            );
          })}
        </PanelsGrid>
      </Box>
      
      {/* Business Statistics Section */}
      <BusinessStats />
    </DashboardContainer>
  );
};

export default DashboardView;

