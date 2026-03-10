export default function Feedback() {
    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h1 style={styles.title}>
                    Share Your <span style={styles.gradientText}>Feedback</span>
                </h1>
                <p style={styles.subtitle}>
                    Help us improve Mitra-Mind by sharing your beta testing experience.
                </p>

                <form className="glass-card" style={styles.formCard}>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Platform</label>
                            <select style={styles.input}>
                                <option value="android">Android</option>
                                <option value="ios">iOS</option>
                                <option value="web">Volunteer Web App</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Type</label>
                            <select style={styles.input}>
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                                <option value="ai">AI Response Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Feedback Details</label>
                        <textarea
                            placeholder="What happened? What did you expect to happen?"
                            rows={6}
                            style={{ ...styles.input, ...styles.textarea }}
                        />
                    </div>

                    <button type="button" className="glass-btn" style={styles.submitBtn}>
                        Submit Feedback
                    </button>
                </form>
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
        maxWidth: '650px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '16px',
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
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        textAlign: 'center' as const,
        marginBottom: '40px',
        lineHeight: 1.6,
    },
    formCard: {
        width: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    row: {
        display: 'flex',
        gap: '20px',
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
    }
};
