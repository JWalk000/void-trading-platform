import { TechnicalAnalysis } from './technical-analysis';
import { BrokerAPIs } from './broker-apis';

export interface BFIFootprint {
  id: string;
  instrument: string;
  timeframe: string;
  origin: {
    low: number;
    base: number;
    timestamp: number;
  };
  range: {
    floor: number;
    base: number;
  };
  strength: number; // Number of swing points broken
  direction: 'bullish' | 'bearish';
  volume: number;
  isValid: boolean;
}

export interface BFISetup {
  id: string;
  instrument: string;
  footprint: BFIFootprint;
  monthlyBias: 'bullish' | 'bearish' | 'potentially_reversing';
  weeklyBias: 'bullish' | 'bearish' | 'potentially_reversing';
  entryRange: {
    floor: number;
    base: number;
    midpoint: number;
  };
  entrySignals: BFISignal[];
  riskRewardRatio: number;
  stopLoss: number;
  targets: number[];
  status: 'waiting' | 'active' | 'completed' | 'invalidated';
}

export interface BFISignal {
  type: 'pinbar' | 'engulfing' | 'fibonacci_retracement' | 'break_retest';
  timeframe: string;
  timestamp: number;
  price: number;
  strength: number;
  confirmation: boolean;
}

export interface MonthlyBias {
  instrument: string;
  bias: 'bullish' | 'bearish' | 'potentially_reversing';
  lastUpdate: number;
  zones: {
    buyZones: Array<{ low: number; high: number; strength: number }>;
    sellZones: Array<{ low: number; high: number; strength: number }>;
  };
}

export class BFITradingStrategy {
  private technicalAnalysis: TechnicalAnalysis;
  private brokerAPIs: BrokerAPIs;
  private monthlyBiases: Map<string, MonthlyBias> = new Map();
  private activeSetups: Map<string, BFISetup> = new Map();

  constructor() {
    this.technicalAnalysis = new TechnicalAnalysis();
    this.brokerAPIs = new BrokerAPIs();
  }

  /**
   * Determine monthly directional bias for an instrument
   * This is the first and most important step in BFI trading
   */
  async determineMonthlyBias(instrument: string): Promise<MonthlyBias> {
    const monthlyData = await this.brokerAPIs.getHistoricalData(instrument, '1M', 60);
    
    // Focus on last 2-3 years of data (24-36 candles)
    const recentData = monthlyData.slice(-36);
    
    // Identify the most recent impulsive movement
    const impulsiveMovement = this.findImpulsiveMovement(recentData);
    
    // Identify monthly zones (buy/sell zones)
    const zones = this.identifyMonthlyZones(recentData);
    
    // Determine current bias based on price position relative to zones
    const currentPrice = recentData[recentData.length - 1].close;
    let bias: 'bullish' | 'bearish' | 'potentially_reversing' = 'potentially_reversing';
    
    // Check if price is in a buy zone
    const inBuyZone = zones.buyZones.some(zone => 
      currentPrice >= zone.low && currentPrice <= zone.high
    );
    
    // Check if price is in a sell zone
    const inSellZone = zones.sellZones.some(zone => 
      currentPrice >= zone.low && currentPrice <= zone.high
    );
    
    if (inBuyZone) {
      bias = 'potentially_reversing';
    } else if (inSellZone) {
      bias = 'potentially_reversing';
    } else if (impulsiveMovement.direction === 'up' && !inSellZone) {
      bias = 'bullish';
    } else if (impulsiveMovement.direction === 'down' && !inBuyZone) {
      bias = 'bearish';
    }
    
    const monthlyBias: MonthlyBias = {
      instrument,
      bias,
      lastUpdate: Date.now(),
      zones
    };
    
    this.monthlyBiases.set(instrument, monthlyBias);
    return monthlyBias;
  }

  /**
   * Find valid BFI footprints on the specified timeframe
   * A valid footprint breaks previous market swing points
   */
  async findValidFootprints(
    instrument: string, 
    timeframe: string, 
    lookbackPeriods: number = 100
  ): Promise<BFIFootprint[]> {
    const data = await this.brokerAPIs.getHistoricalData(instrument, timeframe, lookbackPeriods);
    const footprints: BFIFootprint[] = [];
    
    // Minimum 5 candles for a valid footprint
    for (let i = 5; i < data.length - 5; i++) {
      const currentCandle = data[i];
      const previousCandles = data.slice(i - 5, i);
      const nextCandles = data.slice(i + 1, i + 6);
      
      // Check for bullish footprint
      if (this.isBullishFootprint(currentCandle, previousCandles, nextCandles)) {
        const footprint = this.createFootprint(data, i, 'bullish', timeframe);
        if (footprint.isValid) {
          footprints.push(footprint);
        }
      }
      
      // Check for bearish footprint
      if (this.isBearishFootprint(currentCandle, previousCandles, nextCandles)) {
        const footprint = this.createFootprint(data, i, 'bearish', timeframe);
        if (footprint.isValid) {
          footprints.push(footprint);
        }
      }
    }
    
    return footprints;
  }

  /**
   * Create a BFI footprint from candle data
   */
  private createFootprint(
    data: any[], 
    index: number, 
    direction: 'bullish' | 'bearish', 
    timeframe: string
  ): BFIFootprint {
    const originCandle = data[index];
    const previousCandles = data.slice(0, index);
    
    // Calculate range from low to base (close for bullish, open for bearish)
    const low = originCandle.low;
    const base = direction === 'bullish' ? originCandle.close : originCandle.open;
    
    // Count how many swing points this movement breaks
    const strength = this.countBrokenSwingPoints(data, index, direction);
    
    // Calculate volume
    const volume = originCandle.volume || 0;
    
    // Validate footprint (must break at least 1 swing point)
    const isValid = strength >= 1;
    
    return {
      id: `${timeframe}_${direction}_${index}_${Date.now()}`,
      instrument: data[0].instrument || 'unknown',
      timeframe,
      origin: {
        low,
        base,
        timestamp: originCandle.timestamp
      },
      range: {
        floor: low,
        base
      },
      strength,
      direction,
      volume,
      isValid
    };
  }

  /**
   * Check if a candle creates a bullish BFI footprint
   */
  private isBullishFootprint(currentCandle: any, previousCandles: any[], nextCandles: any[]): boolean {
    // Must be a strong bullish candle
    const bodySize = currentCandle.close - currentCandle.open;
    const totalRange = currentCandle.high - currentCandle.low;
    const bodyRatio = bodySize / totalRange;
    
    if (bodyRatio < 0.6) return false; // Not strong enough
    
    // Must break previous swing highs
    const previousHighs = previousCandles.map(c => c.high);
    const maxPreviousHigh = Math.max(...previousHighs);
    
    return currentCandle.close > maxPreviousHigh;
  }

  /**
   * Check if a candle creates a bearish BFI footprint
   */
  private isBearishFootprint(currentCandle: any, previousCandles: any[], nextCandles: any[]): boolean {
    // Must be a strong bearish candle
    const bodySize = currentCandle.open - currentCandle.close;
    const totalRange = currentCandle.high - currentCandle.low;
    const bodyRatio = bodySize / totalRange;
    
    if (bodyRatio < 0.6) return false; // Not strong enough
    
    // Must break previous swing lows
    const previousLows = previousCandles.map(c => c.low);
    const minPreviousLow = Math.min(...previousLows);
    
    return currentCandle.close < minPreviousLow;
  }

  /**
   * Count how many swing points a movement breaks
   */
  private countBrokenSwingPoints(data: any[], index: number, direction: 'bullish' | 'bearish'): number {
    const currentCandle = data[index];
    const previousCandles = data.slice(0, index);
    
    let brokenPoints = 0;
    
    if (direction === 'bullish') {
      // Count previous swing highs broken
      for (let i = 1; i < previousCandles.length - 1; i++) {
        const prev = previousCandles[i - 1];
        const current = previousCandles[i];
        const next = previousCandles[i + 1];
        
        // Check if this is a swing high
        if (current.high > prev.high && current.high > next.high) {
          if (currentCandle.close > current.high) {
            brokenPoints++;
          }
        }
      }
    } else {
      // Count previous swing lows broken
      for (let i = 1; i < previousCandles.length - 1; i++) {
        const prev = previousCandles[i - 1];
        const current = previousCandles[i];
        const next = previousCandles[i + 1];
        
        // Check if this is a swing low
        if (current.low < prev.low && current.low < next.low) {
          if (currentCandle.close < current.low) {
            brokenPoints++;
          }
        }
      }
    }
    
    return brokenPoints;
  }

  /**
   * Find impulsive movement in monthly data
   */
  private findImpulsiveMovement(data: any[]): { direction: 'up' | 'down'; strength: number } {
    // Look for the most recent strong directional movement
    let maxMove = 0;
    let direction: 'up' | 'down' = 'up';
    
    for (let i = 5; i < data.length; i++) {
      const move = Math.abs(data[i].close - data[i - 5].close);
      if (move > maxMove) {
        maxMove = move;
        direction = data[i].close > data[i - 5].close ? 'up' : 'down';
      }
    }
    
    return { direction, strength: maxMove };
  }

  /**
   * Identify monthly buy and sell zones
   */
  private identifyMonthlyZones(data: any[]): { buyZones: any[]; sellZones: any[] } {
    const buyZones: any[] = [];
    const sellZones: any[] = [];
    
    // Find swing lows (potential buy zones)
    for (let i = 2; i < data.length - 2; i++) {
      const prev = data[i - 1];
      const current = data[i];
      const next = data[i + 1];
      
      if (current.low < prev.low && current.low < next.low) {
        // This is a swing low - potential buy zone
        buyZones.push({
          low: current.low,
          high: current.close,
          strength: 1
        });
      }
    }
    
    // Find swing highs (potential sell zones)
    for (let i = 2; i < data.length - 2; i++) {
      const prev = data[i - 1];
      const current = data[i];
      const next = data[i + 1];
      
      if (current.high > prev.high && current.high > next.high) {
        // This is a swing high - potential sell zone
        sellZones.push({
          low: current.open,
          high: current.high,
          strength: 1
        });
      }
    }
    
    return { buyZones, sellZones };
  }

  /**
   * Find trading setups based on first retest of valid BFI ranges
   */
  async findTradingSetups(instrument: string): Promise<BFISetup[]> {
    const setups: BFISetup[] = [];
    
    // Get monthly bias first
    const monthlyBias = await this.determineMonthlyBias(instrument);
    
    // Find valid footprints on 4H timeframe
    const footprints = await this.findValidFootprints(instrument, '4H', 200);
    
    // Get current price
    const currentPrice = await this.brokerAPIs.getCurrentPrice(instrument);
    
    // Check each footprint for first retest opportunity
    for (const footprint of footprints) {
      const range = footprint.range;
      
      // Check if current price is in the range (first retest)
      if (currentPrice >= range.floor && currentPrice <= range.base) {
        // This is a potential setup
        const entrySignals = await this.findEntrySignals(instrument, range, footprint.direction);
        
        if (entrySignals.length > 0) {
          const setup = this.createTradingSetup(footprint, monthlyBias, entrySignals, currentPrice);
          setups.push(setup);
        }
      }
    }
    
    return setups;
  }

  /**
   * Find entry signals within a valid BFI range
   */
  private async findEntrySignals(
    instrument: string, 
    range: { floor: number; base: number }, 
    direction: 'bullish' | 'bearish'
  ): Promise<BFISignal[]> {
    const signals: BFISignal[] = [];
    
    // Get 15min data for micro signals
    const microData = await this.brokerAPIs.getHistoricalData(instrument, '15m', 100);
    
    // Look for pinbar signals
    const pinbarSignals = this.findPinbarSignals(microData, range, direction);
    signals.push(...pinbarSignals);
    
    // Look for engulfing signals
    const engulfingSignals = this.findEngulfingSignals(microData, range, direction);
    signals.push(...engulfingSignals);
    
    // Look for Fibonacci retracement signals
    const fibSignals = this.findFibonacciSignals(microData, range, direction);
    signals.push(...fibSignals);
    
    return signals;
  }

  /**
   * Find pinbar candlestick signals
   */
  private findPinbarSignals(
    data: any[], 
    range: { floor: number; base: number }, 
    direction: 'bullish' | 'bearish'
  ): BFISignal[] {
    const signals: BFISignal[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      const candle = data[i];
      
      // Check if candle is in range
      if (candle.low >= range.floor && candle.high <= range.base) {
        const bodySize = Math.abs(candle.close - candle.open);
        const totalRange = candle.high - candle.low;
        const wickRatio = (totalRange - bodySize) / totalRange;
        
        // Pinbar must have wick multiple times longer than body
        if (wickRatio > 0.7) {
          // Check if it's a bullish pinbar in a bullish setup
          if (direction === 'bullish' && candle.close > candle.open) {
            const lowerWick = Math.min(candle.open, candle.close) - candle.low;
            const upperWick = candle.high - Math.max(candle.open, candle.close);
            
            if (lowerWick > 2 * bodySize && upperWick < bodySize) {
              signals.push({
                type: 'pinbar',
                timeframe: '15m',
                timestamp: candle.timestamp,
                price: candle.low,
                strength: 1,
                confirmation: true
              });
            }
          }
        }
      }
    }
    
    return signals;
  }

  /**
   * Find engulfing candlestick signals
   */
  private findEngulfingSignals(
    data: any[], 
    range: { floor: number; base: number }, 
    direction: 'bullish' | 'bearish'
  ): BFISignal[] {
    const signals: BFISignal[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      // Check if candles are in range
      if (current.low >= range.floor && current.high <= range.base &&
          previous.low >= range.floor && previous.high <= range.base) {
        
        // Bullish engulfing
        if (direction === 'bullish' && 
            current.close > current.open && 
            previous.close < previous.open &&
            current.open < previous.close &&
            current.close > previous.open) {
          
          signals.push({
            type: 'engulfing',
            timeframe: '15m',
            timestamp: current.timestamp,
            price: current.open,
            strength: 1,
            confirmation: true
          });
        }
      }
    }
    
    return signals;
  }

  /**
   * Find Fibonacci retracement signals
   */
  private findFibonacciSignals(
    data: any[], 
    range: { floor: number; base: number }, 
    direction: 'bullish' | 'bearish'
  ): BFISignal[] {
    const signals: BFISignal[] = [];
    
    // Find recent A to B movement
    const abMovement = this.findABMovement(data, direction);
    
    if (abMovement) {
      const { pointA, pointB } = abMovement;
      const fibLevels = this.calculateFibonacciLevels(pointA, pointB);
      
      // Check if current price is at Fibonacci levels
      const currentPrice = data[data.length - 1].close;
      
      // 50% retracement level
      if (Math.abs(currentPrice - fibLevels.fifty) / fibLevels.fifty < 0.01) {
        signals.push({
          type: 'fibonacci_retracement',
          timeframe: '15m',
          timestamp: Date.now(),
          price: currentPrice,
          strength: 1,
          confirmation: true
        });
      }
      
      // 61.8% retracement level
      if (Math.abs(currentPrice - fibLevels.sixtyOneEight) / fibLevels.sixtyOneEight < 0.01) {
        signals.push({
          type: 'fibonacci_retracement',
          timeframe: '15m',
          timestamp: Date.now(),
          price: currentPrice,
          strength: 1,
          confirmation: true
        });
      }
    }
    
    return signals;
  }

  /**
   * Find A to B movement for Fibonacci analysis
   */
  private findABMovement(data: any[], direction: 'bullish' | 'bearish'): { pointA: number; pointB: number } | null {
    // Look for recent impulsive movement
    for (let i = 10; i < data.length - 5; i++) {
      const start = data[i];
      const end = data[i + 5];
      
      if (direction === 'bullish' && end.close > start.close) {
        return { pointA: start.low, pointB: end.high };
      } else if (direction === 'bearish' && end.close < start.close) {
        return { pointA: start.high, pointB: end.low };
      }
    }
    
    return null;
  }

  /**
   * Calculate Fibonacci retracement levels
   */
  private calculateFibonacciLevels(pointA: number, pointB: number): { fifty: number; sixtyOneEight: number; seventyEightSix: number } {
    const range = Math.abs(pointB - pointA);
    
    return {
      fifty: pointA + (range * 0.5),
      sixtyOneEight: pointA + (range * 0.618),
      seventyEightSix: pointA + (range * 0.786)
    };
  }

  /**
   * Create a trading setup from footprint and signals
   */
  private createTradingSetup(
    footprint: BFIFootprint,
    monthlyBias: MonthlyBias,
    entrySignals: BFISignal[],
    currentPrice: number
  ): BFISetup {
    const range = footprint.range;
    const midpoint = (range.floor + range.base) / 2;
    
    // Calculate stop loss (below range for bullish)
    const stopLoss = footprint.direction === 'bullish' 
      ? range.floor - (range.base - range.floor) * 0.1
      : range.base + (range.base - range.floor) * 0.1;
    
    // Calculate targets (1:3, 1:4, 1:5 risk-reward ratios)
    const risk = Math.abs(currentPrice - stopLoss);
    const targets = [
      currentPrice + (risk * 3),
      currentPrice + (risk * 4),
      currentPrice + (risk * 5)
    ];
    
    const riskRewardRatio = targets[0] - currentPrice / risk;
    
    return {
      id: `setup_${footprint.id}_${Date.now()}`,
      instrument: footprint.instrument,
      footprint,
      monthlyBias: monthlyBias.bias,
      weeklyBias: 'potentially_reversing', // Would need weekly analysis
      entryRange: {
        floor: range.floor,
        base: range.base,
        midpoint
      },
      entrySignals,
      riskRewardRatio,
      stopLoss,
      targets,
      status: 'waiting'
    };
  }

  /**
   * Execute a BFI trading setup
   */
  async executeSetup(setup: BFISetup, positionSize: number): Promise<boolean> {
    try {
      // Validate setup is still valid
      const currentPrice = await this.brokerAPIs.getCurrentPrice(setup.instrument);
      
      if (currentPrice < setup.entryRange.floor || currentPrice > setup.entryRange.base) {
        console.log('Setup no longer valid - price outside range');
        return false;
      }
      
      // Place the order
      const order = await this.brokerAPIs.placeOrder({
        instrument: setup.instrument,
        side: setup.footprint.direction === 'bullish' ? 'buy' : 'sell',
        type: 'market',
        quantity: positionSize,
        stopLoss: setup.stopLoss,
        takeProfit: setup.targets[0] // First target
      });
      
      if (order.success) {
        setup.status = 'active';
        this.activeSetups.set(setup.id, setup);
        console.log(`BFI setup executed: ${setup.id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error executing BFI setup:', error);
      return false;
    }
  }

  /**
   * Monitor active setups and manage exits
   */
  async monitorSetups(): Promise<void> {
    for (const [setupId, setup] of this.activeSetups) {
      const currentPrice = await this.brokerAPIs.getCurrentPrice(setup.instrument);
      
      // Check if stop loss hit
      if (setup.footprint.direction === 'bullish' && currentPrice <= setup.stopLoss) {
        await this.closeSetup(setupId, 'stop_loss');
      } else if (setup.footprint.direction === 'bearish' && currentPrice >= setup.stopLoss) {
        await this.closeSetup(setupId, 'stop_loss');
      }
      
      // Check if targets hit
      for (let i = 0; i < setup.targets.length; i++) {
        if (setup.footprint.direction === 'bullish' && currentPrice >= setup.targets[i]) {
          await this.closeSetup(setupId, 'target_hit', i + 1);
          break;
        } else if (setup.footprint.direction === 'bearish' && currentPrice <= setup.targets[i]) {
          await this.closeSetup(setupId, 'target_hit', i + 1);
          break;
        }
      }
    }
  }

  /**
   * Close a trading setup
   */
  private async closeSetup(setupId: string, reason: string, targetNumber?: number): Promise<void> {
    const setup = this.activeSetups.get(setupId);
    if (!setup) return;
    
    try {
      // Close the position
      await this.brokerAPIs.closePosition(setup.instrument);
      
      setup.status = 'completed';
      console.log(`BFI setup closed: ${setupId} - ${reason}${targetNumber ? ` (Target ${targetNumber})` : ''}`);
      
      this.activeSetups.delete(setupId);
    } catch (error) {
      console.error('Error closing BFI setup:', error);
    }
  }

  /**
   * Get all active setups
   */
  getActiveSetups(): BFISetup[] {
    return Array.from(this.activeSetups.values());
  }

  /**
   * Get monthly bias for an instrument
   */
  getMonthlyBias(instrument: string): MonthlyBias | undefined {
    return this.monthlyBiases.get(instrument);
  }
} 