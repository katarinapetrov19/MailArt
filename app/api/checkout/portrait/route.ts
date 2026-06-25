import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { name, email, address, city, postal, country, note } = await request.json();

  const origin = request.headers.get('origin') ?? '';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: 3500,
          product_data: {
            name: 'Custom Portrait',
            description: 'Hand-drawn original portrait, shipped to your door',
          },
        },
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
      note: note ?? '',
    },
    success_url: `${origin}/success?type=portrait`,
    cancel_url: `${origin}/#home`,
  });

  return Response.json({ url: session.url });
}
