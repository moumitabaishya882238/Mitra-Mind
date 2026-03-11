export default function Downloads() {
    return (
        <div className="page-shell downloads-page" style={styles.container}>
            <div className="page-stack" style={styles.contentWrapper}>
                <p style={styles.eyebrow}>Downloads</p>
                <h1 className="page-title" style={styles.title}>
                    Take <span style={styles.gradientText}>Mitra-Mind</span> with you.
                </h1>
                <p style={styles.subtitle}>
                    Access calm support anywhere with early builds for students, listeners, and campus pilots.
                </p>

                <section style={styles.releaseStrip} className="flow-reveal flow-reveal-1 info-strip">
                    <p style={styles.releaseTitle}>Current release path</p>
                    <div style={styles.releasePoints}>
                        <p style={styles.releasePoint}>Android beta available now</p>
                        <p style={styles.releasePoint}>iOS release in progress</p>
                        <p style={styles.releasePoint}>Campus onboarding available by request</p>
                    </div>
                </section>

                <section className="section-block" style={styles.platformSection}>
                    <div style={styles.platformIntroWrap}>
                        <p style={styles.sectionEyebrow}>Choose Your Platform</p>
                        <h2 style={styles.sectionTitle}>Simple access, calm onboarding</h2>
                    </div>

                    <div className="content-rail" style={styles.platformRail}>
                        <article style={styles.platformItem} className="flow-reveal flow-reveal-1">
                            <div style={{ ...styles.platformMarker, background: 'linear-gradient(135deg, #7AF2FF, #93C5FD)' }} />
                            <div style={styles.platformContent}>
                                <p style={styles.platformStep}>01</p>
                                <h3 style={styles.platformTitle}>iOS App Store</h3>
                                <p style={styles.platformText}>
                                    Designed for iPhone and iPad. The iOS public release is coming soon for early testers and partner campuses.
                                </p>
                                <div style={styles.metaRow}>
                                    <span style={styles.metaPill}>iOS 15+</span>
                                    <span style={styles.metaPillMuted}>Coming soon</span>
                                </div>
                            </div>
                        </article>

                        <article style={styles.platformItem} className="flow-reveal flow-reveal-2">
                            <div style={{ ...styles.platformMarker, background: 'linear-gradient(135deg, #6EE7B7, #7AF2FF)' }} />
                            <div style={styles.platformContent}>
                                <p style={styles.platformStep}>02</p>
                                <h3 style={styles.platformTitle}>Android Beta</h3>
                                <p style={styles.platformText}>
                                    Install the beta APK for early access to Mitra-Mind on Android devices and help shape the next release.
                                </p>
                                <div style={styles.metaRow}>
                                    <span style={styles.metaPill}>Android 10+</span>
                                    <a href="/contact" className="glass-btn" style={styles.inlineBtn}>Request APK Beta</a>
                                </div>
                            </div>
                        </article>

                        <article style={styles.platformItem} className="flow-reveal flow-reveal-3">
                            <div style={{ ...styles.platformMarker, background: 'linear-gradient(135deg, #A78BFA, #FF6A9F)' }} />
                            <div style={styles.platformContent}>
                                <p style={styles.platformStep}>03</p>
                                <h3 style={styles.platformTitle}>Campus Access</h3>
                                <p style={styles.platformText}>
                                    For institutions and student wellness teams exploring rollout, Mitra-Mind can be introduced through guided campus onboarding.
                                </p>
                                <div style={styles.metaRow}>
                                    <span style={styles.metaPill}>Pilot-ready</span>
                                    <a href="/contact" style={styles.textLink}>Talk to our team &rarr;</a>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="flow-reveal flow-reveal-2 two-column-section" style={styles.notesSection}>
                    <div style={styles.noteBlock}>
                        <p style={styles.sectionEyebrow}>What You Get</p>
                        <p style={styles.noteText}>Empathetic AI support, MindSpace exercises, anonymous community features, and a calm interface designed for everyday student use.</p>
                    </div>
                    <div style={styles.noteBlock}>
                        <p style={styles.sectionEyebrow}>Need Help Getting Started?</p>
                        <p style={styles.noteText}>If you are testing Mitra-Mind for a student group or campus program, we can help you with onboarding and rollout planning.</p>
                    </div>
                </section>

                <section style={styles.downloadCta} className="flow-reveal flow-reveal-3 cta-band">
                    <p style={styles.sectionEyebrow}>Start Here</p>
                    <h2 style={styles.downloadCtaTitle}>Choose the right way to try Mitra-Mind today</h2>
                    <div className="button-row" style={styles.ctaButtons}>
                        <a href="/contact" className="glass-btn" style={styles.primaryBtn}>Request Access</a>
                        <a href="/feedback" style={styles.secondaryBtn}>Share Beta Interest &rarr;</a>
                    </div>
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
    releaseStrip: {
        width: '100%',
        padding: '20px 24px',
        borderRadius: '18px',
        border: '1px solid rgba(138, 164, 246, 0.34)',
        background: 'linear-gradient(90deg, rgba(15, 22, 58, 0.82), rgba(14, 18, 46, 0.72))',
        boxShadow: '0 14px 34px rgba(4, 7, 22, 0.34)',
        backdropFilter: 'blur(10px)',
    },
    releaseTitle: {
        fontSize: '1.14rem',
        fontWeight: 700,
        color: '#F4F7FF',
        textAlign: 'center' as const,
        marginBottom: '12px',
    },
    releasePoints: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '10px',
    },
    releasePoint: {
        textAlign: 'center' as const,
        fontSize: '0.97rem',
        color: 'rgba(236, 242, 255, 0.94)',
    },
    platformSection: {
        width: '100%',
    },
    platformIntroWrap: {
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
    platformRail: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        position: 'relative' as const,
        paddingLeft: '24px',
        borderLeft: '1px solid rgba(132, 160, 255, 0.28)',
    },
    platformItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
    },
    platformMarker: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        position: 'absolute' as const,
        left: '-30px',
        top: '8px',
        boxShadow: '0 0 14px rgba(122, 178, 255, 0.8)',
    },
    platformContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(112, 140, 238, 0.2)',
    },
    platformStep: {
        fontSize: '0.78rem',
        letterSpacing: '0.2em',
        color: 'rgba(150, 182, 255, 0.78)',
    },
    platformTitle: {
        fontSize: '1.28rem',
        fontWeight: 700,
        color: '#EDF2FF',
    },
    platformText: {
        fontSize: '1.02rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: '780px',
    },
    metaRow: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        marginTop: '8px',
    },
    metaPill: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '999px',
        background: 'rgba(102, 130, 239, 0.18)',
        border: '1px solid rgba(132, 160, 255, 0.28)',
        color: '#EDF2FF',
        fontSize: '0.9rem',
    },
    metaPillMuted: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '999px',
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: 'rgba(226, 234, 255, 0.84)',
        fontSize: '0.9rem',
    },
    inlineBtn: {
        padding: '10px 18px',
        fontSize: '0.95rem',
    },
    textLink: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#F1F5FF',
    },
    notesSection: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '34px',
        alignItems: 'start',
    },
    noteBlock: {
        minHeight: '100%',
    },
    noteText: {
        fontSize: '1.06rem',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
    },
    downloadCta: {
        width: '100%',
        paddingTop: '14px',
        textAlign: 'center' as const,
    },
    downloadCtaTitle: {
        fontSize: 'clamp(1.5rem, 3.8vw, 2.2rem)',
        fontWeight: 700,
        color: '#FBFCFF',
        maxWidth: '740px',
        margin: '0 auto 18px',
        lineHeight: 1.3,
    },
    ctaButtons: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
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
};
