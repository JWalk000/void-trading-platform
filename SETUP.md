# AI Trading Platform Setup Guide

This guide will help you set up and run the AI-powered trading platform with self-learning capabilities.

## Prerequisites

Before starting, make sure you have the following installed:

### Required Software
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download Git](https://git-scm.com/)

### Optional (for enhanced features)
- **News API Key** - [Get free API key](https://newsapi.org/) for news sentiment analysis
- **Yahoo Finance API** (free, no key required)

## Quick Start

### 1. Clone or Download the Project
```bash
# If using git
git clone <repository-url>
cd ai-trading-platform

# Or download and extract the ZIP file
```

### 2. Start the Backend Server
```bash
# Option 1: Use the startup script
python run_backend.py

# Option 2: Manual setup
cd backend
pip install -r requirements.txt
python app.py
```

The backend server will start on `http://localhost:5000`

### 3. Start the Frontend Server (in a new terminal)
```bash
# Option 1: Use the startup script
python run_frontend.py

# Option 2: Manual setup
cd frontend
npm install
npm start
```

The frontend will open automatically in your browser at `http://localhost:3000`

## Manual Setup (Detailed)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory for additional configuration:

```env
# News API for sentiment analysis
NEWS_API_KEY=your_news_api_key_here

# Database configuration
DATABASE_URL=sqlite:///trading_platform.db

# Flask secret key
SECRET_KEY=your-secret-key-here

# Trading parameters
SIMULATION_MODE=true
INITIAL_PORTFOLIO_VALUE=100000
```

### Trading Parameters

You can configure trading parameters through the web interface:

1. Go to **Settings** in the web interface
2. Adjust parameters like:
   - Max position size
   - Stop loss percentage
   - Take profit percentage
   - AI confidence threshold
   - Risk management settings

## Features Overview

### 🤖 AI-Powered Trading
- **Machine Learning Models**: Random Forest classifier for trade decisions
- **Self-Learning**: Model improves based on trade outcomes
- **Feature Engineering**: Technical indicators, market sentiment, external factors
- **Confidence Scoring**: Risk-adjusted trading signals

### 📊 Real-time Monitoring
- **Live Dashboard**: Portfolio performance, trade history, AI insights
- **Trading Controls**: Start/stop trading, strategy management
- **Performance Analytics**: Win rate, P&L tracking, risk metrics
- **WebSocket Updates**: Real-time trade notifications

### 🛡️ Risk Management
- **Position Sizing**: Dynamic position sizing based on risk level
- **Stop Loss/Take Profit**: Automated risk controls
- **Portfolio Limits**: Maximum daily loss, position size limits
- **Volatility Assessment**: Market condition-based risk adjustment

### 📈 Technical Analysis
- **Multiple Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Market Data**: Real-time price data from Yahoo Finance
- **External Factors**: News sentiment, market sentiment, economic indicators
- **Backtesting**: Historical performance analysis

## Usage Guide

### 1. Dashboard
- **Overview**: Portfolio value, total returns, trading status
- **Charts**: Performance visualization, portfolio growth
- **AI Insights**: Model performance, recommendations

### 2. Trading
- **Controls**: Start/stop automated trading
- **Live Trades**: Real-time trade monitoring
- **AI Status**: Model performance and training status

### 3. Strategies
- **Create Strategies**: Define trading parameters
- **Manage Strategies**: Edit, delete, activate strategies
- **Parameter Tuning**: RSI thresholds, MACD signals, etc.

### 4. Performance
- **Analytics**: Detailed performance metrics
- **Charts**: Monthly performance, trade distribution
- **Metrics**: Win rate, total P&L, average returns

### 5. AI Insights
- **Model Performance**: Accuracy, precision, recall
- **Feature Importance**: Which factors drive decisions
- **Recommendations**: AI-generated trading advice

### 6. Settings
- **Trading Parameters**: Risk management, position sizing
- **AI Configuration**: Confidence thresholds, retraining settings
- **External Data**: News sentiment, market data sources

## Security Notice

⚠️ **Important Security Information**

- This is a **demo/training platform** designed for educational purposes
- **DO NOT use with real money** without extensive testing
- The platform runs in **simulation mode** by default
- All trades are simulated and do not involve real financial transactions
- Always test thoroughly in a safe environment before any real trading

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check Python version (3.8+ required)
   - Ensure all dependencies are installed
   - Check for port conflicts (default: 5000)

2. **Frontend won't start:**
   - Check Node.js version (16+ required)
   - Ensure npm dependencies are installed
   - Check for port conflicts (default: 3000)

3. **No market data:**
   - Check internet connection
   - Verify Yahoo Finance API access
   - Check for rate limiting

4. **AI model not working:**
   - Ensure sufficient training data
   - Check model file permissions
   - Verify scikit-learn installation

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed correctly
3. Ensure both backend and frontend are running
4. Check the browser console for frontend errors

## Development

### Project Structure
```
ai-trading-platform/
├── backend/                 # Python Flask backend
│   ├── models/             # AI models and trading logic
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # React source code
│   ├── public/            # Static files
│   └── package.json       # Node.js dependencies
├── README.md              # Project overview
├── SETUP.md               # This setup guide
└── start.py               # Combined startup script
```

### Adding Features

1. **Backend**: Add new endpoints in `app.py`
2. **AI Models**: Extend models in `backend/models/`
3. **Frontend**: Add new components in `frontend/src/`
4. **Database**: Modify models in `app.py`

## License

This project is for educational purposes. Please ensure compliance with local regulations before using for real trading.

---

**Happy Trading! 🚀📈** 