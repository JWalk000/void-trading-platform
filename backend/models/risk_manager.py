import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class RiskManager:
    def __init__(self):
        self.max_position_size = 0.1  # 10% of portfolio per trade
        self.max_daily_loss = 0.05    # 5% max daily loss
        self.max_portfolio_risk = 0.02  # 2% max portfolio risk per trade
        self.stop_loss_pct = 0.05     # 5% stop loss
        self.take_profit_pct = 0.10   # 10% take profit
        self.current_risk_level = 'LOW'
        self.daily_pnl = 0
        self.portfolio_value = 100000
        
    def assess_risk(self, market_data, ai_signal):
        """
        Assess risk for a potential trade
        """
        try:
            risk_assessment = {
                'risk_level': 'HIGH',
                'recommended_quantity': 0,
                'stop_loss': 0,
                'take_profit': 0,
                'max_loss': 0,
                'risk_score': 0,
                'warnings': []
            }
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(market_data, ai_signal)
            risk_assessment['risk_score'] = risk_score
            
            # Determine risk level
            if risk_score < 0.3:
                risk_assessment['risk_level'] = 'LOW'
            elif risk_score < 0.6:
                risk_assessment['risk_level'] = 'MEDIUM'
            else:
                risk_assessment['risk_level'] = 'HIGH'
            
            # Calculate position size
            if risk_assessment['risk_level'] != 'HIGH':
                recommended_quantity = self._calculate_position_size(
                    market_data, ai_signal, risk_assessment['risk_level']
                )
                risk_assessment['recommended_quantity'] = recommended_quantity
                
                # Calculate stop loss and take profit
                current_price = market_data.get('current_price', 0)
                if current_price > 0:
                    risk_assessment['stop_loss'] = current_price * (1 - self.stop_loss_pct)
                    risk_assessment['take_profit'] = current_price * (1 + self.take_profit_pct)
                    risk_assessment['max_loss'] = recommended_quantity * current_price * self.stop_loss_pct
            else:
                risk_assessment['warnings'].append("Risk level too high for trading")
            
            # Check daily loss limit
            if self.daily_pnl < -(self.portfolio_value * self.max_daily_loss):
                risk_assessment['risk_level'] = 'HIGH'
                risk_assessment['recommended_quantity'] = 0
                risk_assessment['warnings'].append("Daily loss limit reached")
            
            # Update current risk level
            self.current_risk_level = risk_assessment['risk_level']
            
            return risk_assessment
            
        except Exception as e:
            print(f"Error in risk assessment: {e}")
            return {
                'risk_level': 'HIGH',
                'recommended_quantity': 0,
                'warnings': [f"Risk assessment error: {str(e)}"]
            }
    
    def _calculate_risk_score(self, market_data, ai_signal):
        """
        Calculate overall risk score (0-1, where 1 is highest risk)
        """
        risk_factors = []
        
        # Volatility risk
        if 'price_data' in market_data:
            df = market_data['price_data']
            volatility = df['Close'].rolling(20).std().iloc[-1] / df['Close'].iloc[-1]
            volatility_risk = min(volatility * 10, 1.0)  # Scale volatility to 0-1
            risk_factors.append(volatility_risk)
        
        # AI confidence risk (lower confidence = higher risk)
        ai_confidence = ai_signal.get('confidence', 0)
        confidence_risk = 1 - ai_confidence
        risk_factors.append(confidence_risk)
        
        # Market sentiment risk
        if 'market_sentiment' in market_data:
            sentiment = market_data.get('market_sentiment', 0)
            sentiment_risk = (1 - sentiment) / 2  # Convert -1 to 1 range to 0 to 1 risk
            risk_factors.append(sentiment_risk)
        
        # Volume risk (low volume = higher risk)
        if 'volume' in market_data and 'volume_ratio' in market_data:
            volume_ratio = market_data.get('volume_ratio', 1)
            volume_risk = max(0, 1 - volume_ratio)
            risk_factors.append(volume_risk)
        
        # Time-based risk
        now = datetime.now()
        if now.weekday() >= 5:  # Weekend
            time_risk = 0.5
        elif now.hour < 9 or now.hour > 16:  # Outside market hours
            time_risk = 0.3
        else:
            time_risk = 0.1
        risk_factors.append(time_risk)
        
        # Calculate weighted average risk score
        weights = [0.3, 0.3, 0.2, 0.1, 0.1]  # Adjust weights as needed
        risk_score = np.average(risk_factors[:len(weights)], weights=weights[:len(risk_factors)])
        
        return min(risk_score, 1.0)
    
    def _calculate_position_size(self, market_data, ai_signal, risk_level):
        """
        Calculate recommended position size based on risk level
        """
        current_price = market_data.get('current_price', 0)
        if current_price <= 0:
            return 0
        
        # Base position size as percentage of portfolio
        if risk_level == 'LOW':
            base_size_pct = self.max_position_size
        elif risk_level == 'MEDIUM':
            base_size_pct = self.max_position_size * 0.5
        else:
            base_size_pct = 0
        
        # Calculate position size in shares
        position_value = self.portfolio_value * base_size_pct
        position_size = position_value / current_price
        
        # Round down to whole shares
        return int(position_size)
    
    def update_daily_pnl(self, pnl):
        """
        Update daily profit/loss
        """
        self.daily_pnl += pnl
    
    def reset_daily_pnl(self):
        """
        Reset daily P&L (call at start of new trading day)
        """
        self.daily_pnl = 0
    
    def update_portfolio_value(self, new_value):
        """
        Update current portfolio value
        """
        self.portfolio_value = new_value
    
    def get_current_risk_level(self):
        """
        Get current risk level
        """
        return self.current_risk_level
    
    def get_risk_limits(self):
        """
        Get current risk limits and settings
        """
        return {
            'max_position_size': self.max_position_size,
            'max_daily_loss': self.max_daily_loss,
            'max_portfolio_risk': self.max_portfolio_risk,
            'stop_loss_pct': self.stop_loss_pct,
            'take_profit_pct': self.take_profit_pct,
            'current_risk_level': self.current_risk_level,
            'daily_pnl': self.daily_pnl,
            'portfolio_value': self.portfolio_value
        }
    
    def set_risk_parameters(self, **kwargs):
        """
        Update risk management parameters
        """
        if 'max_position_size' in kwargs:
            self.max_position_size = kwargs['max_position_size']
        if 'max_daily_loss' in kwargs:
            self.max_daily_loss = kwargs['max_daily_loss']
        if 'max_portfolio_risk' in kwargs:
            self.max_portfolio_risk = kwargs['max_portfolio_risk']
        if 'stop_loss_pct' in kwargs:
            self.stop_loss_pct = kwargs['stop_loss_pct']
        if 'take_profit_pct' in kwargs:
            self.take_profit_pct = kwargs['take_profit_pct']
    
    def check_portfolio_risk(self, new_trade_value):
        """
        Check if new trade would exceed portfolio risk limits
        """
        total_risk = new_trade_value / self.portfolio_value
        
        if total_risk > self.max_portfolio_risk:
            return False, f"Trade would exceed {self.max_portfolio_risk*100}% portfolio risk limit"
        
        return True, "Trade within risk limits"
    
    def calculate_var(self, portfolio_positions, confidence_level=0.95):
        """
        Calculate Value at Risk (VaR) for current portfolio
        """
        try:
            if not portfolio_positions:
                return 0
            
            # Simulate portfolio returns
            returns = []
            for symbol, position in portfolio_positions.items():
                # This would need actual historical data for proper VaR calculation
                # For now, use simplified approach
                position_value = position['quantity'] * position['current_price']
                returns.append(position_value * 0.02)  # Assume 2% daily volatility
            
            if returns:
                var = np.percentile(returns, (1 - confidence_level) * 100)
                return abs(var)
            
            return 0
            
        except Exception as e:
            print(f"Error calculating VaR: {e}")
            return 0 