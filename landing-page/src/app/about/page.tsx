export default function About() {
    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h1 style={styles.title}>
                    About <span style={styles.gradientText}>Mitra-Mind</span>
                </h1>

                <div className="glass-card" style={styles.card}>
                    <h2 style={styles.sectionTitle}>Our Mission</h2>
                    <p style={styles.text}>
                        We believe that every student deserves access to immediate, empathetic, and effective mental health support without judgment. Mitra-Mind was built to bridge the gap between isolating campus stress and professional care by offering a 24/7 AI companion capable of listening and adapting to you.
                    </p>
                </div>

                <div className="glass-card" style={styles.card}>
                    <h2 style={styles.sectionTitle}>How It Works</h2>
                    <p style={styles.text}>
                        Mitra uses advanced contextual memory to remember your previous conversations and community interactions. If you share that you&apos;re stressed about an exam, Mitra will proactively check in on you. It&apos;s more than a chatbot; it&apos;s an ecosystem of care encompassing AI chat, guided MindSpace exercises like Grounding and Deep Breathing, and an anonymous peer community.
                    </p>
                </div>

                <div className="glass-card" style={styles.card}>
                    <h2 style={styles.sectionTitle}>Privacy First</h2>
                    <p style={styles.text}>
                        Your mental health data is deeply personal. We implement strict data scrubbing pipelines and secure, anonymous session management to ensure you can speak freely without fear of exposure. Your secrets are safe in deep space.
                    </p>
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
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '30px',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '20px',
        textAlign: 'center' as const,
        letterSpacing: '-1px',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #7AF2FF, #8354FF, #FF6A9F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    card: {
        padding: '40px',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '16px',
        color: '#E2E8F0',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
    }
};
