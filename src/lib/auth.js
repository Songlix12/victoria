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

export function getTokenFromRequest(request) {
  // 1. Authorization: Bearer <token>  ← most reliable, sent by our client
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  // 2. Next.js cookies API
  try {
    const cookie = request.cookies?.get?.('victoria_token');
    if (cookie?.value) return cookie.value;
  } catch {}

  // 3. Raw cookie header fallback
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    for (const part of cookieHeader.split(';')) {
      const eq = part.indexOf('=');
      if (eq === -1) continue;
      const key = part.slice(0, eq).trim();
      if (key === 'victoria_token') {
        return part.slice(eq + 1).trim() || null;
      }
    }
  } catch {}

  return null;
}
