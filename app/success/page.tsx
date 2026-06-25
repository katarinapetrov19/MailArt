import Link from 'next/link';

type SearchParams = Promise<{ type?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;
  const isSubscription = type === 'subscribe';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#ffffff',
      fontFamily: "'DM Sans', sans-serif",
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Playpen_Sans', 'DM Sans', sans-serif",
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          color: '#1a1a1a',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          {isSubscription ? "You're subscribed!" : 'Payment confirmed!'}
        </h1>

        <p style={{
          color: '#555',
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          {isSubscription
            ? 'Welcome to the Mail Club! Your first artwork is on its way.'
            : "I'll start working on your portrait and ship the original to you soon."}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '999px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.3px',
            textDecoration: 'none',
          }}>
            Back to home
          </Link>
          {isSubscription && (
            <Link href="/manage" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
              color: '#888',
              textDecoration: 'none',
            }}>
              Manage or cancel subscription
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
