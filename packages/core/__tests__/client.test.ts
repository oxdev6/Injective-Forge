import { InjectiveClient } from "../src";

describe("InjectiveClient", () => {
  it("initializes with network and wallet", () => {
    const client = new InjectiveClient({ network: "testnet", wallet: "keplr" });
    expect(client.network).toBe("testnet");
    expect(client.wallet).toBe("keplr");
  });

  it("simulates gas", async () => {
    const client = new InjectiveClient({ network: "testnet" });
    const gas = await client.simulateGas({});
    expect(typeof gas).toBe("bigint");
  });
});


