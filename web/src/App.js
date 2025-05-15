import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BodyAnalysisScreen from './screens/BodyAnalysisScreen';
import NutritionPage from './screens/NutritionPage';

// Components
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeScreen />} />
            <Route path="body-analysis" element={<BodyAnalysisScreen />} />
            <Route path="nutrition" element={<NutritionPage />} />
          </Route>
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App; 