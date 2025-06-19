import { BFITradingStrategy, BFISetup, BFIFootprint } from './bfi-trading-strategy';
import { brokerAPIService, BrokerConfig } from './broker-apis';
import { PrismaClient } from '@prisma/client';

interface BFITrade {
  id: string;
  setupId: string;
  instrument: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'open' | 'closed' | 'cancelled';
  pnl: number;
  entryTime: Date;
  exitTime?: Date;
  exitReason?: 'target_hit' | 'stop_loss' | 'manual';
}

interface BFIPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export class BFIAutomatedTrading {
  private bfiStrategy: BFITradingStrategy;
  private brokerAPIs: typeof brokerAPIService;
  private prisma: PrismaClient;
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private activeTrades: Map<string, BFITrade> = new Map();
  private instruments: string[] = [
    'BTC/USD', 'ETH/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD',
    'USD/CAD', 'USD/CHF', 'NZD/USD', 'XAU/USD', 'XAG/USD'
  ];
  private brokerConfig: BrokerConfig | null = null;

  constructor() {
    this.bfiStrategy = new BFITradingStrategy();
    this.brokerAPIs = brokerAPIService;
    this.prisma = new PrismaClient();
  }

  /**
   * Set broker configuration
   */
  setBrokerConfig(config: BrokerConfig): void {
    this.brokerConfig = config;
  }

  /**
   * Start the automated BFI trading system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('BFI Automated Trading is already running');
      return;
    }

    console.log('Starting BFI Automated Trading System...');
    this.isRunning = true;

    // Load existing active trades from database
    await this.loadActiveTrades();

    // Start monitoring interval (check every 5 minutes)
    this.monitoringInterval = setInterval(async () => {
      await this.monitoringCycle();
    }, 5 * 60 * 1000);

    // Initial monitoring cycle
    await this.monitoringCycle();

    console.log('BFI Automated Trading System started successfully');
  }

  /**
   * Stop the automated BFI trading system
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('BFI Automated Trading is not running');
      return;
    }

    console.log('Stopping BFI Automated Trading System...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('BFI Automated Trading System stopped');
  }

  /**
   * Main monitoring cycle - runs every 5 minutes
   */
  private async monitoringCycle(): Promise<void> {
    try {
      console.log('Starting BFI monitoring cycle...');

      // 1. Monitor existing trades
      await this.monitorActiveTrades();

      // 2. Scan for new setups
      await this.scanForNewSetups();

      // 3. Execute valid setups
      await this.executeValidSetups();

      console.log('BFI monitoring cycle completed');
    } catch (error) {
      console.error('Error in BFI monitoring cycle:', error);
    }
  }

  /**
   * Monitor active trades for exits
   */
  private async monitorActiveTrades(): Promise<void> {
    const tradeEntries = Array.from(this.activeTrades.entries());
    for (const [tradeId, trade] of tradeEntries) {
      try {
        const currentPrice = await this.brokerAPIs.getCurrentPrice(trade.instrument);
        
        // Check stop loss
        if (this.isStopLossHit(trade, currentPrice)) {
          await this.closeTrade(tradeId, 'stop_loss', currentPrice);
          continue;
        }

        // Check take profit
        if (this.isTakeProfitHit(trade, currentPrice)) {
          await this.closeTrade(tradeId, 'target_hit', currentPrice);
          continue;
        }

        // Update trade P&L
        trade.pnl = this.calculatePnL(trade, currentPrice);
        
        // Update trade in database
        await this.updateTradeInDatabase(trade);

      } catch (error) {
        console.error(`Error monitoring trade ${tradeId}:`, error);
      }
    }
  }

  /**
   * Scan all instruments for new BFI setups
   */
  private async scanForNewSetups(): Promise<void> {
    for (const instrument of this.instruments) {
      try {
        console.log(`Scanning ${instrument} for BFI setups...`);
        
        const setups = await this.bfiStrategy.findTradingSetups(instrument);
        
        // Filter out setups we already have active trades for
        const activeTradeValues = Array.from(this.activeTrades.values());
        const newSetups = setups.filter(setup => 
          !activeTradeValues.some(trade => 
            trade.setupId === setup.id
          )
        );

        console.log(`Found ${newSetups.length} new setups for ${instrument}`);

        // Store new setups for potential execution
        for (const setup of newSetups) {
          await this.storeSetup(setup);
        }

      } catch (error) {
        console.error(`Error scanning ${instrument}:`, error);
      }
    }
  }

  /**
   * Execute valid setups that meet criteria
   */
  private async executeValidSetups(): Promise<void> {
    try {
      // Get stored setups from database
      const storedSetups = await this.prisma.bFISetup.findMany({
        where: { status: 'waiting' },
        include: { footprint: true }
      });

      for (const storedSetup of storedSetups) {
        try {
          // Validate setup is still valid
          const isValid = await this.validateSetup(storedSetup);
          
          if (!isValid) {
            await this.markSetupInvalid(storedSetup.id);
            continue;
          }

          // Check if we should execute this setup
          const shouldExecute = await this.shouldExecuteSetup(storedSetup);
          
          if (shouldExecute) {
            await this.executeSetup(storedSetup);
          }

        } catch (error) {
          console.error(`Error processing setup ${storedSetup.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error executing valid setups:', error);
    }
  }

  /**
   * Validate if a stored setup is still valid
   */
  private async validateSetup(storedSetup: any): Promise<boolean> {
    try {
      const currentPrice = await this.brokerAPIs.getCurrentPrice(storedSetup.instrument);
      
      // Check if price is still in the entry range
      const range = storedSetup.footprint.range;
      return currentPrice >= range.floor && currentPrice <= range.base;
      
    } catch (error) {
      console.error('Error validating setup:', error);
      return false;
    }
  }

  /**
   * Determine if we should execute a setup
   */
  private async shouldExecuteSetup(storedSetup: any): Promise<boolean> {
    try {
      // Check account balance
      const balance = await this.brokerAPIs.getBalance();
      const requiredMargin = this.calculateRequiredMargin(storedSetup);
      
      if (balance < requiredMargin) {
        console.log(`Insufficient balance for setup ${storedSetup.id}`);
        return false;
      }

      // Check risk management rules
      const currentRisk = this.calculateCurrentRisk();
      const maxRisk = 0.02; // 2% max risk per trade
      
      if (currentRisk > maxRisk) {
        console.log(`Risk limit exceeded for setup ${storedSetup.id}`);
        return false;
      }

      // Check if we have too many active trades
      if (this.activeTrades.size >= 5) {
        console.log(`Too many active trades for setup ${storedSetup.id}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error checking setup execution criteria:', error);
      return false;
    }
  }

  /**
   * Execute a BFI setup
   */
  private async executeSetup(storedSetup: any): Promise<void> {
    try {
      console.log(`Executing BFI setup: ${storedSetup.id}`);

      const currentPrice = await this.brokerAPIs.getCurrentPrice(storedSetup.instrument);
      const positionSize = this.calculatePositionSize(storedSetup);

      // Place the order
      const order = await this.brokerAPIs.placeOrder({
        instrument: storedSetup.instrument,
        side: storedSetup.footprint.direction === 'bullish' ? 'buy' : 'sell',
        type: 'market',
        quantity: positionSize,
        stopLoss: storedSetup.stopLoss,
        takeProfit: storedSetup.targets[0]
      });

      if (order.success) {
        // Create trade record
        const trade: BFITrade = {
          id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          setupId: storedSetup.id,
          instrument: storedSetup.instrument,
          side: storedSetup.footprint.direction === 'bullish' ? 'buy' : 'sell',
          quantity: positionSize,
          entryPrice: currentPrice,
          stopLoss: storedSetup.stopLoss,
          takeProfit: storedSetup.targets[0],
          status: 'open',
          pnl: 0,
          entryTime: new Date()
        };

        // Store trade in memory and database
        this.activeTrades.set(trade.id, trade);
        await this.storeTrade(trade);

        // Mark setup as executed
        await this.markSetupExecuted(storedSetup.id);

        console.log(`BFI setup executed successfully: ${trade.id}`);

      } else {
        console.error(`Failed to execute BFI setup: ${storedSetup.id}`);
      }

    } catch (error) {
      console.error(`Error executing setup ${storedSetup.id}:`, error);
    }
  }

  /**
   * Calculate position size based on risk management
   */
  private calculatePositionSize(setup: any): number {
    const accountBalance = 10000; // This should come from broker API
    const riskPerTrade = 0.02; // 2% risk per trade
    const riskAmount = accountBalance * riskPerTrade;
    
    const entryPrice = setup.entryRange.midpoint;
    const stopLoss = setup.stopLoss;
    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    
    return riskAmount / riskPerUnit;
  }

  /**
   * Calculate required margin for a setup
   */
  private calculateRequiredMargin(setup: any): number {
    const positionSize = this.calculatePositionSize(setup);
    const entryPrice = setup.entryRange.midpoint;
    const leverage = 10; // Assuming 10:1 leverage
    
    return (positionSize * entryPrice) / leverage;
  }

  /**
   * Calculate current risk exposure
   */
  private calculateCurrentRisk(): number {
    let totalRisk = 0;
    
    const activeTradeValues = Array.from(this.activeTrades.values());
    for (const trade of activeTradeValues) {
      const riskAmount = Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity;
      totalRisk += riskAmount;
    }
    
    const accountBalance = 10000; // This should come from broker API
    return totalRisk / accountBalance;
  }

  /**
   * Check if stop loss is hit
   */
  private isStopLossHit(trade: BFITrade, currentPrice: number): boolean {
    if (trade.side === 'buy') {
      return currentPrice <= trade.stopLoss;
    } else {
      return currentPrice >= trade.stopLoss;
    }
  }

  /**
   * Check if take profit is hit
   */
  private isTakeProfitHit(trade: BFITrade, currentPrice: number): boolean {
    if (trade.side === 'buy') {
      return currentPrice >= trade.takeProfit;
    } else {
      return currentPrice <= trade.takeProfit;
    }
  }

  /**
   * Calculate P&L for a trade
   */
  private calculatePnL(trade: BFITrade, currentPrice: number): number {
    if (trade.side === 'buy') {
      return (currentPrice - trade.entryPrice) * trade.quantity;
    } else {
      return (trade.entryPrice - currentPrice) * trade.quantity;
    }
  }

  /**
   * Close a trade
   */
  private async closeTrade(tradeId: string, reason: 'target_hit' | 'stop_loss' | 'manual', exitPrice: number): Promise<void> {
    try {
      const trade = this.activeTrades.get(tradeId);
      if (!trade) return;

      console.log(`Closing trade ${tradeId} - ${reason}`);

      // Close position with broker
      await this.brokerAPIs.closePosition(trade.instrument);

      // Update trade record
      trade.status = 'closed';
      trade.exitTime = new Date();
      trade.exitReason = reason;
      trade.pnl = this.calculatePnL(trade, exitPrice);

      // Update database
      await this.updateTradeInDatabase(trade);

      // Remove from active trades
      this.activeTrades.delete(tradeId);

      console.log(`Trade ${tradeId} closed successfully. P&L: ${trade.pnl}`);

    } catch (error) {
      console.error(`Error closing trade ${tradeId}:`, error);
    }
  }

  /**
   * Load active trades from database
   */
  private async loadActiveTrades(): Promise<void> {
    try {
      const trades = await this.prisma.bFITrade.findMany({
        where: { status: 'open' }
      });

      for (const trade of trades) {
        this.activeTrades.set(trade.id, {
          id: trade.id,
          setupId: trade.setupId,
          instrument: trade.instrument,
          side: trade.side as 'buy' | 'sell',
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          status: trade.status as 'open' | 'closed' | 'cancelled',
          pnl: trade.pnl,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime || undefined,
          exitReason: trade.exitReason as 'target_hit' | 'stop_loss' | 'manual' || undefined
        });
      }

      console.log(`Loaded ${this.activeTrades.size} active trades`);
    } catch (error) {
      console.error('Error loading active trades:', error);
    }
  }

  /**
   * Store a setup in the database
   */
  private async storeSetup(setup: BFISetup): Promise<void> {
    try {
      await this.prisma.bFISetup.create({
        data: {
          id: setup.id,
          instrument: setup.instrument,
          monthlyBias: setup.monthlyBias,
          weeklyBias: setup.weeklyBias,
          riskRewardRatio: setup.riskRewardRatio,
          stopLoss: setup.stopLoss,
          targets: setup.targets,
          status: setup.status,
          footprint: {
            create: {
              id: setup.footprint.id,
              instrument: setup.footprint.instrument,
              timeframe: setup.footprint.timeframe,
              direction: setup.footprint.direction,
              strength: setup.footprint.strength,
              volume: setup.footprint.volume,
              isValid: setup.footprint.isValid,
              originLow: setup.footprint.origin.low,
              originBase: setup.footprint.origin.base,
              originTimestamp: new Date(setup.footprint.origin.timestamp),
              rangeFloor: setup.footprint.range.floor,
              rangeBase: setup.footprint.range.base
            }
          }
        }
      });
    } catch (error) {
      console.error('Error storing setup:', error);
    }
  }

  /**
   * Store a trade in the database
   */
  private async storeTrade(trade: BFITrade): Promise<void> {
    try {
      await this.prisma.bFITrade.create({
        data: {
          id: trade.id,
          setupId: trade.setupId,
          instrument: trade.instrument,
          side: trade.side,
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          status: trade.status,
          pnl: trade.pnl,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          exitReason: trade.exitReason
        }
      });
    } catch (error) {
      console.error('Error storing trade:', error);
    }
  }

  /**
   * Update trade in database
   */
  private async updateTradeInDatabase(trade: BFITrade): Promise<void> {
    try {
      await this.prisma.bFITrade.update({
        where: { id: trade.id },
        data: {
          pnl: trade.pnl,
          status: trade.status,
          exitTime: trade.exitTime,
          exitReason: trade.exitReason
        }
      });
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  }

  /**
   * Mark setup as executed
   */
  private async markSetupExecuted(setupId: string): Promise<void> {
    try {
      await this.prisma.bFISetup.update({
        where: { id: setupId },
        data: { status: 'active' }
      });
    } catch (error) {
      console.error('Error marking setup as executed:', error);
    }
  }

  /**
   * Mark setup as invalid
   */
  private async markSetupInvalid(setupId: string): Promise<void> {
    try {
      await this.prisma.bFISetup.update({
        where: { id: setupId },
        data: { status: 'invalidated' }
      });
    } catch (error) {
      console.error('Error marking setup as invalid:', error);
    }
  }

  /**
   * Get performance statistics
   */
  async getPerformance(): Promise<BFIPerformance> {
    try {
      const trades = await this.prisma.bFITrade.findMany({
        where: { status: 'closed' }
      });

      const totalTrades = trades.length;
      const winningTrades = trades.filter((t: any) => t.pnl > 0);
      const losingTrades = trades.filter((t: any) => t.pnl < 0);
      
      const totalPnl = trades.reduce((sum: number, t: any) => sum + t.pnl, 0);
      const totalWins = winningTrades.reduce((sum: number, t: any) => sum + t.pnl, 0);
      const totalLosses = Math.abs(losingTrades.reduce((sum: number, t: any) => sum + t.pnl, 0));
      
      const winRate = totalTrades > 0 ? winningTrades.length / totalTrades : 0;
      const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
      const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = 0;
      let runningTotal = 0;
      
      for (const trade of trades) {
        runningTotal += trade.pnl;
        if (runningTotal > peak) {
          peak = runningTotal;
        }
        const drawdown = peak - runningTotal;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }

      // Calculate Sharpe ratio (simplified)
      const returns = trades.map((t: any) => t.pnl);
      const avgReturn = returns.length > 0 ? returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length : 0;
      const variance = returns.length > 0 ? returns.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

      return {
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        totalPnl,
        averageWin,
        averageLoss,
        profitFactor,
        maxDrawdown,
        sharpeRatio
      };

    } catch (error) {
      console.error('Error calculating performance:', error);
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnl: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      };
    }
  }

  /**
   * Get active trades
   */
  getActiveTrades(): BFITrade[] {
    return Array.from(this.activeTrades.values());
  }

  /**
   * Get system status
   */
  getStatus(): { isRunning: boolean; activeTrades: number; lastUpdate: Date } {
    return {
      isRunning: this.isRunning,
      activeTrades: this.activeTrades.size,
      lastUpdate: new Date()
    };
  }
} 