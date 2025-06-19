import { NextApiRequest, NextApiResponse } from 'next';
import { BFITradingStrategy } from '../../../lib/bfi-trading-strategy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupId, positionSize } = req.body;
    
    if (!setupId || !positionSize) {
      return res.status(400).json({ error: 'Setup ID and position size are required' });
    }

    const bfiStrategy = new BFITradingStrategy();
    
    // Find the setup
    const setups = await bfiStrategy.findTradingSetups('BTC/USD'); // This should be dynamic
    const setup = setups.find(s => s.id === setupId);
    
    if (!setup) {
      return res.status(404).json({ error: 'Setup not found' });
    }

    // Execute the setup
    const success = await bfiStrategy.executeSetup(setup, positionSize);

    if (success) {
      res.status(200).json({ success: true, message: 'Setup executed successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to execute setup' });
    }
  } catch (error) {
    console.error('Error executing BFI setup:', error);
    res.status(500).json({ error: 'Failed to execute setup' });
  }
} 