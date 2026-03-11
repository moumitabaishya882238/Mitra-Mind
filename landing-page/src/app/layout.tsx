import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AdminShortcutListener from '../components/AdminShortcutListener';

export const metadata: Metadata = {
  title: 'MitraMind',
  description: 'MitraMind is an empathetic AI companion for students, designed for calm support, privacy, and campus wellbeing.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/brand/mitramind-logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/brand/mitramind-logo.png',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminShortcutListener />
        <div className="starfield-wrapper" aria-hidden>
          <div className="stars-static" />
          <div className="stars-dynamic" />
          <div className="stars-far" />
          <div className="shooting-stars">
            <span className="shooting-star shooting-star-1" />
            <span className="shooting-star shooting-star-2" />
            <span className="shooting-star shooting-star-3" />
            <span className="shooting-star shooting-star-4" />
          </div>
        </div>

        <div className="star-container" aria-hidden>
          <div className="nebula nebula-1" />
          <div className="nebula nebula-2" />
          <div className="nebula nebula-3" />
          <div className="nebula nebula-4" />
        </div>

        <nav className="site-nav" style={navStyles.nav}>
          <div className="site-nav__brand" style={navStyles.logoContainer}>
            <div style={navStyles.logoOrb}>
              <Image
                src="/brand/mitramind-logo.png"
                alt="MitraMind logo"
                width={32}
                height={32}
                style={navStyles.logoImage}
                priority
              />
            </div>
            <span style={navStyles.logoText}>MitraMind</span>
          </div>
          <div className="site-nav__links" style={navStyles.links}>
            <Link href="/" style={navStyles.link}>Home</Link>
            <Link href="/about" style={navStyles.link}>About</Link>
            <Link href="/downloads" style={navStyles.link}>Downloads</Link>
            <Link href="/feedback" style={navStyles.link}>Feedback</Link>
            <Link href="/contact" style={navStyles.link}>Contact</Link>
          </div>
          <a href="/mitra-mind.apk" download className="glass-btn" style={navStyles.btn}>Download APK</a>

          <details className="site-nav__mobile-menu">
            <summary className="site-nav__toggle" aria-label="Open navigation menu">
              <span className="site-nav__toggle-bar" />
              <span className="site-nav__toggle-bar" />
              <span className="site-nav__toggle-bar" />
            </summary>
            <div className="site-nav__mobile-panel glass-card">
              <Link href="/" className="site-nav__mobile-link">Home</Link>
              <Link href="/about" className="site-nav__mobile-link">About</Link>
              <Link href="/downloads" className="site-nav__mobile-link">Downloads</Link>
              <Link href="/feedback" className="site-nav__mobile-link">Feedback</Link>
              <Link href="/contact" className="site-nav__mobile-link">Contact</Link>
              <Link href="/contact" className="glass-btn site-nav__mobile-cta">Get Early Access</Link>
            </div>
          </details>
        </nav>

        <main className="site-main" style={mainStyles.main}>
          {children}
        </main>

        <footer className="site-footer" style={footerStyles.footer}>
          <div className="site-footer__inner" style={footerStyles.inner}>
            <p style={footerStyles.brand}>MitraMind</p>
            <p style={footerStyles.note}>Made for calmer, safer student support.</p>
            <div className="site-footer__links" style={footerStyles.links}>
              <Link href="/about" style={footerStyles.link}>About</Link>
              <Link href="/downloads" style={footerStyles.link}>Downloads</Link>
              <Link href="/feedback" style={footerStyles.link}>Feedback</Link>
              <Link href="/contact" style={footerStyles.link}>Contact</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

const navStyles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 8%',
    position: 'fixed' as const,
    top: 0,
    width: '100%',
    zIndex: 100,
    background: 'linear-gradient(180deg, rgba(6, 11, 38, 0.9) 0%, rgba(6, 11, 38, 0) 100%)',
    backdropFilter: 'blur(8px)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoOrb: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden' as const,
    boxShadow: '0 0 16px rgba(131, 84, 255, 0.6)',
    flexShrink: 0,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '50%',
    display: 'block',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  links: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  link: {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'rgba(235, 231, 255, 0.9)',
    transition: 'color 0.2s',
  },
  btn: {
    padding: '10px 24px',
    fontSize: '0.95rem',
  }
};

const mainStyles = {
  main: {
    position: 'relative' as const,
    zIndex: 2,
    paddingTop: '100px',
    minHeight: '100vh',
  }
};

const footerStyles = {
  footer: {
    position: 'relative' as const,
    zIndex: 2,
    padding: '18px 8% 40px',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    paddingTop: '22px',
    borderTop: '1px solid rgba(118, 143, 228, 0.24)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap' as const,
  },
  brand: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#F4F7FF',
  },
  note: {
    fontSize: '0.94rem',
    color: 'rgba(215, 225, 255, 0.78)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap' as const,
  },
  link: {
    fontSize: '0.92rem',
    color: 'rgba(228, 235, 255, 0.84)',
  },
};
