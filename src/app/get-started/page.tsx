"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GetStartedPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    walletAddress: string;
    role: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!isConnected || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get a nonce from the server
      const nonceResponse = await fetch("/api/auth/nonce");
      if (!nonceResponse.ok) throw new Error("Failed to get nonce");

      const { nonce } = await nonceResponse.json();

      // Step 2: Create a SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to Athenova",
        uri: window.location.origin,
        version: "1",
        chainId: 1, // Ethereum mainnet - adjust as needed
        nonce: nonce,
      });

      const messageString = message.prepareMessage();

      // Step 3: Sign the message
      const signature = await signMessageAsync({ message: messageString });

      // Step 4: Verify the signature and get session
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageString, signature }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify signature");
      }

      // Step 5: Create user profile (session is now set via cookie)
      const userResponse = await fetch("/api/users", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserProfile(userData.user);
      } else {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || "Failed to create user profile");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    setError(null);
    disconnect();
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
            Connect your wallet to begin. You&apos;ll be able to create a
            profile, back creators, and track your learning journey — all from
            one place.
          </p>
        </header>

        <div className="w-full max-w-md space-y-4">
          {!isConnected ? (
            <ConnectButton />
          ) : userProfile ? (
            // User is logged in and profile created
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-green-800">
                    Profile Created Successfully!
                  </p>
                </div>
                <p className="text-xs text-green-600">Welcome to Athenova</p>
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600 mb-1">User ID:</p>
                  <p className="font-mono text-xs break-all">
                    {userProfile.id}
                  </p>
                  <p className="text-xs text-gray-600 mb-1 mt-2">Wallet:</p>
                  <p className="font-mono text-xs break-all">
                    {userProfile.walletAddress}
                  </p>
                  <p className="text-xs text-gray-600 mb-1 mt-2">Role:</p>
                  <p className="text-xs">{userProfile.role}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout & Disconnect
              </Button>
            </div>
          ) : (
            // User is connected but not logged in yet
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card text-card-foreground">
                <p className="text-sm text-muted-foreground mb-2">
                  Connected as:
                </p>
                <p className="font-mono text-xs break-all">{address}</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleLogin}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Profile..." : "Login & Create Profile"}
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
