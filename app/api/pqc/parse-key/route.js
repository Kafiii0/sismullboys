import { NextResponse } from 'next/server';

function validateOfficerKeyBundle(keyBundle) {
  if (!keyBundle || typeof keyBundle !== 'object') {
    return { isValid: false, error: 'Format file kunci tidak valid (bukan JSON object).' };
  }
  const identity = keyBundle.identity || {};
  const pubKey = keyBundle.public_key || {};
  const secKey = keyBundle.secret_key || keyBundle.private_key || {};

  if (!identity.officer_name) {
    return { isValid: false, error: 'File kunci tidak memiliki nama resmi penandatangan.' };
  }
  if (!identity.institution_name) {
    return { isValid: false, error: 'File kunci tidak memiliki nama lembaga/institusi resmi.' };
  }
  if (!pubKey.rho && !pubKey.fingerprint) {
    return { isValid: false, error: 'Public key ML-DSA-65 rusak atau tidak lengkap.' };
  }
  if (!secKey.seed && !secKey.key_k) {
    return { isValid: false, error: 'Kunci rahasia (Secret Key) tidak ditemukan atau tidak valid.' };
  }
  return { isValid: true, identity };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // 1. Try Python backend if available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('http://127.0.0.1:8000/api/pqc/parse-key', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (_) {
      // Backend not running - fallback cleanly to native validation
    }

    if (!file) {
      return NextResponse.json({ success: false, detail: 'Berkas kunci tidak ditemukan.' }, { status: 400 });
    }

    const text = await file.text();
    let keyBundle;
    try {
      keyBundle = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ success: false, detail: 'Berkas bukan format JSON yang valid.' }, { status: 400 });
    }

    const val = validateOfficerKeyBundle(keyBundle);
    if (!val.isValid) {
      return NextResponse.json({ success: false, detail: val.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      key_bundle: keyBundle,
      identity: val.identity
    });
  } catch (error) {
    console.error('Error in /api/pqc/parse-key:', error);
    return NextResponse.json(
      { success: false, detail: 'Gagal memproses berkas kunci: ' + error.message },
      { status: 500 }
    );
  }
}
