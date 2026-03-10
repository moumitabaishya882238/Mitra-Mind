import './globals.css';
import Link from 'next/link';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="starfield-wrapper" aria-hidden>
          <div className="stars-static" />
          <div className="stars-dynamic" />
          <div className="stars-far" />
        </div>

        <div className="star-container" aria-hidden>
          <div className="nebula nebula-1" />
          <div className="nebula nebula-2" />
          <div className="nebula nebula-3" />
          <div className="nebula nebula-4" />
        </div>

        <nav style={navStyles.nav}>
          <div style={navStyles.logoContainer}>
            <div style={navStyles.logoOrb}></div>
            <span style={navStyles.logoText}>Mitra</span>
          </div>
          <div style={navStyles.links}>
            <Link href="/" style={navStyles.link}>Home</Link>
            <Link href="/about" style={navStyles.link}>About</Link>
            <Link href="/downloads" style={navStyles.link}>Downloads</Link>
            <Link href="/contact" style={navStyles.link}>Contact</Link>
          </div>
          <Link href="/contact" className="glass-btn" style={navStyles.btn}>Get Early Access</Link>
        </nav>

        <main style={mainStyles.main}>
          {children}
        </main>
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
    background: 'linear-gradient(135deg, #7AF2FF, #8354FF, #FF6A9F)',
    boxShadow: '0 0 16px rgba(131, 84, 255, 0.6)'
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
