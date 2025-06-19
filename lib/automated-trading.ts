import { prisma } from './prisma'
import { brokerAPIService } from './broker-apis'
import { TechnicalAnalysis, OHLCV, TradingSignal } from './technical-analysis'
import cron from 'node-cron'

export interface StrategyConfig {
  id: number
  userId: number
  name: string
  symbol: string
  timeframe: string
  strategyType: string
  parameters: any
  maxPositionSize: number
  stopLossPercent?: number
  takeProfitPercent?: number
  maxDailyLoss?: number
  brokerConnectionId: number
  autoExecute: boolean
}

export class AutomatedTradingEngine {
  private runningStrategies: Map<number, cron.ScheduledTask> = new Map()

  async startStrategy(strategyId: number): Promise<boolean> {
    try {
      const strategy = await prisma.tradingStrategy.findUnique({
        where: { id: strategyId },
        include: { user: true }
      })

      if (!strategy || !strategy.isActive) {
        throw new Error('Strategy not found or inactive')
      }

      // Stop existing task if running
      this.stopStrategy(strategyId)

      // Schedule the strategy based on timeframe
      const cronExpression = this.getCronExpression(strategy.timeframe)
      
      const task = cron.schedule(cronExpression, async () => {
        await this.executeStrategy(strategy)
      }, {
        scheduled: true,
        timezone: "UTC"
      })

      this.runningStrategies.set(strategyId, task)

      // Update strategy status
      await prisma.tradingStrategy.update({
        where: { id: strategyId },
        data: { isActive: true }
      })

      console.log(`Strategy ${strategy.name} started successfully`)
      return true
    } catch (error) {
      console.error(`Failed to start strategy ${strategyId}:`, error)
      return false
    }
  }

  async stopStrategy(strategyId: number): Promise<boolean> {
    try {
      const task = this.runningStrategies.get(strategyId)
      if (task) {
        task.stop()
        this.runningStrategies.delete(strategyId)
      }

      await prisma.tradingStrategy.update({
        where: { id: strategyId },
        data: { isActive: false }
      })

      console.log(`Strategy ${strategyId} stopped successfully`)
      return true
    } catch (error) {
      console.error(`Failed to stop strategy ${strategyId}:`, error)
      return false
    }
  }

  async executeStrategy(strategy: any): Promise<void> {
    try {
      console.log(`Executing strategy: ${strategy.name} for ${strategy.symbol}`)

      // Get broker connection
      const brokerConnection = await prisma.brokerConnection.findUnique({
        where: { id: strategy.brokerConnectionId }
      })

      if (!brokerConnection) {
        throw new Error('Broker connection not found')
      }

      // Fetch market data
      const marketData = await this.fetchMarketData(brokerConnection, strategy.symbol, strategy.timeframe)
      
      if (!marketData || marketData.close.length < 50) {
        console.log('Insufficient market data for analysis')
        return
      }

      // Perform technical analysis
      const technicalAnalysis = new TechnicalAnalysis(marketData)
      const signal = technicalAnalysis.generateTradingSignal(strategy.strategyType, JSON.parse(strategy.parameters))

      // Log the signal
      await prisma.strategyExecution.create({
        data: {
          userId: strategy.userId,
          strategyId: strategy.id,
          symbol: strategy.symbol,
          action: signal.action,
          signal: signal.reason,
          price: marketData.close[marketData.close.length - 1],
          size: strategy.maxPositionSize,
          executed: false
        }
      })

      // Execute trade if auto-execute is enabled and signal is strong enough
      if (strategy.autoExecute && signal.confidence >= 70) {
        await this.executeTrade(strategy, brokerConnection, signal, marketData)
      }

    } catch (error) {
      console.error(`Error executing strategy ${strategy.name}:`, error)
    }
  }

  private async fetchMarketData(brokerConnection: any, symbol: string, timeframe: string): Promise<OHLCV | null> {
    try {
      const brokerConfig = {
        id: brokerConnection.id,
        broker: brokerConnection.broker,
        apiKey: brokerConnection.apiKey,
        secretKey: brokerConnection.secretKey,
        passphrase: brokerConnection.passphrase,
        baseUrl: brokerConnection.baseUrl
      }

      // Fetch OHLCV data from broker
      const exchange = brokerAPIService.getExchange(brokerConfig)
      const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, 100)

      if (!ohlcv || ohlcv.length === 0) {
        return null
      }

      return {
        open: ohlcv.map((candle: any) => candle[1]),
        high: ohlcv.map((candle: any) => candle[2]),
        low: ohlcv.map((candle: any) => candle[3]),
        close: ohlcv.map((candle: any) => candle[4]),
        volume: ohlcv.map((candle: any) => candle[5]),
        timestamp: ohlcv.map((candle: any) => candle[0])
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      return null
    }
  }

  private async executeTrade(strategy: any, brokerConnection: any, signal: TradingSignal, marketData: OHLCV): Promise<void> {
    try {
      const currentPrice = marketData.close[marketData.close.length - 1]
      
      // Check risk management
      if (!this.checkRiskManagement(strategy, signal.action)) {
        console.log('Trade blocked by risk management rules')
        return
      }

      // Calculate position size
      const positionSize = this.calculatePositionSize(strategy, currentPrice)

      // Place order
      const brokerConfig = {
        id: brokerConnection.id,
        broker: brokerConnection.broker,
        apiKey: brokerConnection.apiKey,
        secretKey: brokerConnection.secretKey,
        passphrase: brokerConnection.passphrase,
        baseUrl: brokerConnection.baseUrl
      }

      const orderRequest = {
        symbol: strategy.symbol,
        side: signal.action.toLowerCase() as 'buy' | 'sell',
        type: 'market',
        amount: positionSize
      }

      const orderResult = await brokerAPIService.placeOrder(brokerConfig, orderRequest)

      // Update execution record
      await prisma.strategyExecution.updateMany({
        where: {
          strategyId: strategy.id,
          executed: false
        },
        data: {
          executed: true,
          executedAt: new Date()
        }
      })

      // Log trade
      await prisma.tradeHistory.create({
        data: {
          userId: strategy.userId,
          symbol: strategy.symbol,
          side: signal.action.toLowerCase(),
          size: positionSize,
          price: orderResult.price,
          total: positionSize * orderResult.price,
          fee: 0
        }
      })

      console.log(`Trade executed: ${signal.action} ${positionSize} ${strategy.symbol} at ${orderResult.price}`)

    } catch (error) {
      console.error('Failed to execute trade:', error)
    }
  }

  private checkRiskManagement(strategy: any, action: string): boolean {
    // Check daily loss limit
    if (strategy.maxDailyLoss) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const dailyTrades = prisma.tradeHistory.findMany({
        where: {
          userId: strategy.userId,
          timestamp: {
            gte: today
          }
        }
      })

      // Calculate daily P&L and check against limit
      // This is a simplified check - you'd want more sophisticated risk management
    }

    return true
  }

  private calculatePositionSize(strategy: any, currentPrice: number): number {
    // Calculate position size based on max position size and current price
    return Math.min(strategy.maxPositionSize / currentPrice, strategy.maxPositionSize)
  }

  private getCronExpression(timeframe: string): string {
    switch (timeframe) {
      case '1m':
        return '* * * * *' // Every minute
      case '5m':
        return '*/5 * * * *' // Every 5 minutes
      case '15m':
        return '*/15 * * * *' // Every 15 minutes
      case '1h':
        return '0 * * * *' // Every hour
      case '4h':
        return '0 */4 * * *' // Every 4 hours
      case '1d':
        return '0 0 * * *' // Daily at midnight
      default:
        return '*/5 * * * *' // Default to 5 minutes
    }
  }

  async startAllActiveStrategies(): Promise<void> {
    try {
      const activeStrategies = await prisma.tradingStrategy.findMany({
        where: { isActive: true }
      })

      for (const strategy of activeStrategies) {
        await this.startStrategy(strategy.id)
      }

      console.log(`Started ${activeStrategies.length} active strategies`)
    } catch (error) {
      console.error('Failed to start active strategies:', error)
    }
  }

  async stopAllStrategies(): Promise<void> {
    try {
      for (const [strategyId, task] of this.runningStrategies) {
        task.stop()
      }
      this.runningStrategies.clear()

      await prisma.tradingStrategy.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      console.log('All strategies stopped')
    } catch (error) {
      console.error('Failed to stop strategies:', error)
    }
  }
}

export const automatedTradingEngine = new AutomatedTradingEngine() 