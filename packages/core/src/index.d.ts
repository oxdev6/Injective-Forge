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
export declare enum InjectiveErrorCode {
    Unknown = "UNKNOWN",
    Network = "NETWORK_ERROR",
    Validation = "VALIDATION_ERROR",
    Wallet = "WALLET_ERROR",
    Broadcast = "BROADCAST_ERROR",
    Simulation = "SIMULATION_ERROR"
}
export declare class InjectiveError extends Error {
    readonly code: InjectiveErrorCode;
    readonly cause?: unknown;
    constructor(code: InjectiveErrorCode, message: string, cause?: unknown);
}
export interface StreamOptions {
    reconnect?: boolean;
    maxRetries?: number;
    backoffMs?: number;
}
export declare class WebSocketStream {
    private readonly url;
    private readonly options;
    private socket;
    private retries;
    constructor(url: string, options?: StreamOptions);
    subscribe<T>(onMessage: (msg: T) => void): () => void;
}
export declare class InjectiveClient {
    readonly rpcUrl?: string;
    readonly restUrl?: string;
    readonly env: InjectiveEnv;
    readonly chainId?: string;
    readonly network?: InjectiveNetwork;
    readonly wallet?: string;
    constructor(options: InjectiveClientOptions);
    /**
     * Helper for creating a streaming connection to an Injective endpoint.
     * Example: ws.injective.network orderbook / trades streams.
     */
    createWebSocketStream(path: string, options?: StreamOptions): WebSocketStream;
    simulateGas(_tx: unknown): Promise<bigint>;
    broadcastTx(_tx: unknown): Promise<string>;
}
export interface SubaccountId {
    value: string;
}
export interface ExchangeOrder {
    marketId: string;
    subaccountId: SubaccountId;
    price: string;
    quantity: string;
}
