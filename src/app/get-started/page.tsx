import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function GetStartedPage() {
  return (
    <main
      className={cn(
        'min-h-dvh flex flex-col items-center justify-center px-6 py-20',
        'bg-gradient-to-b from-background to-muted'
      )}
    >
      <div className="flex flex-col items-center text-center gap-8 max-w-md">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Get Started</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your wallet to begin. You’ll be able to create a profile, back creators,
            and track your learning journey — all from one place.
          </p>
        </header>

        <Button size="lg" className="w-full max-w-xs">Connect Wallet</Button>

        <p className="text-[11px] text-muted-foreground pt-4">
          No email. No password. Just your wallet. Signing requests will appear when needed.
        </p>
      </div>
    </main>
  )
}
