import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { InjectiveProvider, useWallet } from "@injective-devkit/react";
import { Orderbook, TradeHistory, SubaccountSelector, BroadcastButton, MobileBrowserGuard } from "@injective-devkit/ui";
import "./styles.css";

const TradingApp: React.FC = () => {
  const { connection, connecting, error, connectKeplr, connectMetamask, disconnect, isConnected, keplrAvailable, metamaskAvailable } = useWallet();
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pendingTx, setPendingTx] = useState<unknown | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleConnectKeplr = async () => {
    setWalletError(null);
    setConnecting(true);
    try {
      await connectKeplr();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect Keplr wallet";
      setWalletError(errorMessage);
      console.error("Keplr connection error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectMetamask = async () => {
    setWalletError(null);
    setConnecting(true);
    try {
      await connectMetamask();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect Metamask wallet";
      setWalletError(errorMessage);
      console.error("Metamask connection error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setPendingTx(null);
  };

  const walletAddress = connection?.bech32Address || connection?.evmAddress || null;
  const displayAddress = walletAddress 
    ? walletAddress.length > 20 
      ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
      : walletAddress
    : null;

  const handlePlaceOrder = () => {
    if (!isConnected) {
      setWalletError("Please connect a wallet first");
      return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      setWalletError("Please enter a valid quantity");
      return;
    }
    
    if (orderType === "limit") {
      if (!price || parseFloat(price) <= 0) {
        setWalletError("Please enter a valid price for limit orders");
        return;
      }
    }
    
    setWalletError(null);
    
    // Create order tx object
    const tx = {
      type: orderType,
      side,
      market: "BTC-INJ",
      price: orderType === "market" ? 42350 : parseFloat(price), // Use market price for market orders
      quantity: parseFloat(quantity),
      timestamp: Date.now()
    };
    
    setPendingTx(tx);
  };

  return (
    <InjectiveProvider clientOptions={{ network: "testnet", wallet: "keplr" }}>
      <MobileBrowserGuard>
        <div className="trading-app">
          {/* Header */}
          <header className="trading-header">
            <div className="trading-header__left">
              <h1 className="trading-logo">Injective Exchange</h1>
            </div>
            <div className="trading-header__right">
              {isConnected ? (
                <div className="wallet-info">
                  <span className="wallet-address">{displayAddress}</span>
                  <span className="wallet-type">{connection?.wallet === "keplr" ? "Keplr" : "Metamask"}</span>
                  <button className="btn-secondary" onClick={handleDisconnect}>Disconnect</button>
                </div>
              ) : (
                <div className="wallet-connect">
                  <div className="wallet-buttons">
                    <button 
                      className="btn-primary" 
                      onClick={handleConnectKeplr}
                      disabled={connecting}
                      title={!keplrAvailable ? "Keplr wallet not detected. Install from https://www.keplr.app/" : "Connect with Keplr wallet"}
                    >
                      {connecting ? "Connecting..." : "Connect Keplr"}
                      {!keplrAvailable && <span className="wallet-indicator"></span>}
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={handleConnectMetamask}
                      disabled={connecting}
                      title={!metamaskAvailable ? "Metamask wallet not detected. Install from https://metamask.io/" : "Connect with Metamask wallet"}
                    >
                      {connecting ? "Connecting..." : "Connect Metamask"}
                      {!metamaskAvailable && <span className="wallet-indicator"></span>}
                    </button>
                  </div>
                  {walletError && (
                    <div className="wallet-error" role="alert">
                      {walletError}
                    </div>
                  )}
                  {!keplrAvailable && !metamaskAvailable && !walletError && (
                    <div className="wallet-hint">
                      Install a wallet extension to connect. <a href="https://www.keplr.app/" target="_blank" rel="noopener noreferrer">Keplr</a> or <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">Metamask</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Main Trading Interface */}
          <main className="trading-main">
            {/* Left Column: Orderbook */}
            <aside className="trading-sidebar">
              <Orderbook marketId="BTC-INJ" depth={15} />
            </aside>

            {/* Center: Trading Panel */}
            <section className="trading-center">
              {/* Market Selector */}
              <div className="market-selector">
                <div className="market-info">
                  <span className="market-pair">BTC / INJ</span>
                  <span className="market-price">$42,350.00</span>
                  <span className="market-change positive">+2.34%</span>
                </div>
              </div>

              {/* Trading Panel */}
              <div className="trading-panel">
                {/* Order Type Tabs */}
                <div className="order-type-tabs">
                  <button
                    className={`order-tab ${orderType === "limit" ? "active" : ""}`}
                    onClick={() => {
                      setOrderType("limit");
                      setPrice("");
                      setQuantity("");
                    }}
                  >
                    <span className="tab-icon tab-icon--limit"></span>
                    <span>Limit Order</span>
                  </button>
                  <button
                    className={`order-tab ${orderType === "market" ? "active" : ""}`}
                    onClick={() => {
                      setOrderType("market");
                      setPrice("");
                      setQuantity("");
                    }}
                  >
                    <span className="tab-icon tab-icon--market"></span>
                    <span>Market Order</span>
                  </button>
                </div>

                {/* Limit Order View */}
                {orderType === "limit" && (
                  <div className="order-view order-view--limit">
                    <div className="view-header">
                      <h3>Limit Order</h3>
                      <p className="view-description">Set your desired price and quantity. Order executes when market reaches your price.</p>
                    </div>

                    {/* Buy/Sell Tabs */}
                    <div className="side-tabs">
                      <button
                        className={`side-tab side-tab--buy ${side === "buy" ? "active" : ""}`}
                        onClick={() => setSide("buy")}
                      >
                        Buy
                      </button>
                      <button
                        className={`side-tab side-tab--sell ${side === "sell" ? "active" : ""}`}
                        onClick={() => setSide("sell")}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Order Form */}
                    <div className="order-form">
                      <div className="form-group">
                        <label>Price (INJ)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="42,350.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          step="0.01"
                        />
                        <div className="form-hint">Current market: $42,350.00</div>
                      </div>
                      <div className="form-group">
                        <label>Quantity (BTC)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.00"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          step="0.0001"
                        />
                        <div className="form-hint">Min: 0.001 BTC</div>
                      </div>
                      <div className="form-summary">
                        <div className="summary-row">
                          <span>Total</span>
                          <span>{price && quantity ? (parseFloat(price) * parseFloat(quantity)).toFixed(4) : "0.00"} INJ</span>
                        </div>
                        <div className="summary-row">
                          <span>Fee</span>
                          <span>0.1%</span>
                        </div>
                        <div className="summary-row">
                          <span>Order Type</span>
                          <span className="summary-badge">Limit</span>
                        </div>
                      </div>
                      <button
                        className={`btn-order btn-order--${side}`}
                        onClick={handlePlaceOrder}
                        disabled={!isConnected || !price || !quantity || parseFloat(price) <= 0 || parseFloat(quantity) <= 0}
                      >
                        {side === "buy" ? "Place Buy Order" : "Place Sell Order"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Market Order View */}
                {orderType === "market" && (
                  <div className="order-view order-view--market">
                    <div className="view-header">
                      <h3>Market Order</h3>
                      <p className="view-description">Execute immediately at the best available market price. Faster execution, no price guarantee.</p>
                    </div>

                    {/* Buy/Sell Tabs */}
                    <div className="side-tabs">
                      <button
                        className={`side-tab side-tab--buy ${side === "buy" ? "active" : ""}`}
                        onClick={() => setSide("buy")}
                      >
                        Buy
                      </button>
                      <button
                        className={`side-tab side-tab--sell ${side === "sell" ? "active" : ""}`}
                        onClick={() => setSide("sell")}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Order Form */}
                    <div className="order-form">
                      <div className="market-price-display">
                        <div className="price-info">
                          <span className="price-label">Market Price</span>
                          <span className="price-value">$42,350.00 INJ</span>
                        </div>
                        <div className="price-warning">
                          <span className="warning-icon"></span>
                          Price may vary at execution time
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Quantity (BTC)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.00"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          step="0.0001"
                        />
                        <div className="form-hint">Min: 0.001 BTC</div>
                      </div>
                      <div className="form-group">
                        <label>Estimated Cost</label>
                        <div className="estimated-cost">
                          {quantity ? (42350 * parseFloat(quantity)).toFixed(2) : "0.00"} INJ
                        </div>
                        <div className="form-hint">Based on current market price</div>
                      </div>
                      <div className="form-summary">
                        <div className="summary-row">
                          <span>Order Type</span>
                          <span className="summary-badge summary-badge--market">Market</span>
                        </div>
                        <div className="summary-row">
                          <span>Fee</span>
                          <span>0.1%</span>
                        </div>
                        <div className="summary-row">
                          <span>Execution</span>
                          <span>Immediate</span>
                        </div>
                      </div>
                      <button
                        className={`btn-order btn-order--${side}`}
                        onClick={handlePlaceOrder}
                        disabled={!isConnected || !quantity || parseFloat(quantity) <= 0}
                      >
                        {side === "buy" ? "Execute Buy Order" : "Execute Sell Order"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Balance Display */}
                {isConnected && (
                  <div className="balance-display">
                    <div className="balance-item">
                      <span className="balance-label">Available</span>
                      <span className="balance-value">1,234.56 INJ</span>
                    </div>
                    <div className="balance-item">
                      <span className="balance-label">In Orders</span>
                      <span className="balance-value">56.78 INJ</span>
                    </div>
                  </div>
                )}

                {/* Broadcast Section */}
                {pendingTx && (
                  <div className="broadcast-section">
                    <div className="broadcast-header">
                      <h3>Ready to Broadcast</h3>
                      <div className="order-preview">
                        <div className="preview-row">
                          <span>Type:</span>
                          <span className="preview-value">{orderType === "limit" ? "Limit Order" : "Market Order"}</span>
                        </div>
                        <div className="preview-row">
                          <span>Side:</span>
                          <span className={`preview-value preview-value--${side}`}>{side.toUpperCase()}</span>
                        </div>
                        <div className="preview-row">
                          <span>Price:</span>
                          <span className="preview-value">{price} INJ</span>
                        </div>
                        <div className="preview-row">
                          <span>Quantity:</span>
                          <span className="preview-value">{quantity} BTC</span>
                        </div>
                      </div>
                    </div>
                    <BroadcastButton
                      tx={pendingTx}
                      onBroadcast={(hash) => {
                        alert(`Transaction broadcasted!\nHash: ${hash}\n\nView on explorer: https://explorer.injective.network/tx/${hash}`);
                        setPendingTx(null);
                        setPrice("");
                        setQuantity("");
                      }}
                    />
                    <button 
                      className="btn-secondary" 
                      onClick={() => setPendingTx(null)}
                      style={{ marginTop: "8px", width: "100%" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Trades & Info */}
            <aside className="trading-sidebar trading-sidebar--right">
              <TradeHistory marketId="BTC-INJ" limit={20} />
              <div className="info-card">
                <h3>Open Orders</h3>
                <div className="empty-state">No open orders</div>
              </div>
            </aside>
          </main>
        </div>
      </MobileBrowserGuard>
    </InjectiveProvider>
  );
};

const App: React.FC = () => {
  return (
    <InjectiveProvider clientOptions={{ network: "mainnet", wallet: "keplr" }}>
      <MobileBrowserGuard>
        <TradingApp />
      </MobileBrowserGuard>
    </InjectiveProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
