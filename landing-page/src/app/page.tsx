export default function Home() {
  return (
    <div className="page-shell home-page" style={styles.container}>
      <div className="home-hero" style={styles.heroSection}>
        <div style={styles.badge} className="glass-card">
          <span style={styles.badgeOrb}></span>
          Now accepting beta testers
        </div>

        <h1 className="hero-title" style={styles.title}>
          Your Mind, <span style={styles.gradientText}>Understood.</span>
        </h1>

        <p style={styles.subtitle}>
          Meet Mitra, the empathetic AI companion designed explicitly for students.
          Navigate campus life, manage stress, and find clarity in a judgment-free space.
        </p>

        <div className="button-row" style={styles.ctaGroup}>
          <a href="/mitra-mind.apk" download className="glass-btn" style={styles.primaryBtn}>Download App (APK)</a>
          <a href="/about" style={styles.secondaryBtn}>Learn More &rarr;</a>
        </div>
      </div>

        <section className="section-block" style={styles.flowSection}>
          <div style={styles.flowHeadingWrap}>
            <p style={styles.flowEyebrow}>How Mitra-Mind Supports You</p>
            <h2 style={styles.flowTitle}>A gentle support flow for every day on campus</h2>
          </div>

          <div className="content-rail" style={styles.flowRail}>
            <article style={styles.flowItem} className="flow-reveal flow-reveal-1">
              <div style={{ ...styles.flowMarker, background: 'linear-gradient(135deg, #A78BFA, #7AF2FF)' }} />
              <div style={styles.flowContent}>
                <p style={styles.flowStep}>01</p>
                <h3 style={styles.flowItemTitle}>Empathetic AI Conversations</h3>
                <p style={styles.flowItemText}>
                  Share what you are feeling and get calm, contextual responses that adapt to your mood and history.
                </p>
              </div>
            </article>

            <article style={styles.flowItem} className="flow-reveal flow-reveal-2">
              <div style={{ ...styles.flowMarker, background: 'linear-gradient(135deg, #7AF2FF, #93C5FD)' }} />
              <div style={styles.flowContent}>
                <p style={styles.flowStep}>02</p>
                <h3 style={styles.flowItemTitle}>MindSpace Toolkit</h3>
                <p style={styles.flowItemText}>
                  Open grounding, breathing, and PMR exercises in seconds when your stress spikes between classes.
                </p>
              </div>
            </article>

            <article style={styles.flowItem} className="flow-reveal flow-reveal-3">
              <div style={{ ...styles.flowMarker, background: 'linear-gradient(135deg, #6EE7B7, #7AF2FF)' }} />
              <div style={styles.flowContent}>
                <p style={styles.flowStep}>03</p>
                <h3 style={styles.flowItemTitle}>Anonymous Community Care</h3>
                <p style={styles.flowItemText}>
                  Connect safely with peers and trained student listeners without losing privacy or comfort.
                </p>
              </div>
            </article>
        </div>
        </section>

      <section className="section-block" style={styles.scenarioSection}>
        <div style={styles.scenarioHeadingWrap}>
          <p style={styles.flowEyebrow}>Campus Moments</p>
          <h2 style={styles.scenarioTitle}>Support for real student pressure points</h2>
        </div>

        <div style={styles.scenarioList}>
          <article style={styles.scenarioRow} className="flow-reveal flow-reveal-1 scenario-row">
            <p style={styles.scenarioTag}>Before An Exam</p>
            <p style={styles.scenarioText}>Mitra helps you settle racing thoughts with a 90-second breathing reset and focus prompts.</p>
          </article>

          <article style={styles.scenarioRow} className="flow-reveal flow-reveal-2 scenario-row">
            <p style={styles.scenarioTag}>Late-Night Overwhelm</p>
            <p style={styles.scenarioText}>When everything feels heavy, Mitra offers grounding steps and a safe space to unload.</p>
          </article>

          <article style={styles.scenarioRow} className="flow-reveal flow-reveal-3 scenario-row">
            <p style={styles.scenarioTag}>After Social Conflict</p>
            <p style={styles.scenarioText}>Process emotions calmly, reframe thoughts, and choose your next step with clarity.</p>
          </article>
        </div>
      </section>

      <section style={styles.privacyStrip} className="flow-reveal flow-reveal-2 info-strip">
        <h3 style={styles.privacyTitle}>Private by design. Anonymous by default.</h3>
        <div style={styles.privacyPoints}>
          <p style={styles.privacyPoint}>Encrypted conversations</p>
          <p style={styles.privacyPoint}>No public identity required</p>
          <p style={styles.privacyPoint}>You control your shared data</p>
        </div>
      </section>

      <section style={styles.finalCta} className="flow-reveal flow-reveal-3 cta-band">
        <p style={styles.finalCtaEyebrow}>Bring Mitra-Mind To Your Campus</p>
        <h2 style={styles.finalCtaTitle}>Build a calmer student culture with always-on support</h2>
        <p style={styles.finalCtaText}>Join early access to shape the next generation of student mental wellness care.</p>
        <div className="button-row" style={styles.finalCtaButtons}>
          <a href="/mitra-mind.apk" download className="glass-btn" style={styles.primaryBtn}>Download APK</a>
          <a href="/contact" style={styles.secondaryBtn}>Talk to Team &rarr;</a>
        </div>
      </section>
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
  flowSection: {
    width: '100%',
    maxWidth: '980px',
    marginTop: '100px',
  },
  flowHeadingWrap: {
    textAlign: 'center' as const,
    marginBottom: '36px',
  },
  flowEyebrow: {
    fontSize: '0.82rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.18em',
    color: 'rgba(170, 190, 255, 0.85)',
    marginBottom: '12px',
  },
  flowTitle: {
    fontSize: 'clamp(1.5rem, 3.8vw, 2.4rem)',
    fontWeight: 700,
    color: 'rgba(236, 241, 255, 0.95)',
    letterSpacing: '-0.5px',
  },
  flowRail: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    position: 'relative' as const,
    paddingLeft: '24px',
    borderLeft: '1px solid rgba(132, 160, 255, 0.28)',
  },
  flowItem: {
    display: 'flex',
    gap: '16px',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  flowMarker: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    position: 'absolute' as const,
    left: '-30px',
    top: '8px',
    boxShadow: '0 0 14px rgba(122, 178, 255, 0.8)',
  },
  flowContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    padding: '0 0 14px',
    borderBottom: '1px solid rgba(112, 140, 238, 0.2)',
  },
  flowStep: {
    fontSize: '0.78rem',
    letterSpacing: '0.2em',
    color: 'rgba(150, 182, 255, 0.78)',
  },
  flowItemTitle: {
    fontSize: '1.28rem',
    fontWeight: 700,
    color: '#EDF2FF',
  },
  flowItemText: {
    fontSize: '1.02rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '760px',
  },
  scenarioSection: {
    width: '100%',
    maxWidth: '980px',
    marginTop: '78px',
  },
  scenarioHeadingWrap: {
    textAlign: 'center' as const,
    marginBottom: '28px',
  },
  scenarioTitle: {
    fontSize: 'clamp(1.4rem, 3.2vw, 2.1rem)',
    fontWeight: 700,
    color: 'rgba(236, 241, 255, 0.95)',
  },
  scenarioList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  scenarioRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(170px, 220px) 1fr',
    gap: '20px',
    alignItems: 'start',
    padding: '14px 0',
    borderBottom: '1px solid rgba(123, 149, 237, 0.24)',
  },
  scenarioTag: {
    fontSize: '0.88rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    color: 'rgba(159, 186, 255, 0.88)',
    marginTop: '4px',
  },
  scenarioText: {
    fontSize: '1.04rem',
    lineHeight: 1.65,
    color: 'var(--text-secondary)',
    maxWidth: '720px',
  },
  privacyStrip: {
    width: '100%',
    maxWidth: '980px',
    marginTop: '66px',
    padding: '20px 24px',
    borderRadius: '18px',
    border: '1px solid rgba(138, 164, 246, 0.34)',
    background: 'linear-gradient(90deg, rgba(15, 22, 58, 0.82), rgba(14, 18, 46, 0.72))',
    boxShadow: '0 14px 34px rgba(4, 7, 22, 0.34)',
    backdropFilter: 'blur(10px)',
  },
  privacyTitle: {
    fontSize: '1.22rem',
    fontWeight: 700,
    marginBottom: '14px',
    color: '#F4F7FF',
    textAlign: 'center' as const,
  },
  privacyPoints: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '10px',
  },
  privacyPoint: {
    textAlign: 'center' as const,
    fontSize: '0.98rem',
    color: 'rgba(236, 242, 255, 0.95)',
  },
  finalCta: {
    width: '100%',
    maxWidth: '980px',
    marginTop: '62px',
    padding: '42px 24px 28px',
    textAlign: 'center' as const,
    borderTop: '1px solid rgba(124, 150, 236, 0.28)',
    background: 'radial-gradient(circle at 50% 10%, rgba(34, 45, 99, 0.28) 0%, rgba(10, 13, 33, 0) 68%)',
  },
  finalCtaEyebrow: {
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.18em',
    color: 'rgba(184, 202, 255, 0.94)',
    marginBottom: '14px',
  },
  finalCtaTitle: {
    fontSize: 'clamp(1.5rem, 3.8vw, 2.3rem)',
    fontWeight: 700,
    color: '#FBFCFF',
    textShadow: '0 2px 18px rgba(6, 8, 20, 0.36)',
    maxWidth: '760px',
    margin: '0 auto 14px',
    lineHeight: 1.25,
  },
  finalCtaText: {
    fontSize: '1.05rem',
    color: 'rgba(232, 238, 255, 0.94)',
    maxWidth: '700px',
    margin: '0 auto 24px',
    lineHeight: 1.6,
  },
  finalCtaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
};
