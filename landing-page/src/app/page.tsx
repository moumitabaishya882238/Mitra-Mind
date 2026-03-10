export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.badge} className="glass-card">
          <span style={styles.badgeOrb}></span>
          Now accepting beta testers
        </div>

        <h1 style={styles.title}>
          Your Mind, <span style={styles.gradientText}>Understood.</span>
        </h1>

        <p style={styles.subtitle}>
          Meet Mitra, the empathetic AI companion designed explicitly for students.
          Navigate campus life, manage stress, and find clarity in a judgment-free space.
        </p>

        <div style={styles.ctaGroup}>
          <a href="/downloads" className="glass-btn" style={styles.primaryBtn}>Download App</a>
          <a href="/about" style={styles.secondaryBtn}>Learn More &rarr;</a>
        </div>
      </div>

      <div style={styles.featuresGrid}>
        <div className="glass-card" style={styles.featureCard}>
          <div style={{ ...styles.iconWrapper, background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
            🧠
          </div>
          <h3 style={styles.cardTitle}>Empathetic AI</h3>
          <p style={styles.cardText}>Mitra listens, remembers, and adapts to your emotional state, providing proactive support.</p>
        </div>

        <div className="glass-card" style={styles.featureCard}>
          <div style={{ ...styles.iconWrapper, background: 'rgba(59, 130, 246, 0.2)', color: '#93C5FD' }}>
            🌱
          </div>
          <h3 style={styles.cardTitle}>MindSpace Toolkit</h3>
          <p style={styles.cardText}>Immediate access to grounding exercises, breathing techniques, and PMR logs.</p>
        </div>

        <div className="glass-card" style={styles.featureCard}>
          <div style={{ ...styles.iconWrapper, background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}>
            🤝
          </div>
          <h3 style={styles.cardTitle}>Community Care</h3>
          <p style={styles.cardText}>Connect anonymously with peers or talk to trained student volunteer listeners.</p>
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
    padding: '60px 8% 100px',
  },
  heroSection: {
    textAlign: 'center' as const,
    maxWidth: '800px',
    marginTop: '60px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#A254FF',
    marginBottom: '24px',
    border: '1px solid rgba(162, 84, 255, 0.3)',
  },
  badgeOrb: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#A254FF',
    boxShadow: '0 0 8px #A254FF',
  },
  title: {
    fontSize: '4.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '24px',
    letterSpacing: '-1px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #7AF2FF, #8354FF, #FF6A9F)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '40px',
    maxWidth: '650px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  primaryBtn: {
    padding: '16px 36px',
    fontSize: '1.1rem',
  },
  secondaryBtn: {
    padding: '16px 24px',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'white',
    transition: 'opacity 0.2s',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1100px',
    marginTop: '100px',
  },
  featureCard: {
    padding: '36px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '12px',
  },
  cardText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  }
};
