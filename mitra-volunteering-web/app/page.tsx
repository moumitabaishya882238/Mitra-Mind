import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="card">
      <h2>Verified Volunteer Listener Network</h2>
      <p>
        Build safer, human-centered support by onboarding trained and verified listeners.
        Applicants complete 7 steps before activation.
      </p>

      <div className="grid">
        <div className="card">
          <h3>For Applicants</h3>
          <p>Complete basic details, background, ID upload, training, and code of conduct agreement.</p>
          <Link className="button-primary" href="/apply">Start Application</Link>
        </div>

        <div className="card">
          <h3>For Verified Listeners</h3>
          <p>Toggle online/offline status, review conversations, and maintain safe support practices.</p>
          <Link className="button-primary" href="/dashboard">Open Dashboard</Link>
        </div>

        <div className="card">
          <h3>For Admins</h3>
          <p>Review pending applications and approve, reject, or request additional information.</p>
          <Link className="button-primary" href="/admin/review">Open Admin Review</Link>
        </div>
      </div>
    </section>
  );
}
