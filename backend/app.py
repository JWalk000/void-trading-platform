from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
import os
import json
from datetime import datetime, timedelta
import threading
import time

# Import custom modules
from models.trading_engine import TradingEngine
from models.ai_learner import AILearner
from models.data_fetcher import DataFetcher
from models.risk_manager import RiskManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trading_platform.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
db = SQLAlchemy(app)

# Initialize components
trading_engine = TradingEngine()
ai_learner = AILearner()
data_fetcher = DataFetcher()
risk_manager = RiskManager()

# Global variables
trading_active = False
current_strategy = None

# Database Models
class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False)
    side = db.Column(db.String(4), nullable=False)  # BUY/SELL
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    strategy = db.Column(db.String(100))
    external_factors = db.Column(db.Text)  # JSON string
    outcome = db.Column(db.String(20))  # PROFIT/LOSS/PENDING
    profit_loss = db.Column(db.Float, default=0.0)

class Strategy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parameters = db.Column(db.Text)  # JSON string
    active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ExternalFactor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    source = db.Column(db.String(100))
    weight = db.Column(db.Float, default=1.0)
    active = db.Column(db.Boolean, default=True)

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/strategies', methods=['GET'])
def get_strategies():
    strategies = Strategy.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'parameters': json.loads(s.parameters) if s.parameters else {},
        'active': s.active,
        'created_at': s.created_at.isoformat()
    } for s in strategies])

@app.route('/api/strategies', methods=['POST'])
def create_strategy():
    data = request.json
    strategy = Strategy(
        name=data['name'],
        parameters=json.dumps(data['parameters']),
        active=data.get('active', False)
    )
    db.session.add(strategy)
    db.session.commit()
    return jsonify({'id': strategy.id, 'message': 'Strategy created successfully'})

@app.route('/api/strategies/<int:strategy_id>', methods=['PUT'])
def update_strategy(strategy_id):
    strategy = Strategy.query.get_or_404(strategy_id)
    data = request.json
    
    if 'name' in data:
        strategy.name = data['name']
    if 'parameters' in data:
        strategy.parameters = json.dumps(data['parameters'])
    if 'active' in data:
        strategy.active = data['active']
    
    db.session.commit()
    return jsonify({'message': 'Strategy updated successfully'})

@app.route('/api/trades', methods=['GET'])
def get_trades():
    trades = Trade.query.order_by(Trade.timestamp.desc()).limit(100).all()
    return jsonify([{
        'id': t.id,
        'symbol': t.symbol,
        'side': t.side,
        'quantity': t.quantity,
        'price': t.price,
        'timestamp': t.timestamp.isoformat(),
        'strategy': t.strategy,
        'external_factors': json.loads(t.external_factors) if t.external_factors else {},
        'outcome': t.outcome,
        'profit_loss': t.profit_loss
    } for t in trades])

@app.route('/api/trading/start', methods=['POST'])
def start_trading():
    global trading_active, current_strategy
    
    if trading_active:
        return jsonify({'error': 'Trading is already active'}), 400
    
    data = request.json
    strategy_id = data.get('strategy_id')
    
    if strategy_id:
        strategy = Strategy.query.get_or_404(strategy_id)
        current_strategy = strategy
        strategy.active = True
        db.session.commit()
    
    trading_active = True
    
    # Start trading in background thread
    def trading_loop():
        while trading_active:
            try:
                # Fetch market data
                market_data = data_fetcher.get_market_data()
                
                # Get external factors
                external_factors = data_fetcher.get_external_factors()
                
                # AI analysis
                ai_signal = ai_learner.analyze(market_data, external_factors)
                
                # Risk assessment
                risk_assessment = risk_manager.assess_risk(market_data, ai_signal)
                
                # Execute trades if conditions are met
                if ai_signal['should_trade'] and risk_assessment['risk_level'] == 'LOW':
                    trade_result = trading_engine.execute_trade(
                        symbol=ai_signal['symbol'],
                        side=ai_signal['side'],
                        quantity=risk_assessment['recommended_quantity'],
                        strategy=current_strategy.name if current_strategy else 'AI_Strategy'
                    )
                    
                    if trade_result['success']:
                        # Save trade to database
                        trade = Trade(
                            symbol=trade_result['symbol'],
                            side=trade_result['side'],
                            quantity=trade_result['quantity'],
                            price=trade_result['price'],
                            strategy=trade_result['strategy'],
                            external_factors=json.dumps(external_factors),
                            outcome='PENDING'
                        )
                        db.session.add(trade)
                        db.session.commit()
                        
                        # Emit trade event to frontend
                        socketio.emit('new_trade', trade_result)
                
                # Update AI model with new data
                ai_learner.update_model(market_data, external_factors)
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Error in trading loop: {e}")
                time.sleep(60)
    
    trading_thread = threading.Thread(target=trading_loop, daemon=True)
    trading_thread.start()
    
    return jsonify({'message': 'Trading started successfully'})

@app.route('/api/trading/stop', methods=['POST'])
def stop_trading():
    global trading_active, current_strategy
    
    trading_active = False
    
    if current_strategy:
        current_strategy.active = False
        db.session.commit()
        current_strategy = None
    
    return jsonify({'message': 'Trading stopped successfully'})

@app.route('/api/trading/status', methods=['GET'])
def get_trading_status():
    return jsonify({
        'active': trading_active,
        'current_strategy': current_strategy.name if current_strategy else None,
        'ai_model_status': ai_learner.get_status(),
        'risk_level': risk_manager.get_current_risk_level()
    })

@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    insights = ai_learner.get_insights()
    return jsonify(insights)

@app.route('/api/performance', methods=['GET'])
def get_performance():
    # Calculate performance metrics
    trades = Trade.query.filter(Trade.outcome != 'PENDING').all()
    
    total_trades = len(trades)
    profitable_trades = len([t for t in trades if t.profit_loss > 0])
    total_pnl = sum(t.profit_loss for t in trades)
    
    win_rate = (profitable_trades / total_trades * 100) if total_trades > 0 else 0
    
    return jsonify({
        'total_trades': total_trades,
        'profitable_trades': profitable_trades,
        'win_rate': round(win_rate, 2),
        'total_pnl': round(total_pnl, 2),
        'average_pnl': round(total_pnl / total_trades, 2) if total_trades > 0 else 0
    })

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Connected to trading platform'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 