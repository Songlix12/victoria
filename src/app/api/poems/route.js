export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId || null;

    let result;
    if (userId) {
      result = await query(`
        SELECT p.*,
          COUNT(DISTINCT l.id)::int AS like_count,
          COUNT(DISTINCT c.id)::int AS comment_count,
          BOOL_OR(l.user_id = $1) AS user_liked
        FROM poems p
        LEFT JOIN likes l ON l.poem_id = p.id
        LEFT JOIN comments c ON c.poem_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at ASC
      `, [userId]);
    } else {
      result = await query(`
        SELECT p.*,
          COUNT(DISTINCT l.id)::int AS like_count,
          COUNT(DISTINCT c.id)::int AS comment_count,
          FALSE AS user_liked
        FROM poems p
        LEFT JOIN likes l ON l.poem_id = p.id
        LEFT JOIN comments c ON c.poem_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at ASC
      `);
    }
    return NextResponse.json({ poems: result.rows });
  } catch (error) {
    console.error('Get poems error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { verifyToken, getTokenFromRequest } = await import('@/lib/auth');
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userResult = await query('SELECT is_admin FROM users WHERE id = $1', [payload.userId]);
    if (!userResult.rows[0]?.is_admin) return NextResponse.json({ error: 'Solo admins' }, { status: 403 });

    const { title, content } = await request.json();
    if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });

    const result = await query(
      'INSERT INTO poems (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [title.trim(), content.trim()]
    );
    return NextResponse.json({ poem: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { verifyToken, getTokenFromRequest } = await import('@/lib/auth');
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userResult = await query('SELECT is_admin FROM users WHERE id = $1', [payload.userId]);
    if (!userResult.rows[0]?.is_admin) return NextResponse.json({ error: 'Solo admins' }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await query('DELETE FROM poems WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}