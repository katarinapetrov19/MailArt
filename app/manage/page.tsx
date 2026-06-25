'use client';
import { useState } from 'react';

export default function ManagePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'No subscription found for this email.'); setLoading(false); return; }
    window.location.href = data.url;
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f7f2eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <a href="/" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#888', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>← Back</a>
        <h1 style={{ fontFamily: 'PlaypenSans-Bold, Playpen_Sans, sans-serif', fontSize: '2.5rem', color: '#1a1a1a', margin: '0 0 0.5rem' }}>Manage subscription</h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: '#666', margin: '0 0 2rem' }}>Enter the email you subscribed with to access your billing portal.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="portrait-field-input"
            style={{ fontSize: '1rem' }}
          />
          {error && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#c00', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="portrait-cta-btn"
            style={{ width: '100%', textAlign: 'center', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Loading…' : 'Go to billing portal'}
          </button>
        </form>
      </div>
    </main>
  );
}
