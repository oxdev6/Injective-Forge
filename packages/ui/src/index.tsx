import React from "react";
import { useOrderbook, useTrades, useInjectiveSubaccount, useGas, useMobile, useBroadcast } from "@injective-devkit/react";
import type { IlluminateVoteParams } from "@injective-devkit/react";

interface BaseProps {
  className?: string;
}

// Orderbook
export interface OrderbookProps extends BaseProps {
  marketId: string;
  /**
   * Maximum number of levels to render per side.
   */
  depth?: number;
}

export const Orderbook: React.FC<OrderbookProps> = ({ marketId, depth = 10, className }) => {
  const orderbook = useOrderbook(marketId);

  if (!orderbook) {
    return (
      <div className={`inj-card inj-orderbook ${className ?? ""}`} aria-busy="true" aria-live="polite">
        <div className="inj-card__header">
          <h3 className="inj-card__title">Orderbook</h3>
          <span className="inj-badge">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inj-card inj-orderbook ${className ?? ""}`} aria-live="polite">
      <div className="inj-card__header">
        <h3 className="inj-card__title">Orderbook</h3>
      </div>
      <div className="inj-orderbook__grid">
        <div className="inj-orderbook__side inj-orderbook__side--bids" aria-label="Bid levels">
          <div className="inj-orderbook__side-header">
            <span>Bid Size</span>
            <span>Price</span>
          </div>
          <ul className="inj-orderbook__list">
            {orderbook.bids.slice(0, depth).map(([price, qty], i) => (
              <li key={i} className="inj-orderbook__row inj-orderbook__row--bid">
                <span className="inj-orderbook__qty">{qty}</span>
                <span className="inj-orderbook__price">{price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="inj-orderbook__side inj-orderbook__side--asks" aria-label="Ask levels">
          <div className="inj-orderbook__side-header">
            <span>Price</span>
            <span>Ask Size</span>
          </div>
          <ul className="inj-orderbook__list">
            {orderbook.asks.slice(0, depth).map(([price, qty], i) => (
              <li key={i} className="inj-orderbook__row inj-orderbook__row--ask">
                <span className="inj-orderbook__price">{price}</span>
                <span className="inj-orderbook__qty">{qty}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// TradeHistory
export interface TradeHistoryProps extends BaseProps {
  marketId: string;
  limit?: number;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ marketId, limit = 30, className }) => {
  const trades = useTrades(marketId);

  if (!trades.length) {
    return (
      <div className={`inj-card inj-trade-history ${className ?? ""}`}>
        <div className="inj-card__header">
          <h3 className="inj-card__title">Recent Trades</h3>
        </div>
        <div className="inj-empty">No trades yet.</div>
      </div>
    );
  }

  return (
    <div className={`inj-card inj-trade-history ${className ?? ""}`} aria-live="polite">
      <div className="inj-card__header">
        <h3 className="inj-card__title">Recent Trades</h3>
      </div>
      <table className="inj-table" aria-label="Recent trades">
        <thead>
          <tr>
            <th>Side</th>
            <th>Price</th>
            <th>Size</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, limit).map((t, idx) => (
            <tr key={idx} className={`inj-trade-history__row inj-trade-history__row--${t.side}`}>
              <td className="inj-pill">
                <span>{t.side === "buy" ? "Buy" : "Sell"}</span>
              </td>
              <td>{t.price}</td>
              <td>{t.quantity}</td>
              <td>{new Date(t.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// SubaccountSelector
export interface SubaccountSelectorProps extends BaseProps {
  label?: string;
  placeholder?: string;
}

export const SubaccountSelector: React.FC<SubaccountSelectorProps> = ({
  label = "Subaccount",
  placeholder = "Enter subaccount id",
  className
}) => {
  const { subaccountId, setSubaccountId } = useInjectiveSubaccount();

  return (
    <div className={`inj-field ${className ?? ""}`}>
      <label className="inj-label">
        <span>{label}</span>
        <input
          className="inj-input"
          value={subaccountId ?? ""}
          onChange={(e) => setSubaccountId(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      </label>
    </div>
  );
};

// BroadcastButton
export interface BroadcastButtonProps extends BaseProps {
  tx: unknown | null;
  onBroadcast?: (txHash: string) => void;
}

export const BroadcastButton: React.FC<BroadcastButtonProps> = ({ tx, onBroadcast, className }) => {
  const { gas, loading, error } = useGas(tx);
  const { broadcast, pending } = useBroadcast();

  const handleClick = async () => {
    if (!tx) return;
    try {
      const hash = await broadcast(tx);
      onBroadcast?.(hash);
    } catch {
      // error is already captured by hook
    }
  };

  const disabled = !tx || loading || pending;

  return (
    <div className={`inj-broadcast ${className ?? ""}`}>
      <button
        className="inj-button inj-broadcast__button"
        disabled={disabled}
        onClick={handleClick}
        aria-disabled={disabled}
      >
        {loading || pending ? "Broadcasting…" : "Broadcast"}
        {gas && <span className="inj-chip inj-broadcast__gas">~{gas.toString()} gas</span>}
      </button>
      {error && (
        <div className="inj-broadcast__error" role="alert">
          {error.message}
        </div>
      )}
    </div>
  );
};

// MobileBrowserGuard
export interface MobileBrowserGuardProps extends BaseProps {
  children: React.ReactNode;
  message?: string;
}

export const MobileBrowserGuard: React.FC<MobileBrowserGuardProps> = ({
  children,
  message = "This experience is optimized for desktop or a supported Injective wallet.",
  className
}) => {
  const { isMobileInApp } = useMobile();

  if (!isMobileInApp) return <>{children}</>;

  return (
    <div className={`inj-mobile-guard ${className ?? ""}`} role="alert">
      <p className="inj-mobile-guard__message">{message}</p>
      <div className="inj-mobile-guard__content">{children}</div>
    </div>
  );
};

// Re-export IlluminateVoteParams so UI components can use it
export type { IlluminateVoteParams };


