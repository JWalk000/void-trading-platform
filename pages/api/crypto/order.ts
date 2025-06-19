import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { brokerAPIService } from '@/lib/broker-apis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId, symbol, side, size, price, orderType, brokerId } = req.body

  if (!userId || !symbol || !side || !size || !brokerId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Get broker connection
    const brokerConnection = await prisma.brokerConnection.findFirst({
      where: { id: parseInt(brokerId), userId: parseInt(userId), isActive: true }
    })

    if (!brokerConnection) {
      return res.status(404).json({ message: 'Broker connection not found' })
    }

    // Prepare broker config
    const brokerConfig = {
      id: brokerConnection.id,
      broker: brokerConnection.broker,
      apiKey: brokerConnection.apiKey,
      secretKey: brokerConnection.secretKey,
      passphrase: brokerConnection.passphrase,
      baseUrl: brokerConnection.baseUrl
    }

    // Place real order through broker API
    const orderRequest = {
      symbol,
      side,
      type: orderType,
      amount: parseFloat(size),
      price: price ? parseFloat(price) : undefined
    }

    const orderResult = await brokerAPIService.placeOrder(brokerConfig, orderRequest)

    // Save trade to history
    const trade = await prisma.tradeHistory.create({
      data: {
        userId: parseInt(userId),
        symbol,
        side,
        size: parseFloat(size),
        price: orderResult.price,
        total: parseFloat(size) * orderResult.price,
        fee: 0 // Fee will be updated when order is filled
      }
    })

    res.status(200).json({ 
      message: 'Order placed successfully', 
      order: orderResult,
      trade 
    })
  } catch (error) {
    console.error('Error placing order:', error)
    res.status(500).json({ message: 'Failed to place order' })
  }
} 