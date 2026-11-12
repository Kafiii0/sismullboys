import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${PYTHON_API_URL}/api/pqc/parse-key`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in /api/pqc/parse-key proxy:', error);
    return NextResponse.json(
      { success: false, detail: 'Gagal terhubung ke backend detector server: ' + error.message },
      { status: 500 }
    );
  }
}
