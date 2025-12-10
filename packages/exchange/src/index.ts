import type { InjectiveClient } from "@injective-devkit/core";
import { WebSocketStream } from "@injective-devkit/core";

export interface CreateOrderParams {
  marketId: string;
  price: string;
  quantity: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  subaccountId?: string;
}

export interface CancelOrderParams {
  marketId: string;
  orderHash: string;
  subaccountId?: string;
}

export type OrderbookLevel = [price: string, quantity: string];

export interface OrderbookSnapshot {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  updatedAt: number;
}

export interface Trade {
  price: string;
  quantity: string;
  side: "buy" | "sell";
  ts: number;
}

export type OrderbookStreamCallback = (snapshot: OrderbookSnapshot) => void;
export type TradeStreamCallback = (trades: Trade[]) => void;

export class ExchangeClient {
  constructor(private readonly client: InjectiveClient) {}

  async createOrder(_params: CreateOrderParams): Promise<string> {
    // TODO: construct and broadcast actual Injective order tx
    return this.client.broadcastTx({});
  }

  async cancelOrder(_params: CancelOrderParams): Promise<string> {
    // TODO: construct and broadcast actual Injective cancel tx
    return this.client.broadcastTx({});
  }

  streamOrderbook(marketId: string, onUpdate: OrderbookStreamCallback): () => void {
    // Generate realistic mock orderbook data
    const basePrice = 42350;
    const generateLevels = (side: "bids" | "asks", count: number): OrderbookLevel[] => {
      const levels: OrderbookLevel[] = [];
      const sign = side === "bids" ? -1 : 1;
      for (let i = 0; i < count; i++) {
        const priceOffset = sign * (i * 10 + Math.random() * 5);
        const price = (basePrice + priceOffset).toFixed(2);
        const qty = (Math.random() * 2 + 0.1).toFixed(4);
        levels.push([price, qty]);
      }
      return side === "bids" ? levels.reverse() : levels;
    };

    // Initial snapshot
    const initialSnapshot: OrderbookSnapshot = {
      bids: generateLevels("bids", 15),
      asks: generateLevels("asks", 15),
      updatedAt: Date.now()
    };
    onUpdate(initialSnapshot);

    // Simulate updates
    const interval = setInterval(() => {
      const snapshot: OrderbookSnapshot = {
        bids: generateLevels("bids", 15),
        asks: generateLevels("asks", 15),
        updatedAt: Date.now()
      };
      onUpdate(snapshot);
    }, 2000);

    return () => clearInterval(interval);
  }

  streamTrades(marketId: string, onTrades: TradeStreamCallback): () => void {
    // Generate realistic mock trade data
    const basePrice = 42350;
    const generateTrades = (count: number): Trade[] => {
      const trades: Trade[] = [];
      for (let i = 0; i < count; i++) {
        const priceOffset = (Math.random() - 0.5) * 100;
        const price = (basePrice + priceOffset).toFixed(2);
        const qty = (Math.random() * 1 + 0.01).toFixed(4);
        const side: "buy" | "sell" = Math.random() > 0.5 ? "buy" : "sell";
        trades.push({
          price,
          quantity: qty,
          side,
          ts: Date.now() - i * 1000
        });
      }
      return trades.sort((a, b) => b.ts - a.ts);
    };

    // Initial trades
    onTrades(generateTrades(20));

    // Simulate new trades
    const interval = setInterval(() => {
      const newTrade: Trade = {
        price: (basePrice + (Math.random() - 0.5) * 50).toFixed(2),
        quantity: (Math.random() * 0.5 + 0.01).toFixed(4),
        side: Math.random() > 0.5 ? "buy" : "sell",
        ts: Date.now()
      };
      // Get current trades and prepend new one
      const currentTrades = generateTrades(19);
      onTrades([newTrade, ...currentTrades]);
    }, 3000);

    return () => clearInterval(interval);
  }
}


