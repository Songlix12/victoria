'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

/* ── Ambient Particles ── */
function AmbientParticles() {
  const colors = ['#ffffff', '#b23a4e', '#8b1a2f', '#c9a96e'];
  return (
    <div aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => {
        const s = 1.2 + Math.random() * 2.5;
        return (
          <div key={`p${i}`} className="particle" style={{
            left: `${Math.random() * 100}%`,
            width: `${s}px`, height: `${s}px`,
            background: colors[i % 4],
            animationDuration: `${13 + Math.random() * 16}s`,
            animationDelay: `${Math.random() * 15}s`,
          }} />
        );
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <div key={`h${i}`} className="floating-heart" style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${15 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 18}s`,
          fontSize: `${10 + Math.random() * 7}px`,
          color: i % 2 === 0 ? '#b23a4e' : '#c9a96e',
          opacity: 0.6,
        }}>♥</div>
      ))}
    </div>
  );
}

/* ── SVG Icons ── */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.7 21C9.19 20 18 17 21 10c-3.86-.86-7.25-2.89-7.25-2.89" />
    <path d="M5 22s2-8 9-10" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ── Modal Letter ── */
function LetterModal({ poem, user, onClose }) {
  const [liked, setLiked] = useState(poem.user_liked);
  const [likeCount, setLikeCount] = useState(Number(poem.like_count));
  const [animHeart, setAnimHeart] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    authFetch(`/api/poems/${poem.id}/comments`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setLoadingComments(false); });
    return () => { document.body.style.overflow = ''; };
  }, [poem.id]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 260);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleLike = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setAnimHeart(true); setTimeout(() => setAnimHeart(false), 400);
    const prev = liked;
    setLiked(!prev); setLikeCount(c => prev ? c - 1 : c + 1);
    const res = await authFetch(`/api/poems/${poem.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (res.ok) { const d = await res.json(); setLiked(d.liked); setLikeCount(d.count); }
    else { setLiked(prev); setLikeCount(c => prev ? c + 1 : c - 1); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    const res = await authFetch(`/api/poems/${poem.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim() }),
    });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    if (data.comment) { setComments(p => [...p, data.comment]); setText(''); }
    setPosting(false);
  };

  return (
    <div className={`modal-overlay${closing ? ' closing' : ''}`} onClick={handleOverlayClick}>
      <div className={`modal-card${closing ? ' closing' : ''}`} role="dialog" aria-modal="true">
        <button onClick={handleClose} className="modal-close" aria-label="Cerrar">✕</button>

        <div className="modal-inner">
          <p className="modal-eyebrow">✦ Para Victoria ✦</p>
          <h2 className="modal-title">{poem.title}</h2>

          <div className="modal-divider">
            <span className="modal-divider-icon">♥</span>
          </div>

          <p className="modal-content">{poem.content}</p>

          {/* Action bar */}
          <div className="modal-actions">
            <button
              onClick={handleLike}
              className={`modal-like-btn${liked ? ' liked' : ''}`}
              title={liked ? 'Quitar like' : 'Me gusta'}
            >
              <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: animHeart ? 'scale(1.4)' : 'scale(1)' }}>
                <HeartIcon filled={liked} />
              </span>
              {likeCount > 0 ? likeCount : ''} me gusta
            </button>

            <div className="modal-views">
              <EyeIcon />
              {Number(poem.view_count) || Math.floor(Math.random() * 40) + 5}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="modal-comment-label">Tus palabras</p>
            {loadingComments ? (
              <p className="modal-comment-empty">...</p>
            ) : comments.length > 0 ? (
              <div className="modal-comment-list" style={{ marginBottom: 14 }}>
                {comments.map(c => (
                  <div key={c.id} className="modal-comment-item">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
                      <span className="modal-comment-author">{c.user_name}</span>
                      <span className="modal-comment-date">
                        {new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="modal-comment-text">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="modal-comment-empty">Sé la primera en dejar tu huella aquí...</p>
            )}
            {user ? (
              <form onSubmit={submitComment} className="modal-comment-form">
                <input
                  className="modal-comment-input"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Escribe lo que sientes..."
                  maxLength={400}
                />
                <button type="submit" disabled={posting || !text.trim()} className="modal-comment-submit">
                  {posting ? '...' : 'Enviar'}
                </button>
              </form>
            ) : (
              <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
                <a href="/login" style={{ color: 'var(--wine)', textDecoration: 'underline' }}>Inicia sesión</a> para dejar un mensaje
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Envelope Card ── */
function EnvelopeCard({ poem, user, delay, onOpen }) {
  const [liked, setLiked] = useState(poem.user_liked);
  const [likeCount, setLikeCount] = useState(Number(poem.like_count));
  const [animHeart, setAnimHeart] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    setAnimHeart(true); setTimeout(() => setAnimHeart(false), 400);
    const prev = liked;
    setLiked(!prev); setLikeCount(c => prev ? c - 1 : c + 1);
    const res = await authFetch(`/api/poems/${poem.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (res.ok) { const d = await res.json(); setLiked(d.liked); setLikeCount(d.count); }
    else { setLiked(prev); setLikeCount(c => prev ? c + 1 : c - 1); }
  };

  return (
    <div ref={cardRef} className="reveal" style={{ transitionDelay: `${delay}s` }}>
      <div className="envelope-scene" onClick={() => onOpen(poem)}>
        <div className="envelope-body">
          <div className="env-flap" />
          <div className="env-flap-bottom" />
          <div className="wax-seal">♥</div>
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 13, fontWeight: 600,
              color: 'white', letterSpacing: '0.3px', marginBottom: 4
            }}>{poem.title}</h3>
            <p className="envelope-hint">Toca para abrir</p>
          </div>
          <div style={{ display: 'flex', gap: 14, zIndex: 10, marginTop: 4 }}>
            <button
              onClick={handleLike}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'Montserrat,sans-serif', fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                color: liked ? 'var(--wine-light)' : 'var(--gray-muted)',
                transition: 'color 0.2s' }}
            >
              <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: animHeart ? 'scale(1.4)' : 'scale(1)', fontSize: 13 }}>
                {liked ? '❤' : '♡'}
              </span>
              {likeCount > 0 ? likeCount : ''}
            </button>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'Montserrat,sans-serif', fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--gray-muted)'
            }}>
              ✉ {Number(poem.comment_count) > 0 ? poem.comment_count : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Girasoles Section ── */
function GirasolesSection() {
  const parallaxRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.classList.add('visible');
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const rect = parallaxRef.current.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      parallaxRef.current.style.transform = `translateY(${(progress - 0.5) * 30}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const qualities = [
    { icon: <SunIcon />, label: 'Luz propia', desc: 'Como el sol que llevas dentro' },
    { icon: <LeafIcon />, label: 'Lealtad', desc: 'Firme en cada estación' },
    { icon: <StarIcon />, label: 'Admiración', desc: 'Sin palabras para describir' },
    { icon: <SunIcon />, label: 'Alegría', desc: 'Que ilumina todo a su paso' },
  ];

  return (
    <div ref={sectionRef} className="reveal" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div ref={parallaxRef} style={{
        position: 'absolute', inset: -40, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)',
        transition: 'transform 0.1s linear',
      }} />

      <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20, opacity: 0.8 }}>
        — La flor que te define —
      </p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,5vw,40px)', fontStyle: 'italic', fontWeight: 400, color: 'white', marginBottom: 20, lineHeight: 1.25 }}>
        Como los girasoles que amas
      </h2>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 15, color: 'rgba(216,213,208,0.75)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 40px' }}>
        Siempre buscan la luz, igual que mi corazón te busca a ti, Victoria.
        Son la flor de la lealtad, la alegría y la admiración. Por eso cada vez que veo uno,
        me acuerdo de tu sonrisa que ilumina todo a su alrededor.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, maxWidth: 400, margin: '0 auto' }}>
        {qualities.map((q, i) => (
          <div key={i} style={{
            background: 'rgba(201,169,110,0.04)',
            border: '1px solid rgba(201,169,110,0.12)',
            borderRadius: 18, padding: '20px 16px',
            transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.28)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div className="girasoles-icon">{q.icon}</div>
            <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>{q.label}</p>
            <p style={{ fontFamily: "'Lora',serif", fontSize: 12, color: 'rgba(216,213,208,0.55)', fontStyle: 'italic' }}>{q.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Verso Section ── */
function VersoSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('visible'); }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--wine-light)', marginBottom: 40, opacity: 0.65 }}>
        — Un verso para ti —
      </p>

      <div style={{ position: 'relative', marginBottom: 32 }}>
        <span style={{
          position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Playfair Display',serif",
          fontSize: 96, lineHeight: 1, color: 'var(--wine)', opacity: 0.06,
          fontStyle: 'italic', userSelect: 'none', pointerEvents: 'none',
        }}>"</span>
        <p className="verso-quote">
          Si pudiera escribirte con luz de luna<br />
          cada palabra que el corazón me dicta,<br />
          llenaría el mar sin dejar ninguna<br />
          de las razones por las que me conquista.
        </p>
      </div>

      <div style={{ width: 48, height: 1, background: 'linear-gradient(90deg,transparent,rgba(139,26,47,0.4),transparent)', margin: '0 auto 20px' }} />
      <p className="verso-attribution">— Para Victoria —</p>
      <p style={{ fontFamily: "'Lora',serif", fontSize: 13, fontStyle: 'italic', color: 'rgba(216,213,208,0.4)', marginTop: 14 }}>
        Un pequeño verso entre tantos que nacen al pensar en ti.
      </p>
    </div>
  );
}

/* ── Tab Content ── */
function TabContent({ activeTab, user, poems, loading, onOpenPoem }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) ref.current.classList.add('visible'); }, { threshold: 0.05 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, [activeTab]);

  if (activeTab === 'cartas') {
    return (
      <div ref={ref} className="reveal">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--wine-light)', marginBottom: 12, opacity: 0.7 }}>
            — Cartas escritas con el corazón —
          </p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,4vw,36px)', fontStyle: 'italic', color: 'white', fontWeight: 400 }}>
            Palabras para ti
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--gray-muted)' }}>
              <p style={{ fontFamily: "'Lora',serif", fontSize: 16, fontStyle: 'italic', opacity: 0.5 }}>Preparando las cartas...</p>
            </div>
          ) : poems.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, color: 'var(--gray-muted)' }}>
                Visita <code style={{ color: 'var(--wine-light)' }}>/api/init</code> para inicializar.
              </p>
            </div>
          ) : (
            poems.map((poem, i) => (
              <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.06} onOpen={onOpenPoem} />
            ))
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'girasoles') return <GirasolesSection />;
  if (activeTab === 'poema') return <VersoSection />;
  return null;
}

/* ── Main Page ── */
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [loading, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [showHero, setShowHero] = useState(true);
  const [openPoem, setOpenPoem] = useState(null);
  const heroRef = useRef(null);

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
    const id = setInterval(() => authFetch('/api/auth/heartbeat', { method: 'POST' }), 30000);
    return () => clearInterval(id);
  }, [user]);

  // Hero reveal
  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('.reveal');
    setTimeout(() => els.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 100);
    }), 50);
  }, [showHero]);

  const logout = async () => {
    clearToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleTabClick = (tab) => { setActiveTab(tab); setShowHero(false); };
  const goToHero = () => { setActiveTab(null); setShowHero(true); };

  return (
    <>
      <div className="bg-luxury" />
      <AmbientParticles />
      <div className="gold-top-line" />

      {/* NAV */}
      <nav className="luxury-nav">
        <button onClick={goToHero} className="nav-logo">Victoria</button>

        <div style={{ display: 'flex', gap: 28, marginLeft: 'auto', marginRight: 28 }}>
          {[['cartas', 'Cartas'], ['girasoles', 'Girasoles'], ['poema', 'Verso']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`nav-link${activeTab === tab ? ' active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontFamily: 'Lora,serif', fontSize: 13, fontStyle: 'italic', color: 'rgba(216,213,208,0.7)' }}>{user.name}</span>
              {user.isAdmin && (
                <a href="/admin">
                  <button className="btn-secondary" style={{ fontSize: 10, padding: '7px 16px' }}>Admin</button>
                </a>
              )}
              <button onClick={logout} className="btn-secondary" style={{ fontSize: 10, padding: '7px 16px' }}>Salir</button>
            </>
          ) : (
            <>
              <a href="/login"><button className="btn-secondary" style={{ fontSize: 10, padding: '7px 18px' }}>Entrar</button></a>
              <a href="/register"><button className="btn-primary" style={{ fontSize: 10, padding: '7px 18px' }}>Unirme</button></a>
            </>
          )}
        </div>
      </nav>

      <div className="page-content" style={{ paddingTop: 68 }}>
        {showHero && (
          <section ref={heroRef} style={{ textAlign: 'center', padding: 'clamp(48px,10vw,100px) 24px clamp(56px,8vw,80px)' }}>
            <p className="reveal hero-eyebrow">✦ Un espacio de amor ✦</p>
            <h1 className="reveal hero-title" style={{ transitionDelay: '0.1s' }}>Victoria</h1>

            <div className="reveal" style={{ transitionDelay: '0.2s', margin: '24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12))' }} />
              <span style={{ color: 'var(--wine-light)', fontSize: 12, opacity: 0.8 }}>♥</span>
              <div style={{ width: 60, height: 1, background: 'linear-gradient(270deg,transparent,rgba(255,255,255,0.12))' }} />
            </div>

            <p className="reveal" style={{
              fontFamily: "'Lora',serif", fontSize: 'clamp(16px,2.5vw,20px)',
              fontStyle: 'italic', color: 'rgba(216,213,208,0.65)',
              maxWidth: 480, margin: '0 auto', lineHeight: 1.7,
              transitionDelay: '0.3s',
            }}>
              Cada carta guarda un sentimiento.<br />Ábrelas y encuentra lo que el corazón escribe.
            </p>

            {!user && (
              <div className="reveal" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, transitionDelay: '0.4s' }}>
                <a href="/register"><button className="btn-primary" style={{ padding: '11px 28px' }}>Crear mi cuenta</button></a>
                <a href="/login"><button className="btn-secondary" style={{ padding: '11px 28px' }}>Ya tengo cuenta</button></a>
              </div>
            )}

            {/* Quick nav tiles */}
            <div className="reveal" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap', transitionDelay: '0.5s' }}>
              {[
                { tab: 'cartas', label: 'Cartas', sub: 'Palabras escritas para ti', icon: '✉' },
                { tab: 'girasoles', label: 'Girasoles', sub: 'La flor que te define', icon: '✦' },
                { tab: 'poema', label: 'Verso', sub: 'Una línea de amor', icon: '◈' },
              ].map(({ tab, label, sub, icon }) => (
                <button key={tab} onClick={() => handleTabClick(tab)} style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20, padding: '20px 24px',
                  textAlign: 'center', cursor: 'pointer', minWidth: 140,
                  transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,26,47,0.3)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 28px rgba(139,26,47,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <p style={{ fontSize: 22, marginBottom: 8, color: 'var(--wine-light)', opacity: 0.8 }}>{icon}</p>
                  <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'white', marginBottom: 5 }}>{label}</p>
                  <p style={{ fontFamily: "'Lora',serif", fontSize: 11, fontStyle: 'italic', color: 'rgba(216,213,208,0.45)' }}>{sub}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab && (
          <section style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>
            <TabContent
              activeTab={activeTab} user={user}
              poems={poems} loading={loading}
              onOpenPoem={setOpenPoem}
            />
          </section>
        )}

        <footer style={{ textAlign: 'center', padding: '28px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>
            Hecho con amor, para ti ♥
          </p>
        </footer>
      </div>

      {/* LETTER MODAL */}
      {openPoem && (
        <LetterModal
          poem={openPoem}
          user={user}
          onClose={() => setOpenPoem(null)}
        />
      )}
    </>
  );
}