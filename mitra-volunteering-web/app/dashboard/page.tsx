"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ListenerDashboardPage() {
  const [listenerId, setLiveListenerId] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'online' | 'offline'>('offline');
  const [statusText, setStatusText] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mitra-listener-id');
      if (stored) {
        setLiveListenerId(stored);
        setIsLogged(true);
      }
    }
  });

  const updateAvailability = async (nextStatus: 'online' | 'offline') => {
    if (!listenerId) {
      setStatusText('Enter listener ID first.');
      return;
    }

    try {
      const response = await api.patch(`/listeners/${listenerId}/availability`, {
        availabilityStatus: nextStatus,
      });
      setAvailabilityStatus(response.data.listener.availabilityStatus);
      setStatusText(`Availability updated: ${response.data.listener.availabilityStatus}`);
      if (!isLogged) {
        localStorage.setItem('mitra-listener-id', listenerId);
        setIsLogged(true);
      }
    } catch (error: any) {
      setStatusText(error?.response?.data?.error || 'Failed to update availability.');
    }
  };

  return (
    <section className="card">
      <div className="inline-row" style={{ justifyContent: 'space-between' }}>
        <h2>Listener Dashboard</h2>
        {isLogged && (
          <Link href="/dashboard/chats" className="button-primary">Go to Active Chats 💬</Link>
        )}
      </div>
      <p>For approved listeners to manage availability and support sessions.</p>

      <div className="card">
        <label>
          Listener ID
          <input
            value={listenerId}
            onChange={(e) => setLiveListenerId(e.target.value)}
            placeholder="Mongo ObjectId"
            disabled={isLogged}
          />
        </label>

        <div className="inline-row" style={{ marginTop: 12 }}>
          <button className="button-primary" onClick={() => updateAvailability('online')}>Go Online</button>
          <button className="button-secondary" onClick={() => updateAvailability('offline')}>Go Offline</button>
          <span className="badge">Current: {availabilityStatus}</span>
        </div>

        {statusText ? <p className="notice">{statusText}</p> : null}
      </div>

      {isLogged && (
        <div style={{ marginTop: 20, textAlign: 'center', opacity: 0.7 }}>
          <button style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => {
            localStorage.removeItem('mitra-listener-id');
            setIsLogged(false);
            setLiveListenerId('');
          }}>Switch / Log Out Account</button>
        </div>
      )}
    </section>
  );
}
