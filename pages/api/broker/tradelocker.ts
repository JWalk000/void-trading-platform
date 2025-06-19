import { NextApiRequest, NextApiResponse } from 'next';
import { TradeLockerAPI, TradeLockerConfig } from '../../../lib/tradelocker-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, config, order } = req.body;

    switch (action) {
      case 'connect':
        return await handleConnect(req, res, config);
      case 'test':
        return await handleTestConnection(req, res, config);
      case 'balance':
        return await handleGetBalance(req, res, config);
      case 'price':
        return await handleGetPrice(req, res, config);
      case 'market_order':
        return await handleMarketOrder(req, res, config, order);
      case 'limit_order':
        return await handleLimitOrder(req, res, config, order);
      case 'positions':
        return await handleGetPositions(req, res, config);
      case 'close_position':
        return await handleClosePosition(req, res, config, order);
      case 'order_history':
        return await handleGetOrderHistory(req, res, config);
      case 'cancel_order':
        return await handleCancelOrder(req, res, config, order);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('TradeLocker API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

async function handleConnect(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    
    // Test the connection
    const isConnected = await tradelocker.testConnection();
    
    if (!isConnected) {
      return res.status(400).json({ error: 'Failed to connect to TradeLocker' });
    }

    // Save the configuration
    await tradelocker.saveConfig();

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully connected to TradeLocker' 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleTestConnection(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    const isConnected = await tradelocker.testConnection();
    
    return res.status(200).json({ 
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed'
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleGetBalance(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    const balance = await tradelocker.getBalance();
    
    return res.status(200).json({ 
      success: true, 
      data: balance 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleGetPrice(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const price = await tradelocker.getCurrentPrice(symbol);
    
    return res.status(200).json({ 
      success: true, 
      data: { symbol, price } 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleMarketOrder(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, order: any) {
  try {
    const { symbol, side, quantity, stopLoss, takeProfit } = order;
    
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Symbol, side, and quantity are required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const result = await tradelocker.placeMarketOrder({
      symbol,
      side,
      type: 'market',
      quantity: parseFloat(quantity),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
    });
    
    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleLimitOrder(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, order: any) {
  try {
    const { symbol, side, quantity, price, stopLoss, takeProfit } = order;
    
    if (!symbol || !side || !quantity || !price) {
      return res.status(400).json({ error: 'Symbol, side, quantity, and price are required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const result = await tradelocker.placeLimitOrder({
      symbol,
      side,
      type: 'limit',
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
    });
    
    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleGetPositions(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const tradelocker = new TradeLockerAPI(config);
    const positions = await tradelocker.getPositions();
    
    return res.status(200).json({ 
      success: true, 
      data: positions 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleClosePosition(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, order: any) {
  try {
    const { symbol, quantity } = order;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const result = await tradelocker.closePosition(symbol, quantity ? parseFloat(quantity) : undefined);
    
    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleGetOrderHistory(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig) {
  try {
    const { symbol, limit } = req.body;
    
    const tradelocker = new TradeLockerAPI(config);
    const history = await tradelocker.getOrderHistory(symbol, limit || 100);
    
    return res.status(200).json({ 
      success: true, 
      data: history 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleCancelOrder(req: NextApiRequest, res: NextApiResponse, config: TradeLockerConfig, order: any) {
  try {
    const { orderId } = order;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const tradelocker = new TradeLockerAPI(config);
    const result = await tradelocker.cancelOrder(orderId);
    
    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
} 