"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import { Card, CardContent } from "@mui/material"
import { Box, Typography, Container, Grid } from "@mui/material"
import { 
  TrendingUp, 
  Psychology, 
  Shield, 
  Speed, 
  ArrowForward,
  PlayArrow,
  Assessment
} from "@mui/icons-material"

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    navigate('/trading')
  }

  const handleViewDemo = () => {
    navigate('/dashboard')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      color: 'white'
    }}>
      {/* Navigation */}
      <Box sx={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(10,10,10,0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(45deg, #00c853, #64dd17)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Speed sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                AI Trading Platform
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Typography 
                component="a" 
                href="#features" 
                sx={{ color: '#b0b0b0', '&:hover': { color: '#00c853' }, textDecoration: 'none' }}
              >
                Features
              </Typography>
              <Typography 
                component="a" 
                href="#how-it-works" 
                sx={{ color: '#b0b0b0', '&:hover': { color: '#00c853' }, textDecoration: 'none' }}
              >
                How It Works
              </Typography>
              <Typography 
                component="a" 
                href="#performance" 
                sx={{ color: '#b0b0b0', '&:hover': { color: '#00c853' }, textDecoration: 'none' }}
              >
                Performance
              </Typography>
              <Button 
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  '&:hover': { background: 'linear-gradient(45deg, #00e676, #76ff03)' },
                  color: 'white',
                  border: 0
                }}
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="xl" sx={{ py: 10 }}>
          <Box sx={{
            textAlign: 'center',
            transition: 'all 1s ease',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)'
          }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mb: 3,
              px: 2,
              py: 1,
              backgroundColor: 'rgba(0,200,83,0.1)',
              color: '#00c853',
              border: '1px solid rgba(0,200,83,0.2)',
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(0,200,83,0.2)' }
            }}>
              <Speed sx={{ mr: 1, fontSize: 20 }} />
              AI-Powered Trading
            </Box>
            <Typography variant="h2" sx={{ 
              fontWeight: 'bold', 
              mb: 3, 
              fontSize: { xs: '3rem', md: '4.5rem' },
              lineHeight: 1.2
            }}>
              INTELLIGENT
              <Box component="span" sx={{
                display: 'block',
                background: 'linear-gradient(45deg, #00c853, #64dd17)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                TRADING
              </Box>
              AUTOMATION
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#b0b0b0', 
              mb: 4, 
              maxWidth: '800px', 
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Our AI trading platform leverages advanced machine learning to execute trades based on market parameters 
              and external factors, continuously learning from every transaction to optimize your trading strategy.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                size="large"
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  '&:hover': { background: 'linear-gradient(45deg, #00e676, #76ff03)' },
                  color: 'white',
                  border: 0,
                  px: 4,
                  py: 1.5
                }}
                onClick={handleGetStarted}
              >
                Start Trading
                <ArrowForward sx={{ ml: 1 }} />
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={{
                  borderColor: '#666',
                  color: '#b0b0b0',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#00c853' },
                  px: 4,
                  py: 1.5
                }}
                onClick={handleViewDemo}
              >
                View Demo
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Floating Elements */}
        <Box sx={{
          position: 'absolute',
          top: 80,
          left: 40,
          width: 80,
          height: 80,
          backgroundColor: 'rgba(0,200,83,0.1)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'pulse 2s infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: 80,
          right: 40,
          width: 128,
          height: 128,
          backgroundColor: 'rgba(100,221,23,0.1)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'pulse 2s infinite 1s'
        }} />
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 10, backgroundColor: 'rgba(26,26,26,0.5)' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Powered by Advanced AI
            </Typography>
            <Typography variant="h6" sx={{ color: '#b0b0b0', maxWidth: '600px', mx: 'auto' }}>
              Experience the future of trading with our intelligent automation system
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                backgroundColor: 'rgba(26,26,26,0.5)',
                border: '1px solid #333',
                '&:hover': { borderColor: 'rgba(0,200,83,0.5)' },
                transition: 'all 0.3s ease',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(45deg, #00c853, #64dd17)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}>
                    <Psychology sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                    Machine Learning
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                    Continuously learns from market patterns and trading outcomes to improve decision-making accuracy over time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{
                backgroundColor: 'rgba(26,26,26,0.5)',
                border: '1px solid #333',
                '&:hover': { borderColor: 'rgba(0,200,83,0.5)' },
                transition: 'all 0.3s ease',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(45deg, #00c853, #64dd17)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}>
                    <TrendingUp sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                    Smart Parameters
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                    Analyzes multiple market indicators, news sentiment, and external factors to make informed trading decisions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{
                backgroundColor: 'rgba(26,26,26,0.5)',
                border: '1px solid #333',
                '&:hover': { borderColor: 'rgba(0,200,83,0.5)' },
                transition: 'all 0.3s ease',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(45deg, #00c853, #64dd17)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}>
                    <Shield sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                    Risk Management
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                    Built-in risk controls and position sizing algorithms protect your capital while maximizing opportunities.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Performance Stats */}
      <Box id="performance" sx={{ py: 10 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={6} md={3}>
              <Box sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00c853', mb: 1 }}>
                  94%
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>Success Rate</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00c853', mb: 1 }}>
                  2.3x
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>Average Return</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00c853', mb: 1 }}>
                  24/7
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>Market Monitoring</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00c853', mb: 1 }}>
                  &lt;1s
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>Execution Speed</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box id="how-it-works" sx={{ py: 10, backgroundColor: 'rgba(26,26,26,0.5)' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: '#b0b0b0', maxWidth: '600px', mx: 'auto' }}>
              Simple setup, powerful results
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                  Set Parameters
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>
                  Define your risk tolerance, trading preferences, and investment goals through our intuitive interface.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                  AI Analysis
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>
                  Our AI continuously monitors markets, analyzes patterns, and identifies optimal trading opportunities.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(45deg, #00c853, #64dd17)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  3
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
                  Execute & Learn
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>
                  Trades are executed automatically while the system learns from outcomes to improve future performance.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
              Ready to Transform Your Trading?
            </Typography>
            <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 4 }}>
              Join thousands of traders who trust our AI platform to optimize their investment strategies.
            </Typography>
            <Button
              size="large"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #00c853, #64dd17)',
                '&:hover': { background: 'linear-gradient(45deg, #00e676, #76ff03)' },
                color: 'white',
                border: 0,
                px: 6,
                py: 2,
                fontSize: '1.125rem'
              }}
              onClick={handleGetStarted}
            >
              Start Your Free Trial
              <ArrowForward sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(10,10,10,0.8)'
      }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, md: 0 } }}>
              <Box sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(45deg, #00c853, #64dd17)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Speed sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                AI Trading Platform
              </Typography>
            </Box>
            <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
              © 2024 AI Trading Platform. All rights reserved. | Intelligent Trading Automation
            </Typography>
          </Box>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
} 