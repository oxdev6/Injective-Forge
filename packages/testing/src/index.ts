import type { InjectiveClient } from "@injective-devkit/core";

// Lightweight testing utilities to make it easy to write unit/integration tests
// against Injective frontends and SDK consumers.

export interface MockClientOptions {
  network?: "mainnet" | "testnet" | "devnet";
}

export class MockInjectiveClient {
  readonly network: string;

  constructor(options: MockClientOptions = {}) {
    this.network = options.network ?? "testnet";
  }

  // Simple spies to be asserted in tests
  async simulateGas(_tx: unknown): Promise<bigint> {
    return BigInt(100_000);
  }

  async broadcastTx(_tx: unknown): Promise<string> {
    return "MOCK_TX_HASH";
  }
}

export type AnyInjectiveClient = InjectiveClient | MockInjectiveClient;


