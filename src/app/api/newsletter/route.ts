import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

async function addToMailchimp(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<string | null> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const server = process.env.MAILCHIMP_API_SERVER ?? 'us1';

  if (!apiKey || !audienceId) return null;

  const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName ?? '',
        LNAME: lastName ?? '',
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // "Member Exists" is not a hard error
    if (body?.title === 'Member Exists') return 'exists';
    console.error('Mailchimp error:', body);
    return null;
  }

  const data = await res.json();
  return (data.id as string) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const { email, firstName, lastName } = parsed.data;

    // Upsert subscriber in DB
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (!existing) {
      const mailchimpId = await addToMailchimp(email, firstName, lastName);
      await prisma.subscriber.create({
        data: {
          email,
          firstName,
          lastName,
          mailchimpId,
          syncedAt: mailchimpId ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter signup error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
