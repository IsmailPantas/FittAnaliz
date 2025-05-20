import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  FitnessCenter as FitnessIcon,
  Restaurant as RestaurantIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
  { title: 'Ana Sayfa', icon: <HomeIcon />, path: '/' },
  { title: 'Vücut Analizi', icon: <FitnessIcon />, path: '/body-analysis' },
  { title: 'Besin Değerleri', icon: <RestaurantIcon />, path: '/nutrition' },
  { title: 'Egzersiz Hareketleri', icon: <FitnessIcon />, path: '/exercises' },
];

const bottomMenuItems = [
  { title: 'Profil', icon: <PersonIcon />, path: '/profile' },
  { title: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
  { title: 'Çıkış Yap', icon: <LogoutIcon />, path: '/login' },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <FitnessIcon sx={{ color: 'white', fontSize: 32 }} />
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          FitAnaliz
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 2, py: 3 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigate(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, py: 3 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigate(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
      {isMobile && (
        <IconButton
          color="primary"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 2,
            backgroundColor: 'white',
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: 'white',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.03)} 0%,
            ${alpha(theme.palette.primary.main, 0.05)} 50%,
            ${alpha(theme.palette.secondary.main, 0.03)} 100%
          )`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 2,
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout; 