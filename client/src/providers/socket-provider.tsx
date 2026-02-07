'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useBattleStore } from '@/store/battle-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'; // Port 4000 for Server
const socket = io(SOCKET_URL);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { setConnectionStatus, updateBattleState } = useBattleStore();

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
            setConnectionStatus(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            setConnectionStatus(false);
        });

        socket.on('MATCH_STATE', (state) => {
            console.log('Received State:', state);
            updateBattleState(state);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('MATCH_STATE');
        };
    }, [setConnectionStatus, updateBattleState]);

    return <>{children}</>;
};

export const getSocket = () => socket;
