# AI Trading Platform

An intelligent trading platform that executes trades based on parameters and external factors, with self-learning capabilities from previous trades.

## Features

- **Parameter-based Trading**: Configure trading parameters and strategies
- **External Factor Integration**: Incorporate market data, news, and economic indicators
- **Self-Learning AI**: Machine learning models that learn from trade outcomes
- **Real-time Monitoring**: Live dashboard for trade tracking and performance
- **Risk Management**: Built-in risk controls and position sizing
- **Backtesting**: Test strategies against historical data

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Python Flask API
├── ml_models/         # Machine learning models
├── data/              # Data storage and processing
├── config/            # Configuration files
└── docs/              # Documentation
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

1. Configure trading parameters in the web interface
2. Set up external data sources (market data, news feeds)
3. Enable AI learning mode
4. Monitor trades and performance in real-time
5. Review AI insights and strategy recommendations

## Security Notice

⚠️ **Important**: This is a demo/training platform. Do not use with real money without proper testing and risk management.

## License

MIT License 