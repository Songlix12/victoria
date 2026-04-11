'use client';
import { useState, useEffect } from 'react';

// Helper: fetch that ALWAYS sends cookies
const api = (url, opts = {}) =>
  fetch(url, { credentials: 'include', ...opts });

/* ── Ambient particles ─────────────────────────── */
function AmbientParticles() {
  const golds = ['#c9943a','#e2b55a','#f0cc7a','#d4a843'];
  const particles = Array.from({ length: 22 }, (_, i) => i);
  const hearts    = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div aria-hidden="true">
      {particles.map(i => {
        const s = 1.5 + Math.random() * 3;
        return (
          <div key={`p${i}`} className="particle" style={{
            left: `${Math.random() * 100}%`,
            width: `${s}px`, height: `${s}px`,
            background: golds[i % golds.length],
            animationDuration: `${10 + Math.random() * 16}s`,
            animationDelay: `${Math.random() * 14}s`,
          }} />
        );
      })}
      {hearts.map(i => (
        <div key={`h${i}`} className="floating-heart" style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${12 + Math.random() * 14}s`,
          animationDelay: `${Math.random() * 16}s`,
          fontSize: `${10 + Math.random() * 8}px`,
        }}>♥</div>
      ))}
    </div>
  );
}

/* ── Comment section ───────────────────────────── */
function CommentSection({ poemId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);

  useEffect(() => {
    api(`/api/poems/${poemId}/comments`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setLoading(false); });
  }, [poemId]);

  const submit = async e => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    const res = await api(`/api/poems/${poemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim() })
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      setComments(p => [...p, data.comment]);
      setText('');
    } else if (!res.ok) {
      // If unauthorized, redirect to login
      if (res.status === 401) window.location.href = '/login';
    }
    setPosting(false);
  };

  return (
    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(201,148,58,0.12)' }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'2px',
        textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'14px' }}>
        Tus palabras
      </p>

      {loading ? (
        <p style={{ color:'var(--cream-muted)', fontSize:'14px', fontStyle:'italic' }}>...</p>
      ) : comments.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div style={{ display:'flex', gap:'10px', alignItems:'baseline', marginBottom:'3px' }}>
                <span style={{ fontFamily:'Cinzel,serif', fontSize:'11px', color:'var(--gold)', letterSpacing:'1px' }}>
                  {c.user_name}
                </span>
                <span style={{ fontSize:'11px', color:'var(--cream-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
                </span>
              </div>
              <p style={{ color:'var(--letter-text)', fontSize:'15px', lineHeight:1.6, fontFamily:'EB Garamond,serif' }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color:'var(--cream-muted)', fontSize:'15px', fontStyle:'italic', marginBottom:'14px' }}>
          Sé la primera en dejar tu huella aquí...
        </p>
      )}

      {user ? (
        <form onSubmit={submit} style={{ display:'flex', gap:'10px', alignItems:'flex-end' }}>
          <div style={{ flex:1 }}>
            <input
              className="luxury-input"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe lo que sientes..."
              maxLength={400}
              style={{ fontSize:'16px', padding:'10px 4px 8px' }}
            />
          </div>
          <button type="submit" disabled={posting || !text.trim()} className="btn-gold"
            style={{ padding:'10px 18px', fontSize:'11px', whiteSpace:'nowrap' }}>
            {posting ? '...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize:'14px', color:'var(--cream-muted)', fontStyle:'italic' }}>
          <a href="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>Inicia sesión</a> para dejar un mensaje
        </p>
      )}
    </div>
  );
}

/* ── Envelope Card ─────────────────────────────── */
function EnvelopeCard({ poem, user, delay }) {
  const [opened, setOpened]      = useState(false);
  const [liked, setLiked]        = useState(poem.user_liked);
  const [likeCount, setCount]    = useState(Number(poem.like_count));
  const [showComments, setShowC] = useState(false);
  const [animHeart, setAnimH]    = useState(false);

  const handleOpen  = () => setOpened(true);
  const handleClose = e => { e.stopPropagation(); setOpened(false); setShowC(false); };

  const handleLike = async e => {
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }

    setAnimH(true);
    setTimeout(() => setAnimH(false), 400);
    const prev = liked;
    setLiked(!prev);
    setCount(c => prev ? c - 1 : c + 1);

    const res = await api(`/api/poems/${poem.id}/like`, { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      setLiked(d.liked);
      setCount(d.count);
    } else {
      // Revert optimistic update
      setLiked(prev);
      setCount(c => prev ? c + 1 : c - 1);
      if (res.status === 401) window.location.href = '/login';
    }
  };

  return (
    <div className="fade-in" style={{ animationDelay: `${delay}s` }}>
      {!opened ? (
        /* ── Closed envelope ── */
        <div className="envelope-scene" onClick={handleOpen} role="button" aria-label="Abrir carta">
          <div className="envelope-body">
            <div className="env-flap" />
            <div className="env-flap-bottom" />
            <div className="wax-seal">♥</div>
            <div style={{ textAlign:'center', zIndex:2 }}>
              <h3 style={{
                fontFamily:'Cinzel,serif', fontSize:'clamp(13px,2vw,16px)',
                letterSpacing:'3px', textTransform:'uppercase',
                color:'var(--gold-light)', marginBottom:'10px',
                textShadow:'0 0 12px rgba(201,148,58,0.3)'
              }}>
                {poem.title}
              </h3>
              <p className="envelope-hint">Toca para abrir</p>
            </div>
            <div style={{ display:'flex', gap:'18px', zIndex:2 }}>
              <span style={{ fontSize:'13px', color: liked ? '#e07090':'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'5px' }}>
                {liked ? '❤' : '♡'} {likeCount > 0 ? likeCount : ''}
              </span>
              <span style={{ fontSize:'13px', color:'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'5px' }}>
                💬 {Number(poem.comment_count) > 0 ? poem.comment_count : ''}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Open letter ── */
        <div className="envelope-scene">
          <div style={{ position:'relative' }}>
            <div className="env-flap opened" />
          </div>
          <div className="letter-paper">
            <div className="letter-content">
              {/* Close button */}
              <button onClick={handleClose} style={{
                position:'absolute', top:'16px', right:'20px', background:'none',
                border:'none', cursor:'pointer', color:'var(--cream-muted)',
                fontSize:'20px', lineHeight:1, zIndex:10,
                transition:'color 0.2s', fontFamily:'serif'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--crimson)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--cream-muted)'}
              title="Cerrar">✕</button>

              {/* Title */}
              <div style={{ textAlign:'center', marginBottom:'28px' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'3px',
                  textTransform:'uppercase', color:'var(--crimson)', marginBottom:'14px' }}>
                  ✦ Para Victoria ✦
                </p>
                <h2 style={{
                  fontFamily:'Playfair Display,serif', fontSize:'clamp(22px,4vw,30px)',
                  fontStyle:'italic', color:'var(--letter-text)', fontWeight:400
                }}>
                  {poem.title}
                </h2>
                <div style={{ width:'50px', height:'1px', margin:'14px auto 0',
                  background:'linear-gradient(90deg,transparent,var(--crimson),transparent)' }} />
              </div>

              {/* Poem */}
              <p style={{
                fontFamily:'EB Garamond,serif',
                fontSize:'clamp(17px,2.5vw,20px)',
                lineHeight:2.05, color:'var(--letter-text)',
                whiteSpace:'pre-line', fontStyle:'italic',
                fontWeight:400, textAlign:'center', letterSpacing:'0.2px',
              }}>
                {poem.content}
              </p>

              {/* Actions */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                gap:'20px', marginTop:'28px', paddingTop:'20px',
                borderTop:'1px solid rgba(139,26,47,0.15)'
              }}>
                <button onClick={handleLike} style={{
                  background: liked ? 'rgba(139,26,47,0.1)' : 'transparent',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'7px',
                  fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'1.5px',
                  textTransform:'uppercase', padding:'8px 16px', borderRadius:'1px',
                  color: liked ? 'var(--crimson)' : 'var(--cream-muted)',
                  transition:'background 0.2s, color 0.2s',
                }}>
                  <span style={{
                    fontSize:'20px', lineHeight:1, display:'inline-block',
                    transform: animHeart ? 'scale(1.5)' : 'scale(1)',
                    transition:'transform 0.2s',
                    color: liked ? '#c94060' : 'inherit'
                  }}>
                    {liked ? '❤' : '♡'}
                  </span>
                  {likeCount > 0 ? `${likeCount} ` : ''}Me gusta
                </button>

                <div style={{ width:'1px', height:'20px', background:'rgba(139,26,47,0.2)' }} />

                <button onClick={e => { e.stopPropagation(); setShowC(v => !v); }} style={{
                  background:'none', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'7px',
                  fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'1.5px',
                  textTransform:'uppercase', padding:'8px 16px',
                  color: showComments ? 'var(--gold)' : 'var(--cream-muted)',
                  transition:'color 0.2s',
                }}>
                  <span style={{ fontSize:'16px', lineHeight:1 }}>✉</span>
                  {showComments ? 'Ocultar' : 'Comentar'}
                </button>
              </div>

              {showComments && <CommentSection poemId={poem.id} user={user} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────── */
export default function HomePage() {
  const [user, setUser]    = useState(null);
  const [poems, setPoems]  = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    // credentials: 'include' is critical — sends the session cookie
    Promise.all([
      api('/api/auth/me').then(r => r.json()),
      api('/api/poems').then(r => r.json()),
    ]).then(([u, p]) => {
      setUser(u.user || null);
      setPoems(p.poems || []);
      setLoad(false);
    }).catch(() => setLoad(false));
  }, []);

  // Keep session alive
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      api('/api/auth/heartbeat', { method: 'POST' });
    }, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <>
      <div className="bg-luxury" />
      <AmbientParticles />
      <div className="gold-top-line" />

      {/* Nav */}
      <nav className="luxury-nav">
        <a href="/" className="nav-logo">Victoria</a>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {user ? (
            <>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'16px',
                fontStyle:'italic', color:'var(--cream-muted)' }}>
                {user.name}
              </span>
              {user.isAdmin && (
                <a href="/admin" style={{ textDecoration:'none' }}>
                  <button className="btn-ghost" style={{ padding:'8px 14px', fontSize:'10px' }}>
                    ✦ Admin
                  </button>
                </a>
              )}
              <button onClick={logout} className="btn-ghost" style={{ padding:'8px 14px', fontSize:'10px' }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{ textDecoration:'none' }}>
                <button className="btn-ghost" style={{ padding:'8px 16px', fontSize:'10px' }}>Entrar</button>
              </a>
              <a href="/register" style={{ textDecoration:'none' }}>
                <button className="btn-gold" style={{ padding:'8px 18px', fontSize:'10px' }}>
                  Unirme
                </button>
              </a>
            </>
          )}
        </div>
      </nav>

      <main className="page-content" style={{ paddingTop:'64px' }}>
        {/* Hero */}
        <section style={{
          textAlign:'center', padding:'clamp(60px,10vw,110px) 20px clamp(40px,6vw,70px)',
          position:'relative', overflow:'hidden'
        }}>
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:'600px', height:'300px',
            background:'radial-gradient(ellipse, rgba(139,26,47,0.12) 0%, transparent 65%)',
            pointerEvents:'none'
          }} />

          <p style={{
            fontFamily:'Cinzel,serif', fontSize:'clamp(10px,1.5vw,12px)',
            letterSpacing:'5px', textTransform:'uppercase',
            color:'var(--crimson-soft)', marginBottom:'22px'
          }}>
            ✦ &nbsp; Un espacio de amor &nbsp; ✦
          </p>

          <h1 className="hero-title" style={{ marginBottom:'24px' }}>Victoria</h1>

          <div className="divider-gold" style={{ marginBottom:'24px' }}>
            <span>♥</span>
          </div>

          <p style={{
            fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(17px,2.5vw,22px)',
            fontStyle:'italic', color:'var(--cream-dim)',
            maxWidth:'500px', margin:'0 auto', lineHeight:1.8
          }}>
            Cada carta guarda un sentimiento.<br />
            Ábrelas y encuentra lo que el corazón escribe.
          </p>

          {!user && (
            <div style={{ marginTop:'36px', display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/register" style={{ textDecoration:'none' }}>
                <button className="btn-gold" style={{ fontSize:'12px', padding:'14px 36px' }}>
                  Crear mi cuenta
                </button>
              </a>
              <a href="/login" style={{ textDecoration:'none' }}>
                <button className="btn-ghost" style={{ fontSize:'12px', padding:'14px 28px' }}>
                  Ya tengo cuenta
                </button>
              </a>
            </div>
          )}
        </section>

        {/* Section label */}
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <p style={{
            fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'4px',
            textTransform:'uppercase', color:'var(--cream-muted)'
          }}>
            ✦ &nbsp; Cartas de amor &nbsp; ✦
          </p>
        </div>

        {/* Envelopes */}
        <section style={{
          maxWidth:'760px', margin:'0 auto',
          padding:'0 clamp(16px,4vw,32px) 100px',
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap:'24px'
        }}>
          {loading ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 0', color:'var(--cream-muted)' }}>
              <div style={{ fontSize:'36px', marginBottom:'16px', opacity:0.5 }}>✉</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'20px', fontStyle:'italic' }}>
                Preparando las cartas...
              </p>
            </div>
          ) : poems.length === 0 ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--cream-muted)' }}>
              <p>Visita <code>/api/init</code> para inicializar el contenido.</p>
            </div>
          ) : (
            poems.map((poem, i) => (
              <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.08} />
            ))
          )}
        </section>

        {/* Footer */}
        <footer style={{
          textAlign:'center', padding:'28px 20px 40px',
          borderTop:'1px solid var(--gold-border)'
        }}>
          <p style={{
            fontFamily:'Cormorant Garamond,serif', fontSize:'16px',
            fontStyle:'italic', color:'var(--cream-muted)'
          }}>
            Hecho con amor, para ti. &nbsp;♥
          </p>
        </footer>
      </main>
    </>
  );
}
