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
import { Psychology, TrendingUp, Warning, Info } from '@mui/icons-material';
import axios from 'axios';

function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/api/ai/insights');
      setInsights(response.data);
    } catch (err) {
      setError('Failed to fetch AI insights');
      console.error('AI insights fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Insights
      </Typography>

      <Grid container spacing={3}>
        {/* Model Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Model Performance</Typography>
              </Box>
              
              {insights?.model_performance ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress
                        variant="determinate"
                        value={insights.model_performance.accuracy * 100}
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <Typography variant="body1">
                        {(insights.model_performance.accuracy * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Precision
                    </Typography>
                    <Typography variant="body1">
                      {(insights.model_performance.precision * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Recall
                    </Typography>
                    <Typography variant="body1">
                      {(insights.model_performance.recall * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Training Samples
                    </Typography>
                    <Typography variant="body1">
                      {insights.model_performance.training_samples}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No performance data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Feature Importance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Feature Importance</Typography>
              </Box>
              
              {insights?.feature_importance ? (
                <Box>
                  {Object.entries(insights.feature_importance)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([feature, importance]) => (
                      <Box key={feature} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{feature}</Typography>
                          <Typography variant="body2">{(importance * 100).toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={importance * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No feature importance data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Confidence Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Confidence Trend</Typography>
              </Box>
              
              {insights?.confidence_trend ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trend
                    </Typography>
                    <Chip
                      label={insights.confidence_trend.trend}
                      color={
                        insights.confidence_trend.trend === 'improving' ? 'success' :
                        insights.confidence_trend.trend === 'declining' ? 'error' : 'default'
                      }
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Accuracy
                    </Typography>
                    <Typography variant="body1">
                      {(insights.confidence_trend.current_accuracy * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Accuracy
                    </Typography>
                    <Typography variant="body1">
                      {(insights.confidence_trend.average_accuracy * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No trend data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">AI Recommendations</Typography>
              </Box>
              
              {insights?.recommendations ? (
                <Box>
                  {insights.recommendations.map((recommendation, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 2,
                        p: 1,
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: 1,
                      }}
                    >
                      <Warning sx={{ mr: 1, mt: 0.5, color: 'warning.main' }} />
                      <Typography variant="body2">{recommendation}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recommendations available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Model Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Model Loaded
                    </Typography>
                    <Chip
                      label={insights?.model_performance?.status === 'No performance data available' ? 'No' : 'Yes'}
                      color={insights?.model_performance?.status === 'No performance data available' ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {insights?.model_performance?.last_updated ? 
                        new Date(insights.model_performance.last_updated).toLocaleString() : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Training Status
                    </Typography>
                    <Chip
                      label={insights?.model_performance?.training_samples > 0 ? 'Trained' : 'Not Trained'}
                      color={insights?.model_performance?.training_samples > 0 ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Model Health
                    </Typography>
                    <Chip
                      label={
                        insights?.model_performance?.accuracy > 0.7 ? 'Good' :
                        insights?.model_performance?.accuracy > 0.5 ? 'Fair' : 'Poor'
                      }
                      color={
                        insights?.model_performance?.accuracy > 0.7 ? 'success' :
                        insights?.model_performance?.accuracy > 0.5 ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIInsights; 