import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FitnessCenter as FitnessIcon,
  Restaurant as FoodIcon,
  Assignment as PlanIcon,
  DirectionsRun as ExerciseIcon,
  Timeline as ProgressIcon,
  WaterDrop as WaterIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';

const MenuCard = ({ title, icon, onClick }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
      {icon}
      <Typography variant="h6" component="div" sx={{ mt: 2, color: 'primary.main' }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Vücut Analizi',
      icon: <FitnessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => navigate('/body-analysis'),
    },
    {
      title: 'Besin Değerleri',
      icon: <FoodIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('Besin değerleri'),
    },
    {
      title: 'Beslenme Planı',
      icon: <PlanIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('Beslenme planı'),
    },
    {
      title: 'Egzersiz Planı',
      icon: <ExerciseIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('Egzersiz planı'),
    },
    {
      title: 'İlerleme Takibi',
      icon: <ProgressIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('İlerleme takibi'),
    },
    {
      title: 'Su Takibi',
      icon: <WaterIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('Su takibi'),
    },
    {
      title: 'Profil',
      icon: <ProfileIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      onClick: () => console.log('Profil'),
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hoş Geldin, Kullanıcı
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Bugün sağlıklı yaşam için ne yapmak istersin?
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Menüde ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ my: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredMenuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MenuCard
              title={item.title}
              icon={item.icon}
              onClick={item.onClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomeScreen; 