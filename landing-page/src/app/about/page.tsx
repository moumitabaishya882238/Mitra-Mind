export default function About() {
    return (
        <div className="page-shell about-page" style={styles.container}>
            <div className="page-stack" style={styles.contentWrapper}>
                <p style={styles.eyebrow}>About Mitra-Mind</p>
                <h1 className="page-title" style={styles.title}>
                    Built for <span style={styles.gradientText}>students</span>, designed for calm.
                </h1>

                <p style={styles.intro}>
                    Mitra-Mind exists to make emotional support feel immediate, private, and genuinely helpful during the pressure of student life.
                </p>

                <section style={styles.leadSection} className="flow-reveal flow-reveal-1">
                    <p style={styles.leadText}>
                        We built Mitra-Mind because stress on campus rarely arrives in neat office hours. It shows up before exams, after difficult conversations, during lonely nights, and in the quiet moments when students need support but don&apos;t know where to begin.
                    </p>
                </section>

                <section className="section-block" style={styles.storySection}>
                    <div style={styles.storyHeadingWrap}>
                        <p style={styles.sectionEyebrow}>What We Believe</p>
                        <h2 style={styles.sectionTitle}>Support should feel safe before it feels clinical</h2>
                    </div>

                    <div className="content-rail" style={styles.storyRail}>
                        <article style={styles.storyItem} className="flow-reveal flow-reveal-1">
                            <div style={{ ...styles.storyMarker, background: 'linear-gradient(135deg, #A78BFA, #7AF2FF)' }} />
                            <div style={styles.storyContent}>
                                <p style={styles.storyStep}>01</p>
                                <h3 style={styles.storyTitle}>Immediate support matters</h3>
                                <p style={styles.storyText}>
                                    Students should not have to wait until things become severe before they can reach a calm, compassionate space.
                                </p>
                            </div>
                        </article>

                        <article style={styles.storyItem} className="flow-reveal flow-reveal-2">
                            <div style={{ ...styles.storyMarker, background: 'linear-gradient(135deg, #7AF2FF, #93C5FD)' }} />
                            <div style={styles.storyContent}>
                                <p style={styles.storyStep}>02</p>
                                <h3 style={styles.storyTitle}>Privacy creates honesty</h3>
                                <p style={styles.storyText}>
                                    When students feel protected, they are more likely to open up early, reflect clearly, and ask for help without fear.
                                </p>
                            </div>
                        </article>

                        <article style={styles.storyItem} className="flow-reveal flow-reveal-3">
                            <div style={{ ...styles.storyMarker, background: 'linear-gradient(135deg, #6EE7B7, #7AF2FF)' }} />
                            <div style={styles.storyContent}>
                                <p style={styles.storyStep}>03</p>
                                <h3 style={styles.storyTitle}>Care should be practical</h3>
                                <p style={styles.storyText}>
                                    Mitra-Mind combines conversation, regulation tools, and peer support so students can move from overwhelm to action.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="two-column-section" style={styles.columnsSection}>
                    <div style={styles.column} className="flow-reveal flow-reveal-1">
                        <p style={styles.sectionEyebrow}>How It Works</p>
                        <h2 style={styles.columnTitle}>More than a chatbot</h2>
                        <p style={styles.text}>
                            Mitra remembers emotional context across conversations, checks in when patterns matter, and connects students to guided tools when talking is not enough.
                        </p>
                    </div>

                    <div style={styles.column} className="flow-reveal flow-reveal-2">
                        <p style={styles.sectionEyebrow}>What Makes It Different</p>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Context-aware AI conversations</li>
                            <li style={styles.listItem}>MindSpace tools for fast self-regulation</li>
                            <li style={styles.listItem}>Anonymous peer and listener support</li>
                        </ul>
                    </div>
                </section>

                <section style={styles.privacyStrip} className="flow-reveal flow-reveal-3 info-strip">
                    <h2 style={styles.privacyTitle}>Privacy is not a feature. It is the foundation.</h2>
                    <p style={styles.privacyText}>
                        Your mental health data is personal. Mitra-Mind is built with privacy-first architecture, anonymous support pathways, and careful data handling so students can speak honestly and safely.
                    </p>
                </section>

                <section style={styles.aboutCta} className="flow-reveal flow-reveal-3 cta-band">
                    <p style={styles.sectionEyebrow}>Ready To Explore</p>
                    <h2 style={styles.aboutCtaTitle}>See how Mitra-Mind can support your campus community</h2>
                    <div className="button-row" style={styles.aboutCtaButtons}>
                        <a href="/downloads" className="glass-btn" style={styles.primaryBtn}>Download App</a>
                        <a href="/contact" style={styles.secondaryBtn}>Talk to Team &rarr;</a>
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
    intro: {
        fontSize: '1.2rem',
        color: 'var(--text-secondary)',
        textAlign: 'center' as const,
        lineHeight: 1.65,
        maxWidth: '760px',
        margin: '0 auto',
    },
    leadSection: {
        padding: '20px 0 0',
        borderTop: '1px solid rgba(124, 150, 236, 0.22)',
    },
    leadText: {
        fontSize: '1.16rem',
        lineHeight: 1.75,
        color: 'rgba(232, 238, 255, 0.92)',
        maxWidth: '840px',
        margin: '0 auto',
        textAlign: 'center' as const,
    },
    storySection: {
        width: '100%',
        marginTop: '18px',
    },
    storyHeadingWrap: {
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
    storyRail: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        position: 'relative' as const,
        paddingLeft: '24px',
        borderLeft: '1px solid rgba(132, 160, 255, 0.28)',
    },
    storyItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
    },
    storyMarker: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        position: 'absolute' as const,
        left: '-30px',
        top: '8px',
        boxShadow: '0 0 14px rgba(122, 178, 255, 0.8)',
    },
    storyContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(112, 140, 238, 0.2)',
    },
    storyStep: {
        fontSize: '0.78rem',
        letterSpacing: '0.2em',
        color: 'rgba(150, 182, 255, 0.78)',
    },
    storyTitle: {
        fontSize: '1.28rem',
        fontWeight: 700,
        color: '#EDF2FF',
    },
    storyText: {
        fontSize: '1.02rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: '780px',
    },
    columnsSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '34px',
        alignItems: 'start',
        paddingTop: '10px',
    },
    column: {
        minHeight: '100%',
    },
    columnTitle: {
        fontSize: '1.6rem',
        fontWeight: 700,
        color: '#EDF2FF',
        marginBottom: '12px',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
    },
    list: {
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '14px',
        padding: 0,
        margin: 0,
    },
    listItem: {
        fontSize: '1.05rem',
        color: 'rgba(232, 238, 255, 0.92)',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(112, 140, 238, 0.18)',
    },
    privacyStrip: {
        width: '100%',
        padding: '24px 26px',
        borderRadius: '18px',
        border: '1px solid rgba(138, 164, 246, 0.34)',
        background: 'linear-gradient(90deg, rgba(15, 22, 58, 0.82), rgba(14, 18, 46, 0.72))',
        boxShadow: '0 14px 34px rgba(4, 7, 22, 0.34)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center' as const,
    },
    privacyTitle: {
        fontSize: '1.4rem',
        fontWeight: 700,
        color: '#F4F7FF',
        marginBottom: '10px',
    },
    privacyText: {
        fontSize: '1.03rem',
        color: 'rgba(236, 242, 255, 0.94)',
        lineHeight: 1.65,
        maxWidth: '800px',
        margin: '0 auto',
    },
    aboutCta: {
        paddingTop: '14px',
        textAlign: 'center' as const,
    },
    aboutCtaTitle: {
        fontSize: 'clamp(1.5rem, 3.8vw, 2.2rem)',
        fontWeight: 700,
        color: '#FBFCFF',
        maxWidth: '740px',
        margin: '0 auto 18px',
        lineHeight: 1.3,
    },
    aboutCtaButtons: {
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
