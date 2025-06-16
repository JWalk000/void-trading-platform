import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow, Stop } from '@mui/icons-material';
import axios from 'axios';

function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parameters: {
      rsi_threshold: 30,
      macd_signal: 0.5,
      volume_ratio: 1.2,
      stop_loss: 0.05,
      take_profit: 0.10,
    }
  });

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await axios.get('/api/strategies');
      setStrategies(response.data);
    } catch (err) {
      console.error('Failed to fetch strategies:', err);
    }
  };

  const handleOpenDialog = (strategy = null) => {
    if (strategy) {
      setEditingStrategy(strategy);
      setFormData({
        name: strategy.name,
        parameters: strategy.parameters
      });
    } else {
      setEditingStrategy(null);
      setFormData({
        name: '',
        parameters: {
          rsi_threshold: 30,
          macd_signal: 0.5,
          volume_ratio: 1.2,
          stop_loss: 0.05,
          take_profit: 0.10,
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStrategy(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingStrategy) {
        await axios.put(`/api/strategies/${editingStrategy.id}`, formData);
      } else {
        await axios.post('/api/strategies', formData);
      }
      fetchStrategies();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save strategy:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await axios.delete(`/api/strategies/${id}`);
        fetchStrategies();
      } catch (err) {
        console.error('Failed to delete strategy:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trading Strategies</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          New Strategy
        </Button>
      </Box>

      <Grid container spacing={3}>
        {strategies.map((strategy) => (
          <Grid item xs={12} md={6} key={strategy.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{strategy.name}</Typography>
                  <Box>
                    <Chip
                      label={strategy.active ? 'Active' : 'Inactive'}
                      color={strategy.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    RSI Threshold: {strategy.parameters.rsi_threshold}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MACD Signal: {strategy.parameters.macd_signal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volume Ratio: {strategy.parameters.volume_ratio}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stop Loss: {(strategy.parameters.stop_loss * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Take Profit: {(strategy.parameters.take_profit * 100).toFixed(1)}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(strategy)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(strategy.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStrategy ? 'Edit Strategy' : 'New Strategy'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Strategy Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Parameters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="RSI Threshold"
                type="number"
                value={formData.parameters.rsi_threshold}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, rsi_threshold: parseFloat(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="MACD Signal"
                type="number"
                step="0.1"
                value={formData.parameters.macd_signal}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, macd_signal: parseFloat(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Volume Ratio"
                type="number"
                step="0.1"
                value={formData.parameters.volume_ratio}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, volume_ratio: parseFloat(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stop Loss (%)"
                type="number"
                step="0.1"
                value={formData.parameters.stop_loss * 100}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, stop_loss: parseFloat(e.target.value) / 100 }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Take Profit (%)"
                type="number"
                step="0.1"
                value={formData.parameters.take_profit * 100}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, take_profit: parseFloat(e.target.value) / 100 }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStrategy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Strategies; 