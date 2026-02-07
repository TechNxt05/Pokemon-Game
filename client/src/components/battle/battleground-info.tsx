import { Card } from "@/components/ui/card";

export function BattlegroundInfo({ battleground, minimal = false }: { battleground: any, minimal?: boolean }) {
    if (!battleground) return null;

    if (minimal) {
        return (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2 flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-amber-500">{battleground.name} Terrain</span>
                <div className="flex gap-2">
                    <span className="text-green-400">+{battleground.boostedTypes.join(', ')}</span>
                    <span className="text-red-400">-{battleground.penaltyTypes.join(', ')}</span>
                </div>
            </div>
        )
    }

    return (
        <Card className="mb-6 p-4 bg-zinc-900 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl uppercase transform rotate-12 pointer-events-none">
                {battleground.name}
            </div>

            <div className="relative z-10">
                <h2 className="text-xl font-bold text-amber-400 mb-2">
                    Terrain: {battleground.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-green-400 font-semibold mb-1">Boosts (x1.5 Damage)</span>
                        <div className="flex flex-wrap gap-1">
                            {battleground.boostedTypes.map((t: string) => (
                                <span key={t} className="inline-block bg-green-900/30 text-green-300 px-2 py-0.5 rounded capitalize text-xs border border-green-900/50">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="block text-red-400 font-semibold mb-1">Penalties (x0.8 Damage)</span>
                        <div className="flex flex-wrap gap-1">
                            {battleground.penaltyTypes.map((t: string) => (
                                <span key={t} className="inline-block bg-red-900/30 text-red-300 px-2 py-0.5 rounded capitalize text-xs border border-red-900/50">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
