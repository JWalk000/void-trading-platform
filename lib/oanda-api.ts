import fetch from 'node-fetch';

export class OandaAPI {
  private apiKey: string;
  private accountId: string;
  private baseUrl: string;

  constructor(apiKey: string, accountId: string, isPractice: boolean = true) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseUrl = isPractice
      ? 'https://api-fxpractice.oanda.com/v3'
      : 'https://api-fxtrade.oanda.com/v3';
  }

  private async request(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const options: any = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Account summary
  async getAccountSummary() {
    return this.request(`/accounts/${this.accountId}/summary`);
  }

  // Open positions
  async getOpenPositions() {
    return this.request(`/accounts/${this.accountId}/openPositions`);
  }

  // Orders
  async getOrders() {
    return this.request(`/accounts/${this.accountId}/orders`);
  }
  async placeOrder(order: any) {
    return this.request(`/accounts/${this.accountId}/orders`, 'POST', { order });
  }
  async cancelOrder(orderId: string) {
    return this.request(`/accounts/${this.accountId}/orders/${orderId}/cancel`, 'PUT');
  }

  // Trades
  async getTrades() {
    return this.request(`/accounts/${this.accountId}/trades`);
  }
  async closeTrade(tradeId: string) {
    return this.request(`/accounts/${this.accountId}/trades/${tradeId}/close`, 'PUT');
  }

  // Pricing
  async getPricing(instruments: string) {
    return this.request(`/accounts/${this.accountId}/pricing?instruments=${instruments}`);
  }
} 