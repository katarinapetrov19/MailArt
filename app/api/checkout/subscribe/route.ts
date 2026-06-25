import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { priceId, name, email, address, city, postal, country } = await request.json();

  const origin = request.headers.get('origin') ?? '';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: {
      name,
      address,
      city,
      postal,
      country,
    },
    success_url: `${origin}/success?type=subscribe`,
    cancel_url: `${origin}/#home`,
  });

  return Response.json({ url: session.url });
}
