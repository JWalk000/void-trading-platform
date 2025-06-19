import { NextApiRequest, NextApiResponse } from 'next';
import { BFITradingStrategy } from '../../../lib/bfi-trading-strategy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { instrument } = req.query;
    
    if (!instrument || typeof instrument !== 'string') {
      return res.status(400).json({ error: 'Instrument parameter is required' });
    }

    const bfiStrategy = new BFITradingStrategy();
    const setups = await bfiStrategy.findTradingSetups(instrument);
    const activeSetups = bfiStrategy.getActiveSetups();

    res.status(200).json({
      setups,
      activeSetups
    });
  } catch (error) {
    console.error('Error getting BFI setups:', error);
    res.status(500).json({ error: 'Failed to get BFI setups' });
  }
} 