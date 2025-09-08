"use client";

import React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  createConfig,
  WagmiProvider,
  http,
  createStorage,
  cookieStorage,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = (
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ""
).trim();

// In production we require a WalletConnect project id. In development we
// silently omit the WalletConnect connector so local testing doesn't need it.
if (process.env.NODE_ENV === "production" && !projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.\n" +
      "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your production environment to enable WalletConnect."
  );
}

// Build the wallets array conditionally — include WalletConnect only when a
// projectId is provided. This avoids silently shipping a broken WalletConnect
// configuration in development.
const recommendedWallets = [metaMaskWallet, rainbowWallet, coinbaseWallet];
if (projectId) {
  // Insert WalletConnect among recommended wallets when available
  recommendedWallets.splice(2, 0, walletConnectWallet);
}

// Build connectors options. Use the library's parameter type so we don't have
// to resort to `any` and ESLint complaints. When no projectId is provided we
// omit that field so WalletConnect isn't configured.
type ConnectorsOptions = Parameters<typeof connectorsForWallets>[1];
const connectorOptions: ConnectorsOptions = projectId
  ? { appName: "Athenova", projectId }
  : ({ appName: "Athenova" } as ConnectorsOptions);

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: recommendedWallets,
    },
  ],
  connectorOptions
);

const config = createConfig({
  connectors,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
