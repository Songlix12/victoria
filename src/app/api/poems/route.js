export const runtime = 'nodejs';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId || null;

    let sql;
    let params = [];

    if (userId) {
      sql = `
        SELECT 
          p.*,
          COUNT(DISTINCT l.id)::int AS like_count,
          COUNT(DISTINCT c.id)::int AS comment_count,
          BOOL_OR(l.user_id = $1) AS user_liked
        FROM poems p
        LEFT JOIN likes l ON l.poem_id = p.id
        LEFT JOIN comments c ON c.poem_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at ASC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT 
          p.*,
          COUNT(DISTINCT l.id)::int AS like_count,
          COUNT(DISTINCT c.id)::int AS comment_count,
          FALSE AS user_liked
        FROM poems p
        LEFT JOIN likes l ON l.poem_id = p.id
        LEFT JOIN comments c ON c.poem_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at ASC
      `;
    }

    const result = await query(sql, params);
    return NextResponse.json({ poems: result.rows });
  } catch (error) {
    console.error('Get poems error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
