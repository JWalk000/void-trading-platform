"use client"

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Clock,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface TradeLockerPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
}

interface TradeLockerBalance {
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
}

interface OrderHistory {
  id: string;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  price: number;
  status: string;
  filledQuantity: number;
  averagePrice: number;
  timestamp: Date;
}

export default function TradeLockerPanel() {
  const [config, setConfig] = useState({
    apiKey: '',
    secretKey: '',
    accountId: '',
    baseUrl: 'https://api.tradelocker.com',
    environment: 'demo'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<TradeLockerBalance[]>([]);
  const [positions, setPositions] = useState<TradeLockerPosition[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Order form state
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    side: 'buy',
    type: 'market',
    quantity: '',
    price: '',
    stopLoss: '',
    takeProfit: ''
  });

  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem('tradelocker_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      testConnection(parsed);
    }
  }, []);

  const testConnection = async (configData: any) => {
    try {
      const response = await axios.post('/api/broker/tradelocker', {
        action: 'test',
        config: configData
      });
      
      if (response.data.success) {
        setIsConnected(true);
        await loadData(configData);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
    }
  };

  const loadData = async (configData: any) => {
    try {
      // Load balance
      const balanceResponse = await axios.post('/api/broker/tradelocker', {
        action: 'balance',
        config: configData
      });
      if (balanceResponse.data.success) {
        setBalance(balanceResponse.data.data);
      }

      // Load positions
      const positionsResponse = await axios.post('/api/broker/tradelocker', {
        action: 'positions',
        config: configData
      });
      if (positionsResponse.data.success) {
        setPositions(positionsResponse.data.data);
      }

      // Load order history
      const historyResponse = await axios.post('/api/broker/tradelocker', {
        action: 'order_history',
        config: configData
      });
      if (historyResponse.data.success) {
        setOrderHistory(historyResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/broker/tradelocker', {
        action: 'connect',
        config
      });
      
      if (response.data.success) {
        setIsConnected(true);
        localStorage.setItem('tradelocker_config', JSON.stringify(config));
        await loadData(config);
        setMessage('Successfully connected to TradeLocker');
      }
    } catch (error: any) {
      setMessage(`Connection failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderForm.symbol || !orderForm.quantity) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const action = orderForm.type === 'market' ? 'market_order' : 'limit_order';
      const orderData = {
        symbol: orderForm.symbol,
        side: orderForm.side,
        quantity: orderForm.quantity,
        ...(orderForm.type === 'limit' && { price: orderForm.price }),
        ...(orderForm.stopLoss && { stopLoss: orderForm.stopLoss }),
        ...(orderForm.takeProfit && { takeProfit: orderForm.takeProfit })
      };

      const response = await axios.post('/api/broker/tradelocker', {
        action,
        config,
        order: orderData
      });

      if (response.data.success) {
        setMessage(`Order placed successfully! Order ID: ${response.data.data.orderId}`);
        // Reset form
        setOrderForm({
          symbol: '',
          side: 'buy',
          type: 'market',
          quantity: '',
          price: '',
          stopLoss: '',
          takeProfit: ''
        });
        // Reload data
        await loadData(config);
      }
    } catch (error: any) {
      setMessage(`Order failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePosition = async (symbol: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/broker/tradelocker', {
        action: 'close_position',
        config,
        order: { symbol }
      });

      if (response.data.success) {
        setMessage(`Position closed successfully!`);
        await loadData(config);
      }
    } catch (error: any) {
      setMessage(`Failed to close position: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/broker/tradelocker', {
        action: 'cancel_order',
        config,
        order: { orderId }
      });

      if (response.data.success) {
        setMessage(`Order cancelled successfully!`);
        await loadData(config);
      }
    } catch (error: any) {
      setMessage(`Failed to cancel order: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPrice = async (symbol: string) => {
    try {
      const response = await axios.post('/api/broker/tradelocker', {
        action: 'price',
        config,
        symbol
      });
      
      if (response.data.success) {
        setCurrentPrice(response.data.data.price);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            TradeLocker Trading Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter your TradeLocker API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={config.secretKey}
                    onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                    placeholder="Enter your TradeLocker secret key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account ID</Label>
                  <Input
                    id="accountId"
                    value={config.accountId}
                    onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                    placeholder="Enter your TradeLocker account ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    value={config.environment}
                    onChange={(e) => setConfig({ ...config, environment: e.target.value })}
                    className="w-full p-2 border rounded-md bg-slate-700 text-white"
                  >
                    <option value="demo">Demo</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleConnect} disabled={isLoading} className="w-full">
                {isLoading ? 'Connecting...' : 'Connect to TradeLocker'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnected(false)}
                  className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                >
                  Disconnect
                </Button>
              </div>

              <Tabs defaultValue="trading" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="trading">Trading</TabsTrigger>
                  <TabsTrigger value="positions">Positions</TabsTrigger>
                  <TabsTrigger value="balance">Balance</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="trading" className="space-y-4">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Place Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="symbol">Symbol</Label>
                          <Input
                            id="symbol"
                            value={orderForm.symbol}
                            onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value })}
                            placeholder="e.g., EURUSD"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="side">Side</Label>
                          <select
                            id="side"
                            value={orderForm.side}
                            onChange={(e) => setOrderForm({ ...orderForm, side: e.target.value })}
                            className="w-full p-2 border rounded-md bg-slate-700 text-white"
                          >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Order Type</Label>
                          <select
                            id="type"
                            value={orderForm.type}
                            onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                            className="w-full p-2 border rounded-md bg-slate-700 text-white"
                          >
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={orderForm.quantity}
                            onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                            placeholder="0.01"
                          />
                        </div>
                        {orderForm.type === 'limit' && (
                          <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              type="number"
                              value={orderForm.price}
                              onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                              placeholder="1.2345"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="stopLoss">Stop Loss</Label>
                          <Input
                            id="stopLoss"
                            type="number"
                            value={orderForm.stopLoss}
                            onChange={(e) => setOrderForm({ ...orderForm, stopLoss: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="takeProfit">Take Profit</Label>
                          <Input
                            id="takeProfit"
                            type="number"
                            value={orderForm.takeProfit}
                            onChange={(e) => setOrderForm({ ...orderForm, takeProfit: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handlePlaceOrder} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="positions" className="space-y-4">
                  <div className="space-y-2">
                    {positions.length === 0 ? (
                      <p className="text-slate-400">No open positions</p>
                    ) : (
                      positions.map((position) => (
                        <Card key={position.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-semibold text-white">{position.symbol}</h3>
                                  <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                                    {position.side.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-sm text-slate-300">
                                  <p>Quantity: {position.quantity}</p>
                                  <p>Entry: ${position.entryPrice}</p>
                                  <p>Current: ${position.currentPrice}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${position.unrealizedPnL.toFixed(2)}
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleClosePosition(position.symbol)}
                                  className="mt-2"
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="balance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {balance.map((bal) => (
                      <Card key={bal.currency} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{bal.currency}</h3>
                              <p className="text-slate-300">Balance: ${bal.balance.toFixed(2)}</p>
                              <p className="text-slate-300">Equity: ${bal.equity.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-300">Free Margin: ${bal.freeMargin.toFixed(2)}</p>
                              <p className="text-slate-300">Margin Level: {bal.marginLevel.toFixed(2)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-2">
                    {orderHistory.length === 0 ? (
                      <p className="text-slate-400">No order history</p>
                    ) : (
                      orderHistory.slice(0, 10).map((order) => (
                        <Card key={order.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-semibold text-white">{order.symbol}</h3>
                                  <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                                    {order.side.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">{order.type}</Badge>
                                </div>
                                <div className="text-sm text-slate-300">
                                  <p>Quantity: {order.quantity}</p>
                                  <p>Price: ${order.price}</p>
                                  <p>Status: {order.status}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm text-slate-300">
                                <p>{new Date(order.timestamp).toLocaleDateString()}</p>
                                <p>{new Date(order.timestamp).toLocaleTimeString()}</p>
                                {order.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="mt-2"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              message.includes('Success') || message.includes('successfully') 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 