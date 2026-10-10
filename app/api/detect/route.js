import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const res = await fetch('http://127.0.0.1:8000/detect-redact', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Backend error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Detection API proxy error:', error);
    return NextResponse.json({ error: error.message || 'Internal proxy error' }, { status: 500 });
  }
}
