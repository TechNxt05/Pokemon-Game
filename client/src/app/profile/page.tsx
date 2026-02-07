import { SignedIn, UserButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8 group">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                        <UserButton />
                    </div>
                    My Trainer Profile
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <h2 className="text-xl font-bold mb-4">Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Rank</span>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">Rookie</Badge>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Matches Played</span>
                                <span className="font-mono">0</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-zinc-400">Win Rate</span>
                                <span className="font-mono text-green-400">0%</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-zinc-900 border-zinc-800 flex items-center justify-center min-h-[200px]">
                        <div className="text-center text-zinc-500">
                            <p>Recent Match History</p>
                            <p className="text-xs mt-2">No matches played yet.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
