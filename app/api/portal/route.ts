import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const origin = req.headers.get('origin') || 'https://mail-art.vercel.app';

  const customers = await stripe.customers.list({ email, limit: 1 });
  if (!customers.data.length) {
    return NextResponse.json({ error: 'No subscription found for this email.' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${origin}/`,
  });

  return NextResponse.json({ url: session.url });
}
