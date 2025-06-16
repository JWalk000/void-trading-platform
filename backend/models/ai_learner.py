import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import json
import os
from datetime import datetime, timedelta
import yfinance as yf
import ta

class AILearner:
    def __init__(self):
        self.model_path = 'ml_models/trading_model.pkl'
        self.scaler_path = 'ml_models/scaler.pkl'
        self.model = None
        self.scaler = None
        self.training_data = []
        self.performance_history = []
        self.confidence_threshold = 0.7
        
        # Create models directory if it doesn't exist
        os.makedirs('ml_models', exist_ok=True)
        
        # Load existing model if available
        self._load_model()
        
        # Initialize with default model if none exists
        if self.model is None:
            self._initialize_model()
    
    def _initialize_model(self):
        """
        Initialize a new machine learning model
        """
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.scaler = StandardScaler()
        
    def _load_model(self):
        """
        Load existing trained model
        """
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
        except Exception as e:
            print(f"Error loading model: {e}")
    
    def _save_model(self):
        """
        Save the trained model
        """
        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def extract_features(self, market_data, external_factors):
        """
        Extract features from market data and external factors
        """
        features = {}
        
        # Technical indicators
        if 'price_data' in market_data:
            df = market_data['price_data']
            
            # Price-based features
            features['price'] = df['Close'].iloc[-1]
            features['price_change'] = (df['Close'].iloc[-1] - df['Close'].iloc[-2]) / df['Close'].iloc[-2]
            features['price_volatility'] = df['Close'].rolling(20).std().iloc[-1]
            
            # Volume features
            features['volume'] = df['Volume'].iloc[-1]
            features['volume_ratio'] = df['Volume'].iloc[-1] / df['Volume'].rolling(20).mean().iloc[-1]
            
            # Technical indicators
            features['rsi'] = ta.momentum.RSIIndicator(df['Close']).rsi().iloc[-1]
            features['macd'] = ta.trend.MACD(df['Close']).macd().iloc[-1]
            features['macd_signal'] = ta.trend.MACD(df['Close']).macd_signal().iloc[-1]
            features['bb_upper'] = ta.volatility.BollingerBands(df['Close']).bollinger_hband().iloc[-1]
            features['bb_lower'] = ta.volatility.BollingerBands(df['Close']).bollinger_lband().iloc[-1]
            features['bb_position'] = (df['Close'].iloc[-1] - features['bb_lower']) / (features['bb_upper'] - features['bb_lower'])
            
            # Moving averages
            features['sma_20'] = ta.trend.SMAIndicator(df['Close'], window=20).sma_indicator().iloc[-1]
            features['sma_50'] = ta.trend.SMAIndicator(df['Close'], window=50).sma_indicator().iloc[-1]
            features['ema_12'] = ta.trend.EMAIndicator(df['Close'], window=12).ema_indicator().iloc[-1]
            features['ema_26'] = ta.trend.EMAIndicator(df['Close'], window=26).ema_indicator().iloc[-1]
            
            # Trend features
            features['trend_20'] = 1 if df['Close'].iloc[-1] > features['sma_20'] else 0
            features['trend_50'] = 1 if df['Close'].iloc[-1] > features['sma_50'] else 0
            features['ema_cross'] = 1 if features['ema_12'] > features['ema_26'] else 0
        
        # External factors
        if external_factors:
            features['news_sentiment'] = external_factors.get('news_sentiment', 0)
            features['market_sentiment'] = external_factors.get('market_sentiment', 0)
            features['volatility_index'] = external_factors.get('vix', 20)
            features['interest_rate'] = external_factors.get('interest_rate', 0)
            features['economic_indicator'] = external_factors.get('economic_indicator', 0)
        
        # Time-based features
        now = datetime.now()
        features['hour'] = now.hour
        features['day_of_week'] = now.weekday()
        features['month'] = now.month
        
        return features
    
    def analyze(self, market_data, external_factors):
        """
        Analyze market data and external factors to generate trading signals
        """
        try:
            # Extract features
            features = self.extract_features(market_data, external_factors)
            
            if not features:
                return {
                    'should_trade': False,
                    'confidence': 0,
                    'reason': 'No features available'
                }
            
            # Convert features to array
            feature_values = list(features.values())
            feature_array = np.array(feature_values).reshape(1, -1)
            
            # Scale features
            if self.scaler:
                feature_array = self.scaler.transform(feature_array)
            
            # Make prediction
            if self.model:
                prediction = self.model.predict(feature_array)[0]
                confidence = self.model.predict_proba(feature_array)[0].max()
                
                # Determine trading signal
                should_trade = prediction == 1 and confidence > self.confidence_threshold
                
                # Determine trade direction based on technical indicators
                side = self._determine_trade_side(features)
                
                return {
                    'should_trade': should_trade,
                    'confidence': round(confidence, 3),
                    'side': side,
                    'symbol': market_data.get('symbol', 'AAPL'),
                    'features': features,
                    'reason': f"AI confidence: {confidence:.3f}"
                }
            else:
                return {
                    'should_trade': False,
                    'confidence': 0,
                    'reason': 'Model not trained'
                }
                
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            return {
                'should_trade': False,
                'confidence': 0,
                'reason': f'Analysis error: {str(e)}'
            }
    
    def _determine_trade_side(self, features):
        """
        Determine whether to buy or sell based on features
        """
        buy_signals = 0
        sell_signals = 0
        
        # RSI signals
        if features.get('rsi', 50) < 30:
            buy_signals += 1
        elif features.get('rsi', 50) > 70:
            sell_signals += 1
        
        # MACD signals
        if features.get('macd', 0) > features.get('macd_signal', 0):
            buy_signals += 1
        else:
            sell_signals += 1
        
        # Bollinger Bands signals
        if features.get('bb_position', 0.5) < 0.2:
            buy_signals += 1
        elif features.get('bb_position', 0.5) > 0.8:
            sell_signals += 1
        
        # Moving average signals
        if features.get('trend_20', 0) == 1 and features.get('trend_50', 0) == 1:
            buy_signals += 1
        elif features.get('trend_20', 0) == 0 and features.get('trend_50', 0) == 0:
            sell_signals += 1
        
        # Return decision
        if buy_signals > sell_signals:
            return 'BUY'
        elif sell_signals > buy_signals:
            return 'SELL'
        else:
            return 'HOLD'
    
    def update_model(self, market_data, external_factors, trade_outcome=None):
        """
        Update the model with new data and trade outcomes
        """
        try:
            features = self.extract_features(market_data, external_factors)
            
            if not features:
                return
            
            training_sample = {
                'features': features,
                'timestamp': datetime.utcnow().isoformat(),
                'outcome': trade_outcome
            }
            
            self.training_data.append(training_sample)
            
            # Retrain model periodically
            if len(self.training_data) % 50 == 0:
                self._retrain_model()
                
        except Exception as e:
            print(f"Error updating model: {e}")
    
    def _retrain_model(self):
        """
        Retrain the model with accumulated data
        """
        try:
            if len(self.training_data) < 100:
                return
            
            X = []
            y = []
            
            for sample in self.training_data:
                if sample['outcome'] is not None:
                    X.append(list(sample['features'].values()))
                    y.append(1 if sample['outcome'] == 'PROFIT' else 0)
            
            if len(X) < 50:
                return
            
            X = np.array(X)
            y = np.array(y)
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            self.model.fit(X_train_scaled, y_train)
            
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            
            performance = {
                'timestamp': datetime.utcnow().isoformat(),
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'training_samples': len(X)
            }
            
            self.performance_history.append(performance)
            self._save_model()
            
            print(f"Model retrained - Accuracy: {accuracy:.3f}")
            
        except Exception as e:
            print(f"Error retraining model: {e}")
    
    def get_insights(self):
        """
        Get AI insights and recommendations
        """
        return {
            'model_performance': self._get_model_performance(),
            'feature_importance': self._get_feature_importance(),
            'confidence_trend': self._get_confidence_trend(),
            'recommendations': self._generate_recommendations()
        }
    
    def _get_model_performance(self):
        """
        Get current model performance metrics
        """
        if not self.performance_history:
            return {'status': 'No performance data available'}
        
        latest = self.performance_history[-1]
        return {
            'accuracy': round(latest['accuracy'], 3),
            'precision': round(latest['precision'], 3),
            'recall': round(latest['recall'], 3),
            'training_samples': latest['training_samples'],
            'last_updated': latest['timestamp']
        }
    
    def _get_feature_importance(self):
        """
        Get feature importance from the model
        """
        if not self.model or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        feature_names = list(self.extract_features({}, {}).keys())
        importances = self.model.feature_importances_
        
        feature_importance = list(zip(feature_names, importances))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return {name: round(importance, 4) for name, importance in feature_importance[:10]}
    
    def _get_confidence_trend(self):
        """
        Get confidence trend over time
        """
        if len(self.performance_history) < 2:
            return {'trend': 'Insufficient data'}
        
        recent_accuracies = [p['accuracy'] for p in self.performance_history[-5:]]
        
        if len(recent_accuracies) >= 2:
            trend = 'improving' if recent_accuracies[-1] > recent_accuracies[0] else 'declining'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'current_accuracy': round(recent_accuracies[-1], 3),
            'average_accuracy': round(np.mean(recent_accuracies), 3)
        }
    
    def _generate_recommendations(self):
        """
        Generate trading recommendations based on model insights
        """
        recommendations = []
        
        performance = self._get_model_performance()
        
        if 'accuracy' in performance:
            if performance['accuracy'] < 0.6:
                recommendations.append("Model accuracy is low. Consider collecting more training data.")
            
            if performance['accuracy'] > 0.8:
                recommendations.append("Model is performing well. Consider increasing position sizes.")
        
        if len(self.training_data) < 200:
            recommendations.append("More training data needed for better predictions.")
        
        if not recommendations:
            recommendations.append("Model is performing adequately. Continue monitoring.")
        
        return recommendations
    
    def get_status(self):
        """
        Get current AI model status
        """
        return {
            'model_loaded': self.model is not None,
            'training_samples': len(self.training_data),
            'performance_history': len(self.performance_history),
            'confidence_threshold': self.confidence_threshold,
            'last_performance': self._get_model_performance()
        } 