import { Resend } from 'resend';

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type HeadersLike = {
  get(name: string): string | null;
};

export type ContactRequest = {
  headers: HeadersLike;
  json(): Promise<Record<string, unknown>>;
};

export type ContactResponse = {
  status: number;
  body: {
    error?: string;
    message?: string;
  };
};

function getRequiredEnv(name: 'RESEND_API_KEY' | 'TURNSTILE_SECRET_KEY') {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getClientIp(request: ContactRequest): string | null {
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    request.headers.get('x-real-ip'),
  ];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function isRateLimited(ip: string | null): boolean {
  if (!ip) {
    return false;
  }

  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function handleContactRequest(
  request: ContactRequest
): Promise<ContactResponse> {
  try {
    const body = await request.json();
    const { name, email, message, website, turnstileToken } = body;

    // Honeypot submissions are treated as accepted to avoid confirming bot detection.
    if (typeof website === 'string' && website.trim() !== '') {
      return {
        status: 200,
        body: { message: 'Message received successfully' },
      };
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      typeof turnstileToken !== 'string'
    ) {
      return {
        status: 400,
        body: { error: 'Missing required fields' },
      };
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage || !turnstileToken) {
      return {
        status: 400,
        body: { error: 'Missing required fields' },
      };
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        status: 400,
        body: { error: 'Invalid email format' },
      };
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return {
        status: 400,
        body: { error: 'Message is too long' },
      };
    }

    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return {
        status: 429,
        body: { error: 'Too many requests' },
      };
    }

    const resend = new Resend(getRequiredEnv('RESEND_API_KEY'));
    const turnstileSecretKey = getRequiredEnv('TURNSTILE_SECRET_KEY');

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: turnstileSecretKey,
          response: turnstileToken,
          remoteip: clientIp,
        }),
      }
    );

    if (!turnstileResponse.ok) {
      console.error(
        'Turnstile verification request failed:',
        turnstileResponse.status
      );
      return {
        status: 502,
        body: { error: 'Bot verification failed' },
      };
    }

    const turnstileData = await turnstileResponse.json();
    if (!turnstileData.success) {
      return {
        status: 400,
        body: { error: 'Bot verification failed' },
      };
    }

    const { error } = await resend.emails.send({
      from: 'Contact Form <contact@notifications.jystringfellow.com>',
      to: 'stringfellow.jacob@gmail.com',
      replyTo: trimmedEmail,
      subject: `New message from ${trimmedName}`,
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        status: 500,
        body: { error: 'Failed to send message' },
      };
    }

    return {
      status: 200,
      body: { message: 'Message received successfully' },
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }
}
