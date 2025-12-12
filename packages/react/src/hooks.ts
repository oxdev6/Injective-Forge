import { useCallback, useEffect, useMemo, useState } from "react";
import { useInjectiveContext } from "./context";
import type { OrderbookSnapshot, Trade } from "@injective-devkit/exchange";
import type { WalletConnection } from "@injective-devkit/wallet";

// 1) useInjectiveSubaccount / useSubaccount
export function useInjectiveSubaccount(initialSubaccountId?: string) {
  const { client } = useInjectiveContext();
  const [subaccountId, setSubaccountId] = useState<string | undefined>(initialSubaccountId);

  // TODO: load default subaccount from chain / wallet
  useEffect(() => {
    if (!subaccountId) {
      setSubaccountId("default-subaccount");
    }
  }, [subaccountId]);

  return useMemo(
    () => ({
      client,
      subaccountId,
      setSubaccountId
    }),
    [client, subaccountId]
  );
}

// Ergonomic alias matching high-level API design
export const useSubaccount = useInjectiveSubaccount;

// 2) useOrderbook / useOrderbookStream
export function useOrderbook(marketId?: string) {
  const { exchange } = useInjectiveContext();
  const [orderbook, setOrderbook] = useState<OrderbookSnapshot | null>(null);

  useEffect(() => {
    if (!marketId) return;
    const stop = exchange.streamOrderbook(marketId, (snapshot) => setOrderbook(snapshot));
    return () => stop();
  }, [exchange, marketId]);

  return orderbook;
}

// Backwards-compatible alias for more explicit naming
export const useOrderbookStream = useOrderbook;

// 3) useTrades / useTradeStream
export function useTrades(marketId?: string) {
  const { exchange } = useInjectiveContext();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!marketId) return;
    const stop = exchange.streamTrades(marketId, (nextTrades) => setTrades(nextTrades));
    return () => stop();
  }, [exchange, marketId]);

  return trades;
}

// Backwards-compatible alias
export const useTradeStream = useTrades;

// 4) useGas / useGasEstimate
export function useGas(tx: unknown | null) {
  const { client } = useInjectiveContext();
  const [gas, setGas] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tx) {
      setGas(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    client
      .simulateGas(tx)
      .then((value) => {
        if (!cancelled) setGas(value);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err as Error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, tx]);

  return { gas, loading, error };
}

// Backwards-compatible alias
export const useGasEstimate = useGas;

// 4b) useBroadcast – high-level broadcast helper with gas preflight
export function useBroadcast() {
  const { client } = useInjectiveContext();
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const broadcast = useCallback(
    async (tx: unknown): Promise<string> => {
      setPending(true);
      setError(null);
      try {
        // optional: pre-flight simulate
        await client.simulateGas(tx);
        const hash = await client.broadcastTx(tx);
        setTxHash(hash);
        return hash;
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [client]
  );

  return { broadcast, pending, txHash, error };
}

// 5) useIlluminateVote (placeholder for governance / quadratic funding flows)
export interface IlluminateVoteParams {
  proposalId: string;
  weight: number;
}

export function useIlluminateVote() {
  const { client } = useInjectiveContext();
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  async function vote(_params: IlluminateVoteParams): Promise<string> {
    setPending(true);
    setError(null);
    try {
      // TODO: construct and broadcast actual governance vote tx
      const hash = await client.broadcastTx({});
      setTxHash(hash);
      return hash;
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setPending(false);
    }
  }

  return { vote, pending, txHash, error };
}

// 6) useMobile – mobile / in-app browser helper
export function useMobile() {
  const { wallet } = useInjectiveContext();
  const [isMobileInApp, setIsMobileInApp] = useState(false);

  useEffect(() => {
    setIsMobileInApp(wallet.isMobileInAppBrowser());
  }, [wallet]);

  return { isMobileInApp };
}

// 7) useWallet – wallet connection hook
export function useWallet() {
  const { wallet } = useInjectiveContext();
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [keplrAvailable, setKeplrAvailable] = useState(false);
  const [metamaskAvailable, setMetamaskAvailable] = useState(false);

  useEffect(() => {
    setKeplrAvailable(wallet.isKeplrAvailable());
    setMetamaskAvailable(wallet.isMetamaskAvailable());
    
    // Check periodically in case wallet is injected after page load
    const interval = setInterval(() => {
      setKeplrAvailable(wallet.isKeplrAvailable());
      setMetamaskAvailable(wallet.isMetamaskAvailable());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [wallet]);

  const connectKeplr = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const conn = await wallet.connectKeplr();
      setConnection(conn);
      return conn;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [wallet]);

  const connectMetamask = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const conn = await wallet.connectMetamask();
      setConnection(conn);
      return conn;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [wallet]);

  const disconnect = useCallback(() => {
    setConnection(null);
    setError(null);
  }, []);

  return {
    connection,
    connecting,
    error,
    connectKeplr,
    connectMetamask,
    disconnect,
    isConnected: !!connection,
    keplrAvailable,
    metamaskAvailable
  };
}



