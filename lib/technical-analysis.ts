import { RSI, MACD, BollingerBands, SMA, EMA, Stochastic } from 'technicalindicators'

export interface OHLCV {
  open: number[]
  high: number[]
  low: number[]
  close: number[]
  volume: number[]
  timestamp: number[]
}

export interface TechnicalIndicators {
  rsi: number[]
  macd: { MACD: number[], signal: number[], histogram: number[] }
  bollinger: { upper: number[], middle: number[], lower: number[] }
  sma20: number[]
  sma50: number[]
  ema12: number[]
  ema26: number[]
  stochastic: { k: number[], d: number[] }
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD'
  strength: number // 0-100
  indicators: {
    rsi: { value: number; signal: string }
    macd: { signal: string; histogram: number }
    bollinger: { position: string; bandwidth: number }
    movingAverages: { signal: string }
    stochastic: { signal: string }
  }
  confidence: number // 0-100
  reason: string
}

export class TechnicalAnalysis {
  private data: OHLCV

  constructor(data: OHLCV) {
    this.data = data
  }

  calculateAllIndicators(): TechnicalIndicators {
    return {
      rsi: this.calculateRSI(),
      macd: this.calculateMACD(),
      bollinger: this.calculateBollingerBands(),
      sma20: this.calculateSMA(20),
      sma50: this.calculateSMA(50),
      ema12: this.calculateEMA(12),
      ema26: this.calculateEMA(26),
      stochastic: this.calculateStochastic()
    }
  }

  private calculateRSI(period: number = 14): number[] {
    return RSI.calculate({
      values: this.data.close,
      period
    })
  }

  private calculateMACD(): { MACD: number[], signal: number[], histogram: number[] } {
    const result = MACD.calculate({
      values: this.data.close,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    })
    
    return {
      MACD: result.map(r => r.MACD),
      signal: result.map(r => r.signal),
      histogram: result.map(r => r.histogram)
    }
  }

  private calculateBollingerBands(period: number = 20, stdDev: number = 2): { upper: number[], middle: number[], lower: number[] } {
    const result = BollingerBands.calculate({
      values: this.data.close,
      period,
      stdDev
    })
    
    return {
      upper: result.map(r => r.upper),
      middle: result.map(r => r.middle),
      lower: result.map(r => r.lower)
    }
  }

  private calculateSMA(period: number): number[] {
    return SMA.calculate({
      values: this.data.close,
      period
    })
  }

  private calculateEMA(period: number): number[] {
    return EMA.calculate({
      values: this.data.close,
      period
    })
  }

  private calculateStochastic(period: number = 14): { k: number[], d: number[] } {
    const result = Stochastic.calculate({
      high: this.data.high,
      low: this.data.low,
      close: this.data.close,
      period,
      signalPeriod: 3
    })
    
    return {
      k: result.map(r => r.k),
      d: result.map(r => r.d)
    }
  }

  generateTradingSignal(strategyType: string, parameters: any): TradingSignal {
    const indicators = this.calculateAllIndicators()
    const currentIndex = indicators.rsi.length - 1
    
    if (currentIndex < 0) {
      return {
        action: 'HOLD',
        strength: 0,
        indicators: {
          rsi: { value: 0, signal: 'N/A' },
          macd: { signal: 'N/A', histogram: 0 },
          bollinger: { position: 'N/A', bandwidth: 0 },
          movingAverages: { signal: 'N/A' },
          stochastic: { signal: 'N/A' }
        },
        confidence: 0,
        reason: 'Insufficient data'
      }
    }

    const currentPrice = this.data.close[currentIndex]
    const rsiValue = indicators.rsi[currentIndex]
    const macdHistogram = indicators.macd.histogram[currentIndex]
    const bollingerUpper = indicators.bollinger.upper[currentIndex]
    const bollingerLower = indicators.bollinger.lower[currentIndex]
    const sma20 = indicators.sma20[currentIndex]
    const sma50 = indicators.sma50[currentIndex]
    const stochasticK = indicators.stochastic.k[currentIndex]

    // Analyze RSI
    const rsiSignal = this.analyzeRSI(rsiValue, parameters.rsi?.oversold || 30, parameters.rsi?.overbought || 70)
    
    // Analyze MACD
    const macdSignal = this.analyzeMACD(macdHistogram, indicators.macd.MACD[currentIndex], indicators.macd.signal[currentIndex])
    
    // Analyze Bollinger Bands
    const bollingerSignal = this.analyzeBollingerBands(currentPrice, bollingerUpper, bollingerLower)
    
    // Analyze Moving Averages
    const maSignal = this.analyzeMovingAverages(sma20, sma50, currentPrice)
    
    // Analyze Stochastic
    const stochasticSignal = this.analyzeStochastic(stochasticK, indicators.stochastic.d[currentIndex])

    // Combine signals based on strategy type
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    let strength = 0
    let confidence = 0
    let reason = ''

    switch (strategyType) {
      case 'RSI':
        action = rsiSignal.action
        strength = Math.abs(rsiValue - 50) * 2
        confidence = Math.min(strength, 100)
        reason = rsiSignal.reason
        break
        
      case 'MACD':
        action = macdSignal.action
        strength = Math.abs(macdHistogram) * 100
        confidence = Math.min(strength, 100)
        reason = macdSignal.reason
        break
        
      case 'BOLLINGER':
        action = bollingerSignal.action
        strength = bollingerSignal.strength
        confidence = Math.min(strength, 100)
        reason = bollingerSignal.reason
        break
        
      case 'CUSTOM':
        // Custom strategy combining multiple indicators
        const signals = [rsiSignal, macdSignal, bollingerSignal, maSignal, stochasticSignal]
        const buySignals = signals.filter(s => s.action === 'BUY').length
        const sellSignals = signals.filter(s => s.action === 'SELL').length
        
        if (buySignals >= 3) {
          action = 'BUY'
          strength = (buySignals / signals.length) * 100
          reason = `Multiple indicators showing buy signal (${buySignals}/${signals.length})`
        } else if (sellSignals >= 3) {
          action = 'SELL'
          strength = (sellSignals / signals.length) * 100
          reason = `Multiple indicators showing sell signal (${sellSignals}/${signals.length})`
        } else {
          action = 'HOLD'
          strength = 0
          reason = 'Mixed signals, holding position'
        }
        confidence = strength
        break
        
      default:
        action = 'HOLD'
        strength = 0
        confidence = 0
        reason = 'Unknown strategy type'
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: rsiValue, signal: rsiSignal.reason },
        macd: { signal: macdSignal.reason, histogram: macdHistogram },
        bollinger: { position: bollingerSignal.reason, bandwidth: (bollingerUpper - bollingerLower) / currentPrice },
        movingAverages: { signal: maSignal.reason },
        stochastic: { signal: stochasticSignal.reason }
      },
      confidence,
      reason
    }
  }

  private analyzeRSI(rsi: number, oversold: number, overbought: number) {
    if (rsi < oversold) {
      return { action: 'BUY' as const, reason: `RSI oversold (${rsi.toFixed(2)})` }
    } else if (rsi > overbought) {
      return { action: 'SELL' as const, reason: `RSI overbought (${rsi.toFixed(2)})` }
    } else {
      return { action: 'HOLD' as const, reason: `RSI neutral (${rsi.toFixed(2)})` }
    }
  }

  private analyzeMACD(histogram: number, macd: number, signal: number) {
    if (histogram > 0 && macd > signal) {
      return { action: 'BUY' as const, reason: 'MACD bullish crossover' }
    } else if (histogram < 0 && macd < signal) {
      return { action: 'SELL' as const, reason: 'MACD bearish crossover' }
    } else {
      return { action: 'HOLD' as const, reason: 'MACD neutral' }
    }
  }

  private analyzeBollingerBands(price: number, upper: number, lower: number) {
    const bandwidth = upper - lower
    const position = (price - lower) / bandwidth
    
    if (price <= lower) {
      return { action: 'BUY' as const, strength: 100, reason: 'Price at lower Bollinger Band' }
    } else if (price >= upper) {
      return { action: 'SELL' as const, strength: 100, reason: 'Price at upper Bollinger Band' }
    } else if (position < 0.2) {
      return { action: 'BUY' as const, strength: 80, reason: 'Price near lower Bollinger Band' }
    } else if (position > 0.8) {
      return { action: 'SELL' as const, strength: 80, reason: 'Price near upper Bollinger Band' }
    } else {
      return { action: 'HOLD' as const, strength: 0, reason: 'Price within Bollinger Bands' }
    }
  }

  private analyzeMovingAverages(sma20: number, sma50: number, price: number) {
    if (sma20 > sma50 && price > sma20) {
      return { action: 'BUY' as const, reason: 'Price above moving averages (bullish)' }
    } else if (sma20 < sma50 && price < sma20) {
      return { action: 'SELL' as const, reason: 'Price below moving averages (bearish)' }
    } else {
      return { action: 'HOLD' as const, reason: 'Moving averages neutral' }
    }
  }

  private analyzeStochastic(k: number, d: number) {
    if (k < 20 && d < 20) {
      return { action: 'BUY' as const, reason: 'Stochastic oversold' }
    } else if (k > 80 && d > 80) {
      return { action: 'SELL' as const, reason: 'Stochastic overbought' }
    } else {
      return { action: 'HOLD' as const, reason: 'Stochastic neutral' }
    }
  }
} 