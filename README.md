## injective-devkit

**Vision:** the **canonical JavaScript/TypeScript toolkit for Injective**, from chain client to React hooks and UI.

Principles:

- **DX first**
- **mobile + wallet native**
- **exchange primitives built-in**
- **full TypeScript / typesafety**
- **streaming-first**
- **modular**
- **audited & open source**
  
This is **not another low-level chain client**. It is a **batteries-included standard** comparable to:

- ethers
- cosmjs
- stripe SDK

### Monorepo Layout

`injective-devkit/`

- **`packages/`**
  - **`core/`** – `@injective-devkit/core`
  - **`exchange/`** – `@injective-devkit/exchange`
  - **`wallet/`** – `@injective-devkit/wallet`
  - **`react/`** – `@injective-devkit/react`
  - **`ui/`** – `@injective-devkit/ui`
  - **`indexer/`** – `@injective-devkit/indexer`
  - **`cli/`** – `@injective-devkit/cli`
  - **`testing/`** – `@injective-devkit/testing`
- **`apps/`**
  - **`demo-trading/`** – reference trading dashboard
- **`docs/`** – docs site (Typedoc + Docusaurus-style)
- **`examples/`** – small, focused code samples
- **`scripts/`** – CI/release helpers
- **`governance/`** – DAO text, milestones, funding materials

### React Hooks (world-class DX design)

Hooks that frontends today must hand-roll:

- **`useSubaccount()`**
  - Manages active subaccount for the user.
  - Returns `{ client, subaccountId, setSubaccountId }`.

- **`useOrderbook(marketId)`**
  - Subscribes to live orderbook data (via WebSocket/gRPC under the hood).
  - Returns `OrderbookSnapshot | null`.

- **`useTrades(marketId)`**
  - Subscribes to live trades.
  - Returns `Trade[]`.

- **`useGas(tx)`**
  - Estimates gas for a prepared tx (auto-simulate).
  - Returns `{ gas, loading, error }`.

- **`useBroadcast()`**
  - High-level tx broadcast helper with gas preflight.
  - Returns `{ broadcast(tx), pending, txHash, error }`.

- **`useMobile()`**
  - Mobile in-app browser detection and guard.
  - Returns `{ isMobileInApp }`.

- **`useIlluminateVote()`**
  - Governance / MACI-style verification-ready helper.
  - Returns `{ vote(params), pending, txHash, error }`.

### UI Components (v0 design)

Exported from `@injective-devkit/ui`:

- **`<Orderbook marketId="..." />`**
- **`<TradeHistory marketId="..." />`**
- **`<SubaccountSelector />`**
- **`<BroadcastButton tx={...} onBroadcast={...} />`**
- **`<MobileBrowserGuard>` children `</MobileBrowserGuard>`**

These are intentionally **minimal but production-oriented**, so teams can:

- Drop them into a dashboard quickly.
- Override styles via CSS / Tailwind / design systems.
- Replace them incrementally with custom UIs while keeping the data layer.

### Architecture Overview – End to End

- **Core layer (`@injective-devkit/core`)**
  - **Chain client**
    - `InjectiveClient`:
      - `simulateGas(tx): Promise<bigint>`
      - `broadcastTx(tx): Promise<string>`
      - future: `sign`, `query*` helpers.
    - Initialization:
      - `new InjectiveClient({ network: 'mainnet', wallet: 'keplr' })`
    - **Protobuf is hidden** behind a clean TS API.
  - **Type system**
    - Building blocks for ABI → types generation.
    - Strong `SubaccountId`, `ExchangeOrder`, etc.
  - **Gas estimator**
    - `simulateGas` + fee suggestion helpers (testnet-first).
  - **Streaming base**
    - `WebSocketStream` abstraction:
      - reconnect
      - backoff
      - shared across exchange/indexer streams.
  - **Error system**
    - `InjectiveError` with `InjectiveErrorCode`:
      - `NETWORK_ERROR`, `VALIDATION_ERROR`, `WALLET_ERROR`, etc.
    - Stripe-level, globally documented error codes.

- **Exchange layer (`@injective-devkit/exchange`)**
  - Domain APIs for:
    - **Spot trading**
    - **Perpetuals**
    - **Orderbooks**
    - **Subaccounts**
    - **NFTs**
  - `ExchangeClient`:
    - `createOrder(params): Promise<string>`
    - `cancelOrder(params): Promise<string>`
    - `streamOrderbook(marketId, cb): () => void`
    - `streamTrades(marketId, cb): () => void`
  - Primitives that are currently missing from most stacks:
    - subaccount switcher
    - orderbook hooks
    - mobile guard-aware UX.

- **Wallet layer (`@injective-devkit/wallet`)**
  - Keplr + Metamask support.
  - Mobile in-app browser detection.
  - Address verification flows.

- **Indexer layer (`@injective-devkit/indexer`)**
  - Event listeners (gRPC/WebSocket/REST).
  - Pluggable store (e.g. in-memory, SQLite, IndexedDB).
  - REST/GraphQL style query layer for historical data.

- **React layer (`@injective-devkit/react`)**
  - `InjectiveProvider` wires:
    - `InjectiveClient`
    - `ExchangeClient`
    - `DefaultWalletProvider`
  - Hooks:
    - `useInjectiveContext`
    - `useSubaccount`
    - `useOrderbook`
    - `useTrades`
    - `useGas`
    - `useBroadcast`
    - `useMobile`
    - `useIlluminateVote`

- **UI (`@injective-devkit/ui`)**
  - Lightly opinionated components built on the hooks.
  - Theming-friendly and replaceable.

- **CLI (`@injective-devkit/cli`)**
  - Single `inj` binary for:
    - project scaffolding
    - type generation
    - gas simulation
    - governance helpers.

- **Testing (`@injective-devkit/testing`)**
  - Test helpers and mock clients for unit/integration/stream tests.

### Roadmap / Milestones (Grant-Friendly)

- **Phase 1 – Foundation (2 weeks)**
  - Monorepo, build tooling, CI.
  - `@injective-devkit/core`:
    - Client initialization.
    - Gas simulation.
    - Basic spot/perp query helpers.

- **Phase 2 – Exchange (3 weeks)**
  - `@injective-devkit/exchange`:
    - Order create/cancel (spot + perp).
    - Orderbook and trade streams.
    - Subaccount helper utilities.

- **Phase 3 – React (3 weeks)**
  - `@injective-devkit/react`:
    - All hooks listed above.
  - `@injective-devkit/ui`:
    - Initial component set (`Orderbook`, `TradeHistory`, `SubaccountSelector`, `BroadcastButton`, `MobileBrowserGuard`).
  - **Demo dApp**:
    - Open source trading dashboard showcasing the SDK.

- **Phase 4 – Adoption (4 weeks)**
  - Docs site:
    - Guides, examples, cookbook snippets.
  - Workshops / devrel content.
  - DAO / grant round demo (e.g. Illuminate / Dora).

### Global Production Standards

- **CI/CD**
  - GitHub Actions:
    - typecheck
    - lint
    - test (unit + integration + streams)
    - build.
  - Semantic-release driven **npm publish** for all packages.

- **Testing**
  - Unit tests for core logic.
  - Integration tests for exchange flows.
  - Streaming reliability tests.
  - Mobile and wallet flows in real/CI devices where possible.

- **Security**
  - Third-party audits.
  - MACI-style verification readiness for governance flows.
  - Transparent changelogs and security advisories.

- **Docs**
  - Typedoc for full API surface.
  - Docusaurus-style docs site.
  - Examples and demo app wired into docs.

- **Governance**
  - DAO narrative:
    - public good
    - 100+ dev adoption
    - mobile friendly
    - open source
    - quadratic funding aligned.

### Example API

- **Initialize**

```ts
import { InjectiveClient } from "@injective-devkit/core";

const client = new InjectiveClient({
  network: "mainnet",
  wallet: "keplr"
});
```

- **Trade**

```ts
const txHash = await client.exchange.createOrder({
  marketId: "BTC-INJ",
  side: "buy",
  type: "limit",
  price: "20",
  quantity: "0.1"
});
```

- **Hook**

```ts
const { orderbook } = useOrderbook("BTC-INJ");
```

### Next Steps

From here we can:

- Flesh out the **core client** with real Injective / CosmJS integration.
- Implement **real streaming** (WebSocket) for orderbooks and trades.
- Add **docs + demo app** under `apps/trading-dashboard`.
- Polish the **API ergonomics** (naming, DX, error handling) with early design partners.


