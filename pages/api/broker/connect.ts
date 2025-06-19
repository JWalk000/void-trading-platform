import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { brokerAPIService } from '@/lib/broker-apis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId, broker, apiKey, secretKey, passphrase, baseUrl } = req.body

  if (!userId || !broker || !apiKey || !secretKey) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Test the connection first
    const brokerConfig = {
      id: 0,
      broker,
      apiKey,
      secretKey,
      passphrase,
      baseUrl
    }

    const isConnected = await brokerAPIService.testConnection(brokerConfig)
    
    if (!isConnected) {
      return res.status(400).json({ message: 'Invalid API credentials' })
    }

    // Save the connection to database
    const connection = await prisma.brokerConnection.create({
      data: {
        userId: parseInt(userId),
        broker,
        apiKey,
        secretKey,
        passphrase,
        baseUrl,
        isActive: true
      }
    })

    res.status(200).json({ 
      message: 'Broker connected successfully', 
      connection: {
        id: connection.id,
        broker: connection.broker,
        isActive: connection.isActive
      }
    })
  } catch (error) {
    console.error('Failed to connect broker:', error)
    res.status(500).json({ message: 'Failed to connect broker' })
  }
} 