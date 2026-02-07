'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Swords, Plus, ArrowRight } from 'lucide-react';

export default function LobbyPage() {
    const router = useRouter();
    const [joinId, setJoinId] = useState('');

    const createMatch = () => {
        const matchId = 'match-' + Math.random().toString(36).substr(2, 9);
        router.push(`/battle/${matchId}`);
    };

    const joinMatch = () => {
        if (joinId) {
            router.push(`/battle/${joinId}`);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-zinc-900 border-zinc-800">
                <div className="text-center mb-8">
                    <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Swords className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Battle Arena</h1>
                    <p className="text-zinc-500">Create a new battlefield or join an existing one.</p>
                </div>

                <div className="space-y-6">
                    <Button
                        size="lg"
                        className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg"
                        onClick={createMatch}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Create New Match
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500">Or join with ID</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Match ID..."
                            className="bg-zinc-950 border-zinc-800 h-12 text-zinc-100"
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                        />
                        <Button
                            variant="secondary"
                            className="h-12 w-12 p-0 shrink-0"
                            onClick={joinMatch}
                            disabled={!joinId}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
