import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Psychology,
  Speed,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [tradingStatus, setTradingStatus] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio status
      const portfolioResponse = await axios.get('/api/trading/status');
      setTradingStatus(portfolioResponse.data);
      
      // Fetch performance data
      const performanceResponse = await axios.get('/api/performance');
      setPerformanceData(performanceResponse.data);
      
      // Fetch AI insights
      const insightsResponse = await axios.get('/api/ai/insights');
      setAiInsights(insightsResponse.data);
      
      // Simulate portfolio data (in real app, this would come from API)
      setPortfolioData({
        totalValue: 125000,
        cash: 25000,
        positions: {
          'AAPL': { quantity: 100, value: 15000 },
          'GOOGL': { quantity: 50, value: 7500 },
          'TSLA': { quantity: 200, value: 45000 },
        },
        dailyChange: 1250,
        dailyChangePercent: 1.01,
        totalReturn: 25000,
        totalReturnPercent: 25.0,
      });
      
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      default: return 'default';
    }
  };

  const portfolioChartData = [
    { date: 'Mon', value: 120000 },
    { date: 'Tue', value: 122000 },
    { date: 'Wed', value: 118000 },
    { date: 'Thu', value: 125000 },
    { date: 'Fri', value: 125000 },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Portfolio Value</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                ${portfolioData?.totalValue?.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {portfolioData?.dailyChangePercent > 0 ? (
                  <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                )}
                <Typography
                  variant="body2"
                  color={portfolioData?.dailyChangePercent > 0 ? 'success.main' : 'error.main'}
                >
                  {portfolioData?.dailyChangePercent > 0 ? '+' : ''}
                  {portfolioData?.dailyChangePercent}% today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Return</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                ${portfolioData?.totalReturn?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main">
                +{portfolioData?.totalReturnPercent}% overall
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Trading Status</Typography>
              </Box>
              <Chip
                label={tradingStatus?.active ? 'Active' : 'Inactive'}
                color={tradingStatus?.active ? 'success' : 'default'}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Risk Level: {tradingStatus?.risk_level}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">AI Model</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {aiInsights?.model_performance?.accuracy ? 
                  `${(aiInsights.model_performance.accuracy * 100).toFixed(1)}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accuracy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00c853"
                    strokeWidth={2}
                    dot={{ fill: '#00c853' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Trades
                </Typography>
                <Typography variant="h4">
                  {performanceData?.total_trades || 0}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Win Rate
                </Typography>
                <Typography variant="h4" color="success.main">
                  {performanceData?.win_rate || 0}%
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total P&L
                </Typography>
                <Typography
                  variant="h4"
                  color={performanceData?.total_pnl > 0 ? 'success.main' : 'error.main'}
                >
                  ${performanceData?.total_pnl?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Positions
              </Typography>
              {portfolioData?.positions ? (
                Object.entries(portfolioData.positions).map(([symbol, position]) => (
                  <Box
                    key={symbol}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid #333',
                    }}
                  >
                    <Typography variant="body1">{symbol}</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">
                        {position.quantity} shares
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${position.value.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active positions
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Insights
              </Typography>
              {aiInsights?.recommendations ? (
                aiInsights.recommendations.map((recommendation, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Warning sx={{ mr: 1, mt: 0.5, color: 'warning.main' }} />
                    <Typography variant="body2">{recommendation}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No insights available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 