'use client';
import { useState, useEffect } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

/* ── Ambient particles ── */
function AmbientParticles() {
  const golds = ['#c9943a','#e2b55a','#f0cc7a','#d4a843'];
  return (
    <div aria-hidden="true">
      {Array.from({length:22},(_,i) => {
        const s = 1.5 + Math.random() * 3;
        return (
          <div key={`p${i}`} className="particle" style={{
            left:`${Math.random()*100}%`,
            width:`${s}px`, height:`${s}px`,
            background: golds[i%4],
            animationDuration:`${10+Math.random()*16}s`,
            animationDelay:`${Math.random()*14}s`,
          }} />
        );
      })}
      {Array.from({length:10},(_,i) => (
        <div key={`h${i}`} className="floating-heart" style={{
          left:`${Math.random()*100}%`,
          animationDuration:`${12+Math.random()*14}s`,
          animationDelay:`${Math.random()*16}s`,
          fontSize:`${10+Math.random()*8}px`,
        }}>♥</div>
      ))}
    </div>
  );
}

/* ── Comment section ── */
function CommentSection({ poemId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);

  useEffect(() => {
    authFetch(`/api/poems/${poemId}/comments`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setLoading(false); });
  }, [poemId]);

  const submit = async e => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    const res = await authFetch(`/api/poems/${poemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim() })
    });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    if (data.comment) { setComments(p => [...p, data.comment]); setText(''); }
    setPosting(false);
  };

  return (
    <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(201,148,58,0.12)' }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'2px',
        textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'12px' }}>
        Tus palabras
      </p>
      {loading ? (
        <p style={{ color:'var(--cream-muted)', fontSize:'13px', fontStyle:'italic' }}>...</p>
      ) : comments.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' }}>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div style={{ display:'flex', gap:'8px', alignItems:'baseline', marginBottom:'2px' }}>
                <span style={{ fontFamily:'Cinzel,serif', fontSize:'10px', color:'var(--gold)', letterSpacing:'1px' }}>
                  {c.user_name}
                </span>
                <span style={{ fontSize:'10px', color:'var(--cream-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
                </span>
              </div>
              <p style={{ color:'var(--letter-text)', fontSize:'14px', lineHeight:1.5,
                fontFamily:'EB Garamond,serif' }}>{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color:'var(--cream-muted)', fontSize:'13px', fontStyle:'italic', marginBottom:'12px' }}>
          Sé la primera en dejar tu huella aquí...
        </p>
      )}
      {user ? (
        <form onSubmit={submit} style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
          <div style={{ flex:1 }}>
            <input className="luxury-input" value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe lo que sientes..."
              maxLength={400}
              style={{ fontSize:'14px', padding:'8px 4px 6px' }} />
          </div>
          <button type="submit" disabled={posting || !text.trim()} className="btn-gold"
            style={{ padding:'8px 14px', fontSize:'10px', whiteSpace:'nowrap' }}>
            {posting ? '...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize:'12px', color:'var(--cream-muted)', fontStyle:'italic' }}>
          <a href="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>Inicia sesión</a> para dejar un mensaje
        </p>
      )}
    </div>
  );
}

/* ── Envelope Card (más pequeña) ── */
function EnvelopeCard({ poem, user, delay }) {
  const [opened, setOpened]      = useState(false);
  const [liked, setLiked]        = useState(poem.user_liked);
  const [likeCount, setCount]    = useState(Number(poem.like_count));
  const [showComments, setShowC] = useState(false);
  const [animHeart, setAnimH]    = useState(false);

  const handleLike = async e => {
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    setAnimH(true); setTimeout(() => setAnimH(false), 400);
    const prev = liked;
    setLiked(!prev); setCount(c => prev ? c - 1 : c + 1);
    const res = await authFetch(`/api/poems/${poem.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (res.ok) {
      const d = await res.json();
      setLiked(d.liked); setCount(d.count);
    } else {
      setLiked(prev); setCount(c => prev ? c + 1 : c - 1);
    }
  };

  return (
    <div className="fade-in" style={{ animationDelay: `${delay}s` }}>
      {!opened ? (
        <div className="envelope-scene" onClick={() => setOpened(true)} role="button">
          <div className="envelope-body">
            <div className="env-flap" />
            <div className="env-flap-bottom" />
            <div className="wax-seal">♥</div>
            <div style={{ textAlign:'center', zIndex:2 }}>
              <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(12px,1.8vw,14px)',
                letterSpacing:'2px', textTransform:'uppercase',
                color:'var(--gold-light)', marginBottom:'6px',
                textShadow:'0 0 8px rgba(201,148,58,0.3)' }}>
                {poem.title}
              </h3>
              <p className="envelope-hint">Toca para abrir</p>
            </div>
            <div style={{ display:'flex', gap:'14px', zIndex:2, marginTop:'4px' }}>
              <span style={{ fontSize:'12px', color: liked ? '#e07090':'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'4px' }}>
                {liked ? '❤' : '♡'} {likeCount > 0 ? likeCount : ''}
              </span>
              <span style={{ fontSize:'12px', color:'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'4px' }}>
                💬 {Number(poem.comment_count) > 0 ? poem.comment_count : ''}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="envelope-scene">
          <div style={{ position:'relative' }}>
            <div className="env-flap opened" />
          </div>
          <div className="letter-paper">
            <div className="letter-content">
              <button onClick={e => { e.stopPropagation(); setOpened(false); setShowC(false); }} style={{
                position:'absolute', top:'12px', right:'16px', background:'none',
                border:'none', cursor:'pointer', color:'var(--cream-muted)',
                fontSize:'18px', lineHeight:1, zIndex:10, transition:'color 0.2s'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--crimson)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--cream-muted)'}>✕</button>

              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'2px',
                  textTransform:'uppercase', color:'var(--crimson)', marginBottom:'10px' }}>
                  ✦ Para Victoria ✦
                </p>
                <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(18px,3vw,24px)',
                  fontStyle:'italic', color:'var(--letter-text)', fontWeight:400 }}>
                  {poem.title}
                </h2>
                <div style={{ width:'40px', height:'1px', margin:'10px auto 0',
                  background:'linear-gradient(90deg,transparent,var(--crimson),transparent)' }} />
              </div>

              <p style={{ fontFamily:'EB Garamond,serif', fontSize:'clamp(15px,2vw,17px)',
                lineHeight:1.8, color:'var(--letter-text)', whiteSpace:'pre-line',
                fontStyle:'italic', fontWeight:400, textAlign:'center', letterSpacing:'0.2px' }}>
                {poem.content}
              </p>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:'16px', marginTop:'24px', paddingTop:'16px',
                borderTop:'1px solid rgba(139,26,47,0.15)' }}>
                <button onClick={handleLike} style={{
                  background: liked ? 'rgba(139,26,47,0.1)' : 'transparent',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'6px',
                  fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'1px',
                  textTransform:'uppercase', padding:'6px 12px', borderRadius:'1px',
                  color: liked ? 'var(--crimson)' : 'var(--cream-muted)',
                  transition:'background 0.2s, color 0.2s',
                }}>
                  <span style={{ fontSize:'16px', lineHeight:1, display:'inline-block',
                    transform: animHeart ? 'scale(1.4)' : 'scale(1)',
                    transition:'transform 0.2s',
                    color: liked ? '#c94060' : 'inherit' }}>
                    {liked ? '❤' : '♡'}
                  </span>
                  {likeCount > 0 ? `${likeCount} ` : ''}Me gusta
                </button>

                <div style={{ width:'1px', height:'16px', background:'rgba(139,26,47,0.2)' }} />

                <button onClick={e => { e.stopPropagation(); setShowC(v => !v); }} style={{
                  background:'none', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'6px',
                  fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'1px',
                  textTransform:'uppercase', padding:'6px 12px',
                  color: showComments ? 'var(--gold)' : 'var(--cream-muted)',
                  transition:'color 0.2s',
                }}>
                  <span style={{ fontSize:'14px', lineHeight:1 }}>✉</span>
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

/* ── Componente Pestaña bonita (Tab) ── */
function Pestana() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <div className="flex">
          <div className="bg-gradient-to-r from-[#1a0e06] to-[#2c1a0c] px-8 py-2 rounded-t-md border-b-0 border-t border-l border-r border-[rgba(201,148,58,0.3)] shadow-lg z-10">
            <span className="font-cinzel text-[11px] tracking-[3px] text-gold-light uppercase">Cartas de amor</span>
          </div>
          <div className="w-12 h-8 bg-gradient-to-tr from-transparent via-[#1a0e06] to-[#1a0e06] rounded-t-md border-b-0 border-t border-r border-[rgba(201,148,58,0.2)] opacity-60"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function HomePage() {
  const [user, setUser]    = useState(null);
  const [poems, setPoems]  = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/auth/me').then(r => r.json()),
      authFetch('/api/poems').then(r => r.json()),
    ]).then(([u, p]) => {
      setUser(u.user || null);
      setPoems(p.poems || []);
      setLoad(false);
    }).catch(() => setLoad(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      authFetch('/api/auth/heartbeat', { method: 'POST' });
    }, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const logout = async () => {
    clearToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <>
      <div className="bg-luxury" />
      <AmbientParticles />
      <div className="gold-top-line" />

      <nav className="luxury-nav">
        <a href="/" className="nav-logo">Victoria</a>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {user ? (
            <>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'16px',
                fontStyle:'italic', color:'var(--cream-muted)' }}>{user.name}</span>
              {user.isAdmin && (
                <a href="/admin" style={{ textDecoration:'none' }}>
                  <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:'9px' }}>✦ Admin</button>
                </a>
              )}
              <button onClick={logout} className="btn-ghost" style={{ padding:'6px 12px', fontSize:'9px' }}>Salir</button>
            </>
          ) : (
            <>
              <a href="/login" style={{ textDecoration:'none' }}>
                <button className="btn-ghost" style={{ padding:'6px 14px', fontSize:'9px' }}>Entrar</button>
              </a>
              <a href="/register" style={{ textDecoration:'none' }}>
                <button className="btn-gold" style={{ padding:'6px 16px', fontSize:'9px' }}>Unirme</button>
              </a>
            </>
          )}
        </div>
      </nav>

      <main className="page-content" style={{ paddingTop:'64px' }}>
        {/* Hero */}
        <section style={{ textAlign:'center', padding:'clamp(50px,8vw,90px) 20px clamp(30px,5vw,50px)',
          position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)', width:'500px', height:'250px',
            background:'radial-gradient(ellipse, rgba(139,26,47,0.12) 0%, transparent 65%)',
            pointerEvents:'none' }} />
          <p style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(9px,1.5vw,11px)',
            letterSpacing:'4px', textTransform:'uppercase',
            color:'var(--crimson-soft)', marginBottom:'18px' }}>
            ✦ &nbsp; Un espacio de amor &nbsp; ✦
          </p>
          <h1 className="hero-title" style={{ marginBottom:'20px' }}>Victoria</h1>
          <div className="divider-gold" style={{ marginBottom:'20px' }}><span>♥</span></div>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(16px,2vw,19px)',
            fontStyle:'italic', color:'var(--cream-dim)', maxWidth:'500px',
            margin:'0 auto', lineHeight:1.6 }}>
            Cada carta guarda un sentimiento.<br />
            Ábrelas y encuentra lo que el corazón escribe.
          </p>
          {!user && (
            <div style={{ marginTop:'30px', display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/register" style={{ textDecoration:'none' }}>
                <button className="btn-gold" style={{ fontSize:'11px', padding:'10px 28px' }}>Crear mi cuenta</button>
              </a>
              <a href="/login" style={{ textDecoration:'none' }}>
                <button className="btn-ghost" style={{ fontSize:'11px', padding:'10px 22px' }}>Ya tengo cuenta</button>
              </a>
            </div>
          )}
        </section>

        {/* Pestaña decorativa */}
        <Pestana />

        {/* Grid de cartas (dos columnas) */}
        <section style={{ maxWidth:'900px', margin:'0 auto', padding:'0 20px 80px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--cream-muted)' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px', opacity:0.5 }}>✉</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'18px', fontStyle:'italic' }}>
                Preparando las cartas...
              </p>
            </div>
          ) : poems.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--cream-muted)' }}>
              <p>Visita <code>/api/init</code> para inicializar el contenido.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poems.map((poem, i) => (
                <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.05} />
              ))}
            </div>
          )}
        </section>

        <footer style={{ textAlign:'center', padding:'24px 20px 36px',
          borderTop:'1px solid var(--gold-border)' }}>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'15px',
            fontStyle:'italic', color:'var(--cream-muted)' }}>
            Hecho con amor, para ti. &nbsp;♥
          </p>
        </footer>
      </main>
    </>
  );
}