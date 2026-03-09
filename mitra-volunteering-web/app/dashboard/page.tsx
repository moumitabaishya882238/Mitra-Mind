"use client";

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ListenerDashboardPage() {
  const [listenerId, setListenerId] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'online' | 'offline'>('offline');
  const [statusText, setStatusText] = useState('');

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
    } catch (error: any) {
      setStatusText(error?.response?.data?.error || 'Failed to update availability.');
    }
  };

  return (
    <section className="card">
      <h2>Listener Dashboard</h2>
      <p>For approved listeners to manage availability and support sessions.</p>

      <div className="card">
        <label>
          Listener ID
          <input value={listenerId} onChange={(e) => setListenerId(e.target.value)} placeholder="Mongo ObjectId" />
        </label>

        <div className="inline-row" style={{ marginTop: 12 }}>
          <button className="button-primary" onClick={() => updateAvailability('online')}>Go Online</button>
          <button className="button-secondary" onClick={() => updateAvailability('offline')}>Go Offline</button>
          <span className="badge">Current: {availabilityStatus}</span>
        </div>

        {statusText ? <p className="notice">{statusText}</p> : null}
      </div>
    </section>
  );
}
