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
import ExerciseListScreen from './screens/ExerciseListScreen';
import RegisterScreen from './screens/RegisterScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import ExercisePlanScreen from './screens/ExercisePlanScreen';
import WaterTrackingPage from './screens/WaterTrackingPage';

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
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeScreen />} />
            <Route path="body-analysis" element={<BodyAnalysisScreen />} />
            <Route path="nutrition" element={<NutritionPage />} />
            <Route path="exercises" element={<ExerciseListScreen />} />
            <Route path="meal-plan" element={<MealPlanScreen />} />
            <Route path="exercise-plan" element={<ExercisePlanScreen />} />
            <Route path="water-tracking" element={<WaterTrackingPage />} />
          </Route>
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App; 