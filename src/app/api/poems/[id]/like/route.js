export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Inicia sesión para dar me gusta' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const poemId = params.id;
    const userId = payload.userId;

    const existing = await query(
      'SELECT id FROM likes WHERE poem_id = $1 AND user_id = $2',
      [poemId, userId]
    );

    let liked;
    if (existing.rows.length > 0) {
      await query('DELETE FROM likes WHERE poem_id = $1 AND user_id = $2', [poemId, userId]);
      liked = false;
    } else {
      await query('INSERT INTO likes (poem_id, user_id) VALUES ($1, $2)', [poemId, userId]);
      liked = true;
    }

    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM likes WHERE poem_id = $1',
      [poemId]
    );

    return NextResponse.json({ liked, count: countResult.rows[0].count });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
