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
        chainId: chainId ?? 1,
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
        credentials: "include",
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
      // Log and continue with client-side cleanup to avoid blocking UX
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
          {/* Main card: blue border with rounded corners */}
          <div className="rounded-2xl border border-auth bg-card shadow-sm p-10">
            {/* Logo inline with title */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/Logo.png"
                  alt="Athenova"
                  width={56}
                  height={56}
                  priority
                />
                <h2 className="text-xl font-semibold text-foreground">
                  Athenova
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-8 max-w-md">
            <div className="w-full max-w-md space-y-4">
              {!isConnected ? (
                // keep layout but remove the default RainbowKit blue ConnectButton
                // the custom Connect Wallet button (ConnectButton.Custom) below
                // will be the single connect-control inside the card
                <></>
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
                    <p className="text-xs text-green-600">
                      Welcome to Athenova
                    </p>
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
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
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
                  <p className="mt-2 text-base text-muted-foreground font-normal">
                    Welcome Back
                  </p>
                  <p className="text-xs text-muted-foreground font-normal">
                    Log in to your account
                  </p>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <Button
                  className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                  variant="outline"
                  type="button"
                >
                  Log in with Google
                </Button>

                {!isConnected && (
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
                )}

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px border-auth bg-auth"></div>
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px border-auth bg-auth"></div>
                </div>

                <Button
                  className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                  variant="outline"
                  type="button"
                >
                  Log in with Email
                </Button>
              </div>

              <div className="mt-7 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="athena-link">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
