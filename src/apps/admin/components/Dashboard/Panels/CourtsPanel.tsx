import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Chip,
  IconButton,
  Tooltip,
  styled,
  alpha
} from '@mui/material';
import { 
  Gavel,
  AccessTime,
  LocationOn,
  Email
} from '@mui/icons-material';
import { courtCases, getPriorityColor, getPriorityLabel } from '../../../../../data/mockData';

const PanelContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ItemsList = styled(List)(({ theme }) => ({
  flex: 1,
  padding: 0,
  overflow: 'auto',
}));

const CourtItem = styled(ListItem)<{ priority: string }>(({ theme, priority }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: '12px 0',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderLeft: `3px solid ${getPriorityColor(priority)}`,
  paddingLeft: 12,
  marginBottom: 8,
  backgroundColor: alpha(getPriorityColor(priority), 0.02),
  borderRadius: '0 4px 4px 0',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(getPriorityColor(priority), 0.05),
    transform: 'translateX(2px)',
  },
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0,
  },
}));

const ItemHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 8,
}));

const HeaderLeft = styled(Box)(({ theme }) => ({
  flex: 1,
  marginRight: 8,
}));

const HeaderRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}));

const EmailButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
}));

const ItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  lineHeight: 1.3,
  flex: 1,
  marginRight: 8,
}));

const PriorityChip = styled(Chip)<{ priority: string }>(({ theme, priority }) => ({
  height: 20,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: alpha(getPriorityColor(priority), 0.1),
  color: getPriorityColor(priority),
  border: `1px solid ${alpha(getPriorityColor(priority), 0.3)}`,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const ItemDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
}));

const DetailIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 14,
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  padding: theme.spacing(3),
}));

interface CourtsPanelProps {
  panelId: string;
}

const CourtsPanel: React.FC<CourtsPanelProps> = ({ panelId }) => {
  const handleItemClick = (courtCase: typeof courtCases[0]) => {
    console.log('Court case clicked:', courtCase.title);
    // Here you would typically navigate to the case details or open a modal
  };

  const handleEmailClick = (e: React.MouseEvent, courtCase: typeof courtCases[0]) => {
    e.stopPropagation(); // Prevent triggering the item click
    console.log('Email button clicked for:', courtCase.title);
    // Here you would open an email modal or compose window
    // For now, we'll show a simple alert
    alert(`Άνοιγμα email για: ${courtCase.title}\nΠαραλήπτης: ${courtCase.opponent || 'Εντολέας'}`);
  };

  if (courtCases.length === 0) {
    return (
      <PanelContainer>
        <EmptyState>
          <Gavel sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            Δεν υπάρχουν προγραμματισμένες δικάσιμοι
          </Typography>
        </EmptyState>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <ItemsList>
        {courtCases.map((courtCase) => (
          <CourtItem
            key={courtCase.id}
            priority={courtCase.priority}
            onClick={() => handleItemClick(courtCase)}
          >
            <ItemHeader>
              <HeaderLeft>
                <ItemTitle>
                  {courtCase.title}
                </ItemTitle>
              </HeaderLeft>
              <HeaderRight>
                <Tooltip title="Αποστολή Email" arrow>
                  <EmailButton
                    onClick={(e) => handleEmailClick(e, courtCase)}
                    size="small"
                  >
                    <Email />
                  </EmailButton>
                </Tooltip>
                <PriorityChip
                  priority={courtCase.priority}
                  label={getPriorityLabel(courtCase.priority)}
                  size="small"
                />
              </HeaderRight>
            </ItemHeader>
            
            <ItemDetails>
              <DetailRow>
                <DetailIcon>
                  <AccessTime />
                </DetailIcon>
                <Typography variant="caption">
                  {courtCase.details}
                </Typography>
              </DetailRow>
              
              {courtCase.court && (
                <DetailRow>
                  <DetailIcon>
                    <LocationOn />
                  </DetailIcon>
                  <Typography variant="caption">
                    {courtCase.court}
                  </Typography>
                </DetailRow>
              )}
              
              {courtCase.opponent && (
                <DetailRow>
                  <DetailIcon>
                    <Gavel />
                  </DetailIcon>
                  <Typography variant="caption">
                    Εναντίον: {courtCase.opponent}
                  </Typography>
                </DetailRow>
              )}
            </ItemDetails>
          </CourtItem>
        ))}
      </ItemsList>
    </PanelContainer>
  );
};

export default CourtsPanel;

