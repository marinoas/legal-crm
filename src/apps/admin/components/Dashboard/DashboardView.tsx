import React, { useEffect } from 'react';
import { Box, Typography, styled } from '@mui/material';
import DockingContainer from '../Docking/DockingContainer';
import QuickActions from './QuickActions';
import CourtsPanel from './Panels/CourtsPanel';
import DeadlinesPanel from './Panels/DeadlinesPanel';
import PendingPanel from './Panels/PendingPanel';
import AppointmentsPanel from './Panels/AppointmentsPanel';
import { useDocking } from '../../hooks/useDocking';

const DashboardContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const UpcomingSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0, // Important for flex child to shrink
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

const DockingArea = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 400,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
}));

const DashboardView: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { addPanel, panels } = useDocking(containerRef);

  // Initialize default panels
  useEffect(() => {
    // Only add panels if they don't exist yet
    if (panels.length === 0) {
      const defaultPanels = [
        {
          id: 'courts',
          title: 'Επερχόμενα Δικαστήρια',
          component: CourtsPanel,
          isMinimized: false,
          isPinned: false,
          isVisible: true,
        },
        {
          id: 'deadlines',
          title: 'Επερχόμενες Προθεσμίες',
          component: DeadlinesPanel,
          isMinimized: false,
          isPinned: false,
          isVisible: true,
        },
        {
          id: 'pending',
          title: 'Εκκρεμότητες',
          component: PendingPanel,
          isMinimized: false,
          isPinned: false,
          isVisible: true,
        },
        {
          id: 'appointments',
          title: 'Προγραμματισμένα Ραντεβού',
          component: AppointmentsPanel,
          isMinimized: false,
          isPinned: false,
          isVisible: true,
        },
      ];

      // Add panels with a small delay to ensure proper initialization
      setTimeout(() => {
        defaultPanels.forEach(panel => {
          addPanel(panel);
        });
      }, 100);
    }
  }, [addPanel, panels.length]);

  return (
    <DashboardContainer>
      {/* Quick Actions Section */}
      <QuickActions />
      
      {/* Upcoming Items Section with Dockable Panels */}
      <UpcomingSection>
        <SectionTitle>
          Επερχόμενα (5 Εργάσιμες Ημέρες)
        </SectionTitle>
        
        <DockingArea ref={containerRef}>
          <DockingContainer />
        </DockingArea>
      </UpcomingSection>
    </DashboardContainer>
  );
};

export default DashboardView;

