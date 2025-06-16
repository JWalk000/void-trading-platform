import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Strategies from './pages/Strategies';
import Performance from './pages/Performance';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00c853',
    },
    secondary: {
      main: '#ff6d00',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing page without layout */}
          <Route path="/" element={<Landing />} />
          
          {/* App pages with layout */}
          <Route path="/app/*" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/trading" element={<Trading />} />
                  <Route path="/strategies" element={<Strategies />} />
                  <Route path="/performance" element={<Performance />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </Box>
          } />
          
          {/* Direct routes for backward compatibility */}
          <Route path="/dashboard" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Dashboard />
              </Layout>
            </Box>
          } />
          <Route path="/trading" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Trading />
              </Layout>
            </Box>
          } />
          <Route path="/strategies" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Strategies />
              </Layout>
            </Box>
          } />
          <Route path="/performance" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Performance />
              </Layout>
            </Box>
          } />
          <Route path="/ai-insights" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <AIInsights />
              </Layout>
            </Box>
          } />
          <Route path="/settings" element={
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Layout>
                <Settings />
              </Layout>
            </Box>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 