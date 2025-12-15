import type { InjectiveClient } from "@injective-devkit/core";

export interface IndexerEvent {
  type: string;
  blockHeight: number;
  txHash?: string;
  payload: unknown;
}

export interface IndexerStore {
  saveEvent(event: IndexerEvent): Promise<void>;
  getEventsByType(type: string): Promise<IndexerEvent[]>;
}

export class InMemoryIndexerStore implements IndexerStore {
  private readonly events: IndexerEvent[] = [];

  async saveEvent(event: IndexerEvent): Promise<void> {
    this.events.push(event);
  }

  async getEventsByType(type: string): Promise<IndexerEvent[]> {
    return this.events.filter((e) => e.type === type);
  }
}

export class InjectiveIndexer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly _client: InjectiveClient, private readonly store: IndexerStore) {}

  // TODO: wire into Injective events (WebSocket / gRPC / REST) and persist via store
  // leaving protobuf details hidden from callers.
}


