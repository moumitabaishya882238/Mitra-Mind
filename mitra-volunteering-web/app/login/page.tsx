"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
    const [listenerId, setListenerId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listenerId.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Verify if listener exists
            const response = await api.get(`/listeners/${listenerId}`);
            if (response.data.listener) {
                localStorage.setItem('mitra-listener-id', listenerId);
                router.push('/dashboard/chats');
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Listener ID not found or unverified.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
            <h2>Volunteer Access</h2>
            <p>Enter your unique Listener ID to access your support workspace.</p>

            <form onSubmit={handleLogin}>
                <div className="card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <label>
                        Listener ID
                        <input
                            value={listenerId}
                            onChange={(e) => setListenerId(e.target.value)}
                            placeholder="e.g. 65db..."
                            style={{ width: '100%', marginTop: 8 }}
                            required
                        />
                    </label>

                    {error ? <p className="notice" style={{ color: '#ff4444' }}>{error}</p> : null}

                    <button
                        type="submit"
                        className="button-primary"
                        style={{ width: '100%', marginTop: 16 }}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Access Workspace'}
                    </button>
                </div>
            </form>
        </section>
    );
}
