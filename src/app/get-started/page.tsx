"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function GetStartedPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleLogin = () => {
    if (isConnected && address) {
      // Create or update a user profile on the server linked to this wallet
      fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      })
        .then((r) => r.json())
        .then((data) => console.log("user upsert result", data))
        .catch((err) => console.error("create user error", err));
    }
  };

  return (
    <main
      className={cn(
        "min-h-dvh flex flex-col items-center justify-center px-6 py-20",
        "bg-gradient-to-b from-background to-muted"
      )}
    >
      <div className="flex flex-col items-center text-center gap-8 max-w-md">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Get Started</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your wallet to begin. You’ll be able to create a profile,
            back creators, and track your learning journey — all from one place.
          </p>
        </header>

        <div className="w-full max-w-md space-y-4">
          {!isConnected ? (
            <ConnectButton />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card text-card-foreground">
                <p className="text-sm text-muted-foreground mb-2">
                  Connected as:
                </p>
                <p className="font-mono text-xs break-all">{address}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLogin} className="flex-1">
                  Login
                </Button>
                <Button onClick={() => disconnect()} variant="outline">
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground pt-4">
          No email. No password. Just your wallet. Signing requests will appear
          when needed.
        </p>
      </div>
    </main>
  );
}
