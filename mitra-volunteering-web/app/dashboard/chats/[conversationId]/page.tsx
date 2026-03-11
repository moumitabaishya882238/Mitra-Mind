"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export default function ChatDetailPage() {
    const { conversationId } = useParams() as { conversationId: string };
    const [messages, setMessages] = useState<any[]>([]);
    const [insight, setInsight] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [loadingInsight, setLoadingInsight] = useState(true);
    const [listenerId, setListenerId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('mitra-listener-id');
        if (!storedId) {
            router.push('/login');
            return;
        }
        setListenerId(storedId);

        // Extract studentId from conversationId (userId::listenerId)
        const [studentId] = conversationId.split('::');

        const fetchData = async () => {
            try {
                // Fetch Messages
                const msgRes = await api.get(`/listener-chat/${conversationId}`);
                setMessages(msgRes.data.messages);

                // Fetch AI Insight
                const insightRes = await api.get(`/insight/${studentId}`);
                setInsight(insightRes.data.insight);
            } catch (err) {
                console.error('Error fetching chat data:', err);
            } finally {
                setLoadingInsight(false);
            }
        };

        fetchData();

        // Setup Socket
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001', {
            auth: { userId: storedId }
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('register', { userId: storedId });
        });

        socket.on('listener-chat:new', (payload: any) => {
            if (payload.chatMessage.conversationId === conversationId) {
                setMessages(prev => [...prev, payload.chatMessage]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [conversationId, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !listenerId) return;

        const [studentId] = conversationId.split('::');

        try {
            const payload = {
                userId: studentId,
                listenerId: listenerId,
                senderRole: 'listener',
                message: newMessage.trim(),
            };

            await api.post('/listener-chat', payload);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
            {/* Smart AI Insight Card */}
            <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #5b9bd5' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                    ✨ AI-GENERATED STUDENT PREVIEW
                </h3>
                {loadingInsight ? (
                    <p style={{ margin: '8px 0 0', fontStyle: 'italic' }}>Analyzing student background...</p>
                ) : (
                    <div style={{ whiteSpace: 'pre-line', marginTop: 8, fontSize: '0.95rem' }}>
                        {insight}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: '15px',
                            alignSelf: msg.senderRole === 'listener' ? 'flex-end' : 'flex-start',
                            background: msg.senderRole === 'listener' ? '#5b9bd5' : 'rgba(255,255,255,0.1)',
                            color: msg.senderRole === 'listener' ? '#fff' : 'inherit',
                            fontSize: '0.95rem'
                        }}
                    >
                        {msg.message}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your supportive reply..."
                        style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
                    />
                    <button type="submit" className="button-primary" style={{ height: '48px' }}>Send Reply</button>
                </div>
            </form>
        </div>
    );
}
