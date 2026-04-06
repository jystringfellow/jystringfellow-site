import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { Resend } from 'resend';
import {
  handleContactRequest,
  type ContactRequest,
} from '../app/api/contact/contact-handler.ts';

type SendArgs = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

const resendEmailsPrototype = Object.getPrototypeOf(new Resend('test').emails) as {
  send: (payload: SendArgs) => Promise<{ error: unknown }>;
};

const originalFetch = global.fetch;
const originalSend = resendEmailsPrototype.send;
const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
};

let requestCounter = 0;

function createRequest(
  body: Record<string, unknown>,
  ip = `203.0.113.${++requestCounter}`
) {
  return {
    headers: new Headers({
      'x-forwarded-for': ip,
    }),
    json: async () => body,
  } as ContactRequest;
}

function validBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Jacob',
    email: 'jacob@example.com',
    message: 'Hello there',
    website: '',
    turnstileToken: 'token-123',
    ...overrides,
  };
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 'resend-test-key';
  process.env.TURNSTILE_SECRET_KEY = 'turnstile-test-key';
});

afterEach(() => {
  global.fetch = originalFetch;
  resendEmailsPrototype.send = originalSend;

  if (originalEnv.RESEND_API_KEY === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
  }

  if (originalEnv.TURNSTILE_SECRET_KEY === undefined) {
    delete process.env.TURNSTILE_SECRET_KEY;
  } else {
    process.env.TURNSTILE_SECRET_KEY = originalEnv.TURNSTILE_SECRET_KEY;
  }
});

test('accepts a valid contact submission and trims outbound fields', async () => {
  const fetchCalls: Array<{ url: string; body: string }> = [];
  let sendPayload: SendArgs | null = null;

  global.fetch = (async (input, init) => {
    fetchCalls.push({
      url: String(input),
      body: String(init?.body ?? ''),
    });

    return {
      ok: true,
      json: async () => ({ success: true }),
    } as Response;
  }) as typeof global.fetch;

  resendEmailsPrototype.send = async (payload) => {
    sendPayload = payload;
    return { error: null };
  };

  const response = await handleContactRequest(
    createRequest(
      validBody({
        name: '  Jacob  ',
        email: '  jacob@example.com  ',
        message: '  Hello from the contact form.  ',
      })
    )
  );

  assert.equal(response.status, 200);
  assert.equal(fetchCalls.length, 1);
  assert.equal(
    fetchCalls[0]?.url,
    'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  );
  assert.ok(sendPayload);
  const sentEmail = sendPayload as SendArgs;
  assert.equal(sentEmail.replyTo, 'jacob@example.com');
  assert.equal(sentEmail.subject, 'New message from Jacob');
  assert.match(sentEmail.text, /Hello from the contact form\./);
});

test('short-circuits honeypot submissions before verification or email send', async () => {
  let sendCalled = false;

  global.fetch = (async () => {
    throw new Error('fetch should not be called for honeypot submissions');
  }) as typeof global.fetch;

  resendEmailsPrototype.send = async () => {
    sendCalled = true;
    return { error: null };
  };

  const response = await handleContactRequest(
    createRequest(validBody({ website: 'https://spam.example' }))
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Message received successfully');
  assert.equal(sendCalled, false);
});

test('rejects invalid email addresses before verification', async () => {
  let sendCalled = false;
  let fetchCalled = false;

  global.fetch = (async () => {
    fetchCalled = true;
    return {
      ok: true,
      json: async () => ({ success: true }),
    } as Response;
  }) as typeof global.fetch;

  resendEmailsPrototype.send = async () => {
    sendCalled = true;
    return { error: null };
  };

  const response = await handleContactRequest(
    createRequest(validBody({ email: 'not-an-email' }))
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Invalid email format');
  assert.equal(fetchCalled, false);
  assert.equal(sendCalled, false);
});

test('returns 400 when Turnstile verification fails', async () => {
  let sendCalled = false;

  global.fetch = (async () => {
    return {
      ok: true,
      json: async () => ({ success: false }),
    } as Response;
  }) as typeof global.fetch;

  resendEmailsPrototype.send = async () => {
    sendCalled = true;
    return { error: null };
  };

  const response = await handleContactRequest(createRequest(validBody()));

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Bot verification failed');
  assert.equal(sendCalled, false);
});

test('rate limits repeated submissions from the same IP', async () => {
  global.fetch = (async () => {
    return {
      ok: true,
      json: async () => ({ success: true }),
    } as Response;
  }) as typeof global.fetch;

  resendEmailsPrototype.send = async () => ({ error: null });

  const ip = `198.51.100.${++requestCounter}`;

  for (let index = 0; index < 5; index += 1) {
    const response = await handleContactRequest(createRequest(validBody(), ip));
    assert.equal(response.status, 200);
  }

  const limitedResponse = await handleContactRequest(createRequest(validBody(), ip));

  assert.equal(limitedResponse.status, 429);
  assert.equal(limitedResponse.body.error, 'Too many requests');
});

test('returns 500 when required environment variables are missing', async () => {
  delete process.env.TURNSTILE_SECRET_KEY;

  let fetchCalled = false;
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    global.fetch = (async () => {
      fetchCalled = true;
      return {
        ok: true,
        json: async () => ({ success: true }),
      } as Response;
    }) as typeof global.fetch;

    resendEmailsPrototype.send = async () => ({ error: null });

    const response = await handleContactRequest(createRequest(validBody()));

    assert.equal(response.status, 500);
    assert.equal(response.body.error, 'Internal server error');
    assert.equal(fetchCalled, false);
  } finally {
    console.error = originalConsoleError;
  }
});
