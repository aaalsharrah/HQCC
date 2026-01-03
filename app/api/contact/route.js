import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(req) {
  try {
    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
      return Response.json(
        { error: 'Missing email configuration.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const message = String(body?.message || '').trim();
    const path = String(body?.path || '').trim();

    if (!message) {
      return Response.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const subject = `HQCC Issue Report${name ? ` from ${name}` : ''}`;

    const text = [
      name ? `Name: ${name}` : null,
      email ? `Email: ${email}` : null,
      path ? `Page: ${path}` : null,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n');

    await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      subject,
      text,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Resend contact error:', error);
    return Response.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
