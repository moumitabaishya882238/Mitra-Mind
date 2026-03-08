import apiClient from '../api/client';

export type CommunityFilter = 'all' | 'mine' | 'saved';

export type ModerationResult = {
    flagged: boolean;
    categories: string[];
    empatheticResponse: string;
    supportResources: string[];
};

export type CommunityPost = {
    id: string;
    userId: string;
    anonymousUsername: string;
    message: string;
    mood?: string;
    createdAt: string;
    canDelete: boolean;
    replyCount: number;
    saved: boolean;
    moderation?: ModerationResult;
};

export type CommunityReply = {
    id: string;
    postId: string;
    userId: string;
    anonymousUsername: string;
    message: string;
    createdAt: string;
    canDelete: boolean;
};

export type ConversationItem = {
    conversationId: string;
    peerId: string;
    peerAnonymousUsername: string;
    lastMessage: string;
    timestamp: string;
};

export type DirectMessageItem = {
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

const communityService = {
    // Community posts use the same axios client as AI features, keeping API auth/session behavior consistent.
    async getPosts(userId: string, filter: CommunityFilter) {
        const response = await apiClient.get('/community/posts', {
            params: { userId, filter },
        });
        return response.data as { posts: CommunityPost[] };
    },

    async createPost(userId: string, message: string, mood?: string) {
        const response = await apiClient.post('/community/posts', {
            userId,
            message,
            mood,
        });
        return response.data as { post: CommunityPost; moderation: ModerationResult };
    },

    async deletePost(userId: string, postId: string) {
        const response = await apiClient.delete(`/community/posts/${postId}`, {
            params: { userId },
        });
        return response.data as { success: boolean };
    },

    async savePost(userId: string, postId: string) {
        const response = await apiClient.post(`/community/posts/${postId}/save`, { userId });
        return response.data as { success: boolean };
    },

    async unsavePost(userId: string, postId: string) {
        const response = await apiClient.delete(`/community/posts/${postId}/save`, {
            params: { userId },
        });
        return response.data as { success: boolean };
    },

    async getPostDetail(userId: string, postId: string) {
        const response = await apiClient.get(`/community/posts/${postId}`, {
            params: { userId },
        });
        return response.data as { post: CommunityPost; replies: CommunityReply[] };
    },

    async createReply(userId: string, postId: string, message: string) {
        const response = await apiClient.post(`/community/posts/${postId}/replies`, {
            userId,
            message,
        });
        return response.data as { reply: CommunityReply; moderation: ModerationResult };
    },

    async getConversations(userId: string) {
        const response = await apiClient.get('/community/messages', {
            params: { userId },
        });
        return response.data as { conversations: ConversationItem[] };
    },

    async getMessageHistory(userId: string, peerId: string) {
        const response = await apiClient.get(`/community/messages/${peerId}`, {
            params: { userId },
        });
        return response.data as {
            peerId: string;
            peerAnonymousUsername: string;
            messages: DirectMessageItem[];
        };
    },

    async sendDirectMessage(senderId: string, receiverId: string, message: string) {
        const response = await apiClient.post('/community/messages', {
            senderId,
            receiverId,
            message,
        });
        return response.data as { directMessage: DirectMessageItem; moderation: ModerationResult };
    },
};

export default communityService;
