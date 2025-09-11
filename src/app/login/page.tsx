"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useDisconnect, useSignMessage, useChainId } from "wagmi";
import { SiweMessage } from "siwe";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GetStartedPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
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
      // Step 1: Get nonce from the server
      const nonceResponse = await fetch("/api/auth/nonce");
      if (!nonceResponse.ok) throw new Error("Failed to get nonce");

      const { nonce } = await nonceResponse.json();

      // Step 2: Create a SIWE message
      // read client-visible env vars (NEXT_PUBLIC_*) and enforce in production
      const envDomain = process.env.NEXT_PUBLIC_SIWE_DOMAIN;
      const envUri = process.env.NEXT_PUBLIC_SIWE_URI;
      const envStatement = process.env.NEXT_PUBLIC_SIWE_STATEMENT;
      const envChainId = process.env.NEXT_PUBLIC_SIWE_CHAIN_ID;

      if (process.env.NODE_ENV === "production") {
        if (!envDomain || !envUri) {
          setError(
            "SIWE configuration missing. NEXT_PUBLIC_SIWE_DOMAIN and NEXT_PUBLIC_SIWE_URI must be set in production."
          );
          setIsLoading(false);
          return;
        }
      }

      const domain = envDomain ?? window.location.host;
      const uri = envUri ?? window.location.origin;
      const statement = envStatement ?? "Sign in with Ethereum to Athenova";

      let parsedChainId: number | undefined = undefined;
      if (envChainId) {
        const n = parseInt(envChainId, 10);
        if (!Number.isNaN(n)) parsedChainId = n;
      }
      const finalChainId =
        parsedChainId ?? (typeof chainId === "number" ? chainId : 1);

      const message = new SiweMessage({
        domain,
        address: address,
        statement,
        uri,
        version: "1",
        chainId: finalChainId,
        nonce,
      });

      const messageString = message.prepareMessage();

      const signature = await signMessageAsync({ message: messageString });

      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageString, signature }),
        credentials: "include",
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify signature");
      }

      const userResponse = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserProfile(userData.user);
      } else if (userResponse.status === 409) {
        const meResp = await fetch("/api/users/me", { credentials: "include" });
        if (meResp.ok) {
          const me = await meResp.json();
          setUserProfile(me.user);
        } else {
          throw new Error("Account exists but could not fetch profile");
        }
      } else {
        let errorMsg = "Failed to create user profile";
        try {
          const errorData = await userResponse.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        throw new Error(err?.message || "Failed to logout");
      }
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      setUserProfile(null);
      setError(null);
      disconnect();
      setIsLoading(false);
    }
  };

  return (
    <main
      className={cn(
        "min-h-screen min-h-[100dvh] flex items-center justify-center bg-background px-2 py-10"
      )}
    >
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Main card: matches screenshot layout */}
          <div className="rounded-2xl border border-auth bg-white p-10 max-w-md mx-auto shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3">
                <Image src="/Logo.png" alt="Athenova" width={56} height={56} />
                <h2 className="text-xl font-semibold text-foreground">
                  Athenova
                </h2>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">Welcome Back</p>
              <p className="text-xs text-muted-foreground">
                Log in to your account
              </p>

              <div className="mt-8 w-full space-y-4 max-w-sm">
                <Button
                  className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                  variant="outline"
                  type="button"
                >
                  Log in with Google
                </Button>

                {/* single Connect Wallet button inside the card */}
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button
                      onClick={openConnectModal}
                      className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                      variant="outline"
                      type="button"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </ConnectButton.Custom>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px border-auth bg-auth" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px border-auth bg-auth" />
                </div>

                <Button
                  className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                  variant="outline"
                  type="button"
                >
                  Log in with Email
                </Button>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="athena-link">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* --- Alerts / Modals kept outside the card so card stays visually identical to screenshot --- */}

          {/* Success alert when userProfile exists */}
          {userProfile && (
            <div
              role="status"
              aria-live="polite"
              className="fixed right-4 top-4 z-50 max-w-sm w-full sm:w-auto px-4"
            >
              <div className="p-4 rounded-lg border bg-green-50 border-green-200 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm font-medium text-green-800">
                    Profile Created Successfully!
                  </p>
                </div>
                <p className="text-xs text-green-600 mb-3">
                  Welcome to Athenova
                </p>

                <div className="p-2 bg-white rounded border mb-3">
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

                <div className="flex gap-2">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex-1"
                  >
                    Logout & Disconnect
                  </Button>
                  <Button
                    onClick={() => {
                      // keep logic same; closing alert just clears profile UI
                      setUserProfile(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Connected-but-not-logged-in alert */}
          {isConnected && !userProfile && (
            <div
              role="alert"
              aria-live="polite"
              className="fixed right-4 top-4 z-50 max-w-sm w-full sm:w-auto px-4"
            >
              <div className="p-4 rounded-lg border bg-card text-card-foreground shadow">
                <p className="text-sm text-muted-foreground mb-2">
                  Connected as:
                </p>
                <p className="font-mono text-xs break-all">{address}</p>

                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-3"
                  >
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleLogin}
                    className="flex-1"
                    type="button"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Creating Profile..."
                      : "Login & Create Profile"}
                  </Button>
                  <Button onClick={() => disconnect()} variant="outline">
                    Disconnect
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-base text-muted-foreground">
                    Welcome Back
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Log in to your account
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
