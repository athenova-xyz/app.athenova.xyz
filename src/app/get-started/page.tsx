"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function GetStartedPage() {
  useAccount();

  return (
    <main
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-2 py-10"
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
                  src="/logo.png"
                  alt="Athenova logo"
                  className="rounded-lg bg-card"
                  width={40}
                  height={40}
                  priority
                />
                <h2 className="text-xl font-semibold text-foreground">
                  Athenova
                </h2>
              </div>
              <p className="mt-2 text-md text-muted-foreground font-normal">
                Welcome Back
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                Log in to your account
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <Button
                className="w-full py-3 border border-auth bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-none font-sans text-sm"
                variant="outline"
                type="button"
              >
                Log in with Google
              </Button>

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
    </main>
  );
}
