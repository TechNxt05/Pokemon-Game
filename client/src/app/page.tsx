import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Swords, Trophy, Users, LogIn } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Nav */}
      <nav className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="font-bold text-xl flex items-center gap-2">
          <div className="bg-red-600 rounded-full p-1"><Swords size={16} /></div>
          PokeBattle
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-zinc-300 hover:text-white">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 p-4 bg-red-600/10 rounded-full border border-red-900/50 animate-pulse">
          <Swords className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-5xl font-black tracking-tighter sm:text-7xl mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Pokémon Battle Platform
        </h1>

        <p className="max-w-[600px] text-zinc-400 text-lg sm:text-xl mb-10">
          Experience real-time competitive battles with deterministic mechanics, dynamic battlegrounds, and instant replays.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200 text-lg h-14">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Play
              </Button>
            </SignInButton>
            <Link href="/battle/test-match-1" className="w-full">
              <Button size="lg" variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-lg h-14">
                <Swords className="mr-2 h-5 w-5" />
                Try Demo (Guest)
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/lobby" className="w-full">
              <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-lg h-14">
                <Swords className="mr-2 h-5 w-5" />
                Battle Arena
              </Button>
            </Link>
            <Link href="/profile" className="w-full">
              <Button size="lg" variant="outline" className="w-full border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-lg h-14">
                <Swords className="mr-2 h-5 w-5" />
                My Profile
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-4xl w-full text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Swords className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Real-Time Combat</h3>
            <p className="text-zinc-500">WebSocket-powered low-latency state synchronization for instant feedback.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Trophy className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Ranked System</h3>
            <p className="text-zinc-500">Climb the ladder with our deterministic ELO matchmaking engine.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Users className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Dynamic Arenas</h3>
            <p className="text-zinc-500">Battle on terrain that affects type effectiveness and move power.</p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-zinc-600">
        Proudly built with Next.js 14, NestJS, and Tailwind CSS.
      </footer>
    </div>
  );
}
