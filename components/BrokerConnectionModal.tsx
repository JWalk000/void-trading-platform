"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Link, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Shield
} from "lucide-react"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BROKERS = [
  {
    id: "binance",
    name: "Binance",
    logo: "🔶",
    description: "Global cryptocurrency exchange",
    apiUrl: "https://binance.com/en/my/settings/api-management",
    fields: ["API Key", "Secret Key"]
  },
  {
    id: "coinbase",
    name: "Coinbase Pro",
    logo: "🔵",
    description: "Professional trading platform",
    apiUrl: "https://pro.coinbase.com/profile/api",
    fields: ["API Key", "Secret Key", "Passphrase"]
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🔷",
    description: "Cryptocurrency exchange",
    apiUrl: "https://www.kraken.com/u/settings/api",
    fields: ["API Key", "Private Key"]
  },
  {
    id: "tradelocker",
    name: "TradeLocker",
    logo: "🔷",
    description: "Professional trading platform",
    apiUrl: "",
    fields: ["API Key", "Secret Key", "Account ID", "Base URL", "Environment"]
  },
  {
    id: "custom",
    name: "Custom API",
    logo: "⚙️",
    description: "Connect to any trading API",
    apiUrl: "",
    fields: ["API Key", "Secret Key", "Base URL", "Environment"]
  }
]

interface BrokerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (broker: string, config: any) => void;
}

export default function BrokerConnectionModal({ isOpen, onClose, onConnect }: BrokerConnectionModalProps) {
  const [selectedBroker, setSelectedBroker] = useState(BROKERS[0].id)
  const [showSecrets, setShowSecrets] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState({
    apiKey: "",
    secretKey: "",
    passphrase: "",
    baseUrl: "",
    environment: "demo",
    accountId: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await onConnect(selectedBroker, config)
      onClose()
    } catch (err: any) {
      console.error("Connection failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getBrokerFields = () => {
    switch (selectedBroker) {
      case "binance":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your Binance API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                value={config.secretKey}
                onChange={handleInputChange}
                placeholder="Enter your Binance secret key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                value={config.environment}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="demo">Demo/Testnet</option>
                <option value="live">Live</option>
              </select>
            </div>
          </>
        )
      case "coinbase":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your Coinbase API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                value={config.secretKey}
                onChange={handleInputChange}
                placeholder="Enter your Coinbase secret key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                name="passphrase"
                type="password"
                value={config.passphrase}
                onChange={handleInputChange}
                placeholder="Enter your Coinbase passphrase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                value={config.environment}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="demo">Sandbox</option>
                <option value="live">Live</option>
              </select>
            </div>
          </>
        )
      case "kraken":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your Kraken API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                value={config.secretKey}
                onChange={handleInputChange}
                placeholder="Enter your Kraken secret key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                value={config.environment}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </div>
          </>
        )
      case "tradelocker":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your TradeLocker API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                value={config.secretKey}
                onChange={handleInputChange}
                placeholder="Enter your TradeLocker secret key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                name="accountId"
                value={config.accountId}
                onChange={handleInputChange}
                placeholder="Enter your TradeLocker account ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL (Optional)</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                value={config.baseUrl}
                onChange={handleInputChange}
                placeholder="https://api.tradelocker.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                value={config.environment}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </div>
          </>
        )
      case "custom":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                value={config.secretKey}
                onChange={handleInputChange}
                placeholder="Enter your secret key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                value={config.baseUrl}
                onChange={handleInputChange}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                name="environment"
                value={config.environment}
                onChange={handleSelectChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Link className="w-4 h-4 mr-2" />
          Connect Broker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connect Trading Account
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Securely connect your trading account to start automated trading
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Tabs value={selectedBroker} onValueChange={setSelectedBroker}>
            <TabsList className="grid w-full grid-cols-5">
              {BROKERS.map((broker) => (
                <TabsTrigger key={broker.id} value={broker.id} className="text-xs">
                  {broker.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {BROKERS.map((broker) => (
              <TabsContent key={broker.id} value={broker.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{broker.name}</h3>
                  <Badge variant="secondary">{broker.description}</Badge>
                </div>
                
                <div className="space-y-4">
                  {getBrokerFields()}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 