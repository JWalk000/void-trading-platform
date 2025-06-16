import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

function Trading() {
  const [tradingStatus, setTradingStatus] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTradingData();
    if (autoRefresh) {
      const interval = setInterval(fetchTradingData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchTradingData = async () => {
    try {
      const [statusResponse, tradesResponse] = await Promise.all([
        axios.get('/api/trading/status'),
        axios.get('/api/trades')
      ]);
      
      setTradingStatus(statusResponse.data);
      setTrades(tradesResponse.data);
    } catch (err) {
      setError('Failed to fetch trading data');
      console.error('Trading data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrading = async () => {
    try {
      await axios.post('/api/trading/start');
      fetchTradingData();
    } catch (err) {
      setError('Failed to start trading');
    }
  };

  const handleStopTrading = async () => {
    try {
      await axios.post('/api/trading/stop');
      fetchTradingData();
    } catch (err) {
      setError('Failed to stop trading');
    }
  };

  const getTradeColor = (side) => {
    return side === 'BUY' ? 'success.main' : 'error.main';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trading</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTradingData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Trading Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Controls
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={handleStartTrading}
                  disabled={tradingStatus?.active}
                  fullWidth
                >
                  Start Trading
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStopTrading}
                  disabled={!tradingStatus?.active}
                  fullWidth
                >
                  Stop Trading
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Status: {tradingStatus?.active ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2">
                  Risk Level: {tradingStatus?.risk_level}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Model Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Model Loaded
                </Typography>
                <Chip
                  label={tradingStatus?.ai_model_status?.model_loaded ? 'Yes' : 'No'}
                  color={tradingStatus?.ai_model_status?.model_loaded ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Training Samples
                </Typography>
                <Typography variant="body1">
                  {tradingStatus?.ai_model_status?.training_samples || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Performance History
                </Typography>
                <Typography variant="body1">
                  {tradingStatus?.ai_model_status?.performance_history || 0} records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Trades */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Trades
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>P&L</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.length > 0 ? (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {trade.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {trade.side === 'BUY' ? (
                            <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                          ) : (
                            <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                          )}
                          <Chip
                            label={trade.side}
                            color={trade.side === 'BUY' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>{trade.strategy}</TableCell>
                      <TableCell>
                        <Chip
                          label={trade.outcome}
                          color={
                            trade.outcome === 'PROFIT' ? 'success' :
                            trade.outcome === 'LOSS' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={trade.profit_loss > 0 ? 'success.main' : 'error.main'}
                        >
                          ${trade.profit_loss.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimestamp(trade.timestamp)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No trades found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Trading; 