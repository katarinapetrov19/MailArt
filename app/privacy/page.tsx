export default function PrivacyPolicy() {
  return (
    <main style={{
      maxWidth: '680px',
      margin: '0 auto',
      padding: '6rem 2rem',
      fontFamily: 'DM Sans, sans-serif',
      color: '#1a1a1a',
      lineHeight: '1.8',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#888', marginBottom: '3rem', fontSize: '0.9rem' }}>Last updated: June 2026</p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Who we are</h2>
        <p>This website is operated by Sebastian Wagner (PIEPPIEPSEPPL). You can reach me at <a href="mailto:hello@pieppiep.art" style={{ color: '#1a1a1a' }}>hello@pieppiep.art</a>.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>What data I collect and why</h2>
        <p><strong>Portrait orders &amp; Mail Club subscriptions</strong> — when you place an order I collect your name, email address, and shipping address. This is necessary to fulfil your order and ship artwork to you.</p>
        <p style={{ marginTop: '1rem' }}><strong>Portrait photo</strong> — if you order a custom portrait you upload a photo of yourself. I use it solely to draw your portrait. The photo is never stored on my servers and is deleted as soon as your portrait is complete.</p>
        <p style={{ marginTop: '1rem' }}><strong>Contact</strong> — if you email me directly or send a DM on Instagram, I only use your message to respond to your inquiry.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Where data is stored</h2>
        <p>I do not run my own database. Your order data is stored by the following processors:</p>
        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
          <li><strong>Stripe</strong> — payment processing and order records. Stripe is GDPR-compliant and stores data on EU-region servers. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a' }}>Stripe Privacy Policy</a></li>
          <li style={{ marginTop: '0.5rem' }}><strong>Resend</strong> — transactional email (order confirmations). Email logs are kept for 3 days on the free plan. <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a' }}>Resend Privacy Policy</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>How long I keep your data</h2>
        <p>Order records are kept in Stripe for as long as required by tax and accounting law (typically 7 years in the EU). Portrait photos are deleted immediately after your artwork is complete. I do not keep any data beyond what is required to fulfil your order.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your rights</h2>
        <p>Under GDPR you have the right to access, correct, or delete your personal data at any time. To exercise any of these rights, email <a href="mailto:hello@pieppiep.art" style={{ color: '#1a1a1a' }}>hello@pieppiep.art</a> and I will respond within 30 days.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cookies</h2>
        <p>This site does not use tracking cookies or analytics. Stripe may set cookies during checkout — these are necessary for payment processing only.</p>
      </section>

      <a href="/" style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>← Back to site</a>
    </main>
  );
}
