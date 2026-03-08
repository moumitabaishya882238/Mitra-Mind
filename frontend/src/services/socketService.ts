import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

let socket: Socket | null = null;
let currentUserId: string | null = null;

type DMEventPayload = {
    directMessage: {
        id: string;
        senderId: string;
        receiverId: string;
        conversationId: string;
        message: string;
        timestamp: string;
        anonymousSender: string;
        anonymousReceiver: string;
        isMine: boolean;
    };
};

export function connectSocket(userId: string) {
    if (socket && currentUserId === userId) return socket;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    currentUserId = userId;
    socket = io(BASE_URL, {
        transports: ['websocket', 'polling'],
        auth: { userId },
    });

    socket.emit('register', { userId });
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    currentUserId = null;
}

export function onNewDirectMessage(handler: (payload: DMEventPayload) => void) {
    if (!socket) return;
    socket.on('dm:new', handler);
}

export function offNewDirectMessage(handler: (payload: DMEventPayload) => void) {
    if (!socket) return;
    socket.off('dm:new', handler);
}
