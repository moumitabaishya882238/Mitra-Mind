"use client";

import { useState } from 'react';
import { BACKEND_BASE_URL } from '../../lib/backendBaseUrl';

export default function Feedback() {
    const [formData, setFormData] = useState({
        platform: 'android',
        feedbackType: 'bug',
        reporterEmail: '',
        details: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<{ ok: boolean; message: string } | null>(null);

    const handleFieldChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitState(null);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/landing/forms/landing-feedback-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform: formData.platform,
                    feedbackType: formData.feedbackType,
                    reporterEmail: formData.reporterEmail,
                    details: formData.details,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to submit feedback right now.');
            }

            setSubmitState({ ok: true, message: 'Thanks for your feedback. This helps us improve MitraMind.' });
            setFormData({
                platform: 'android',
                feedbackType: 'bug',
                reporterEmail: '',
                details: '',
            });
        } catch (error) {
            setSubmitState({
                ok: false,
                message: error instanceof Error ? error.message : 'Submission failed. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-shell feedback-page" style={styles.container}>
            <div className="page-stack" style={styles.contentWrapper}>
                <p style={styles.eyebrow}>Feedback</p>
                <h1 className="page-title" style={styles.title}>
                    Help shape the next version of <span style={styles.gradientText}>Mitra-Mind</span>.
                </h1>
                <p style={styles.subtitle}>
                    Your beta feedback helps us improve emotional support quality, polish the experience, and prioritize the right next features.
                </p>

                <section style={styles.feedbackStrip} className="flow-reveal flow-reveal-1 info-strip">
                    <p style={styles.stripTitle}>Most useful feedback includes</p>
                    <div style={styles.stripPoints}>
                        <p style={styles.stripPoint}>What happened</p>
                        <p style={styles.stripPoint}>What you expected</p>
                        <p style={styles.stripPoint}>How it felt to use</p>
                    </div>
                </section>

                <section className="section-block" style={styles.feedbackGuideSection}>
                    <div style={styles.feedbackGuideIntro}>
                        <p style={styles.sectionEyebrow}>What To Share</p>
                        <h2 style={styles.sectionTitle}>The kinds of feedback we care about most</h2>
                    </div>

                    <div className="content-rail" style={styles.feedbackRail}>
                        <article style={styles.feedbackItem} className="flow-reveal flow-reveal-1">
                            <div style={{ ...styles.feedbackMarker, background: 'linear-gradient(135deg, #A78BFA, #7AF2FF)' }} />
                            <div style={styles.feedbackContent}>
                                <p style={styles.feedbackStep}>01</p>
                                <h3 style={styles.feedbackTitle}>Bug reports</h3>
                                <p style={styles.feedbackText}>Tell us what broke, where it happened, and what device or platform you were using.</p>
                            </div>
                        </article>

                        <article style={styles.feedbackItem} className="flow-reveal flow-reveal-2">
                            <div style={{ ...styles.feedbackMarker, background: 'linear-gradient(135deg, #7AF2FF, #93C5FD)' }} />
                            <div style={styles.feedbackContent}>
                                <p style={styles.feedbackStep}>02</p>
                                <h3 style={styles.feedbackTitle}>AI response quality</h3>
                                <p style={styles.feedbackText}>Let us know when a response felt especially helpful, off-tone, repetitive, or emotionally inaccurate.</p>
                            </div>
                        </article>

                        <article style={styles.feedbackItem} className="flow-reveal flow-reveal-3">
                            <div style={{ ...styles.feedbackMarker, background: 'linear-gradient(135deg, #6EE7B7, #7AF2FF)' }} />
                            <div style={styles.feedbackContent}>
                                <p style={styles.feedbackStep}>03</p>
                                <h3 style={styles.feedbackTitle}>Feature ideas</h3>
                                <p style={styles.feedbackText}>Share what would make Mitra-Mind more calming, more useful, or easier to return to every day.</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section style={styles.formSection} className="flow-reveal flow-reveal-2 split-form-section">
                    <div style={styles.formIntro}>
                        <p style={styles.sectionEyebrow}>Submit Feedback</p>
                        <h2 style={styles.formTitle}>Tell us what you noticed</h2>
                        <p style={styles.formText}>Use this form to report bugs, suggest features, or flag AI responses that need improvement.</p>
                    </div>

                    <form className="glass-card form-card-shell" style={styles.formCard} onSubmit={handleSubmit}>
                        <div className="responsive-two-col" style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="feedback-platform" style={styles.label}>Platform</label>
                                <select
                                    id="feedback-platform"
                                    name="platform"
                                    style={styles.input}
                                    value={formData.platform}
                                    onChange={handleFieldChange}
                                >
                                    <option value="android">Android</option>
                                    <option value="ios">iOS</option>
                                    <option value="web">Volunteer Web App</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="feedback-type" style={styles.label}>Type</label>
                                <select
                                    id="feedback-type"
                                    name="feedbackType"
                                    style={styles.input}
                                    value={formData.feedbackType}
                                    onChange={handleFieldChange}
                                >
                                    <option value="bug">Bug Report</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="ai">AI Response Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="feedback-email" style={styles.label}>Email (optional)</label>
                            <input
                                id="feedback-email"
                                name="reporterEmail"
                                type="email"
                                placeholder="you@example.com"
                                style={styles.input}
                                value={formData.reporterEmail}
                                onChange={handleFieldChange}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="feedback-details" style={styles.label}>Feedback Details</label>
                            <textarea
                                id="feedback-details"
                                name="details"
                                placeholder="What happened? What did you expect? What would make this experience better?"
                                rows={6}
                                style={{ ...styles.input, ...styles.textarea }}
                                value={formData.details}
                                onChange={handleFieldChange}
                                required
                            />
                        </div>

                        <button type="submit" className="glass-btn" style={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>

                        {submitState ? (
                            <p style={submitState.ok ? styles.submitMessage : styles.submitError}>{submitState.message}</p>
                        ) : null}
                    </form>
                </section>

                <section style={styles.responseNote} className="flow-reveal flow-reveal-3">
                    <p style={styles.sectionEyebrow}>Why It Matters</p>
                    <p style={styles.responseText}>Every thoughtful report helps us make Mitra-Mind safer, calmer, and more useful for students who rely on it.</p>
                </section>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '40px 8% 100px',
    },
    contentWrapper: {
        maxWidth: '980px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '34px',
    },
    eyebrow: {
        fontSize: '0.82rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.18em',
        color: 'rgba(170, 190, 255, 0.85)',
        textAlign: 'center' as const,
    },
    title: {
        fontSize: 'clamp(2.4rem, 6vw, 4.1rem)',
        fontWeight: 800,
        marginBottom: '8px',
        textAlign: 'center' as const,
        letterSpacing: '-1px',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #7AF2FF, #8354FF, #FF6A9F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        fontSize: '1.18rem',
        color: 'var(--text-secondary)',
        textAlign: 'center' as const,
        lineHeight: 1.6,
        maxWidth: '760px',
    },
    feedbackStrip: {
        width: '100%',
        padding: '20px 24px',
        borderRadius: '18px',
        border: '1px solid rgba(138, 164, 246, 0.34)',
        background: 'linear-gradient(90deg, rgba(15, 22, 58, 0.82), rgba(14, 18, 46, 0.72))',
        boxShadow: '0 14px 34px rgba(4, 7, 22, 0.34)',
        backdropFilter: 'blur(10px)',
    },
    stripTitle: {
        fontSize: '1.14rem',
        fontWeight: 700,
        color: '#F4F7FF',
        textAlign: 'center' as const,
        marginBottom: '12px',
    },
    stripPoints: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '10px',
    },
    stripPoint: {
        textAlign: 'center' as const,
        fontSize: '0.97rem',
        color: 'rgba(236, 242, 255, 0.94)',
    },
    feedbackGuideSection: {
        width: '100%',
    },
    feedbackGuideIntro: {
        textAlign: 'center' as const,
        marginBottom: '30px',
    },
    sectionEyebrow: {
        fontSize: '0.8rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.18em',
        color: 'rgba(170, 190, 255, 0.85)',
        marginBottom: '12px',
    },
    sectionTitle: {
        fontSize: 'clamp(1.5rem, 3.6vw, 2.3rem)',
        fontWeight: 700,
        color: '#EDF2FF',
    },
    feedbackRail: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        position: 'relative' as const,
        paddingLeft: '24px',
        borderLeft: '1px solid rgba(132, 160, 255, 0.28)',
    },
    feedbackItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
    },
    feedbackMarker: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        position: 'absolute' as const,
        left: '-30px',
        top: '8px',
        boxShadow: '0 0 14px rgba(122, 178, 255, 0.8)',
    },
    feedbackContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(112, 140, 238, 0.2)',
    },
    feedbackStep: {
        fontSize: '0.78rem',
        letterSpacing: '0.2em',
        color: 'rgba(150, 182, 255, 0.78)',
    },
    feedbackTitle: {
        fontSize: '1.28rem',
        fontWeight: 700,
        color: '#EDF2FF',
    },
    feedbackText: {
        fontSize: '1.02rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: '780px',
    },
    formSection: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 320px) 1fr',
        gap: '28px',
        alignItems: 'start',
    },
    formIntro: {
        paddingTop: '8px',
    },
    formTitle: {
        fontSize: 'clamp(1.35rem, 3vw, 1.9rem)',
        fontWeight: 700,
        color: '#EDF2FF',
        marginBottom: '12px',
    },
    formText: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
    },
    formCard: {
        width: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        width: '100%',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        flex: 1,
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'rgba(235, 231, 255, 0.9)',
    },
    input: {
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(142, 161, 255, 0.2)',
        borderRadius: '12px',
        padding: '14px 16px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    },
    textarea: {
        resize: 'none' as const,
    },
    submitBtn: {
        marginTop: '10px',
        width: '100%',
        padding: '16px',
    },
    submitMessage: {
        fontSize: '0.92rem',
        textAlign: 'center' as const,
        color: 'rgba(169, 255, 208, 0.95)',
    },
    submitError: {
        fontSize: '0.92rem',
        textAlign: 'center' as const,
        color: 'rgba(255, 177, 177, 0.95)',
    },
    responseNote: {
        width: '100%',
        paddingTop: '6px',
        textAlign: 'center' as const,
        borderTop: '1px solid rgba(124, 150, 236, 0.22)',
    },
    responseText: {
        fontSize: '1.02rem',
        color: 'rgba(232, 238, 255, 0.92)',
        lineHeight: 1.65,
        maxWidth: '760px',
        margin: '0 auto',
    },
};
