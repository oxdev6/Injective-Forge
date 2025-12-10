export type InjectiveEnv = "mainnet" | "testnet" | "devnet";

export type InjectiveNetwork = "mainnet" | "testnet" | "devnet";

export interface InjectiveClientOptions {
  /**
   * High-level network name – preferred way to initialize in apps.
   * Example: { network: 'mainnet', wallet: 'keplr' }
   */
  network?: InjectiveNetwork;
  /**
   * Optional wallet hint used for UX defaults.
   */
  wallet?: string;
  /**
   * Low-level RPC / REST configuration, if overriding defaults.
   */
  rpcUrl?: string;
  restUrl?: string;
  chainId?: string;
}

export enum InjectiveErrorCode {
  Unknown = "UNKNOWN",
  Network = "NETWORK_ERROR",
  Validation = "VALIDATION_ERROR",
  Wallet = "WALLET_ERROR",
  Broadcast = "BROADCAST_ERROR",
  Simulation = "SIMULATION_ERROR"
}

export class InjectiveError extends Error {
  readonly code: InjectiveErrorCode;
  readonly cause?: unknown;

  constructor(code: InjectiveErrorCode, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}

export interface StreamOptions {
  reconnect?: boolean;
  maxRetries?: number;
  backoffMs?: number;
}

export class WebSocketStream {
  // Placeholder streaming base to be wired to real Injective WS endpoints.
  // Handles reconnect & backoff semantics in a single abstraction.
  private socket: WebSocket | null = null;
  private retries = 0;

  constructor(private readonly url: string, private readonly options: StreamOptions = {}) {}

  subscribe<T>(onMessage: (msg: T) => void): () => void {
    const { reconnect = true, maxRetries = 5, backoffMs = 1_000 } = this.options;
    const connect = () => {
      if (typeof WebSocket === "undefined") {
        // In non-browser environments the consumer should provide a polyfill.
        return;
      }

      this.socket = new WebSocket(this.url);
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as T;
          onMessage(data);
        } catch {
          // Ignore parse errors; caller can opt into raw mode in a future version.
        }
      };

      this.socket.onclose = () => {
        if (!reconnect) return;
        if (this.retries >= maxRetries) return;
        this.retries += 1;
        setTimeout(connect, backoffMs * this.retries);
      };
    };

    connect();

    return () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    };
  }
}

export class InjectiveClient {
  readonly rpcUrl?: string;
  readonly restUrl?: string;
  readonly env: InjectiveEnv;
  readonly chainId?: string;
  readonly network?: InjectiveNetwork;
  readonly wallet?: string;

  constructor(options: InjectiveClientOptions) {
    this.network = options.network;
    this.wallet = options.wallet;
    this.rpcUrl = options.rpcUrl;
    this.restUrl = options.restUrl;
    this.env = (options.network as InjectiveEnv) ?? "testnet";
    this.chainId = options.chainId;
  }

  /**
   * Helper for creating a streaming connection to an Injective endpoint.
   * Example: ws.injective.network orderbook / trades streams.
   */
  createWebSocketStream(path: string, options?: StreamOptions): WebSocketStream {
    const base =
      this.network === "mainnet"
        ? "wss://api.injective.network"
        : this.network === "devnet"
        ? "wss://devnet.api.injective.network"
        : "wss://testnet.api.injective.network";

    const url = `${base}${path}`;
    return new WebSocketStream(url, options);
  }

  // TODO: wire into actual Injective / CosmJS client(s), keeping protobuf hidden from callers.

  async simulateGas(_tx: unknown): Promise<bigint> {
    // placeholder gas simulation
    return BigInt(200_000);
  }

  async broadcastTx(_tx: unknown): Promise<string> {
    // placeholder broadcast
    return "FAKE_TX_HASH";
  }

  // Spot / Perp / NFT / IBC helpers and type-safe query builders will be added in follow-up iterations.
}

// Placeholder type system hooks for future ABI → types generation
export interface SubaccountId {
  value: string;
}

export interface ExchangeOrder {
  marketId: string;
  subaccountId: SubaccountId;
  price: string;
  quantity: string;
}



