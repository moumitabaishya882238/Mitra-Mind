export default function Downloads() {
    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h1 style={styles.title}>
                    <span style={styles.gradientText}>Download</span> Mitra-Mind
                </h1>
                <p style={styles.subtitle}>
                    Take your empathetic AI companion anywhere. Available on iOS and Android.
                </p>

                <div style={styles.grid}>
                    <div className="glass-card" style={styles.downloadCard}>
                        <div style={{ ...styles.iconWrapper, background: 'rgba(56, 189, 248, 0.2)', color: '#7DD3FC' }}>
                            📱
                        </div>
                        <h3 style={styles.cardTitle}>iOS App Store</h3>
                        <p style={styles.cardText}>For iPhone and iPad. Requires iOS 15.0 or later.</p>
                        <button className="glass-btn" style={styles.actionBtn}>Coming Soon</button>
                    </div>

                    <div className="glass-card" style={styles.downloadCard}>
                        <div style={{ ...styles.iconWrapper, background: 'rgba(34, 197, 94, 0.2)', color: '#86EFAC' }}>
                            🤖
                        </div>
                        <h3 style={styles.cardTitle}>Google Play Store</h3>
                        <p style={styles.cardText}>For Android devices. Requires Android 10.0 or later.</p>
                        <button className="glass-btn" style={styles.actionBtn}>Get the APK Beta</button>
                    </div>
                </div>
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
        maxWidth: '900px',
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
        marginBottom: '60px',
        lineHeight: 1.6,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        width: '100%',
    },
    downloadCard: {
        padding: '40px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        textAlign: 'center' as const,
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: '24px',
    },
    cardTitle: {
        fontSize: '1.4rem',
        fontWeight: 700,
        marginBottom: '12px',
    },
    cardText: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '30px',
    },
    actionBtn: {
        marginTop: 'auto',
        width: '100%',
        padding: '14px',
    }
};
