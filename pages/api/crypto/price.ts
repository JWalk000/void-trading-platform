import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { symbol } = req.query

  try {
    // Using CoinGecko API for real crypto data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data')
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching crypto price:', error)
    res.status(500).json({ message: 'Failed to fetch price data' })
  }
} 