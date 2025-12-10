export var InjectiveErrorCode;
(function (InjectiveErrorCode) {
    InjectiveErrorCode["Unknown"] = "UNKNOWN";
    InjectiveErrorCode["Network"] = "NETWORK_ERROR";
    InjectiveErrorCode["Validation"] = "VALIDATION_ERROR";
    InjectiveErrorCode["Wallet"] = "WALLET_ERROR";
    InjectiveErrorCode["Broadcast"] = "BROADCAST_ERROR";
    InjectiveErrorCode["Simulation"] = "SIMULATION_ERROR";
})(InjectiveErrorCode || (InjectiveErrorCode = {}));
export class InjectiveError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
    }
}
export class WebSocketStream {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        // Placeholder streaming base to be wired to real Injective WS endpoints.
        // Handles reconnect & backoff semantics in a single abstraction.
        this.socket = null;
        this.retries = 0;
    }
    subscribe(onMessage) {
        const { reconnect = true, maxRetries = 5, backoffMs = 1000 } = this.options;
        const connect = () => {
            if (typeof WebSocket === "undefined") {
                // In non-browser environments the consumer should provide a polyfill.
                return;
            }
            this.socket = new WebSocket(this.url);
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                }
                catch {
                    // Ignore parse errors; caller can opt into raw mode in a future version.
                }
            };
            this.socket.onclose = () => {
                if (!reconnect)
                    return;
                if (this.retries >= maxRetries)
                    return;
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
    constructor(options) {
        this.network = options.network;
        this.wallet = options.wallet;
        this.rpcUrl = options.rpcUrl;
        this.restUrl = options.restUrl;
        this.env = options.network ?? "testnet";
        this.chainId = options.chainId;
    }
    /**
     * Helper for creating a streaming connection to an Injective endpoint.
     * Example: ws.injective.network orderbook / trades streams.
     */
    createWebSocketStream(path, options) {
        const base = this.network === "mainnet"
            ? "wss://api.injective.network"
            : this.network === "devnet"
                ? "wss://devnet.api.injective.network"
                : "wss://testnet.api.injective.network";
        const url = `${base}${path}`;
        return new WebSocketStream(url, options);
    }
    // TODO: wire into actual Injective / CosmJS client(s), keeping protobuf hidden from callers.
    async simulateGas(_tx) {
        // placeholder gas simulation
        return BigInt(200000);
    }
    async broadcastTx(_tx) {
        // placeholder broadcast
        return "FAKE_TX_HASH";
    }
}
//# sourceMappingURL=index.js.map