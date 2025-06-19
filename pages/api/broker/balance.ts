import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { brokerAPIService } from '@/lib/broker-apis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    // Get all active broker connections for the user
    const connections = await prisma.brokerConnection.findMany({
      where: { 
        userId: parseInt(userId as string), 
        isActive: true 
      }
    })

    if (connections.length === 0) {
      return res.status(404).json({ message: 'No active broker connections found' })
    }

    // Fetch balances from all connected brokers
    const allBalances = []
    let totalUSDValue = 0

    for (const connection of connections) {
      try {
        const brokerConfig = {
          id: connection.id,
          broker: connection.broker,
          apiKey: connection.apiKey,
          secretKey: connection.secretKey,
          passphrase: connection.passphrase,
          baseUrl: connection.baseUrl
        }

        const balances = await brokerAPIService.getBalance(brokerConfig)
        
        allBalances.push({
          broker: connection.broker,
          balances,
          connectionId: connection.id
        })

        // Calculate total USD value (simplified - you'd want to get real USD prices)
        balances.forEach(balance => {
          if (balance.currency === 'USDT' || balance.currency === 'USD') {
            totalUSDValue += balance.total
          }
        })
      } catch (error) {
        console.error(`Failed to fetch balance for ${connection.broker}:`, error)
        allBalances.push({
          broker: connection.broker,
          balances: [],
          connectionId: connection.id,
          error: 'Failed to fetch balance'
        })
      }
    }

    res.status(200).json({
      totalUSDValue,
      brokers: allBalances
    })
  } catch (error) {
    console.error('Failed to fetch balances:', error)
    res.status(500).json({ message: 'Failed to fetch account balances' })
  }
} 