import jwt from 'jsonwebtoken';
import { headers, cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'victoria-amor-eterno-2024';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Uses next/headers (the proper App Router API) — avoids DYNAMIC_SERVER_USAGE error
export function getTokenFromRequest(_request) {
  try {
    // 1. Authorization: Bearer <token> from localStorage (most reliable)
    const headersList = headers();
    const auth = headersList.get('authorization') || '';
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();
      if (token) return token;
    }

    // 2. Cookie fallback
    const cookieStore = cookies();
    const cookie = cookieStore.get('victoria_token');
    if (cookie?.value) return cookie.value;
  } catch (e) {
    // If next/headers fails, try reading from the raw request
    try {
      const auth = _request?.headers?.get?.('authorization') || '';
      if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
    } catch {}
  }

  return null;
}
