#!/usr/bin/env node
/* eslint-disable no-console */

import { InjectiveClient } from "@injective-devkit/core";

// Minimal placeholder CLI; to be expanded with:
// - create project
// - generate types
// - simulate gas
// - vote helpers

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "version":
      console.log("injective-devkit CLI v0.1.0");
      break;
    case "simulate":
      // Example: inj simulate
      {
        const client = new InjectiveClient({ network: "testnet" });
        const gas = await client.simulateGas({});
        console.log(`Estimated gas: ${gas.toString()}`);
      }
      break;
    default:
      console.log("inj <command>");
      console.log("  version          Print CLI version");
      console.log("  simulate         Example gas simulation (testnet)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


