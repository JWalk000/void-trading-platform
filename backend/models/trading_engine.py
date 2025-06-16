import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import random

class TradingEngine:
    def __init__(self):
        self.simulation_mode = True  # Set to False for real trading
        self.portfolio = {
            'cash': 100000,  # Starting cash
            'positions': {},
            'total_value': 100000
        }
        self.trade_history = []
        
    def execute_trade(self, symbol, side, quantity, strategy):
        """
        Execute a trade (simulated or real)
        """
        try:
            if self.simulation_mode:
                return self._simulate_trade(symbol, side, quantity, strategy)
            else:
                return self._real_trade(symbol, side, quantity, strategy)
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _simulate_trade(self, symbol, side, quantity, strategy):
        """
        Simulate a trade execution
        """
        # Get current market price
        current_price = self._get_current_price(symbol)
        
        if current_price is None:
            return {
                'success': False,
                'error': 'Unable to get current price'
            }
        
        # Calculate trade value
        trade_value = current_price * quantity
        
        # Check if we have enough cash for buy orders
        if side == 'BUY' and trade_value > self.portfolio['cash']:
            return {
                'success': False,
                'error': 'Insufficient funds'
            }
        
        # Check if we have enough shares for sell orders
        if side == 'SELL' and symbol not in self.portfolio['positions']:
            return {
                'success': False,
                'error': 'No position to sell'
            }
        
        if side == 'SELL' and self.portfolio['positions'][symbol] < quantity:
            return {
                'success': False,
                'error': 'Insufficient shares to sell'
            }
        
        # Execute the trade
        if side == 'BUY':
            self.portfolio['cash'] -= trade_value
            if symbol in self.portfolio['positions']:
                self.portfolio['positions'][symbol] += quantity
            else:
                self.portfolio['positions'][symbol] = quantity
        else:  # SELL
            self.portfolio['cash'] += trade_value
            self.portfolio['positions'][symbol] -= quantity
            if self.portfolio['positions'][symbol] <= 0:
                del self.portfolio['positions'][symbol]
        
        # Update total portfolio value
        self._update_portfolio_value()
        
        # Record the trade
        trade_record = {
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'price': current_price,
            'value': trade_value,
            'strategy': strategy,
            'timestamp': datetime.utcnow().isoformat(),
            'success': True
        }
        
        self.trade_history.append(trade_record)
        
        return trade_record
    
    def _real_trade(self, symbol, side, quantity, strategy):
        """
        Execute a real trade (placeholder for actual implementation)
        """
        # This would integrate with a real broker API
        # For now, return simulation
        return self._simulate_trade(symbol, side, quantity, strategy)
    
    def _get_current_price(self, symbol):
        """
        Get current market price for a symbol
        """
        try:
            ticker = yf.Ticker(symbol)
            current_data = ticker.history(period='1d')
            if not current_data.empty:
                return current_data['Close'].iloc[-1]
            return None
        except Exception as e:
            print(f"Error getting price for {symbol}: {e}")
            return None
    
    def _update_portfolio_value(self):
        """
        Update total portfolio value
        """
        total_value = self.portfolio['cash']
        
        for symbol, quantity in self.portfolio['positions'].items():
            current_price = self._get_current_price(symbol)
            if current_price:
                total_value += current_price * quantity
        
        self.portfolio['total_value'] = total_value
    
    def get_portfolio_status(self):
        """
        Get current portfolio status
        """
        self._update_portfolio_value()
        return {
            'cash': round(self.portfolio['cash'], 2),
            'positions': self.portfolio['positions'],
            'total_value': round(self.portfolio['total_value'], 2),
            'total_return': round(self.portfolio['total_value'] - 100000, 2),
            'return_percentage': round(((self.portfolio['total_value'] - 100000) / 100000) * 100, 2)
        }
    
    def get_trade_history(self, limit=50):
        """
        Get recent trade history
        """
        return self.trade_history[-limit:] if self.trade_history else []
    
    def calculate_pnl(self, trade_id):
        """
        Calculate profit/loss for a specific trade
        """
        if trade_id >= len(self.trade_history):
            return None
        
        trade = self.trade_history[trade_id]
        current_price = self._get_current_price(trade['symbol'])
        
        if current_price is None:
            return None
        
        if trade['side'] == 'BUY':
            # For buy trades, calculate unrealized P&L
            pnl = (current_price - trade['price']) * trade['quantity']
        else:
            # For sell trades, P&L is already realized
            pnl = (trade['price'] - trade['price']) * trade['quantity']  # This would need historical buy price
        
        return round(pnl, 2) 