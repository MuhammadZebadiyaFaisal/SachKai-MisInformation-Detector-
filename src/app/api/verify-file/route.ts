import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiBaseUrl = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';

  try {
    const formData = await request.formData();
    const response = await fetch(`${apiBaseUrl}/api/verify-file`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail: 'FastAPI file verification backend is unavailable.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
