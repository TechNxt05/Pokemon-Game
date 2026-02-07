import { create } from 'zustand';

interface BattleStore {
    matchId: string | null;
    role: 'player' | 'spectator' | null;
    battleState: any | null; // Mirrors the server BattleState
    isConnected: boolean;

    setMatchId: (id: string) => void;
    setRole: (role: 'player' | 'spectator') => void;
    updateBattleState: (state: any) => void;
    setConnectionStatus: (status: boolean) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
    matchId: null,
    role: null,
    battleState: null,
    isConnected: false,

    setMatchId: (id) => set({ matchId: id }),
    setRole: (role) => set({ role }),
    updateBattleState: (state) => set({ battleState: state }),
    setConnectionStatus: (status) => set({ isConnected: status }),
}));
