import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BodyAnalysisScreen from './screens/BodyAnalysisScreen';

// Components
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800080',
    },
    secondary: {
      main: '#4B0082',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeScreen />} />
          <Route path="body-analysis" element={<BodyAnalysisScreen />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App; 