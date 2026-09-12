import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const content = body.content ?? body.claim ?? '';
  const input_type = body.input_type ?? 'text';
  const media_url = body.media_url ?? null;
  const apiBaseUrl = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';

  try {
    const response = await fetch(`${apiBaseUrl}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_type, content, media_url }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail: 'FastAPI verification backend is unavailable.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
