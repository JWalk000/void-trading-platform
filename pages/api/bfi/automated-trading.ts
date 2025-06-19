import { NextApiRequest, NextApiResponse } from 'next';
import { BFIAutomatedTrading } from '../../../lib/bfi-automated-trading';
import { BrokerConfig } from '../../../lib/broker-apis';

// Global instance of the automated trading system
let automatedTrading: BFIAutomatedTrading | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res);
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in automated trading API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action, brokerConfig } = req.body;

  switch (action) {
    case 'start':
      return await startAutomatedTrading(req, res, brokerConfig);
    case 'stop':
      return await stopAutomatedTrading(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;

  switch (type) {
    case 'status':
      return await getStatus(req, res);
    case 'performance':
      return await getPerformance(req, res);
    case 'trades':
      return await getActiveTrades(req, res);
    default:
      return res.status(400).json({ error: 'Invalid type parameter' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  switch (action) {
    case 'update_config':
      return await updateConfig(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  switch (action) {
    case 'close_trade':
      return await closeTrade(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function startAutomatedTrading(req: NextApiRequest, res: NextApiResponse, brokerConfig: BrokerConfig) {
  try {
    if (automatedTrading) {
      return res.status(400).json({ error: 'Automated trading is already running' });
    }

    automatedTrading = new BFIAutomatedTrading();
    automatedTrading.setBrokerConfig(brokerConfig);
    await automatedTrading.start();

    return res.status(200).json({ 
      success: true, 
      message: 'Automated BFI trading started successfully' 
    });
  } catch (error) {
    console.error('Error starting automated trading:', error);
    return res.status(500).json({ error: 'Failed to start automated trading' });
  }
}

async function stopAutomatedTrading(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!automatedTrading) {
      return res.status(400).json({ error: 'Automated trading is not running' });
    }

    await automatedTrading.stop();
    automatedTrading = null;

    return res.status(200).json({ 
      success: true, 
      message: 'Automated BFI trading stopped successfully' 
    });
  } catch (error) {
    console.error('Error stopping automated trading:', error);
    return res.status(500).json({ error: 'Failed to stop automated trading' });
  }
}

async function getStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!automatedTrading) {
      return res.status(200).json({ 
        isRunning: false, 
        activeTrades: 0, 
        lastUpdate: new Date() 
      });
    }

    const status = automatedTrading.getStatus();
    return res.status(200).json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    return res.status(500).json({ error: 'Failed to get status' });
  }
}

async function getPerformance(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!automatedTrading) {
      return res.status(400).json({ error: 'Automated trading is not running' });
    }

    const performance = await automatedTrading.getPerformance();
    return res.status(200).json(performance);
  } catch (error) {
    console.error('Error getting performance:', error);
    return res.status(500).json({ error: 'Failed to get performance' });
  }
}

async function getActiveTrades(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!automatedTrading) {
      return res.status(200).json([]);
    }

    const trades = automatedTrading.getActiveTrades();
    return res.status(200).json(trades);
  } catch (error) {
    console.error('Error getting active trades:', error);
    return res.status(500).json({ error: 'Failed to get active trades' });
  }
}

async function updateConfig(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { brokerConfig } = req.body;

    if (!automatedTrading) {
      return res.status(400).json({ error: 'Automated trading is not running' });
    }

    automatedTrading.setBrokerConfig(brokerConfig);

    return res.status(200).json({ 
      success: true, 
      message: 'Configuration updated successfully' 
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return res.status(500).json({ error: 'Failed to update configuration' });
  }
}

async function closeTrade(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tradeId } = req.body;

    if (!automatedTrading) {
      return res.status(400).json({ error: 'Automated trading is not running' });
    }

    // This would need to be implemented in the BFIAutomatedTrading class
    // For now, we'll return a placeholder response
    return res.status(200).json({ 
      success: true, 
      message: 'Trade close request received' 
    });
  } catch (error) {
    console.error('Error closing trade:', error);
    return res.status(500).json({ error: 'Failed to close trade' });
  }
} 