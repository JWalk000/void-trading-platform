"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  Target,
  Link,
  Unlink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react"
import BrokerConnectionModal from "@/components/BrokerConnectionModal"
import CryptoTradingPanel from "@/components/CryptoTradingPanel"
import TradeLockerPanel from "@/components/TradeLockerPanel"
import OandaDashboard from "@/components/OandaDashboard"

interface AccountData {
  balance: number
  currency: string
  change24h: number
  changePercent24h: number
  isConnected: boolean
  brokerName: string
}

interface PerformanceData {
  daily: { pnl: number; percent: number }
  weekly: { pnl: number; percent: number }
  monthly: { pnl: number; percent: number }
  total: { pnl: number; percent: number }
}

export default function Dashboard() {
  const [accountData, setAccountData] = useState<AccountData>({
    balance: 0,
    currency: "USD",
    change24h: 0,
    changePercent24h: 0,
    isConnected: false,
    brokerName: "Not Connected"
  })

  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    daily: { pnl: 0, percent: 0 },
    weekly: { pnl: 0, percent: 0 },
    monthly: { pnl: 0, percent: 0 },
    total: { pnl: 0, percent: 0 }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false)

  // Simulate fetching account data
  const fetchAccountData = async () => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setAccountData({
        balance: 12547.89,
        currency: "USD",
        change24h: 234.56,
        changePercent24h: 1.91,
        isConnected: true,
        brokerName: "Binance"
      })
      setIsLoading(false)
    }, 1000)
  }

  // Simulate fetching performance data
  const fetchPerformanceData = async () => {
    setPerformanceData({
      daily: { pnl: 234.56, percent: 1.91 },
      weekly: { pnl: 1247.89, percent: 11.05 },
      monthly: { pnl: 3456.78, percent: 38.12 },
      total: { pnl: 12547.89, percent: 245.67 }
    })
  }

  useEffect(() => {
    fetchAccountData()
    fetchPerformanceData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: accountData.currency
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-green-400" : "text-red-400"
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const handleBrokerConnect = async (broker: string, config: any) => {
    try {
      // Handle broker connection logic here
      console.log('Connecting to broker:', broker, config);
      // You can add actual connection logic here
      setAccountData(prev => ({
        ...prev,
        isConnected: true,
        brokerName: broker
      }));
    } catch (error) {
      console.error('Broker connection failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-slate-400">Welcome back! Here's your trading overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge 
              className={`${
                accountData.isConnected 
                  ? "bg-green-400/10 text-green-400 border-green-400/20" 
                  : "bg-red-400/10 text-red-400 border-red-400/20"
              }`}
            >
              {accountData.isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected to {accountData.brokerName}
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
            <Button 
              onClick={fetchAccountData} 
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Account Balance Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(accountData.balance)}
                </div>
                <div className={`flex items-center gap-2 ${getPerformanceColor(accountData.changePercent24h)}`}>
                  {getPerformanceIcon(accountData.changePercent24h)}
                  <span>{formatCurrency(accountData.change24h)} ({formatPercent(accountData.changePercent24h)})</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Last 24 hours</p>
              </div>
              <div className="flex items-center justify-end">
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setIsBrokerModalOpen(true)}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Connect Broker
                </Button>
                <BrokerConnectionModal 
                  isOpen={isBrokerModalOpen}
                  onClose={() => setIsBrokerModalOpen(false)}
                  onConnect={handleBrokerConnect}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="daily" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="total" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Total
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.daily.pnl)}`}>
                    {formatCurrency(performanceData.daily.pnl)}
                  </div>
                  <div className={`text-sm ${getPerformanceColor(performanceData.daily.percent)}`}>
                    {formatPercent(performanceData.daily.percent)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">24</div>
                  <div className="text-sm text-slate-400">Today</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">87.5%</div>
                  <div className="text-sm text-slate-400">21/24 trades</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.weekly.pnl)}`}>
                    {formatCurrency(performanceData.weekly.pnl)}
                  </div>
                  <div className={`text-sm ${getPerformanceColor(performanceData.weekly.percent)}`}>
                    {formatPercent(performanceData.weekly.percent)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-sm text-slate-400">This Week</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">82.1%</div>
                  <div className="text-sm text-slate-400">128/156 trades</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.monthly.pnl)}`}>
                    {formatCurrency(performanceData.monthly.pnl)}
                  </div>
                  <div className={`text-sm ${getPerformanceColor(performanceData.monthly.percent)}`}>
                    {formatPercent(performanceData.monthly.percent)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">642</div>
                  <div className="text-sm text-slate-400">This Month</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">85.7%</div>
                  <div className="text-sm text-slate-400">550/642 trades</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="total" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.total.pnl)}`}>
                    {formatCurrency(performanceData.total.pnl)}
                  </div>
                  <div className={`text-sm ${getPerformanceColor(performanceData.total.percent)}`}>
                    {formatPercent(performanceData.total.percent)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2,847</div>
                  <div className="text-sm text-slate-400">All Time</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">84.2%</div>
                  <div className="text-sm text-slate-400">2,397/2,847 trades</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Crypto Trading Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Crypto Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CryptoTradingPanel />
          </CardContent>
        </Card>

        {/* TradeLocker Trading Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              TradeLocker Professional Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradeLockerPanel />
          </CardContent>
        </Card>

        {/* OANDA Dashboard Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              OANDA Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OandaDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 