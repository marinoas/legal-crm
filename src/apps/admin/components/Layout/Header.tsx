import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  styled,
  alpha
} from '@mui/material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer - 1,
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: theme.spacing(2, 0),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 400,
}));

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Επισκόπηση',
  subtitle = 'Γενική επισκόπηση των δραστηριοτήτων σας'
}) => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <HeaderContent>
          <PageTitle variant="h4">
            {title}
          </PageTitle>
          <PageSubtitle variant="body2">
            {subtitle}
          </PageSubtitle>
        </HeaderContent>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;

