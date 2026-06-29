import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const form = await request.formData();

  const name    = form.get('name') as string;
  const email   = form.get('email') as string;
  const address = form.get('address') as string;
  const city    = form.get('city') as string;
  const postal  = form.get('postal') as string;
  const country = form.get('country') as string;
  const note    = (form.get('note') as string) ?? '';
  const photos = form.getAll('photos') as File[];

  if (!photos.length) {
    return Response.json({ error: 'No photos' }, { status: 400 });
  }

  const attachments = await Promise.all(
    photos.map(async (photo, i) => {
      const ext = photo.name.split('.').pop() ?? 'jpg';
      return {
        filename: `portrait-${name.replace(/\s+/g, '-').toLowerCase()}-${i + 1}.${ext}`,
        content: Buffer.from(await photo.arrayBuffer()),
      };
    })
  );

  const { error } = await resend.emails.send({
    from: 'hello@pieppiep.art',
    to: 'hello@pieppiep.art',
    subject: `New portrait order — ${name}`,
    text: `New portrait order\n\nName: ${name}\nEmail: ${email}\nAddress: ${address}, ${city} ${postal}, ${country}${note ? `\nNote: ${note}` : ''}`,
    attachments,
  });

  if (error) {
    return Response.json({ error: 'Failed to send' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
