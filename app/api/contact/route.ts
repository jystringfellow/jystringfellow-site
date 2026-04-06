import { NextRequest, NextResponse } from 'next/server';
import { handleContactRequest } from './contact-handler';

export async function POST(request: NextRequest) {
  const response = await handleContactRequest(request);
  return NextResponse.json(response.body, { status: response.status });
}
