import { PrismaClient } from '@prisma/client';

export interface TradeLockerConfig {
  apiKey: string;
  secretKey: string;
  accountId: string;
  baseUrl: string;
  environment: 'demo' | 'live';
}

export interface TradeLockerOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface TradeLockerPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
}

export interface TradeLockerBalance {
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
}

export class TradeLockerAPI {
  private config: TradeLockerConfig;
  private prisma: PrismaClient;
  private baseUrl: string;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 100; // 100ms between requests

  constructor(config: TradeLockerConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.baseUrl = config.baseUrl || 'https://api.tradelocker.com';
  }

  /**
   * Rate limiting helper
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Enhanced error handling for bot trading
   */
  private async handleBotTradingError(error: any, operation: string): Promise<never> {
    console.error(`TradeLocker Bot Error (${operation}):`, error);
    
    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      throw new Error(`Rate limit exceeded. Please wait before retrying.`);
    }
    
    if (error.message?.includes('insufficient margin')) {
      throw new Error(`Insufficient margin for trade. Check account balance.`);
    }
    
    if (error.message?.includes('market closed')) {
      throw new Error(`Market is closed. Trading not available at this time.`);
    }
    
    if (error.message?.includes('invalid symbol')) {
      throw new Error(`Invalid trading symbol. Please check symbol format.`);
    }
    
    throw new Error(`TradeLocker ${operation} failed: ${error.message}`);
  }

  /**
   * Test connection to TradeLocker
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/v1/accounts');
      return response.success === true;
    } catch (error) {
      console.error('TradeLocker connection test failed:', error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<TradeLockerBalance[]> {
    try {
      const response = await this.makeRequest('GET', `/v1/accounts/${this.config.accountId}/balance`);
      
      if (response.success) {
        return response.data.map((balance: any) => ({
          currency: balance.currency,
          balance: parseFloat(balance.balance),
          equity: parseFloat(balance.equity),
          margin: parseFloat(balance.margin),
          freeMargin: parseFloat(balance.freeMargin),
          marginLevel: parseFloat(balance.marginLevel)
        }));
      }
      
      throw new Error('Failed to fetch balance');
    } catch (error) {
      console.error('Error fetching TradeLocker balance:', error);
      throw error;
    }
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      await this.rateLimit();
      
      const response = await this.makeRequest('GET', `/v1/quotes/${symbol}`);
      
      if (response.success) {
        return parseFloat(response.data.bid);
      }
      
      throw new Error('Failed to fetch price');
    } catch (error) {
      console.error('Error fetching TradeLocker price:', error);
      throw error;
    }
  }

  /**
   * Get historical data
   */
  async getHistoricalData(symbol: string, timeframe: string, limit: number = 100): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', `/v1/charts/${symbol}`, {
        timeframe,
        limit
      });
      
      if (response.success) {
        return response.data.map((candle: any) => ({
          timestamp: new Date(candle.timestamp),
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close),
          volume: parseFloat(candle.volume)
        }));
      }
      
      throw new Error('Failed to fetch historical data');
    } catch (error) {
      console.error('Error fetching TradeLocker historical data:', error);
      throw error;
    }
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(order: TradeLockerOrder): Promise<any> {
    try {
      const orderData = {
        symbol: order.symbol,
        side: order.side,
        type: 'market',
        quantity: order.quantity,
        timeInForce: order.timeInForce || 'GTC'
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        // If stop loss and take profit are specified, add them
        if (order.stopLoss || order.takeProfit) {
          await this.addStopLossTakeProfit(response.data.orderId, order);
        }
        
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          filledQuantity: response.data.filledQuantity,
          averagePrice: response.data.averagePrice
        };
      }
      
      throw new Error('Failed to place order');
    } catch (error) {
      console.error('Error placing TradeLocker order:', error);
      throw error;
    }
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(order: TradeLockerOrder): Promise<any> {
    try {
      if (!order.price) {
        throw new Error('Price is required for limit orders');
      }

      const orderData = {
        symbol: order.symbol,
        side: order.side,
        type: 'limit',
        quantity: order.quantity,
        price: order.price,
        timeInForce: order.timeInForce || 'GTC'
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        // If stop loss and take profit are specified, add them
        if (order.stopLoss || order.takeProfit) {
          await this.addStopLossTakeProfit(response.data.orderId, order);
        }
        
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status
        };
      }
      
      throw new Error('Failed to place limit order');
    } catch (error) {
      console.error('Error placing TradeLocker limit order:', error);
      throw error;
    }
  }

  /**
   * Add stop loss and take profit to an existing position
   */
  private async addStopLossTakeProfit(orderId: string, order: TradeLockerOrder): Promise<void> {
    try {
      if (order.stopLoss) {
        await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/positions/${orderId}/stop-loss`, {
          price: order.stopLoss
        });
      }

      if (order.takeProfit) {
        await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/positions/${orderId}/take-profit`, {
          price: order.takeProfit
        });
      }
    } catch (error) {
      console.error('Error adding stop loss/take profit:', error);
    }
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    try {
      const positions = await this.getPositions();
      const position = positions.find(p => p.symbol === symbol);
      
      if (!position) {
        throw new Error('Position not found');
      }

      const closeQuantity = quantity || position.quantity;
      const side = position.side === 'long' ? 'sell' : 'buy';

      const orderData = {
        symbol: symbol,
        side: side,
        type: 'market',
        quantity: closeQuantity,
        timeInForce: 'IOC'
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          closedQuantity: closeQuantity
        };
      }
      
      throw new Error('Failed to close position');
    } catch (error) {
      console.error('Error closing TradeLocker position:', error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<TradeLockerPosition[]> {
    try {
      const response = await this.makeRequest('GET', `/v1/accounts/${this.config.accountId}/positions`);
      
      if (response.success) {
        return response.data.map((position: any) => ({
          id: position.id,
          symbol: position.symbol,
          side: position.side,
          quantity: parseFloat(position.quantity),
          entryPrice: parseFloat(position.entryPrice),
          currentPrice: parseFloat(position.currentPrice),
          unrealizedPnL: parseFloat(position.unrealizedPnL),
          stopLoss: position.stopLoss ? parseFloat(position.stopLoss) : undefined,
          takeProfit: position.takeProfit ? parseFloat(position.takeProfit) : undefined,
          timestamp: new Date(position.timestamp)
        }));
      }
      
      throw new Error('Failed to fetch positions');
    } catch (error) {
      console.error('Error fetching TradeLocker positions:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(symbol?: string, limit: number = 100): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      params.append('limit', limit.toString());

      const response = await this.makeRequest('GET', `/v1/accounts/${this.config.accountId}/orders?${params}`);
      
      if (response.success) {
        return response.data.map((order: any) => ({
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: parseFloat(order.quantity),
          price: parseFloat(order.price),
          status: order.status,
          filledQuantity: parseFloat(order.filledQuantity),
          averagePrice: parseFloat(order.averagePrice),
          timestamp: new Date(order.timestamp)
        }));
      }
      
      throw new Error('Failed to fetch order history');
    } catch (error) {
      console.error('Error fetching TradeLocker order history:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await this.makeRequest('DELETE', `/v1/accounts/${this.config.accountId}/orders/${orderId}`);
      
      if (response.success) {
        return {
          success: true,
          orderId: orderId,
          status: 'cancelled'
        };
      }
      
      throw new Error('Failed to cancel order');
    } catch (error) {
      console.error('Error cancelling TradeLocker order:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to TradeLocker API
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Date.now().toString();
    
    // Create signature for authentication
    const signature = this.createSignature(method, endpoint, timestamp, data);
    
    const headers: any = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-Timestamp': timestamp,
      'X-Signature': signature
    };

    const requestOptions: any = {
      method,
      headers
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`TradeLocker API error: ${result.message || response.statusText}`);
    }

    return result;
  }

  /**
   * Create signature for API authentication
   */
  private createSignature(method: string, endpoint: string, timestamp: string, data?: any): string {
    const message = `${method}${endpoint}${timestamp}${data ? JSON.stringify(data) : ''}`;
    
    // Use crypto-js or similar library for HMAC-SHA256
    // For now, we'll use a simple hash (you should implement proper HMAC)
    const crypto = require('crypto');
    return crypto.createHmac('sha256', this.config.secretKey).update(message).digest('hex');
  }

  /**
   * Save broker configuration to database
   */
  async saveConfig(): Promise<void> {
    try {
      await this.prisma.brokerConfig.upsert({
        where: { broker: 'tradelocker' },
        update: {
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          accountId: this.config.accountId,
          baseUrl: this.config.baseUrl,
          environment: this.config.environment
        },
        create: {
          broker: 'tradelocker',
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          accountId: this.config.accountId,
          baseUrl: this.config.baseUrl,
          environment: this.config.environment
        }
      });
    } catch (error) {
      console.error('Error saving TradeLocker config:', error);
      throw error;
    }
  }

  /**
   * Load broker configuration from database
   */
  async loadConfig(): Promise<TradeLockerConfig | null> {
    try {
      const config = await this.prisma.brokerConfig.findUnique({
        where: { broker: 'tradelocker' }
      });

      if (config) {
        this.config = {
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          accountId: config.accountId,
          baseUrl: config.baseUrl,
          environment: config.environment as 'demo' | 'live'
        };
        return this.config;
      }

      return null;
    } catch (error) {
      console.error('Error loading TradeLocker config:', error);
      return null;
    }
  }

  /**
   * Bot-optimized market order placement
   */
  async placeBotMarketOrder(order: TradeLockerOrder): Promise<any> {
    try {
      await this.rateLimit();
      
      const orderData = {
        symbol: order.symbol,
        side: order.side,
        type: 'market',
        quantity: order.quantity,
        timeInForce: order.timeInForce || 'IOC' // Immediate or Cancel for bots
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        // Log successful bot trade
        console.log(`Bot Trade Executed: ${order.side} ${order.quantity} ${order.symbol} at market`);
        
        // If stop loss and take profit are specified, add them
        if (order.stopLoss || order.takeProfit) {
          await this.addStopLossTakeProfit(response.data.orderId, order);
        }
        
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          filledQuantity: response.data.filledQuantity,
          averagePrice: response.data.averagePrice,
          timestamp: new Date()
        };
      }
      
      throw new Error('Failed to place bot order');
    } catch (error: any) {
      return this.handleBotTradingError(error, 'market order');
    }
  }

  /**
   * Bot-optimized limit order placement
   */
  async placeBotLimitOrder(order: TradeLockerOrder): Promise<any> {
    try {
      await this.rateLimit();
      
      if (!order.price) {
        throw new Error('Price is required for limit orders');
      }

      const orderData = {
        symbol: order.symbol,
        side: order.side,
        type: 'limit',
        quantity: order.quantity,
        price: order.price,
        timeInForce: order.timeInForce || 'GTC'
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        console.log(`Bot Limit Order Placed: ${order.side} ${order.quantity} ${order.symbol} at ${order.price}`);
        
        if (order.stopLoss || order.takeProfit) {
          await this.addStopLossTakeProfit(response.data.orderId, order);
        }
        
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          timestamp: new Date()
        };
      }
      
      throw new Error('Failed to place bot limit order');
    } catch (error: any) {
      return this.handleBotTradingError(error, 'limit order');
    }
  }

  /**
   * Bot-optimized position closing
   */
  async closeBotPosition(symbol: string, quantity?: number): Promise<any> {
    try {
      await this.rateLimit();
      
      const positions = await this.getPositions();
      const position = positions.find(p => p.symbol === symbol);
      
      if (!position) {
        throw new Error('Position not found for bot to close');
      }

      const closeQuantity = quantity || position.quantity;
      const side = position.side === 'long' ? 'sell' : 'buy';

      const orderData = {
        symbol: symbol,
        side: side,
        type: 'market',
        quantity: closeQuantity,
        timeInForce: 'IOC'
      };

      const response = await this.makeRequest('POST', `/v1/accounts/${this.config.accountId}/orders`, orderData);
      
      if (response.success) {
        console.log(`Bot Position Closed: ${closeQuantity} ${symbol}`);
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          closedQuantity: closeQuantity,
          timestamp: new Date()
        };
      }
      
      throw new Error('Failed to close bot position');
    } catch (error: any) {
      return this.handleBotTradingError(error, 'position close');
    }
  }

  /**
   * Get account balance for bot risk management
   */
  async getBotBalance(): Promise<TradeLockerBalance[]> {
    try {
      await this.rateLimit();
      
      const response = await this.makeRequest('GET', `/v1/accounts/${this.config.accountId}/balance`);
      
      if (response.success) {
        return response.data.map((balance: any) => ({
          currency: balance.currency,
          balance: parseFloat(balance.balance),
          equity: parseFloat(balance.equity),
          margin: parseFloat(balance.margin),
          freeMargin: parseFloat(balance.freeMargin),
          marginLevel: parseFloat(balance.marginLevel)
        }));
      }
      
      throw new Error('Failed to fetch bot balance');
    } catch (error: any) {
      return this.handleBotTradingError(error, 'balance fetch');
    }
  }

  /**
   * Check if bot can place trade (risk management)
   */
  async canBotTrade(symbol: string, quantity: number, side: 'buy' | 'sell'): Promise<boolean> {
    try {
      await this.rateLimit();
      
      // Get current balance
      const balance = await this.getBotBalance();
      const usdBalance = balance.find(b => b.currency === 'USD');
      
      if (!usdBalance) {
        console.error('Bot: No USD balance found');
        return false;
      }
      
      // Get current price
      const currentPrice = await this.getCurrentPrice(symbol);
      
      // Calculate required margin (assuming 1:100 leverage)
      const requiredMargin = (quantity * currentPrice) / 100;
      
      // Check if we have enough free margin
      if (usdBalance.freeMargin < requiredMargin) {
        console.error(`Bot: Insufficient margin. Required: ${requiredMargin}, Available: ${usdBalance.freeMargin}`);
        return false;
      }
      
      // Check margin level (should be above 200% for safety)
      if (usdBalance.marginLevel < 200) {
        console.error(`Bot: Margin level too low: ${usdBalance.marginLevel}%`);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Bot: Error checking trade feasibility:', error);
      return false;
    }
  }

  /**
   * Get positions for bot monitoring
   */
  async getBotPositions(): Promise<TradeLockerPosition[]> {
    try {
      await this.rateLimit();
      
      const response = await this.makeRequest('GET', `/v1/accounts/${this.config.accountId}/positions`);
      
      if (response.success) {
        return response.data.map((position: any) => ({
          id: position.id,
          symbol: position.symbol,
          side: position.side,
          quantity: parseFloat(position.quantity),
          entryPrice: parseFloat(position.entryPrice),
          currentPrice: parseFloat(position.currentPrice),
          unrealizedPnL: parseFloat(position.unrealizedPnL),
          stopLoss: position.stopLoss ? parseFloat(position.stopLoss) : undefined,
          takeProfit: position.takeProfit ? parseFloat(position.takeProfit) : undefined,
          timestamp: new Date(position.timestamp)
        }));
      }
      
      throw new Error('Failed to fetch bot positions');
    } catch (error: any) {
      return this.handleBotTradingError(error, 'positions fetch');
    }
  }
} 