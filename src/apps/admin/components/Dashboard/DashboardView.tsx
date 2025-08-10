import React from 'react';
import { Box, Typography, styled, Paper } from '@mui/material';
import QuickActions from './QuickActions';
import CourtsPanel from './Panels/CourtsPanel';
import DeadlinesPanel from './Panels/DeadlinesPanel';
import PendingPanel from './Panels/PendingPanel';
import AppointmentsPanel from './Panels/AppointmentsPanel';

const DashboardContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
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

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
}));

const PanelControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
}));

const ControlButton = styled('button')(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  borderRadius: '4px',
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const DashboardView: React.FC = () => {
  const panels = [
    {
      id: 'courts',
      title: 'Επερχόμενα Δικαστήρια',
      component: CourtsPanel,
      color: '#8b5cf6',
      badges: [18, 19, 20]
    },
    {
      id: 'deadlines', 
      title: 'Επερχόμενες Προθεσμίες',
      component: DeadlinesPanel,
      color: '#06b6d4',
      badges: [21, 22, 23]
    },
    {
      id: 'pending',
      title: 'Εκκρεμότητες', 
      component: PendingPanel,
      color: '#ef4444',
      badges: [24, 25, 26]
    },
    {
      id: 'appointments',
      title: 'Προγραμματισμένα Ραντεβού',
      component: AppointmentsPanel,
      color: '#f59e0b',
      badges: [27, 28, 29]
    }
  ];

  return (
    <DashboardContainer>
      {/* Quick Actions Section */}
      <QuickActions />
      
      {/* Upcoming Items Section */}
      <Box>
        <SectionTitle>
          Επερχόμενα (5 Εργάσιμες Ημέρες)
        </SectionTitle>
        
        <PanelsGrid>
          {panels.map((panel) => {
            const PanelComponent = panel.component;
            return (
              <PanelCard key={panel.id} elevation={2}>
                <PanelHeader color={panel.color}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>📋</span>
                    <span>{panel.title}</span>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {panel.badges.map((badge, index) => (
                        <Box
                          key={badge}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          {badge}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  <PanelControls>
                    <ControlButton title="Pin panel">📌</ControlButton>
                    <ControlButton title="Minimize panel">➖</ControlButton>
                    <ControlButton title="Close panel">✖️</ControlButton>
                  </PanelControls>
                </PanelHeader>
                
                <PanelContent>
                  <PanelComponent panelId={panel.id} />
                </PanelContent>
              </PanelCard>
            );
          })}
        </PanelsGrid>
      </Box>
    </DashboardContainer>
  );
};

export default DashboardView;

