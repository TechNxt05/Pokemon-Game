'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBattleStore } from '@/store/battle-store';
import { getSocket } from '@/providers/socket-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, Swords, Eye } from 'lucide-react';
import { BattlegroundInfo } from '@/components/battle/battleground-info';

export default function BattlePage() {
    const params = useParams();
    const matchId = params.id as string;
    const { battleState, setMatchId, setRole } = useBattleStore();
    const [copied, setCopied] = useState(false);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    const getSprite = (id: number, back = false) =>
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${back ? 'back/' : ''}${id}.png`;

    // Timer Logic for Phases
    useEffect(() => {
        if (battleState?.phase === 'reveal' && battleState.timers?.currentPhaseExpiry) {
            setTimeLeft(Math.max(0, Math.ceil((battleState.timers.currentPhaseExpiry - Date.now()) / 1000)));

            const interval = setInterval(() => {
                const diff = Math.ceil((battleState.timers.currentPhaseExpiry - Date.now()) / 1000);
                setTimeLeft(Math.max(0, diff));
                if (diff <= 0) clearInterval(interval);
            }, 100);
            return () => clearInterval(interval);
        }
        else if ((battleState?.phase === 'selection' || battleState?.phase === 'formation' || battleState?.phase === 'fainted_switch') && battleState.timers?.currentPhaseExpiry) {
            setTimeLeft(Math.max(0, Math.ceil((battleState.timers.currentPhaseExpiry - Date.now()) / 1000)));
            const interval = setInterval(() => {
                const diff = Math.ceil((battleState.timers.currentPhaseExpiry - Date.now()) / 1000);
                setTimeLeft(Math.max(0, diff));
                if (diff <= 0) clearInterval(interval);
            }, 100);
            return () => clearInterval(interval);
        }
        else if (battleState?.phase === 'battle') {
            // AFK Timer or Global Timer? state doesn't send explicit AFK expiry per user easily without extra bandwidth. 
            // For now, let's just show "BATTLE START" or hide timer.
            setTimeLeft(20); // Static 20s visual? Or just -
        }
    }, [battleState?.phase, battleState?.timers?.currentPhaseExpiry]);

    useEffect(() => {
        if (matchId) {
            setMatchId(matchId);
            const socket = getSocket();

            // Try to get existing ID or create new one
            let userId = localStorage.getItem('battle_user_id');
            if (!userId) {
                userId = 'user-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('battle_user_id', userId);
            }
            setMyUserId(userId);

            socket.emit('JOIN_MATCH', { matchId, userId, username: 'Player' });
        }
    }, [matchId, setMatchId]);

    const copyLink = (type: 'join' | 'watch') => {
        const url = window.location.href; // Simplified for now
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!battleState) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Connecting to Battle Arena...</h1>
                    <p className="text-zinc-400">Match ID: {matchId}</p>
                </div>
            </div>
        );
    }

    // ... inside BattlePage component ...

    const { field, players, playerIds, phase, selection, timers } = battleState;

    // --- PHASE: WAITING FOR PLAYERS ---
    if (phase === 'waiting_for_players') {
        const myPlayer = myUserId ? players[myUserId] : null;
        const opponentId = playerIds.find((id: string) => id !== myUserId);
        const isHost = playerIds[0] === myUserId;

        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
                {/* Navbar Area (Simple) */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2"><Swords className="text-red-500" /> Battle Arena</h1>
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>Exit</Button>
                </div>

                <Card className="w-full max-w-md p-8 bg-zinc-900 border-zinc-800 text-center relative overflow-hidden">
                    <div className="bg-amber-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Swords className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Waiting for Challenger...</h1>
                    <p className="text-zinc-400 mb-6">Share this Match ID for a friend to join.</p>

                    <div className="bg-zinc-950 p-4 rounded-lg flex items-center justify-between mb-6 border border-zinc-800">
                        <code className="text-lg font-mono text-zinc-200">{matchId}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyLink('join')}>
                            {copied ? 'Copied' : <Share2 className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-green-500/50">
                                <span className="font-bold text-green-500 text-xl">P1</span>
                            </div>
                            <span className="text-sm font-semibold text-zinc-300">You</span>
                        </div>
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border-2 transition-all ${opponentId ? 'bg-red-500/20 border-red-500/50' : 'bg-zinc-800 border-zinc-700 border-dashed'}`}>
                                {opponentId ? <span className="font-bold text-red-500 text-xl">P2</span> : <span className="text-zinc-600">?</span>}
                            </div>
                            <span className="text-sm font-semibold text-zinc-300">{opponentId ? 'Joined' : 'Waiting'}</span>
                        </div>
                    </div>

                    {isHost && (
                        <Button
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            disabled={!opponentId}
                            onClick={() => {
                                getSocket().emit('START_MATCH', { matchId, userId: myUserId });
                            }}
                        >
                            {opponentId ? 'Start Match' : 'Waiting for Opponent...'}
                        </Button>
                    )}
                    {!isHost && (
                        <div className="text-zinc-400 animate-pulse text-sm font-medium bg-zinc-950/50 py-2 rounded">
                            Waiting for Host to start...
                        </div>
                    )}

                    {/* Battlefield Info in Waiting Room */}
                    <div className="mt-6 text-left border-t border-zinc-800 pt-4">
                        <BattlegroundInfo battleground={field?.battleground} minimal />
                    </div>
                </Card>
            </div>
        );
    }

    // --- PHASE: REVEAL (7s) ---
    if (phase === 'reveal' && selection) {
        const pool = selection.pool || [];

        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col p-4">
                <div className="text-center mb-4 mt-2">
                    <h1 className="text-4xl font-black mb-2 animate-in slide-in-from-top fade-in">SCOUTING REPORT</h1>
                    <p className="text-zinc-400">Memorize the pool! Allocation in <span className="text-yellow-500 font-mono text-xl">{timeLeft}s</span></p>
                </div>

                <div className="max-w-4xl mx-auto w-full mb-4">
                    <BattlegroundInfo battleground={field?.battleground} minimal />
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 animate-pulse opacity-50 pointer-events-none">
                        {pool.map((mon: any) => (
                            <div key={mon.id} className="bg-zinc-800/50 rounded p-2 flex flex-col items-center justify-center border border-zinc-700/50">
                                <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-16 h-16 object-contain pixelated" />
                                <div className="text-[10px] text-zinc-500">#{mon.speciesId}</div>
                                <div className="font-bold text-xs truncate w-full text-center">{mon.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-9xl font-black text-zinc-800 select-none">
                            {timeLeft}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- PHASE: SELECTION / DRAFT ---
    if (phase === 'selection' && selection) {
        const myDraft = myUserId ? selection.draft[myUserId] : { team: [], selectedIndices: [] };
        const myTeam = myDraft?.team || [];
        const pool = selection.pool || [];
        const timeLeft = Math.max(0, Math.ceil((timers.currentPhaseExpiry - Date.now()) / 1000));

        // Mock opponent status
        const opponentId = playerIds.find((id: string) => id !== myUserId);
        const opponentDraft = opponentId ? selection.draft[opponentId] : null;

        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col p-4 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-4 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Swords className="text-blue-500" size={20} /> Team Selection
                        </h1>
                        <p className="text-xs text-zinc-500">Build your team of 6 (3 assigned + 3 picked).</p>
                    </div>

                    {/* Battleground Info */}
                    <div className="px-4">
                        <BattlegroundInfo battleground={field?.battleground} minimal />
                    </div>

                    <div className="text-center">
                        <div className={`text-4xl font-black font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-zinc-100'}`}>
                            {timeLeft}s
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-zinc-400">Opponent</div>
                        <div className="flex gap-1 mt-1 justify-end">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full bg-zinc-800`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
                    {/* Left: Pool (8 cols) */}
                    <div className="md:col-span-8 bg-zinc-900/30 rounded-lg border border-zinc-800 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
                            <h2 className="font-bold flex justify-between">
                                <span>Available Pokemon</span>
                                <span className="text-zinc-500 text-sm">{pool.length} remaining</span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {pool.map((mon: any, idx: number) => {
                                // Check if selected by *anyone* (if shared pool logic) OR just me.
                                // Current logic: Pool is shared visually but drafted independently unless we remove from pool.
                                // Simulating "Draft from remaining 44": Indices of 'locked' ones should be disabled?
                                // Actually, random allocation picked 3 indices. They reside in 'draft' now.
                                // We should check if this index is in my selectedIndices.

                                const isSelected = myDraft?.selectedIndices?.includes(idx);

                                return (
                                    <button
                                        key={mon.id}
                                        disabled={isSelected || myTeam.length >= 6}
                                        onClick={() => {
                                            getSocket().emit('SELECT_ACTION', {
                                                matchId,
                                                userId: myUserId,
                                                action: { type: 'draft', draftIndex: idx }
                                            });
                                        }}
                                        className={`relative p-3 rounded-lg border text-left transition-all hover:scale-[1.02] overflow-hidden
                                             ${isSelected
                                                ? 'bg-zinc-800 border-zinc-700 opacity-50 cursor-not-allowed'
                                                : 'bg-zinc-900 border-zinc-700 hover:border-blue-500 hover:bg-zinc-800'
                                            }`}
                                    >
                                        <div className="absolute -right-2 -bottom-2 w-20 h-20 opacity-20 pointer-events-none grayscale">
                                            <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-full h-full object-contain pixelated" />
                                        </div>
                                        <div className="relative z-10 w-12 h-12 mb-2">
                                            <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-full h-full object-contain pixelated" />
                                        </div>
                                        <div className="text-xs font-mono text-zinc-500 mb-1 relative z-10">#{mon.speciesId}</div>
                                        <div className="font-bold truncate">{mon.name}</div>
                                        <div className="flex gap-1 mt-2">
                                            {mon.types.map((t: string) => (
                                                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-zinc-950 rounded capitalize text-zinc-300">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        {/* Simple Stats Bar */}
                                        <div className="mt-3 space-y-1">
                                            <div className="flex items-center text-[10px] gap-1">
                                                <span className="w-6 text-zinc-500">ATK</span>
                                                <div className="h-1 bg-zinc-700 flex-1 rounded-full"><div style={{ width: `${Math.min(100, mon.stats.atk / 1.5)}%` }} className="h-full bg-red-500/70 rounded-full" /></div>
                                            </div>
                                            <div className="flex items-center text-[10px] gap-1">
                                                <span className="w-6 text-zinc-500">SPD</span>
                                                <div className="h-1 bg-zinc-700 flex-1 rounded-full"><div style={{ width: `${Math.min(100, mon.stats.spe / 1.5)}%` }} className="h-full bg-blue-500/70 rounded-full" /></div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: My Team (4 cols) */}
                    <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-zinc-800">
                            <h2 className="font-bold">My Team ({myTeam.length}/6)</h2>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto flex-1">
                            {[...Array(6)].map((_, i) => {
                                const mon = myTeam[i];
                                return (
                                    <div key={i} className={`h-20 rounded-lg border flex items-center px-4 gap-4 
                                        ${mon ? 'bg-zinc-900 border-green-900/30' : 'bg-zinc-950 border-zinc-800 border-dashed'}`}>
                                        {mon ? (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 overflow-hidden border border-zinc-700">
                                                    <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-full h-full object-contain pixelated" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{mon.name}</div>
                                                    <div className="text-xs text-zinc-500">Lv. {mon.level}</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-zinc-600 text-sm w-full text-center">Empty Slot</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-zinc-800 text-center">
                            {myTeam.length === 6 ? (
                                <div className="text-green-500 text-sm font-bold animate-pulse">Ready for Battle!</div>
                            ) : (
                                <div className="text-zinc-500 text-sm">Select {6 - myTeam.length} more</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- PHASE: FORMATION (Lead Selection) ---
    if (phase === 'formation') {
        const myTeam = players[myUserId!]?.team || [];

        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4">
                    <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 mb-2">
                        PREPARE FOR BATTLE
                    </h1>
                    <p className="text-zinc-400 text-lg">Choose your Lead Pokemon!</p>
                    <div className="text-6xl font-black font-mono mt-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {timeLeft}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
                    {myTeam.map((mon: any) => (
                        <Card
                            key={mon.id}
                            onClick={() => {
                                getSocket().emit('SELECT_ACTION', { matchId, userId: myUserId, action: { type: 'switch', pokemonId: mon.id } });
                                // Optimistic update or wait for server? Server will send update.
                                // Maybe show 'Selected' state locally if needed, but for now just click.
                            }}
                            className={`p-4 bg-zinc-900 border-zinc-700 cursor-pointer hover:bg-zinc-800 hover:border-amber-500 transition-all group relative overflow-hidden
                                ${players[myUserId!]?.activePokemonId === mon.id ? 'ring-2 ring-amber-500 bg-amber-900/20' : ''}
                            `}
                        >
                            <div className="relative z-10 flex flex-col items-center">
                                <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-24 h-24 object-contain pixelated mb-2 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-lg">{mon.name}</div>
                                <div className="flex gap-1 mt-1">
                                    {mon.types.map((t: string) => (
                                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 uppercase">{t}</span>
                                    ))}
                                </div>
                            </div>
                            {/* Selected Indicator */}
                            {players[myUserId!]?.activePokemonId === mon.id && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    // ... keep existing ...
    const myPlayer = myUserId ? players[myUserId] : null;
    const opponentId = playerIds.find((id: string) => id !== myUserId);
    const opponent = opponentId ? players[opponentId] : null;

    const myActiveMon = myPlayer?.team?.find((p: any) => p.id === myPlayer.activePokemonId);
    const opponentActiveMon = opponent?.team?.find((p: any) => p.id === opponent.activePokemonId);

    // Filter "Fog of War" - don't show all opponent pokemon details if wanted?
    // For now, assume state.player[opponentId] handles it.

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
            {/* Navbar */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold flex items-center gap-2"><Swords className="text-red-500" /> Arena</h1>
                    <div className="px-3 py-1 bg-zinc-900 rounded border border-zinc-800 text-xs font-mono text-zinc-500">
                        ID: {matchId}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyLink('join')}><Share2 className="w-4 h-4 mr-2" /> Invite</Button>
                </div>
            </div>

            {/* Main Battle Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden relative">

                {/* LEFT: MY TEAM (3 Cols) */}
                <div className="md:col-span-3 bg-zinc-900/30 border-r border-zinc-900 flex flex-col">
                    <div className="p-3 border-b border-zinc-900 font-bold text-sm text-zinc-500 uppercase tracking-wider">My Team</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {myPlayer?.team?.map((mon: any) => {
                            const isActive = mon.id === myPlayer.activePokemonId;
                            const isFainted = mon.currentHp === 0;
                            return (
                                <div key={mon.id} className={`p-2 rounded border transition-all 
                                    ${isActive ? 'bg-zinc-800 border-green-500/50 shadow-lg shadow-green-900/20' : 'bg-zinc-900/50 border-zinc-800'}
                                    ${isFainted ? 'opacity-50 grayscale' : ''}
                                `}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center overflow-hidden border border-zinc-700">
                                                <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-full h-full object-contain pixelated" />
                                            </div>
                                            <span className={`font-bold text-sm ${isActive ? 'text-green-400' : 'text-zinc-300'}`}>{mon.name}</span>
                                        </div>
                                        <span className="text-xs text-zinc-500">Lv.{mon.level}</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(mon.currentHp / mon.maxHp) * 100}%` }} />
                                    </div>
                                    <div className="text-[10px] text-right text-zinc-500 mt-1">{mon.currentHp}/{mon.maxHp}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* CENTER: ARENA & CONTROLS (6 Cols) */}
                <div className="md:col-span-6 flex flex-col relative bg-gradient-to-b from-zinc-950 to-zinc-900">

                    {/* Scorecard / Header */}
                    <div className="h-16 flex items-center justify-between px-8 border-b border-zinc-900 bg-zinc-950/80">
                        <div className="text-center">
                            <div className="text-xs text-zinc-500">You</div>
                            <div className="font-bold text-green-500 text-lg">{myPlayer?.team?.filter((p: any) => p.currentHp > 0).length} Alive</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Turn {battleState.turn}</div>
                            <div className={`text-4xl font-black font-mono leading-none ${timeLeft < 4 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {timeLeft}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-zinc-500">Opponent</div>
                            <div className="font-bold text-red-500 text-lg">{opponent?.team?.filter((p: any) => p.currentHp > 0).length} Alive</div>
                        </div>
                    </div>

                    {/* Battle Visuals */}
                    <div className="flex-1 relative flex items-center justify-center p-8">
                        {/* Environment Background (Subtle) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                        {/* Battleground Info Overlay */}
                        <div className="absolute top-4 left-0 right-0 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                            {field?.battleground && <BattlegroundInfo battleground={field.battleground} minimal />}
                        </div>

                        <div className="flex justify-between items-end w-full max-w-2xl px-8 relative z-0">
                            {/* My Active Mon (Back View) */}
                            <div className="relative group">
                                {myActiveMon ? (
                                    <div className="text-center">
                                        <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-800/20 rounded-full blur-xl absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                                        {/* Placeholder Sprite */}
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-800/20 rounded-lg flex items-center justify-center relative z-10 transform transition-transform group-hover:scale-105">
                                            <img src={getSprite(myActiveMon.speciesId, true)} alt={myActiveMon.name} className="w-full h-full object-contain pixelated scale-150" />
                                        </div>
                                        <div className="mt-4 bg-zinc-900/80 backdrop-blur p-2 rounded-lg border border-zinc-800 inline-block min-w-[120px]">
                                            <div className="font-bold text-white">{myActiveMon.name}</div>
                                            <div className="w-full h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(myActiveMon.currentHp / myActiveMon.maxHp) * 100}%` }} />
                                            </div>
                                            <div className="text-xs text-right mt-1 font-mono text-zinc-400">{myActiveMon.currentHp}/{myActiveMon.maxHp}</div>
                                        </div>
                                    </div>
                                ) : <div className="text-zinc-600 animate-pulse">Summoning...</div>}
                            </div>

                            {/* Opponent Active Mon (Front View) */}
                            <div className="relative group">
                                {opponentActiveMon ? (
                                    <div className="text-center">
                                        <div className="w-32 h-32 md:w-48 md:h-48 bg-red-900/10 rounded-full blur-xl absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-800/20 rounded-lg flex items-center justify-center relative z-10 transform scale-90">
                                            <img src={getSprite(opponentActiveMon.speciesId)} alt={opponentActiveMon.name} className="w-full h-full object-contain pixelated scale-150" />
                                        </div>
                                        <div className="mt-4 bg-zinc-900/80 backdrop-blur p-2 rounded-lg border border-zinc-800 inline-block min-w-[120px]">
                                            <div className="font-bold text-red-200">{opponentActiveMon.name}</div>
                                            <div className="w-full h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(opponentActiveMon.currentHp / opponentActiveMon.maxHp) * 100}%` }} />
                                            </div>
                                            {/* Hide exact HP for opponent? Just bar is usually standard, but let's show % or value for now debug */}
                                            <div className="text-xs text-right mt-1 font-mono text-zinc-500">{Math.ceil((opponentActiveMon.currentHp / opponentActiveMon.maxHp) * 100)}%</div>
                                        </div>
                                    </div>
                                ) : <div className="text-zinc-600">Waiting...</div>}
                            </div>
                        </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="h-auto min-h-[160px] bg-zinc-950 border-t border-zinc-900 p-4">
                        <div className="grid grid-cols-2 gap-4 h-full max-w-2xl mx-auto">
                            {myActiveMon?.moves?.map((move: any) => {
                                const expiry = move.cooldownExpiry || 0;
                                const duration = move.cooldownDuration || 0;
                                const remaining = Math.max(0, expiry - now);
                                const isOnCooldown = remaining > 0;
                                const progress = duration > 0 ? (remaining / duration) * 100 : 0;

                                return (
                                    <Button
                                        key={move.id}
                                        variant={isOnCooldown ? "ghost" : "outline"}
                                        disabled={isOnCooldown || !opponentActiveMon}
                                        className={`h-full relative overflow-hidden group border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 
                                            ${isOnCooldown ? 'opacity-80' : 'bg-white text-black hover:bg-zinc-200'}
                                        `}
                                        onClick={() => {
                                            if (!isOnCooldown) {
                                                getSocket().emit('SELECT_ACTION', { matchId, userId: myUserId, action: { type: 'move', moveId: move.id } });
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col items-start w-full relative z-10">
                                            <span className="font-bold text-lg">{move.name}</span>
                                            <div className="flex gap-2 text-xs opacity-70">
                                                <span className="capitalize">{move.type}</span>
                                                <span>Pow: {move.power}</span>
                                                <span className={`${move.currentPp === 0 ? 'text-red-500' : ''}`}>PP {move.currentPp}/{move.maxPp}</span>
                                            </div>
                                            {/* Timer Text */}
                                            {isOnCooldown && (
                                                <div className="text-xs font-mono mt-1 font-bold">
                                                    {(remaining / 1000).toFixed(1)}s
                                                </div>
                                            )}
                                        </div>

                                        {/* Cooldown Overlay (Vertical Progress) */}
                                        {isOnCooldown && (
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-[1px] z-0 transition-all duration-100 ease-linear"
                                                style={{ height: `${progress}%` }}
                                            />
                                        )}

                                        {/* Type Color Hints (Subtle) */}
                                        {!isOnCooldown && (
                                            <div className={`absolute right-0 top-0 bottom-0 w-2 opacity-100 transition-opacity
                                                ${move.type === 'fire' ? 'bg-red-500' :
                                                    move.type === 'water' ? 'bg-blue-500' :
                                                        move.type === 'grass' ? 'bg-green-500' :
                                                            move.type === 'electric' ? 'bg-yellow-500' :
                                                                'bg-zinc-400'}
                                            `} />
                                        )}
                                    </Button>
                                );
                            })}
                            {(!myActiveMon || myActiveMon.moves?.length === 0) && (
                                <div className="col-span-2 flex items-center justify-center text-zinc-500 italic">
                                    Prepare for battle...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: OPPONENT TEAM (3 Cols) */}
                <div className="md:col-span-3 bg-zinc-900/30 border-l border-zinc-900 flex flex-col">
                    <div className="p-3 border-b border-zinc-900 font-bold text-sm text-zinc-500 uppercase tracking-wider text-right">Opponent Team</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {opponent?.team?.map((mon: any, i: number) => {
                            const isActive = mon.id === opponent.activePokemonId;
                            const isFainted = mon.currentHp === 0;
                            return (
                                <div key={i} className={`p-2 rounded border transition-all 
                                    ${isActive ? 'bg-zinc-800/50 border-red-500/30' : 'bg-zinc-900/50 border-zinc-800'}
                                    ${isFainted ? 'opacity-50 grayscale' : ''}
                                `}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center overflow-hidden border border-zinc-700">
                                                <img src={getSprite(mon.speciesId)} alt={mon.name} className="w-full h-full object-contain pixelated" />
                                            </div>
                                            <span className={`font-bold text-sm ${isActive ? 'text-red-400' : 'text-zinc-500'}`}>
                                                {mon.name || 'Unknown'}
                                            </span>
                                        </div>
                                        {/* Hide Level for opponent? Or show? */}
                                        <span className="text-xs text-zinc-600">Lv.{mon.level}</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        {/* Red bar for opponent */}
                                        <div className="h-full bg-red-500/70 transition-all duration-500" style={{ width: `${(mon.currentHp / mon.maxHp) * 100}%` }} />
                                    </div>
                                    <div className="text-[10px] text-right text-zinc-600 mt-1">
                                        {isFainted ? 'Fainted' : `${Math.ceil((mon.currentHp / mon.maxHp) * 100)}%`}
                                    </div>
                                </div>
                            )
                        })}
                        {(!opponent?.team || opponent.team.length === 0) && (
                            <div className="text-center text-zinc-600 p-4 text-xs italic">
                                Hidden Info
                            </div>
                        )}
                    </div>
                    {/* Log Panel (Small, at bottom right) */}
                    <div className="h-48 border-t border-zinc-900 bg-zinc-950 p-2 overflow-y-auto font-mono text-[10px] text-zinc-400">
                        <div className="text-zinc-600 mb-1 sticky top-0 bg-zinc-950">BATTLE LOG</div>
                        {battleState.history?.slice().reverse().map((log: string, i: number) => (
                            <div key={i} className="mb-1 border-b border-zinc-900/50 pb-0.5">{log}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scorecard Overlay */}
            {battleState.phase === 'fainted_switch' && battleState.faintedState?.userId === myUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-4xl p-6 bg-zinc-900 border-red-900/50">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-red-500 mb-2">Pokemon Fainted!</h2>
                            <p className="text-zinc-400">Choose your next Pokemon ({timeLeft}s)</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {myPlayer?.team?.map((mon: any) => {
                                const isFainted = mon.currentHp === 0;
                                const isActive = mon.id === myPlayer.activePokemonId;
                                return (
                                    <button
                                        key={mon.id}
                                        disabled={isFainted || isActive}
                                        onClick={() => {
                                            getSocket().emit('SELECT_ACTION', { matchId, userId: myUserId, action: { type: 'switch', pokemonId: mon.id } });
                                        }}
                                        className={`p-3 rounded border flex flex-col items-center gap-2 transition-all
                                            ${isFainted ? 'bg-zinc-950 border-zinc-800 opacity-50 cursor-not-allowed' :
                                                isActive ? 'bg-zinc-800 border-green-900 opacity-50 cursor-not-allowed' :
                                                    'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-white cursor-pointer'}
                                        `}
                                    >
                                        <div className="w-16 h-16 relative">
                                            <img src={getSprite(mon.speciesId)} alt={mon.name} className={`w-full h-full object-contain pixelated ${isFainted ? 'grayscale' : ''}`} />
                                            {isFainted && <div className="absolute inset-0 flex items-center justify-center text-red-600 font-black text-2xl">X</div>}
                                        </div>
                                        <div className="font-bold text-sm">{mon.name}</div>
                                        <div className="text-xs text-zinc-500">
                                            {isFainted ? 'Fainted' : isActive ? 'Active' : `${mon.currentHp}/${mon.maxHp}`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {battleState.phase === 'finished' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <Card className="w-full max-w-lg p-6 bg-zinc-900 border-zinc-700 text-center animate-in fade-in zoom-in">
                        <h2 className="text-4xl font-extrabold text-amber-500 mb-2">Match Finished!</h2>

                        <div className="my-8">
                            {battleState.winner ? (
                                <div className="text-2xl font-bold text-white">
                                    Winner: <span className="text-green-400">{battleState.winner}</span>
                                </div>
                            ) : (
                                <div className="text-2xl text-zinc-400">Draw</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-zinc-950/50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-zinc-500">Total Turns</p>
                                <p className="text-xl font-mono">{battleState.turn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Battleground</p>
                                <p className="text-xl">{battleState.field?.battleground?.name || 'Unknown'}</p>
                            </div>
                        </div>

                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => window.location.href = '/'}>
                            Return to Home
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
