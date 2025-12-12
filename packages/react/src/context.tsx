import React, { createContext, useContext } from "react";
import { InjectiveClient, type InjectiveClientOptions } from "@injective-devkit/core";
import { ExchangeClient } from "@injective-devkit/exchange";
import { DefaultWalletProvider } from "@injective-devkit/wallet";

export interface InjectiveProviderProps {
  clientOptions: InjectiveClientOptions;
  children: React.ReactNode;
}

interface InjectiveContextValue {
  client: InjectiveClient;
  exchange: ExchangeClient;
  wallet: DefaultWalletProvider;
}

const InjectiveContext = createContext<InjectiveContextValue | undefined>(undefined);

export const InjectiveProvider: React.FC<InjectiveProviderProps> = (props) => {
  const { clientOptions, children } = props;
  const client = new InjectiveClient(clientOptions);
  const exchange = new ExchangeClient(client);
  const wallet = new DefaultWalletProvider(client);

  return (
    <InjectiveContext.Provider value={{ client, exchange, wallet }}>
      {children}
    </InjectiveContext.Provider>
  );
};

export const useInjectiveContext = (): InjectiveContextValue => {
  const ctx = useContext(InjectiveContext);
  if (!ctx) {
    throw new Error("useInjectiveContext must be used within an InjectiveProvider");
  }
  return ctx;
};


