import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiBaseUrl = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ?? '20';

  try {
    const response = await fetch(`${apiBaseUrl}/api/feed?limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail: 'FastAPI verification feed is unavailable.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
