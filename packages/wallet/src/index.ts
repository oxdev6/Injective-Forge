import type { InjectiveClient } from "@injective-devkit/core";

export type SupportedWallet = "keplr" | "metamask";

export interface WalletConnection {
  address: string;
  bech32Address?: string;
  evmAddress?: string;
  wallet: SupportedWallet;
}

export interface WalletProvider {
  isMobileInAppBrowser(): boolean;
  isKeplrAvailable(): boolean;
  isMetamaskAvailable(): boolean;
  connectKeplr(): Promise<WalletConnection>;
  connectMetamask(): Promise<WalletConnection>;
  verifyAddress(connection: WalletConnection): Promise<boolean>;
}

export class DefaultWalletProvider implements WalletProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly _client: InjectiveClient) {}

  isMobileInAppBrowser(): boolean {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.includes("metamask") || ua.includes("keplr") || ua.includes("inapp");
  }

  isKeplrAvailable(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.keplr;
  }

  isMetamaskAvailable(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.ethereum && window.ethereum.isMetaMask);
  }

  async connectKeplr(): Promise<WalletConnection> {
    if (typeof window === "undefined") {
      throw new Error("Keplr connection requires browser environment");
    }

    // Wait a bit for Keplr to inject if it's still loading
    let keplr = window.keplr;
    if (!keplr) {
      // Wait up to 1 second for Keplr to inject
      await new Promise((resolve) => setTimeout(resolve, 100));
      keplr = window.keplr;
    }
    
    if (!keplr) {
      throw new Error("Keplr extension not found. Please install Keplr wallet from https://www.keplr.app/");
    }

    // Injective mainnet chain ID
    const chainId = "injective-1";
    
    try {
      await keplr.enable(chainId);
      const key = await keplr.getKey(chainId);
      
      return {
        address: key.bech32Address,
        bech32Address: key.bech32Address,
        wallet: "keplr"
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("rejected")) {
        throw new Error("Connection rejected. Please approve the connection request in Keplr.");
      }
      throw new Error(`Failed to connect Keplr: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async connectMetamask(): Promise<WalletConnection> {
    if (typeof window === "undefined") {
      throw new Error("Metamask connection requires browser environment");
    }

    // Wait a bit for MetaMask to inject if it's still loading
    let ethereum = window.ethereum;
    if (!ethereum || !ethereum.isMetaMask) {
      // Wait up to 1 second for MetaMask to inject
      await new Promise((resolve) => setTimeout(resolve, 100));
      ethereum = window.ethereum;
    }
    
    if (!ethereum || !ethereum.isMetaMask) {
      throw new Error("Metamask extension not found. Please install Metamask wallet from https://metamask.io/");
    }

    try {
      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your Metamask wallet.");
      }

      const address = accounts[0];
      
      return {
        address,
        evmAddress: address,
        wallet: "metamask"
      };
    } catch (error) {
      if (error instanceof Error && (error.message.includes("rejected") || error.message.includes("denied"))) {
        throw new Error("Connection rejected. Please approve the connection request in Metamask.");
      }
      throw new Error(`Failed to connect Metamask: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyAddress(_connection: WalletConnection): Promise<boolean> {
    // TODO: sign & verify a message cross-wallet
    return true;
  }
}


