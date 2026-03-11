"use client";

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { BACKEND_BASE_URL } from '../../../lib/backendBaseUrl';

type LandingContactInquiry = {
  _id: string;
  fullName: string;
  email: string;
  inquiryType: 'partnership' | 'beta' | 'general';
  message: string;
  status: 'new' | 'in_review' | 'resolved';
  createdAt: string;
};

type LandingFeedbackReport = {
  _id: string;
  platform: 'android' | 'ios' | 'web' | 'unknown';
  feedbackType: 'bug' | 'feature' | 'ai' | 'other';
  details: string;
  reporterEmail?: string;
  status: 'new' | 'in_review' | 'resolved';
  createdAt: string;
};

type LoginState = {
  email: string;
  password: string;
};

export default function LandingInboxAdminPage() {
  const [login, setLogin] = useState<LoginState>({ email: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<LandingContactInquiry[]>([]);
  const [feedback, setFeedback] = useState<LandingFeedbackReport[]>([]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [contactsRes, feedbackRes] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/landing/admin/landing-contact-inquiries`, {
          credentials: 'include',
        }),
        fetch(`${BACKEND_BASE_URL}/landing/admin/landing-feedback-reports`, {
          credentials: 'include',
        }),
      ]);

      const contactsPayload = await contactsRes.json().catch(() => ({}));
      const feedbackPayload = await feedbackRes.json().catch(() => ({}));

      if (!contactsRes.ok || !feedbackRes.ok) {
        throw new Error(
          contactsPayload.message || feedbackPayload.message || 'Unable to load landing inbox data.'
        );
      }

      setContacts(Array.isArray(contactsPayload.data) ? contactsPayload.data : []);
      setFeedback(Array.isArray(feedbackPayload.data) ? feedbackPayload.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin inbox data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_BASE_URL}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(login),
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload.success) {
          throw new Error(payload.message || 'Admin login failed.');
        }

        setIsAuthenticated(true);
        await refreshData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to login.');
      } finally {
        setIsLoading(false);
      }
    },
    [login, refreshData]
  );

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch(`${BACKEND_BASE_URL}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setIsAuthenticated(false);
      setContacts([]);
      setFeedback([]);
      setIsLoading(false);
    }
  }, []);

  const summary = useMemo(() => {
    const contactNew = contacts.filter((item) => item.status === 'new').length;
    const feedbackNew = feedback.filter((item) => item.status === 'new').length;
    return {
      contactTotal: contacts.length,
      feedbackTotal: feedback.length,
      pendingTotal: contactNew + feedbackNew,
    };
  }, [contacts, feedback]);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.eyebrow}>Landing Admin</p>
        <h1 style={styles.title}>Landing Inbox</h1>
        <p style={styles.subtitle}>
          Review landing contact inquiries and landing feedback reports submitted from the website.
        </p>

        {!isAuthenticated ? (
          <form style={styles.loginCard} onSubmit={handleLogin}>
            <label style={styles.label} htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              style={styles.input}
              value={login.email}
              onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))}
              required
            />

            <label style={styles.label} htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              style={styles.input}
              value={login.password}
              onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))}
              required
            />

            <button style={styles.primaryBtn} type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {error ? <p style={styles.error}>{error}</p> : null}
          </form>
        ) : (
          <>
            <div style={styles.toolbar}>
              <div style={styles.stats}>
                <span>Total contacts: {summary.contactTotal}</span>
                <span>Total feedback: {summary.feedbackTotal}</span>
                <span>New items: {summary.pendingTotal}</span>
              </div>
              <div style={styles.toolbarActions}>
                <button style={styles.secondaryBtn} onClick={refreshData} disabled={isLoading} type="button">
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button style={styles.secondaryBtn} onClick={handleLogout} type="button">
                  Logout
                </button>
              </div>
            </div>

            {error ? <p style={styles.error}>{error}</p> : null}

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Landing Contact Inquiries</h2>
              {contacts.length === 0 ? (
                <p style={styles.empty}>No landing contact inquiries yet.</p>
              ) : (
                <div style={styles.list}>
                  {contacts.map((item) => (
                    <article key={item._id} style={styles.itemCard}>
                      <div style={styles.itemHead}>
                        <strong>{item.fullName}</strong>
                        <span style={styles.status}>{item.status}</span>
                      </div>
                      <p style={styles.meta}>{item.email} · {item.inquiryType} · {new Date(item.createdAt).toLocaleString()}</p>
                      <p style={styles.message}>{item.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Landing Feedback Reports</h2>
              {feedback.length === 0 ? (
                <p style={styles.empty}>No landing feedback reports yet.</p>
              ) : (
                <div style={styles.list}>
                  {feedback.map((item) => (
                    <article key={item._id} style={styles.itemCard}>
                      <div style={styles.itemHead}>
                        <strong>{item.feedbackType.toUpperCase()}</strong>
                        <span style={styles.status}>{item.status}</span>
                      </div>
                      <p style={styles.meta}>
                        {item.platform} · {item.reporterEmail || 'no email'} · {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p style={styles.message}>{item.details}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '120px 16px 48px',
    display: 'flex',
    justifyContent: 'center',
  },
  wrap: {
    width: '100%',
    maxWidth: '1080px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  eyebrow: {
    fontSize: '0.78rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'rgba(170, 190, 255, 0.85)',
  },
  title: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    margin: 0,
  },
  subtitle: {
    color: 'rgba(235, 231, 255, 0.82)',
    margin: 0,
  },
  loginCard: {
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(24, 32, 66, 0.55)',
    border: '1px solid rgba(142, 161, 255, 0.15)',
  },
  label: {
    fontSize: '0.9rem',
    color: 'rgba(235, 231, 255, 0.9)',
  },
  input: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(142, 161, 255, 0.2)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: 'white',
  },
  primaryBtn: {
    marginTop: '8px',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 16px',
    fontWeight: 700,
    color: 'white',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, rgba(92, 64, 232, 0.88), rgba(59, 130, 246, 0.88))',
  },
  secondaryBtn: {
    border: '1px solid rgba(142, 161, 255, 0.25)',
    borderRadius: '999px',
    padding: '9px 14px',
    fontWeight: 600,
    color: 'rgba(235, 231, 255, 0.92)',
    cursor: 'pointer',
    background: 'rgba(16, 24, 54, 0.62)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  stats: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    color: 'rgba(225, 233, 255, 0.88)',
    fontSize: '0.95rem',
  },
  toolbarActions: {
    display: 'flex',
    gap: '10px',
  },
  section: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.2rem',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  itemCard: {
    borderRadius: '12px',
    padding: '14px',
    background: 'rgba(18, 24, 50, 0.72)',
    border: '1px solid rgba(112, 140, 238, 0.22)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  status: {
    fontSize: '0.78rem',
    padding: '4px 8px',
    borderRadius: '999px',
    background: 'rgba(112, 140, 238, 0.24)',
    color: 'rgba(235, 241, 255, 0.95)',
    textTransform: 'uppercase',
  },
  meta: {
    margin: 0,
    fontSize: '0.82rem',
    color: 'rgba(184, 199, 240, 0.84)',
  },
  message: {
    margin: 0,
    color: 'rgba(232, 238, 255, 0.94)',
    lineHeight: 1.55,
  },
  empty: {
    margin: 0,
    color: 'rgba(184, 199, 240, 0.84)',
  },
  error: {
    margin: 0,
    color: 'rgba(255, 177, 177, 0.95)',
    fontSize: '0.92rem',
  },
};
