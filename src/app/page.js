'use client';
import { useState, useEffect } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

/* ── Ambient particles (solo corazones) ── */
function AmbientParticles() {
  const golds = ['#c9943a','#e2b55a','#f0cc7a','#d4a843'];
  return (
    <div aria-hidden="true">
      {Array.from({length:18},(_,i) => {
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
      {Array.from({length:12},(_,i) => (
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

/* ── Comment section (compacto) ── */
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
    <div style={{ marginTop:'16px', paddingTop:'12px', borderTop:'1px solid rgba(201,148,58,0.12)' }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'2px',
        textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'8px' }}>
        Tus palabras
      </p>
      {loading ? (
        <p style={{ color:'var(--cream-muted)', fontSize:'12px', fontStyle:'italic' }}>...</p>
      ) : comments.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'10px' }}>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div style={{ display:'flex', gap:'6px', alignItems:'baseline', marginBottom:'2px' }}>
                <span style={{ fontFamily:'Cinzel,serif', fontSize:'9px', color:'var(--gold)', letterSpacing:'1px' }}>
                  {c.user_name}
                </span>
                <span style={{ fontSize:'9px', color:'var(--cream-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
                </span>
              </div>
              <p style={{ color:'var(--letter-text)', fontSize:'13px', lineHeight:1.4,
                fontFamily:'EB Garamond,serif' }}>{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color:'var(--cream-muted)', fontSize:'12px', fontStyle:'italic', marginBottom:'10px' }}>
          Sé la primera en dejar tu huella aquí...
        </p>
      )}
      {user ? (
        <form onSubmit={submit} style={{ display:'flex', gap:'6px', alignItems:'flex-end' }}>
          <div style={{ flex:1 }}>
            <input className="luxury-input" value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe lo que sientes..."
              maxLength={400}
              style={{ fontSize:'12px', padding:'6px 4px 4px' }} />
          </div>
          <button type="submit" disabled={posting || !text.trim()} className="btn-gold"
            style={{ padding:'6px 10px', fontSize:'9px', whiteSpace:'nowrap' }}>
            {posting ? '...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize:'11px', color:'var(--cream-muted)', fontStyle:'italic' }}>
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
              <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'11px',
                letterSpacing:'2px', textTransform:'uppercase',
                color:'var(--gold-light)', marginBottom:'4px',
                textShadow:'0 0 6px rgba(201,148,58,0.3)' }}>
                {poem.title}
              </h3>
              <p className="envelope-hint">Toca para abrir</p>
            </div>
            <div style={{ display:'flex', gap:'12px', zIndex:2, marginTop:'2px' }}>
              <span style={{ fontSize:'11px', color: liked ? '#e07090':'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'3px' }}>
                {liked ? '❤' : '♡'} {likeCount > 0 ? likeCount : ''}
              </span>
              <span style={{ fontSize:'11px', color:'var(--cream-muted)',
                display:'flex', alignItems:'center', gap:'3px' }}>
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
                position:'absolute', top:'10px', right:'12px', background:'none',
                border:'none', cursor:'pointer', color:'var(--cream-muted)',
                fontSize:'16px', lineHeight:1, zIndex:10, transition:'color 0.2s'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--crimson)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--cream-muted)'}>✕</button>

              <div style={{ textAlign:'center', marginBottom:'16px' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'2px',
                  textTransform:'uppercase', color:'var(--crimson)', marginBottom:'8px' }}>
                  ✦ Para Victoria ✦
                </p>
                <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'16px',
                  fontStyle:'italic', color:'var(--letter-text)', fontWeight:400 }}>
                  {poem.title}
                </h2>
                <div style={{ width:'30px', height:'1px', margin:'8px auto 0',
                  background:'linear-gradient(90deg,transparent,var(--crimson),transparent)' }} />
              </div>

              <p style={{ fontFamily:'EB Garamond,serif', fontSize:'14px',
                lineHeight:1.6, color:'var(--letter-text)', whiteSpace:'pre-line',
                fontStyle:'italic', fontWeight:400, textAlign:'center', letterSpacing:'0.1px' }}>
                {poem.content}
              </p>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:'12px', marginTop:'18px', paddingTop:'12px',
                borderTop:'1px solid rgba(139,26,47,0.15)' }}>
                <button onClick={handleLike} style={{
                  background: liked ? 'rgba(139,26,47,0.1)' : 'transparent',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'4px',
                  fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1px',
                  textTransform:'uppercase', padding:'4px 10px', borderRadius:'1px',
                  color: liked ? 'var(--crimson)' : 'var(--cream-muted)',
                  transition:'background 0.2s, color 0.2s',
                }}>
                  <span style={{ fontSize:'14px', lineHeight:1, display:'inline-block',
                    transform: animHeart ? 'scale(1.3)' : 'scale(1)',
                    transition:'transform 0.2s',
                    color: liked ? '#c94060' : 'inherit' }}>
                    {liked ? '❤' : '♡'}
                  </span>
                  {likeCount > 0 ? `${likeCount} ` : ''}Me gusta
                </button>

                <div style={{ width:'1px', height:'14px', background:'rgba(139,26,47,0.2)' }} />

                <button onClick={e => { e.stopPropagation(); setShowC(v => !v); }} style={{
                  background:'none', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:'4px',
                  fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1px',
                  textTransform:'uppercase', padding:'4px 10px',
                  color: showComments ? 'var(--gold)' : 'var(--cream-muted)',
                  transition:'color 0.2s',
                }}>
                  <span style={{ fontSize:'12px', lineHeight:1 }}>✉</span>
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

/* ── Contenido de las pestañas (sin la barra de tabs) ── */
function TabContent({ activeTab, user, poems, loading }) {
  if (activeTab === 'cartas') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-cream-muted">
            <div className="text-3xl mb-2 opacity-50">✉</div>
            <p className="font-cormorant text-lg italic">Preparando las cartas...</p>
          </div>
        ) : poems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p>Visita <code className="text-gold">/api/init</code> para inicializar el contenido.</p>
          </div>
        ) : (
          poems.map((poem, i) => (
            <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.05} />
          ))
        )}
      </div>
    );
  }

  if (activeTab === 'girasoles') {
    return (
      <div className="max-w-3xl mx-auto text-center py-8 px-4">
        <div className="text-6xl mb-6">🌻🌻🌻</div>
        <h2 className="font-playfair text-3xl italic text-gold-light mb-4">Como los girasoles que amas</h2>
        <p className="font-garamond text-lg text-cream-dim leading-relaxed">
          Los girasoles siempre buscan la luz, igual que mi corazón te busca a ti, Victoria.
          Son la flor de la lealtad, la alegría y la admiración. Por eso cada vez que veo uno,
          me acuerdo de tu sonrisa que ilumina todo a su alrededor.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-black-card p-3 rounded-lg border border-gold-border">
            <span className="text-3xl">✨</span>
            <p className="text-sm font-cinzel text-gold mt-1">Lealtad</p>
          </div>
          <div className="bg-black-card p-3 rounded-lg border border-gold-border">
            <span className="text-3xl">☀️</span>
            <p className="text-sm font-cinzel text-gold mt-1">Luz propia</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'poema') {
    return (
      <div className="max-w-2xl mx-auto text-center py-8 px-4">
        <div className="bg-black-card/50 p-8 rounded-lg border border-gold-border">
          <p className="font-cormorant text-2xl italic text-cream leading-relaxed">
            “Si pudiera escribirte con luz de luna<br />
            cada palabra que el corazón me dicta,<br />
            llenaría el mar sin dejar ninguna<br />
            de las razones por las que me conquista.”
          </p>
          <p className="font-cinzel text-xs tracking-wider text-gold mt-6">— Para Victoria —</p>
          <div className="w-12 h-px bg-gold mx-auto mt-4"></div>
          <p className="font-garamond text-cream-muted text-sm mt-4">
            Un pequeño verso entre tantos que nacen al pensar en ti.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/* ── MAIN PAGE (héroe solo en inicio, tabs muestran contenido) ── */
export default function HomePage() {
  const [user, setUser]    = useState(null);
  const [poems, setPoems]  = useState([]);
  const [loading, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState(null); // null = mostrar héroe
  const [showHero, setShowHero] = useState(true);

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

  // Manejador para cambiar de pestaña
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowHero(false);
  };

  // Volver al héroe (al hacer clic en el logo)
  const goToHero = () => {
    setActiveTab(null);
    setShowHero(true);
  };

  return (
    <>
      <div className="bg-luxury" />
      <AmbientParticles />
      <div className="gold-top-line" />

      {/* Barra de navegación con logo, pestañas y botones de usuario */}
      <nav className="luxury-nav">
        <button onClick={goToHero} className="nav-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          Victoria
        </button>

        {/* Pestañas de navegación integradas */}
        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto', marginRight: '1rem' }}>
          <button
            onClick={() => handleTabClick('cartas')}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: activeTab === 'cartas' ? 'var(--gold-light)' : 'var(--cream-muted)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              borderBottom: activeTab === 'cartas' ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            📜 Cartas
          </button>
          <button
            onClick={() => handleTabClick('girasoles')}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: activeTab === 'girasoles' ? 'var(--gold-light)' : 'var(--cream-muted)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              borderBottom: activeTab === 'girasoles' ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            🌻 Girasoles
          </button>
          <button
            onClick={() => handleTabClick('poema')}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: activeTab === 'poema' ? 'var(--gold-light)' : 'var(--cream-muted)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              borderBottom: activeTab === 'poema' ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            ✨ Verso
          </button>
        </div>

        {/* Botones de usuario */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {user ? (
            <>
              <span className="font-cormorant text-base italic text-cream-muted">{user.name}</span>
              {user.isAdmin && (
                <a href="/admin">
                  <button className="btn-ghost" style={{ padding:'5px 10px', fontSize:'9px' }}>✦ Admin</button>
                </a>
              )}
              <button onClick={logout} className="btn-ghost" style={{ padding:'5px 10px', fontSize:'9px' }}>Salir</button>
            </>
          ) : (
            <>
              <a href="/login"><button className="btn-ghost" style={{ padding:'5px 12px', fontSize:'9px' }}>Entrar</button></a>
              <a href="/register"><button className="btn-gold" style={{ padding:'5px 14px', fontSize:'9px' }}>Unirme</button></a>
            </>
          )}
        </div>
      </nav>

      <div className="page-content" style={{ paddingTop: '80px' }}>
        {/* Hero: solo se muestra si showHero es true */}
        {showHero && (
          <section style={{ textAlign:'center', padding:'clamp(40px,6vw,70px) 20px clamp(30px,4vw,50px)' }}>
            <p className="font-cinzel text-xs tracking-[4px] text-crimson-soft mb-3">✦ UN ESPACIO DE AMOR ✦</p>
            <h1 className="hero-title">Victoria</h1>
            <div className="divider-gold my-4"><span>♥</span></div>
            <p className="font-cormorant text-xl italic text-cream-dim max-w-xl mx-auto leading-relaxed">
              Cada carta guarda un sentimiento.<br />
              Ábrelas y encuentra lo que el corazón escribe.
            </p>
            {!user && (
              <div className="flex gap-3 justify-center mt-6">
                <a href="/register"><button className="btn-gold text-sm py-2 px-5">Crear mi cuenta</button></a>
                <a href="/login"><button className="btn-ghost text-sm py-2 px-5">Ya tengo cuenta</button></a>
              </div>
            )}
          </section>
        )}

        {/* Contenido dinámico según la pestaña activa (solo si hay una pestaña seleccionada) */}
        {activeTab && (
          <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 70px' }}>
            <TabContent activeTab={activeTab} user={user} poems={poems} loading={loading} />
          </section>
        )}

        <footer className="text-center py-6 border-t border-gold-border">
          <p className="font-cormorant text-sm italic text-cream-muted">
            Hecho con amor, para ti. ♥
          </p>
        </footer>
      </div>
    </>
  );
}