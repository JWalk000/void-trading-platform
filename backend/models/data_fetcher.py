import yfinance as yf
import pandas as pd
import numpy as np
import requests
import json
from datetime import datetime, timedelta
import time
import random

class DataFetcher:
    def __init__(self):
        self.symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
        self.news_api_key = None  # Set your News API key here
        
    def get_market_data(self, symbol=None):
        """
        Fetch market data for specified symbol or default symbols
        """
        if symbol is None:
            symbol = random.choice(self.symbols)
        
        cache_key = f"market_data_{symbol}"
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration:
                return cached_data
        
        try:
            # Fetch data from Yahoo Finance
            ticker = yf.Ticker(symbol)
            
            # Get historical data
            hist_data = ticker.history(period='30d', interval='1h')
            
            if hist_data.empty:
                return None
            
            # Get current info
            info = ticker.info
            
            market_data = {
                'symbol': symbol,
                'price_data': hist_data,
                'current_price': hist_data['Close'].iloc[-1],
                'volume': hist_data['Volume'].iloc[-1],
                'high_24h': hist_data['High'].iloc[-1],
                'low_24h': hist_data['Low'].iloc[-1],
                'open': hist_data['Open'].iloc[-1],
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'beta': info.get('beta', 1.0),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Cache the data
            self.cache[cache_key] = (market_data, time.time())
            
            return market_data
            
        except Exception as e:
            print(f"Error fetching market data for {symbol}: {e}")
            return None
    
    def get_external_factors(self):
        """
        Fetch external factors that might influence trading decisions
        """
        external_factors = {}
        
        try:
            # Market sentiment (VIX-like volatility index)
            external_factors['vix'] = self._get_volatility_index()
            
            # News sentiment
            external_factors['news_sentiment'] = self._get_news_sentiment()
            
            # Market sentiment
            external_factors['market_sentiment'] = self._get_market_sentiment()
            
            # Economic indicators
            external_factors['interest_rate'] = self._get_interest_rate()
            external_factors['economic_indicator'] = self._get_economic_indicator()
            
            # Time-based factors
            now = datetime.now()
            external_factors['market_hours'] = 1 if 9 <= now.hour <= 16 else 0
            external_factors['weekend'] = 1 if now.weekday() >= 5 else 0
            
            return external_factors
            
        except Exception as e:
            print(f"Error fetching external factors: {e}")
            return {}
    
    def _get_volatility_index(self):
        """
        Get volatility index (simulated VIX)
        """
        try:
            # Fetch VIX data
            vix = yf.Ticker("^VIX")
            vix_data = vix.history(period='1d')
            
            if not vix_data.empty:
                return vix_data['Close'].iloc[-1]
            
            # Fallback to simulated volatility
            return random.uniform(15, 35)
            
        except Exception as e:
            print(f"Error fetching VIX: {e}")
            return random.uniform(15, 35)
    
    def _get_news_sentiment(self):
        """
        Get news sentiment score
        """
        if not self.news_api_key:
            # Simulate news sentiment
            return random.uniform(-1, 1)
        
        try:
            # Fetch news from News API
            url = f"https://newsapi.org/v2/everything"
            params = {
                'q': 'stock market OR trading OR finance',
                'apiKey': self.news_api_key,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 10
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                news_data = response.json()
                
                # Simple sentiment analysis (in real implementation, use proper NLP)
                positive_words = ['bull', 'gain', 'rise', 'positive', 'growth', 'profit']
                negative_words = ['bear', 'loss', 'fall', 'negative', 'decline', 'risk']
                
                sentiment_score = 0
                total_articles = len(news_data.get('articles', []))
                
                for article in news_data.get('articles', []):
                    title = article.get('title', '').lower()
                    content = article.get('description', '').lower()
                    text = title + ' ' + content
                    
                    positive_count = sum(1 for word in positive_words if word in text)
                    negative_count = sum(1 for word in negative_words if word in text)
                    
                    if positive_count > negative_count:
                        sentiment_score += 1
                    elif negative_count > positive_count:
                        sentiment_score -= 1
                
                return sentiment_score / total_articles if total_articles > 0 else 0
            
            return random.uniform(-1, 1)
            
        except Exception as e:
            print(f"Error fetching news sentiment: {e}")
            return random.uniform(-1, 1)
    
    def _get_market_sentiment(self):
        """
        Get overall market sentiment
        """
        try:
            # Calculate market sentiment based on multiple stocks
            sentiment_scores = []
            
            for symbol in self.symbols[:5]:  # Use first 5 symbols
                market_data = self.get_market_data(symbol)
                
                if market_data and 'price_data' in market_data:
                    df = market_data['price_data']
                    
                    # Calculate various sentiment indicators
                    price_change = (df['Close'].iloc[-1] - df['Close'].iloc[-5]) / df['Close'].iloc[-5]
                    volume_ratio = df['Volume'].iloc[-1] / df['Volume'].rolling(5).mean().iloc[-1]
                    
                    # Combine indicators
                    sentiment = (price_change * 0.7) + (min(volume_ratio - 1, 0.5) * 0.3)
                    sentiment_scores.append(sentiment)
            
            if sentiment_scores:
                return np.mean(sentiment_scores)
            
            return random.uniform(-1, 1)
            
        except Exception as e:
            print(f"Error calculating market sentiment: {e}")
            return random.uniform(-1, 1)
    
    def _get_interest_rate(self):
        """
        Get current interest rate (simulated)
        """
        # In a real implementation, fetch from Federal Reserve API
        return random.uniform(4.0, 6.0)
    
    def _get_economic_indicator(self):
        """
        Get economic indicator (simulated)
        """
        # In a real implementation, fetch GDP, unemployment, etc.
        return random.uniform(0.5, 1.5)
    
    def get_multiple_symbols_data(self, symbols=None):
        """
        Fetch market data for multiple symbols
        """
        if symbols is None:
            symbols = self.symbols
        
        market_data = {}
        
        for symbol in symbols:
            data = self.get_market_data(symbol)
            if data:
                market_data[symbol] = data
        
        return market_data
    
    def get_historical_data(self, symbol, period='1y', interval='1d'):
        """
        Fetch historical data for backtesting
        """
        try:
            ticker = yf.Ticker(symbol)
            hist_data = ticker.history(period=period, interval=interval)
            
            return {
                'symbol': symbol,
                'data': hist_data,
                'period': period,
                'interval': interval
            }
            
        except Exception as e:
            print(f"Error fetching historical data for {symbol}: {e}")
            return None
    
    def get_market_summary(self):
        """
        Get overall market summary
        """
        try:
            # Fetch data for major indices
            indices = {
                'S&P 500': '^GSPC',
                'NASDAQ': '^IXIC',
                'DOW': '^DJI'
            }
            
            summary = {}
            
            for name, symbol in indices.items():
                ticker = yf.Ticker(symbol)
                data = ticker.history(period='1d')
                
                if not data.empty:
                    summary[name] = {
                        'current': data['Close'].iloc[-1],
                        'change': data['Close'].iloc[-1] - data['Open'].iloc[-1],
                        'change_percent': ((data['Close'].iloc[-1] - data['Open'].iloc[-1]) / data['Open'].iloc[-1]) * 100
                    }
            
            return summary
            
        except Exception as e:
            print(f"Error fetching market summary: {e}")
            return {}
    
    def clear_cache(self):
        """
        Clear the data cache
        """
        self.cache = {}
    
    def set_news_api_key(self, api_key):
        """
        Set News API key for news sentiment analysis
        """
        self.news_api_key = api_key 