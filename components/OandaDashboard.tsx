"use client";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function OandaDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isPractice, setIsPractice] = useState(true);
  const [tab, setTab] = useState('account');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instruments, setInstruments] = useState('EUR_USD,GBP_USD,USD_JPY');

  const fetchData = async (action: string, params: any = {}) => {
    setLoading(true);
    setData(null);
    const res = await fetch('/api/broker/oanda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, accountId, isPractice, action, params })
    });
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    if (apiKey && accountId) fetchData(tab);
    // eslint-disable-next-line
  }, [tab]);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">OANDA Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Input placeholder="OANDA API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <Input placeholder="Account ID" value={accountId} onChange={e => setAccountId(e.target.value)} />
          <Button onClick={() => setIsPractice(!isPractice)}>{isPractice ? 'Practice' : 'Live'}</Button>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            {loading ? 'Loading...' : <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
          </TabsContent>
          <TabsContent value="positions">
            {loading ? 'Loading...' : <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
          </TabsContent>
          <TabsContent value="orders">
            {loading ? 'Loading...' : <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
          </TabsContent>
          <TabsContent value="trades">
            {loading ? 'Loading...' : <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
          </TabsContent>
          <TabsContent value="pricing">
            <div className="mb-2">
              <Input value={instruments} onChange={e => setInstruments(e.target.value)} placeholder="Instruments (comma separated)" />
              <Button onClick={() => fetchData('pricing', { instruments })} className="ml-2">Get Pricing</Button>
            </div>
            {loading ? 'Loading...' : <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
            <div className="mt-4">
              {/* TradingView Widget Example */}
              <iframe
                src={`https://www.tradingview.com/widgetembed/?symbol=OANDA:${instruments.split(',')[0]}&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&hideideas=1&studies_overrides={}`}
                height="400"
                width="100%"
                frameBorder="0"
                allowFullScreen
                title="TradingView Chart"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 