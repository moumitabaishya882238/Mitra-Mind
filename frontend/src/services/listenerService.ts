import apiClient from '../api/client';

export type ListenerItem = {
    id: string;
    name: string;
    role: string;
        profileImage?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    trainingCompleted: boolean;
    availabilityStatus: 'online' | 'offline';
    createdAt: string;
};

export type ListenerProfile = {
    id: string;
    name: string;
    role: string;
    profileImage?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    trainingCompleted: boolean;
    availabilityStatus: 'online' | 'offline';
    city?: string;
    state?: string;
    country?: string;
    motivation?: string;
    priorSupportExperience?: string;
    educationLevel?: string;
    fieldOfStudy?: string;
    occupation?: string;
    createdAt: string;
};

export type ListenerChatMessage = {
    id: string;
    conversationId: string;
    userId: string;
    listenerId: string;
    senderRole: 'user' | 'listener' | 'system';
    message: string;
    createdAt: string;
};

function getConversationId(userId: string, listenerId: string) {
    return `${userId}::${listenerId}`;
}

const listenerService = {
    async getListeners(availability?: 'online' | 'offline') {
        const response = await apiClient.get('/listeners', {
            params: {
                verificationStatus: 'verified',
                ...(availability ? { availability } : {}),
            },
        });
        return response.data as { listeners: ListenerItem[] };
    },

    async getListenerProfile(listenerId: string) {
        const response = await apiClient.get(`/listeners/${listenerId}`);
        return response.data as { listener: ListenerProfile };
    },

    async sendListenerChatMessage(userId: string, listenerId: string, message: string) {
        const response = await apiClient.post('/listener-chat', {
            userId,
            listenerId,
            senderRole: 'user',
            message,
        });

        return response.data as {
            chatMessage: ListenerChatMessage;
        };
    },

    async getListenerChat(userId: string, listenerId: string) {
        const conversationId = getConversationId(userId, listenerId);
        const response = await apiClient.get(`/listener-chat/${encodeURIComponent(conversationId)}`);
        return response.data as {
            conversationId: string;
            messages: ListenerChatMessage[];
        };
    },
};

export default listenerService;
