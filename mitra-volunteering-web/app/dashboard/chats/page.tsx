"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ChatsListPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const listenerId = localStorage.getItem('mitra-listener-id');
        if (!listenerId) {
            router.push('/login');
            return;
        }

        const fetchChats = async () => {
            try {
                // In a real app, we'd have a specific list-conversations endpoint for listeners
                // For now, we'll fetch general listener stats or similar if available, 
                // but since we don't have a "get my active chats" endpoint yet, 
                // we'll assume a list will be populated.
                // Let's create a placeholder or check if any chats exist.
                setLoading(false);
            } catch (error) {
                console.error('Fetch chats error:', error);
                setLoading(false);
            }
        };

        fetchChats();
    }, [router]);

    return (
        <section className="card">
            <div className="inline-row" style={{ justifyContent: 'space-between' }}>
                <h2>Active Support Sessions</h2>
                <button className="button-secondary" onClick={() => {
                    localStorage.removeItem('mitra-listener-id');
                    router.push('/login');
                }}>Log Out</button>
            </div>

            <p>Select a student to begin providing support. AI-generated insights will be available once you enter a chat.</p>

            {loading ? (
                <p>Loading your conversations...</p>
            ) : chats.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>No active chats</h3>
                    <p>Go online on the <Link href="/dashboard" style={{ color: '#5b9bd5' }}>Dashboard</Link> to receive new support requests.</p>
                </div>
            ) : (
                <div className="grid">
                    {chats.map(chat => (
                        <Link key={chat.id} href={`/dashboard/chats/${chat.id}`} className="card chat-item">
                            <h4>Student: {chat.userId.substring(0, 8)}...</h4>
                            <p>Last message: {chat.lastMessage}</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
