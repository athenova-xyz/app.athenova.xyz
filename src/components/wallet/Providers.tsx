"use client";

import React from "react";

import "@rainbow-me/rainbowkit/styles.css";
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
  // Don't throw at module init in a client component; warn and omit WalletConnect.
  // CI/CD should enforce presence of NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID before deploy.
  // Throwing here would break any page that imports this file.
  console.warn(
    "WalletConnect disabled: missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
  );
}

// Build the wallets array conditionally — include WalletConnect only when a
// projectId is provided. This avoids silently shipping a broken WalletConnect
// configuration in development.
const baseWallets = [metaMaskWallet, rainbowWallet, coinbaseWallet];
const recommendedWallets = projectId
  ? [metaMaskWallet, rainbowWallet, walletConnectWallet, coinbaseWallet]
  : baseWallets;

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

// Note: cookieStorage is fine for client-side persistence, but if you need
// server-side hydration of connectors in App Router, wire Next.js `cookies()` into
// the configuration. Otherwise you may observe connector hydration flicker.
const config = createConfig({
  connectors,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
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
