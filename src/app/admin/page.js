'use client';
import { useState, useEffect, useRef } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

/* ── Compose Letter Modal ── */
function ComposeLetter({ onSaved, onClose }) {
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Escribe el título y el contenido.'); return; }
    setSaving(true); setError('');
    try {
      const res = await authFetch('/api/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al guardar.'); setSaving(false); return; }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 900);
    } catch { setError('Error de red.'); setSaving(false); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(4,4,4,0.82)',
      backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(12px,4vw,24px)',
      animation: 'overlayIn 0.3s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto',
        background: preview ? 'var(--letter-cream)' : 'rgba(12,12,12,0.95)',
        border: `1px solid ${preview ? 'rgba(201,169,110,0.22)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 'clamp(16px,3vw,28px)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(201,169,110,0.06)',
        position: 'relative',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(18px,3vw,28px) clamp(18px,3vw,28px) 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${preview ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
          paddingBottom: 16, marginBottom: 0,
        }}>
          <div>
            <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: preview ? 'var(--wine)' : 'var(--wine-light)', marginBottom: 4 }}>
              ✦ Nueva Carta
            </p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,24px)', fontStyle: 'italic', fontWeight: 400, color: preview ? 'var(--letter-text)' : 'white' }}>
              Redactar para Victoria
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPreview(!preview)} style={{
              background: preview ? 'var(--wine)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${preview ? 'var(--wine-light)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20, padding: '6px clamp(10px,2vw,16px)',
              fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: preview ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
              transition: 'all 0.25s', whiteSpace: 'nowrap',
            }}>
              {preview ? '✎ Editar' : '◉ Vista previa'}
            </button>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(90deg)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >✕</button>
          </div>
        </div>

        <div style={{ padding: 'clamp(18px,3vw,28px)' }}>
          {!preview ? (
            /* EDITOR */
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10 }}>
                  Título de la carta
                </label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="El título que guardará este sentimiento..."
                  maxLength={120}
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.12)',
                    color: 'white', padding: '10px 4px 8px',
                    fontFamily: "'Playfair Display',serif", fontSize: 'clamp(16px,2.5vw,20px)',
                    fontStyle: 'italic', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--wine-light)'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
                />
                <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 4 }}>{title.length}/120</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10 }}>
                  Contenido
                </label>
                <textarea
                  ref={textareaRef}
                  value={content} onChange={e => { setContent(e.target.value); autoResize(); }}
                  placeholder={"Querida Victoria,\n\nEscribe aquí todo lo que sientes..."}
                  maxLength={3000}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, color: 'rgba(216,213,208,0.85)',
                    padding: '16px', resize: 'none', minHeight: 180,
                    fontFamily: "'Lora',serif", fontSize: 'clamp(13px,2vw,15px)',
                    lineHeight: 1.85, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,26,47,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 4 }}>{content.length}/3000</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(139,26,47,0.12)', border: '1px solid rgba(139,26,47,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, color: 'var(--wine-light)' }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: 10, padding: '9px clamp(14px,3vw,22px)' }}>Cancelar</button>
                <button type="submit" disabled={saving || success} className="btn-primary" style={{ fontSize: 10, padding: '9px clamp(14px,3vw,22px)', minWidth: 100 }}>
                  {success ? '✓ Guardado' : saving ? 'Guardando...' : '✉ Publicar carta'}
                </button>
              </div>
            </form>
          ) : (
            /* PREVIEW — mock del modal */
            <div>
              <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--wine)', textAlign: 'center', marginBottom: 14 }}>
                ✦ Para Victoria ✦
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,4vw,26px)', fontWeight: 500, fontStyle: 'italic', color: 'var(--letter-text)', textAlign: 'center', marginBottom: 6 }}>
                {title || 'Sin título'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '18px auto' }}>
                <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg,transparent,rgba(139,26,47,0.22))' }} />
                <span style={{ color: 'var(--wine)', fontSize: 11, opacity: 0.7 }}>♥</span>
                <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg,rgba(139,26,47,0.22),transparent)' }} />
              </div>
              <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(16px,2.5vw,19px)', color: 'rgba(30,20,15,0.82)', lineHeight: 1.9, textAlign: 'center', whiteSpace: 'pre-line', marginBottom: 24 }}>
                {content || 'El contenido de la carta aparecerá aquí...'}
              </p>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setPreview(false)} className="btn-secondary" style={{ background: 'transparent', borderColor: 'rgba(139,26,47,0.25)', color: 'var(--wine)', fontSize: 10, padding: '8px 18px' }}>
                  ✎ Seguir editando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ poem, onConfirm, onCancel }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onCancel(); }} style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(4,4,4,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'overlayIn 0.2s ease',
    }}>
      <div style={{
        background: 'rgba(14,14,14,0.95)', border: '1px solid rgba(139,26,47,0.25)',
        borderRadius: 20, padding: 'clamp(24px,4vw,36px)',
        maxWidth: 380, width: '100%', textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--wine-light)', marginBottom: 14 }}>
          Eliminar carta
        </p>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: 'italic', color: 'white', marginBottom: 10 }}>
          "{poem.title}"
        </h3>
        <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'rgba(216,213,208,0.45)', fontStyle: 'italic', marginBottom: 24 }}>
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} className="btn-secondary" style={{ fontSize: 10, padding: '9px 20px' }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            background: 'rgba(139,26,47,0.8)', color: 'white',
            border: '1px solid var(--wine)', borderRadius: 40,
            padding: '9px 20px', fontFamily: 'Montserrat,sans-serif',
            fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--wine)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,26,47,0.8)'}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Poems Manager ── */
function PoemsManager({ poems, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const confirmDelete = async () => {
    setDeleting(deleteTarget.id);
    await authFetch('/api/poems', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    setDeleteTarget(null); setDeleting(null);
    onDelete();
  };

  if (poems.length === 0) return (
    <div style={{ textAlign: 'center', padding: 'clamp(32px,6vw,60px) 20px', opacity: 0.5 }}>
      <p style={{ fontFamily: "'Lora',serif", fontSize: 15, fontStyle: 'italic', color: 'rgba(216,213,208,0.5)' }}>
        No hay cartas publicadas aún.
      </p>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {poems.map((poem, i) => (
          <div key={poem.id} className="admin-card fade-in" style={{ animationDelay: `${i * 0.04}s`, display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(14px,2vw,17px)', fontStyle: 'italic', color: 'white', marginBottom: 4, wordBreak: 'break-word' }}>
                {poem.title}
              </h3>
              <p style={{ fontFamily: "'Lora',serif", fontSize: 12, color: 'rgba(216,213,208,0.4)', fontStyle: 'italic', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                {poem.content}
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
                  {new Date(poem.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, color: 'var(--wine-light)', letterSpacing: '1px' }}>
                  ♥ {poem.like_count || 0}
                </span>
                <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
                  ✉ {poem.comment_count || 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(poem)}
              disabled={deleting === poem.id}
              style={{
                background: 'transparent', border: '1px solid rgba(139,26,47,0.2)',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 500,
                letterSpacing: '1px', textTransform: 'uppercase',
                color: 'rgba(139,26,47,0.6)', transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,26,47,0.5)'; e.currentTarget.style.color = 'var(--wine-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,26,47,0.2)'; e.currentTarget.style.color = 'rgba(139,26,47,0.6)'; }}
            >
              {deleting === poem.id ? '...' : 'Eliminar'}
            </button>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <DeleteConfirm poem={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const [users, setUsers]         = useState([]);
  const [poems, setPoems]         = useState([]);
  const [user, setUser]           = useState(null);
  const [loading, setLoad]        = useState(true);
  const [updated, setUpd]         = useState(null);
  const [showCompose, setCompose] = useState(false);
  const [activeSection, setSection] = useState('users');

  const load = async () => {
    const [me, usrs, pms] = await Promise.all([
      authFetch('/api/auth/me').then(r => r.json()),
      authFetch('/api/admin/users').then(r => r.json()),
      authFetch('/api/poems').then(r => r.json()),
    ]);
    if (!me.user?.isAdmin) { window.location.href = '/'; return; }
    setUser(me.user);
    if (usrs.users) setUsers(usrs.users);
    if (pms.poems) setPoems(pms.poems);
    setUpd(new Date());
    setLoad(false);
  };

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, []);

  const logout = async () => {
    clearToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const fmt = d => new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const online  = users.filter(u => u.is_online);

  if (loading) return (
    <>
      <div className="bg-luxury" />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Lora',serif", fontSize: 16, fontStyle: 'italic', color: 'rgba(216,213,208,0.4)' }}>Cargando panel...</p>
      </div>
    </>
  );

  return (
    <>
      <div className="bg-luxury" />
      <div className="gold-top-line" />

      {/* NAV */}
      <nav className="luxury-nav" style={{ flexWrap: 'wrap', height: 'auto', minHeight: 68, padding: 'clamp(10px,2vw,14px) clamp(14px,4vw,40px)' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span className="nav-logo">Victoria</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,14px)', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(11px,2vw,14px)', fontStyle: 'italic', color: 'rgba(216,213,208,0.55)' }}>
            ✦ {user?.name}
          </span>
          <a href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: 9, padding: '7px clamp(10px,2vw,16px)' }}>Ver cartas</button>
          </a>
          <button onClick={logout} className="btn-secondary" style={{ fontSize: 9, padding: '7px clamp(10px,2vw,16px)' }}>Salir</button>
        </div>
      </nav>

      <main className="page-content" style={{ paddingTop: 'clamp(74px,10vw,90px)', padding: 'clamp(74px,10vw,90px) clamp(12px,4vw,40px) 60px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Header */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,48px)' }}>
            <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--wine-light)', marginBottom: 12 }}>
              ✦ Panel Secreto ✦
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 'clamp(26px,5vw,40px)', color: 'white', fontWeight: 400, marginBottom: 10 }}>
              Administrador
            </h1>
            <div style={{ width: 50, height: 1, margin: '12px auto', background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
            <p style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(12px,2vw,15px)', fontStyle: 'italic', color: 'rgba(216,213,208,0.4)' }}>
              Solo tú puedes ver esta página
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(clamp(90px,20vw,130px),1fr))', gap: 'clamp(10px,2vw,16px)', marginBottom: 'clamp(20px,4vw,36px)' }}>
            {[
              { label: 'Registradas', value: users.length, icon: '✉', color: 'var(--gold)' },
              { label: 'En línea', value: online.length, icon: '●', color: '#4ade80' },
              { label: 'Cartas', value: poems.length, icon: '♥', color: 'var(--wine-light)' },
              { label: 'Likes totales', value: users.reduce((a, u) => a + (u.total_likes || 0), 0), icon: '♥', color: 'var(--wine-light)' },
            ].map(s => (
              <div key={s.label} className="admin-card" style={{ textAlign: 'center', padding: 'clamp(14px,3vw,24px) clamp(10px,2vw,16px)' }}>
                <div style={{ fontSize: 'clamp(16px,3vw,22px)', color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: 'white' }}>{s.value}</div>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 'clamp(16px,3vw,28px)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0, flexWrap: 'wrap' }}>
            {[['users', 'Usuarias'], ['letters', 'Cartas publicadas']].map(([key, label]) => (
              <button key={key} onClick={() => setSection(key)} style={{
                fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(9px,1.5vw,11px)', fontWeight: 600,
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                background: 'none', border: 'none', padding: 'clamp(8px,1.5vw,12px) clamp(10px,2vw,18px)',
                color: activeSection === key ? 'white' : 'rgba(255,255,255,0.3)',
                borderBottom: `2px solid ${activeSection === key ? 'var(--wine-light)' : 'transparent'}`,
                transition: 'color 0.2s, border-color 0.2s',
                marginBottom: -1, whiteSpace: 'nowrap',
              }}>
                {label}
              </button>
            ))}
            <button onClick={() => setCompose(true)} style={{
              marginLeft: 'auto', background: 'var(--wine)', color: 'white',
              border: '1px solid var(--wine-light)', borderRadius: 40,
              padding: 'clamp(7px,1.5vw,9px) clamp(12px,2.5vw,22px)',
              fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(9px,1.5vw,11px)', fontWeight: 600,
              letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'background 0.25s, box-shadow 0.3s',
              alignSelf: 'center', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--wine-light)'; e.currentTarget.style.boxShadow = '0 0 20px var(--wine-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--wine)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              + Redactar carta
            </button>
          </div>

          {/* Users Section */}
          {activeSection === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {updated && (
                  <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '1px', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
                    {updated.toLocaleTimeString('es-ES')}
                  </span>
                )}
                <button onClick={load} className="btn-secondary" style={{ fontSize: 9, padding: '6px 14px' }}>Actualizar</button>
              </div>

              {users.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: 'clamp(32px,6vw,60px) 20px' }}>
                  <p style={{ fontFamily: "'Lora',serif", fontSize: 15, fontStyle: 'italic', color: 'rgba(216,213,208,0.4)' }}>
                    Nadie se ha registrado aún.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...users.filter(u => u.is_online), ...users.filter(u => !u.is_online)].map(u => (
                    <div key={u.id} className="admin-card fade-in" style={{ borderColor: u.is_online ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,16px)', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{
                          width: 'clamp(36px,6vw,46px)', height: 'clamp(36px,6vw,46px)',
                          borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--gold) 0%, var(--wine) 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 700, color: 'white',
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(14px,2.5vw,17px)', fontStyle: 'italic', color: 'white', wordBreak: 'break-word' }}>{u.name}</span>
                            {u.is_online ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4ade80' }}>
                                <span className="online-pulse" /> En línea
                              </span>
                            ) : (
                              <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Desconectada</span>
                            )}
                          </div>
                          <div style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(11px,1.8vw,13px)', color: 'rgba(216,213,208,0.35)', fontStyle: 'italic', wordBreak: 'break-all' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 'clamp(12px,3vw,22px)', flexShrink: 0 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 700, color: 'var(--wine-light)' }}>♥ {u.total_likes}</div>
                            <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 7, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>likes</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 700, color: 'var(--gold)' }}>✦ {u.total_comments}</div>
                            <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 7, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>mensajes</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 'clamp(10px,3vw,24px)', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Registrada', value: fmt(u.created_at) },
                          { label: 'Última vez', value: u.last_seen ? fmt(u.last_seen) : 'Nunca', green: u.is_online },
                        ].map(d => (
                          <div key={d.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>{d.label}:</span>
                            <span style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(11px,2vw,13px)', fontStyle: 'italic', color: d.green ? '#4ade80' : 'rgba(216,213,208,0.5)' }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Letters Section */}
          {activeSection === 'letters' && (
            <PoemsManager poems={poems} onDelete={load} />
          )}

          <div style={{ marginTop: 'clamp(28px,5vw,48px)', textAlign: 'center', padding: 'clamp(16px,3vw,24px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(12px,2vw,15px)', fontStyle: 'italic', color: 'rgba(216,213,208,0.2)' }}>
              "Espero con el corazón en la mano el momento en que ella llegue." ♥
            </p>
          </div>
        </div>
      </main>

      {showCompose && (
        <ComposeLetter
          onSaved={load}
          onClose={() => setCompose(false)}
        />
      )}
    </>
  );
}