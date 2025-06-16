import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';

function Settings() {
  const [settings, setSettings] = useState({
    // Trading Settings
    maxPositionSize: 0.1,
    maxDailyLoss: 0.05,
    stopLossPercentage: 0.05,
    takeProfitPercentage: 0.10,
    
    // AI Settings
    confidenceThreshold: 0.7,
    autoRetrain: true,
    retrainInterval: 50,
    
    // Risk Management
    enableRiskManagement: true,
    maxPortfolioRisk: 0.02,
    volatilityThreshold: 0.3,
    
    // External Data
    enableNewsSentiment: true,
    enableMarketSentiment: true,
    enableEconomicIndicators: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      maxPositionSize: 0.1,
      maxDailyLoss: 0.05,
      stopLossPercentage: 0.05,
      takeProfitPercentage: 0.10,
      confidenceThreshold: 0.7,
      autoRetrain: true,
      retrainInterval: 50,
      enableRiskManagement: true,
      maxPortfolioRisk: 0.02,
      volatilityThreshold: 0.3,
      enableNewsSentiment: true,
      enableMarketSentiment: true,
      enableEconomicIndicators: true,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Trading Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Settings
              </Typography>
              
              <TextField
                fullWidth
                label="Max Position Size (%)"
                type="number"
                value={settings.maxPositionSize * 100}
                onChange={(e) => handleSettingChange('maxPositionSize', parseFloat(e.target.value) / 100)}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
              
              <TextField
                fullWidth
                label="Max Daily Loss (%)"
                type="number"
                value={settings.maxDailyLoss * 100}
                onChange={(e) => handleSettingChange('maxDailyLoss', parseFloat(e.target.value) / 100)}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
              
              <TextField
                fullWidth
                label="Stop Loss (%)"
                type="number"
                value={settings.stopLossPercentage * 100}
                onChange={(e) => handleSettingChange('stopLossPercentage', parseFloat(e.target.value) / 100)}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
              
              <TextField
                fullWidth
                label="Take Profit (%)"
                type="number"
                value={settings.takeProfitPercentage * 100}
                onChange={(e) => handleSettingChange('takeProfitPercentage', parseFloat(e.target.value) / 100)}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* AI Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Model Settings
              </Typography>
              
              <TextField
                fullWidth
                label="Confidence Threshold"
                type="number"
                value={settings.confidenceThreshold}
                onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRetrain}
                    onChange={(e) => handleSettingChange('autoRetrain', e.target.checked)}
                  />
                }
                label="Auto Retrain Model"
                sx={{ mt: 2 }}
              />
              
              <TextField
                fullWidth
                label="Retrain Interval (samples)"
                type="number"
                value={settings.retrainInterval}
                onChange={(e) => handleSettingChange('retrainInterval', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 10, max: 1000 }}
                disabled={!settings.autoRetrain}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Management
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRiskManagement}
                    onChange={(e) => handleSettingChange('enableRiskManagement', e.target.checked)}
                  />
                }
                label="Enable Risk Management"
              />
              
              <TextField
                fullWidth
                label="Max Portfolio Risk (%)"
                type="number"
                value={settings.maxPortfolioRisk * 100}
                onChange={(e) => handleSettingChange('maxPortfolioRisk', parseFloat(e.target.value) / 100)}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
                disabled={!settings.enableRiskManagement}
              />
              
              <TextField
                fullWidth
                label="Volatility Threshold"
                type="number"
                value={settings.volatilityThreshold}
                onChange={(e) => handleSettingChange('volatilityThreshold', parseFloat(e.target.value))}
                margin="normal"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                disabled={!settings.enableRiskManagement}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* External Data Sources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                External Data Sources
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNewsSentiment}
                    onChange={(e) => handleSettingChange('enableNewsSentiment', e.target.checked)}
                  />
                }
                label="News Sentiment Analysis"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableMarketSentiment}
                    onChange={(e) => handleSettingChange('enableMarketSentiment', e.target.checked)}
                  />
                }
                label="Market Sentiment"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEconomicIndicators}
                    onChange={(e) => handleSettingChange('enableEconomicIndicators', e.target.checked)}
                  />
                }
                label="Economic Indicators"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Platform Version
                  </Typography>
                  <Typography variant="body1">1.0.0</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    AI Model Version
                  </Typography>
                  <Typography variant="body1">v2.1.0</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Last Update
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Operational
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings; 