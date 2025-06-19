"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Target,
  Zap
} from "lucide-react"
import axios from "axios"

interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
}

const POPULAR_PAIRS = [
  { symbol: "BTC/USDT", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH/USDT", name: "Ethereum", icon: "Ξ" },
  { symbol: "BNB/USDT", name: "Binance Coin", icon: "🔶" },
  { symbol: "ADA/USDT", name: "Cardano", icon: "₳" },
  { symbol: "SOL/USDT", name: "Solana", icon: "◎" },
  { symbol: "DOT/USDT", name: "Polkadot", icon: "●" },
  { symbol: "DOGE/USDT", name: "Dogecoin", icon: "Ð" },
  { symbol: "AVAX/USDT", name: "Avalanche", icon: "❄" },
]

export default function CryptoTradingPanel() {
  const [selectedPair, setSelectedPair] = useState(POPULAR_PAIRS[0])
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [orderSize, setOrderSize] = useState("")
  const [orderPrice, setOrderPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [priceData, setPriceData] = useState<CryptoPrice>({
    symbol: "BTC/USDT",
    price: 43250.67,
    change24h: 1250.34,
    changePercent24h: 2.98,
    volume24h: 28475000000,
    marketCap: 847500000000
  })

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 100,
        change24h: prev.change24h + (Math.random() - 0.5) * 50,
        changePercent24h: prev.changePercent24h + (Math.random() - 0.5) * 0.5
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handlePlaceOrder = async () => {
    if (!orderSize || (orderType === "limit" && !orderPrice)) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await axios.post("/api/crypto/order", {
        userId: 1, // This should come from user session
        symbol: selectedPair.symbol,
        side: orderSide,
        size: orderSize,
        price: orderPrice,
        orderType,
        brokerId: 1 // This should come from selected broker connection
      })
      
      alert(`${orderSide.toUpperCase()} order placed successfully!`)
      
      // Reset form
      setOrderSize("")
      setOrderPrice("")
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to place order")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return volume.toString()
  }

  const getPriceColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getPriceIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPair.icon}</span>
              <div>
                <div className="text-xl">{selectedPair.name}</div>
                <div className="text-sm text-slate-400">{selectedPair.symbol}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(priceData.price)}
              </div>
              <div className={`flex items-center gap-2 ${getPriceColor(priceData.changePercent24h)}`}>
                {getPriceIcon(priceData.changePercent24h)}
                <span>{formatCurrency(priceData.change24h)} ({priceData.changePercent24h.toFixed(2)}%)</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">24h Change</p>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-white mb-1">
                {formatVolume(priceData.volume24h)}
              </div>
              <p className="text-slate-400 text-sm">24h Volume</p>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-white mb-1">
                {formatVolume(priceData.marketCap)}
              </div>
              <p className="text-slate-400 text-sm">Market Cap</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Pairs */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Popular Pairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {POPULAR_PAIRS.map((pair) => (
                <div
                  key={pair.symbol}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedPair.symbol === pair.symbol
                      ? "bg-orange-400/10 border border-orange-400/30"
                      : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"
                  }`}
                  onClick={() => setSelectedPair(pair)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{pair.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{pair.name}</div>
                        <div className="text-sm text-slate-400">{pair.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatCurrency(Math.random() * 50000 + 1000)}
                      </div>
                      <div className={`text-xs ${Math.random() > 0.5 ? "text-green-400" : "text-red-400"}`}>
                        {Math.random() > 0.5 ? "+" : "-"}{Math.random() * 5}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger 
                  value="market" 
                  className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                  onClick={() => setOrderType("market")}
                >
                  Market Order
                </TabsTrigger>
                <TabsTrigger 
                  value="limit" 
                  className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                  onClick={() => setOrderType("limit")}
                >
                  Limit Order
                </TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={orderSide === "buy" ? "default" : "outline"}
                    className={`${
                      orderSide === "buy" 
                        ? "bg-green-600 hover:bg-green-700 text-white border-0" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setOrderSide("buy")}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === "sell" ? "default" : "outline"}
                    className={`${
                      orderSide === "sell" 
                        ? "bg-red-600 hover:bg-red-700 text-white border-0" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setOrderSide("sell")}
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="size" className="text-slate-300">Amount ({selectedPair.symbol.split('/')[0]})</Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="0.00"
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Estimated Value:</span>
                      <span className="text-white">
                        {orderSize ? formatCurrency(parseFloat(orderSize) * priceData.price) : "$0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !orderSize}
                    className={`w-full ${
                      orderSide === "buy" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    } text-white border-0`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {orderSide === "buy" ? "Buy" : "Sell"} {selectedPair.symbol.split('/')[0]}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="limit" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={orderSide === "buy" ? "default" : "outline"}
                    className={`${
                      orderSide === "buy" 
                        ? "bg-green-600 hover:bg-green-700 text-white border-0" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setOrderSide("buy")}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === "sell" ? "default" : "outline"}
                    className={`${
                      orderSide === "sell" 
                        ? "bg-red-600 hover:bg-red-700 text-white border-0" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setOrderSide("sell")}
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="limit-price" className="text-slate-300">Price (USD)</Label>
                    <Input
                      id="limit-price"
                      type="number"
                      placeholder="0.00"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="limit-size" className="text-slate-300">Amount ({selectedPair.symbol.split('/')[0]})</Label>
                    <Input
                      id="limit-size"
                      type="number"
                      placeholder="0.00"
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Value:</span>
                      <span className="text-white">
                        {orderSize && orderPrice ? formatCurrency(parseFloat(orderSize) * parseFloat(orderPrice)) : "$0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !orderSize || !orderPrice}
                    className={`w-full ${
                      orderSide === "buy" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    } text-white border-0`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Place {orderSide === "buy" ? "Buy" : "Sell"} Order
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 