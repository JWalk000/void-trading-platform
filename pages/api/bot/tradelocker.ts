import { NextApiRequest, NextApiResponse } from 'next';
import { TradeLockerAPI, TradeLockerConfig } from '../../../lib/tradelocker-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, config, tradeData } = req.body;

    switch (action) {
      case 'execute_trade':
        return await handleExecuteTrade(req, res, config, tradeData);
      case 'check_balance':
        return await handleCheckBalance(req, res, config);
      case 'check_positions':
        return await handleCheckPositions(req, res, config);
      case 'close_position':
        return await handleClosePosition(req, res, config, tradeData);
      case 'can_trade':
        return await handleCanTrade(req, res, config, tradeData);
      case 'get_price':
        return await handleGetPrice(req, res, config, tradeData);
      default:
        return res.status(400).json({ error: 'Invalid bot action' });
    }
  } catch (error: any) {
    console.error('TradeLocker Bot API error:', error);
    return res.status(500).json({ 
      error: 'Bot trading error', 
      details: error.message 
    });
  }
}

async function handleExecuteTrade(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, tradeData: any) {
  try {
    const { symbol, side, quantity, orderType, price, stopLoss, takeProfit } = tradeData;
    
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Symbol, side, and quantity are required for bot trade' });
    }

    const tradelocker = new TradeLockerAPI(config);
    
    // Check if bot can trade (risk management)
    const canTrade = await tradelocker.canBotTrade(symbol, quantity, side);
    if (!canTrade) {
      return res.status(400).json({ 
        error: 'Bot cannot execute trade - insufficient margin or risk limits exceeded' 
      });
    }

    let result;
    if (orderType === 'market') {
      result = await tradelocker.placeBotMarketOrder({
        symbol,
        side,
        type: 'market',
        quantity: parseFloat(quantity),
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
      });
    } else if (orderType === 'limit') {
      if (!price) {
        return res.status(400).json({ error: 'Price is required for limit orders' });
      }
      result = await tradelocker.placeBotLimitOrder({
        symbol,
        side,
        type: 'limit',
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
      });
    } else {
      return res.status(400).json({ error: 'Invalid order type for bot' });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: result,
      message: `Bot trade executed: ${side} ${quantity} ${symbol}`
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleCheckBalance(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    const balance = await tradelocker.getBotBalance();
    
    return res.status(200).json({ 
      success: true, 
      data: balance 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleCheckPositions(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    const positions = await tradelocker.getBotPositions();
    
    return res.status(200).json({ 
      success: true, 
      data: positions 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleClosePosition(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, tradeData: any) {
  try {
    const { symbol, quantity } = tradeData;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required for bot position close' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const result = await tradelocker.closeBotPosition(symbol, quantity ? parseFloat(quantity) : undefined);
    
    return res.status(200).json({ 
      success: true, 
      data: result,
      message: `Bot position closed: ${symbol}`
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleCanTrade(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, tradeData: any) {
  try {
    const { symbol, quantity, side } = tradeData;
    
    if (!symbol || !quantity || !side) {
      return res.status(400).json({ error: 'Symbol, quantity, and side are required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const canTrade = await tradelocker.canBotTrade(symbol, parseFloat(quantity), side);
    
    return res.status(200).json({ 
      success: true, 
      data: { canTrade },
      message: canTrade ? 'Bot can execute trade' : 'Bot cannot execute trade - risk limits exceeded'
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleGetPrice(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, tradeData: any) {
  try {
    const { symbol } = tradeData;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required for price check' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const price = await tradelocker.getCurrentPrice(symbol);
    
    return res.status(200).json({ 
      success: true, 
      data: { symbol, price },
      message: `Current price for ${symbol}: ${price}`
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
} 