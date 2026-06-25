import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const ARTIST_EMAIL = 'pieppiepseppl@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_email || session.customer_details?.email || '';
    const customerName = session.customer_details?.name || 'there';
    const isSubscription = session.mode === 'subscription';
    const meta = session.metadata || {};

    // Email to customer
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: isSubscription ? 'You\'re in the Mail Club!' : 'Portrait order confirmed!',
      html: isSubscription
        ? `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
            <h1 style="font-size:1.8rem;color:#1a1a1a">You're subscribed!</h1>
            <p style="color:#555;line-height:1.7">Hi ${customerName},<br><br>
            Welcome to the Mail Club! Your first hand-drawn original artwork is on its way.<br><br>
            Each month I'll create something new and mail the original to your door — never reprinted, never repeated.</p>
            <p style="color:#555;line-height:1.7">To manage or cancel your subscription at any time, visit:<br>
            <a href="https://mail-art.vercel.app/manage" style="color:#2d8a4e">mail-art.vercel.app/manage</a></p>
            <p style="color:#999;font-size:0.85rem;margin-top:2rem">— Sebastian / PIEPPIEPSEPPL</p>
          </div>`
        : `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
            <h1 style="font-size:1.8rem;color:#1a1a1a">Portrait order confirmed!</h1>
            <p style="color:#555;line-height:1.7">Hi ${customerName},<br><br>
            Your order is confirmed and I'll start working on your portrait soon.<br><br>
            The original hand-drawn artwork will be shipped to:<br>
            <strong>${meta.address || ''}, ${meta.city || ''} ${meta.postal || ''}, ${meta.country || ''}</strong></p>
            <p style="color:#555;line-height:1.7">Delivery takes 2–3 weeks. I'll be in touch if I have any questions about your photo.</p>
            <p style="color:#999;font-size:0.85rem;margin-top:2rem">— Sebastian / PIEPPIEPSEPPL</p>
          </div>`,
    });

    // Notification to artist
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ARTIST_EMAIL,
      subject: isSubscription
        ? `New Mail Club subscriber — ${customerName}`
        : `New portrait order — ${customerName}`,
      html: isSubscription
        ? `<div style="font-family:sans-serif;padding:1rem">
            <h2>New Mail Club subscriber</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Address:</strong> ${meta.address || ''}, ${meta.city || ''} ${meta.postal || ''}, ${meta.country || ''}</p>
          </div>`
        : `<div style="font-family:sans-serif;padding:1rem">
            <h2>New portrait order — 35€</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Address:</strong> ${meta.address || ''}, ${meta.city || ''} ${meta.postal || ''}, ${meta.country || ''}</p>
            ${meta.note ? `<p><strong>Note:</strong> ${meta.note}</p>` : ''}
          </div>`,
    });
  }

  return NextResponse.json({ received: true });
}
