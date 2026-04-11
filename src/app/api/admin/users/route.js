export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload?.isAdmin) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const result = await query(`
      SELECT 
        id, name, email, created_at, last_seen,
        CASE WHEN last_seen > NOW() - INTERVAL '2 minutes' THEN TRUE ELSE FALSE END AS is_online,
        (SELECT COUNT(*)::int FROM likes WHERE user_id = users.id) AS total_likes,
        (SELECT COUNT(*)::int FROM comments WHERE user_id = users.id) AS total_comments
      FROM users
      WHERE is_admin = FALSE
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
