import jwt from 'jsonwebtoken';

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

// Next.js App Router provides request.cookies.get() — much more reliable than manual parsing
export function getTokenFromRequest(request) {
  // Method 1: Next.js built-in cookies API (most reliable)
  try {
    const cookie = request.cookies.get('victoria_token');
    if (cookie?.value) return cookie.value;
  } catch {}

  // Method 2: Manual header parsing as fallback
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
      const [rawKey, ...rawVal] = part.split('=');
      const key = rawKey.trim();
      if (key === 'victoria_token') {
        return rawVal.join('=').trim() || null;
      }
    }
  } catch {}

  return null;
}
