import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold">DotaStats</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/heroes" className="hover:text-foreground">
              Heroes
            </Link>
            <Link href="/teams" className="hover:text-foreground">
              Teams
            </Link>
            <Link href="/tournaments" className="hover:text-foreground">
              Tournaments
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            Data from{' '}
            <a
              href="https://stratz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stratz
            </a>{' '}
            &{' '}
            <a
              href="https://opendota.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenDota
            </a>
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>Dota 2 is a registered trademark of Valve Corporation.</p>
        </div>
      </div>
    </footer>
  )
}
