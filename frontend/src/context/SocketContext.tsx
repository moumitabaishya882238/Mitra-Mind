import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { Socket } from 'socket.io-client';

const STORAGE_SESSION_KEY = 'mh-session-id';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let activeSocket: Socket | null = null;

        const initSocket = async () => {
            try {
                const userId = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
                if (userId) {
                    activeSocket = connectSocket(userId);
                    setSocket(activeSocket);

                    activeSocket.on('connect', () => setIsConnected(true));
                    activeSocket.on('disconnect', () => setIsConnected(false));
                }
            } catch (error) {
                console.error('Socket initialization error:', error);
            }
        };

        initSocket();

        return () => {
            if (activeSocket) {
                activeSocket.off('connect');
                activeSocket.off('disconnect');
                disconnectSocket();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
