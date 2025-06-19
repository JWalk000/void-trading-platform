import { NextApiRequest, NextApiResponse } from 'next';
import { OandaAPI } from '../../../lib/oanda-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { apiKey, accountId, isPractice, action, params } = req.body;
  if (!apiKey || !accountId) return res.status(400).json({ error: 'Missing API key or account ID' });
  const oanda = new OandaAPI(apiKey, accountId, isPractice);
  try {
    switch (action) {
      case 'account':
        return res.json(await oanda.getAccountSummary());
      case 'positions':
        return res.json(await oanda.getOpenPositions());
      case 'orders':
        return res.json(await oanda.getOrders());
      case 'placeOrder':
        return res.json(await oanda.placeOrder(params));
      case 'cancelOrder':
        return res.json(await oanda.cancelOrder(params.orderId));
      case 'trades':
        return res.json(await oanda.getTrades());
      case 'closeTrade':
        return res.json(await oanda.closeTrade(params.tradeId));
      case 'pricing':
        return res.json(await oanda.getPricing(params.instruments));
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
} 