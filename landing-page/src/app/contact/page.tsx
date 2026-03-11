"use client";

import { useState } from 'react';
import { BACKEND_BASE_URL } from '../../lib/backendBaseUrl';

export default function Contact() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        inquiryType: 'partnership',
        message: '',
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
            const response = await fetch(`${BACKEND_BASE_URL}/landing/forms/landing-contact-inquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    inquiryType: formData.inquiryType,
                    message: formData.message,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to submit your message right now.');
            }

            setSubmitState({ ok: true, message: 'Thanks, your message was sent. We will get back to you soon.' });
            setFormData({
                fullName: '',
                email: '',
                inquiryType: 'partnership',
                message: '',
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
        <div className="page-shell contact-page" style={styles.container}>
            <div className="page-stack" style={styles.contentWrapper}>
                <p style={styles.eyebrow}>Contact</p>
                <h1 className="page-title" style={styles.title}>
                    Let&apos;s bring <span style={styles.gradientText}>Mitra-Mind</span> to more students.
                </h1>
                <p style={styles.subtitle}>
                    Whether you want beta access, a campus rollout conversation, or just more details, we&apos;d love to hear from you.
                </p>

                <section style={styles.contactStrip} className="flow-reveal flow-reveal-1 info-strip">
                    <p style={styles.stripTitle}>Best for</p>
                    <div style={styles.stripPoints}>
                        <p style={styles.stripPoint}>Campus partnerships</p>
                        <p style={styles.stripPoint}>Beta access requests</p>
                        <p style={styles.stripPoint}>Student wellness pilots</p>
                    </div>
                </section>

                <section className="section-block" style={styles.contactPathsSection}>
                    <div style={styles.contactPathsIntro}>
                        <p style={styles.sectionEyebrow}>Reach Out</p>
                        <h2 style={styles.sectionTitle}>Choose the conversation you want to start</h2>
                    </div>

                    <div className="content-rail" style={styles.contactRail}>
                        <article style={styles.contactItem} className="flow-reveal flow-reveal-1">
                            <div style={{ ...styles.contactMarker, background: 'linear-gradient(135deg, #A78BFA, #7AF2FF)' }} />
                            <div style={styles.contactContent}>
                                <p style={styles.contactStep}>01</p>
                                <h3 style={styles.contactTitle}>Campus partnerships</h3>
                                <p style={styles.contactText}>
                                    Reach out if you want to explore Mitra-Mind for your institution, student org, or wellness initiative.
                                </p>
                            </div>
                        </article>

                        <article style={styles.contactItem} className="flow-reveal flow-reveal-2">
                            <div style={{ ...styles.contactMarker, background: 'linear-gradient(135deg, #7AF2FF, #93C5FD)' }} />
                            <div style={styles.contactContent}>
                                <p style={styles.contactStep}>02</p>
                                <h3 style={styles.contactTitle}>Product and beta questions</h3>
                                <p style={styles.contactText}>
                                    If you want Android beta access, iOS updates, or onboarding details, send us a note here.
                                </p>
                            </div>
                        </article>

                        <article style={styles.contactItem} className="flow-reveal flow-reveal-3">
                            <div style={{ ...styles.contactMarker, background: 'linear-gradient(135deg, #6EE7B7, #7AF2FF)' }} />
                            <div style={styles.contactContent}>
                                <p style={styles.contactStep}>03</p>
                                <h3 style={styles.contactTitle}>General inquiries</h3>
                                <p style={styles.contactText}>
                                    Ask about the mission, team, roadmap, or how Mitra-Mind can support student communities more broadly.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                <section style={styles.formSection} className="flow-reveal flow-reveal-2 split-form-section">
                    <div style={styles.formIntro}>
                        <p style={styles.sectionEyebrow}>Send A Message</p>
                        <h2 style={styles.formTitle}>Tell us what you&apos;re looking for</h2>
                        <p style={styles.formText}>We&apos;ll use this to understand whether you&apos;re asking about access, partnership, or support.</p>
                    </div>

                    <form className="glass-card form-card-shell" style={styles.formCard} onSubmit={handleSubmit}>
                        <div className="responsive-two-col" style={styles.inputGrid}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="contact-name" style={styles.label}>Name</label>
                                <input
                                    id="contact-name"
                                    name="fullName"
                                    type="text"
                                    placeholder="Your name"
                                    style={styles.input}
                                    value={formData.fullName}
                                    onChange={handleFieldChange}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label htmlFor="contact-email" style={styles.label}>Email</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    style={styles.input}
                                    value={formData.email}
                                    onChange={handleFieldChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="contact-interest" style={styles.label}>What are you reaching out about?</label>
                            <select
                                id="contact-interest"
                                name="inquiryType"
                                style={styles.input}
                                value={formData.inquiryType}
                                onChange={handleFieldChange}
                            >
                                <option value="partnership">Campus partnership</option>
                                <option value="beta">Beta access</option>
                                <option value="general">General inquiry</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="contact-message" style={styles.label}>Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                placeholder="Tell us about your campus, your goals, or what you need help with."
                                rows={6}
                                style={{ ...styles.input, ...styles.textarea }}
                                value={formData.message}
                                onChange={handleFieldChange}
                                required
                            />
                        </div>

                        <button type="submit" className="glass-btn" style={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>

                        {submitState ? (
                            <p style={submitState.ok ? styles.submitMessage : styles.submitError}>{submitState.message}</p>
                        ) : null}
                    </form>
                </section>

                <section style={styles.responseNote} className="flow-reveal flow-reveal-3">
                    <p style={styles.sectionEyebrow}>What Happens Next</p>
                    <p style={styles.responseText}>We&apos;ll review your note and reply with the right next step for beta access, pilot onboarding, or a campus conversation.</p>
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
    contactStrip: {
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
    contactPathsSection: {
        width: '100%',
    },
    contactPathsIntro: {
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
    contactRail: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        position: 'relative' as const,
        paddingLeft: '24px',
        borderLeft: '1px solid rgba(132, 160, 255, 0.28)',
    },
    contactItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
    },
    contactMarker: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        position: 'absolute' as const,
        left: '-30px',
        top: '8px',
        boxShadow: '0 0 14px rgba(122, 178, 255, 0.8)',
    },
    contactContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(112, 140, 238, 0.2)',
    },
    contactStep: {
        fontSize: '0.78rem',
        letterSpacing: '0.2em',
        color: 'rgba(150, 182, 255, 0.78)',
    },
    contactTitle: {
        fontSize: '1.28rem',
        fontWeight: 700,
        color: '#EDF2FF',
    },
    contactText: {
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
    inputGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
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
