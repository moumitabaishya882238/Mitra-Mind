export default function Contact() {
    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h1 style={styles.title}>
                    <span style={styles.gradientText}>Contact</span> Us
                </h1>
                <p style={styles.subtitle}>
                    Have questions or want to partner with us to bring Mitra-Mind to your campus? We&apos;d love to hear from you.
                </p>

                <form className="glass-card" style={styles.formCard}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Name</label>
                        <input type="text" placeholder="Your name" style={styles.input} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input type="email" placeholder="your@email.com" style={styles.input} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Message</label>
                        <textarea placeholder="How can we help?" rows={5} style={{ ...styles.input, ...styles.textarea }} />
                    </div>

                    <button type="button" className="glass-btn" style={styles.submitBtn}>
                        Send Message
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
        maxWidth: '600px',
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
    }
};
