import ccxt from 'ccxt'
import { prisma } from './prisma'

export interface BrokerConfig {
  id: number
  broker: string
  apiKey: string
  secretKey: string
  passphrase?: string
  baseUrl?: string
}

export interface OrderRequest {
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  amount: number
  price?: number
}

export interface Balance {
  currency: string
  free: number
  used: number
  total: number
}

export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  cost: number
  fee: number
  timestamp: number
}

class BrokerAPIService {
  private getExchange(brokerConfig: BrokerConfig) {
    const config: any = {
      apiKey: brokerConfig.apiKey,
      secret: brokerConfig.secretKey,
      enableRateLimit: true,
      options: {}
    }

    if (brokerConfig.baseUrl) {
      config.urls = { api: { rest: brokerConfig.baseUrl } }
    }

    switch (brokerConfig.broker.toLowerCase()) {
      case 'binance':
        return new ccxt.binance(config)
      case 'coinbase':
        return new ccxt.coinbase(config)
      case 'kraken':
        return new ccxt.kraken(config)
      case 'kucoin':
        return new ccxt.kucoin(config)
      case 'okx':
        return new ccxt.okx(config)
      default:
        throw new Error(`Unsupported broker: ${brokerConfig.broker}`)
    }
  }

  async testConnection(brokerConfig: BrokerConfig): Promise<boolean> {
    try {
      const exchange = this.getExchange(brokerConfig)
      await exchange.fetchBalance()
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  async getBalance(brokerConfig: BrokerConfig): Promise<Balance[]> {
    try {
      const exchange = this.getExchange(brokerConfig)
      const balance = await exchange.fetchBalance()
      
      return Object.entries(balance).map(([currency, data]: [string, any]) => ({
        currency,
        free: data.free || 0,
        used: data.used || 0,
        total: data.total || 0
      })).filter(b => b.total > 0)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      throw new Error('Failed to fetch account balance')
    }
  }

  async getTicker(brokerConfig: BrokerConfig, symbol: string) {
    try {
      const exchange = this.getExchange(brokerConfig)
      const ticker = await exchange.fetchTicker(symbol)
      
      return {
        symbol: ticker.symbol,
        price: ticker.last,
        change24h: ticker.change,
        changePercent24h: ticker.percentage,
        volume24h: ticker.baseVolume,
        high24h: ticker.high,
        low24h: ticker.low
      }
    } catch (error) {
      console.error('Failed to fetch ticker:', error)
      throw new Error('Failed to fetch price data')
    }
  }

  async placeOrder(brokerConfig: BrokerConfig, orderRequest: OrderRequest) {
    try {
      const exchange = this.getExchange(brokerConfig)
      
      const orderParams: any = {
        symbol: orderRequest.symbol,
        type: orderRequest.type,
        side: orderRequest.side,
        amount: orderRequest.amount
      }

      if (orderRequest.type === 'limit' && orderRequest.price) {
        orderParams.price = orderRequest.price
      }

      const order = await exchange.createOrder(
        orderParams.symbol,
        orderParams.type,
        orderParams.side,
        orderParams.amount,
        orderParams.price
      )

      return {
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        amount: order.amount,
        price: order.price,
        status: order.status,
        timestamp: order.timestamp
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      throw new Error('Failed to place order')
    }
  }

  async getOrderHistory(brokerConfig: BrokerConfig, symbol?: string, limit: number = 100): Promise<Trade[]> {
    try {
      const exchange = this.getExchange(brokerConfig)
      const trades = await exchange.fetchMyTrades(symbol, undefined, limit)
      
      return trades.map((trade: any) => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        amount: trade.amount,
        price: trade.price,
        cost: trade.cost,
        fee: trade.fee?.cost || 0,
        timestamp: trade.timestamp
      }))
    } catch (error) {
      console.error('Failed to fetch trade history:', error)
      throw new Error('Failed to fetch trade history')
    }
  }

  async getOpenOrders(brokerConfig: BrokerConfig, symbol?: string) {
    try {
      const exchange = this.getExchange(brokerConfig)
      const orders = await exchange.fetchOpenOrders(symbol)
      
      return orders.map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        amount: order.amount,
        price: order.price,
        filled: order.filled,
        remaining: order.remaining,
        status: order.status,
        timestamp: order.timestamp
      }))
    } catch (error) {
      console.error('Failed to fetch open orders:', error)
      throw new Error('Failed to fetch open orders')
    }
  }

  async cancelOrder(brokerConfig: BrokerConfig, orderId: string, symbol: string) {
    try {
      const exchange = this.getExchange(brokerConfig)
      const result = await exchange.cancelOrder(orderId, symbol)
      
      return {
        orderId: result.id,
        status: result.status,
        timestamp: result.timestamp
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      throw new Error('Failed to cancel order')
    }
  }

  async getMarkets(brokerConfig: BrokerConfig) {
    try {
      const exchange = this.getExchange(brokerConfig)
      const markets = await exchange.loadMarkets()
      
      return Object.values(markets).map((market: any) => ({
        symbol: market.symbol,
        base: market.base,
        quote: market.quote,
        active: market.active,
        precision: market.precision,
        limits: market.limits
      }))
    } catch (error) {
      console.error('Failed to fetch markets:', error)
      throw new Error('Failed to fetch markets')
    }
  }

  async getHistoricalData(brokerConfig: BrokerConfig, symbol: string, timeframe: string, limit: number = 100): Promise<any[]> {
    try {
      const exchange = this.getExchange(brokerConfig);
      const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
      return ohlcv.map((candle: any) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      throw new Error('Failed to fetch historical data');
    }
  }

  async getCurrentPrice(brokerConfig: BrokerConfig, symbol: string): Promise<number> {
    const ticker = await this.getTicker(brokerConfig, symbol);
    if (typeof ticker.price !== 'number') {
      throw new Error('Price data unavailable');
    }
    return ticker.price;
  }
}

export const brokerAPIService = new BrokerAPIService() 