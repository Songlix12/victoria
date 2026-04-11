'use client';
import { useState, useEffect } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

function AmbientParticles() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <div key={`p${i}`} className="particle" style={{
          left: `${Math.random() * 100}%`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          animationDuration: `${12 + Math.random() * 16}s`,
          animationDelay: `${Math.random() * 14}s`,
        }} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <div key={`h${i}`} className="floating-heart" style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${14 + Math.random() * 14}s`,
          animationDelay: `${Math.random() * 16}s`,
          fontSize: `${12 + Math.random() * 8}px`,
        }}>♥</div>
      ))}
    </div>
  );
}

function CommentSection({ poemId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

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
    <div className="mt-4 pt-3 border-t border-white/10">
      <p className="text-[10px] tracking-wider text-white-muted uppercase mb-2">✎ Mensajes</p>
      {loading ? (
        <p className="text-sm italic text-white-muted">Cargando...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-2 mb-3">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="flex gap-2 items-baseline">
                <span className="text-xs font-semibold text-wine-light">{c.user_name}</span>
                <span className="text-[10px] text-white-muted">{new Date(c.created_at).toLocaleDateString('es-ES')}</span>
              </div>
              <p className="text-sm text-gray-800">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-white-muted mb-2">Sé la primera en dejar tu huella...</p>
      )}
      {user ? (
        <form onSubmit={submit} className="flex gap-2 items-end">
          <input className="luxury-input flex-1 text-sm py-1" value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe lo que sientes..."
            maxLength={400}
          />
          <button type="submit" disabled={posting || !text.trim()} className="btn-wine text-xs py-1.5 px-3">
            {posting ? '...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-white-muted"><a href="/login" className="text-wine-light">Inicia sesión</a> para comentar</p>
      )}
    </div>
  );
}

function EnvelopeCard({ poem, user, delay }) {
  const [opened, setOpened] = useState(false);
  const [liked, setLiked] = useState(poem.user_liked);
  const [likeCount, setCount] = useState(Number(poem.like_count));
  const [showComments, setShowC] = useState(false);
  const [animHeart, setAnimH] = useState(false);

  const handleLike = async e => {
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    setAnimH(true); setTimeout(() => setAnimH(false), 300);
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
        <div className="envelope-scene" onClick={() => setOpened(true)}>
          <div className="envelope-body">
            <div className="env-flap" />
            <div className="env-flap-bottom" />
            <div className="wax-seal">✧</div>
            <div className="text-center">
              <h3 className="font-sans text-sm font-medium tracking-wide text-white">{poem.title}</h3>
              <p className="envelope-hint mt-1">abrir carta</p>
            </div>
            <div className="flex gap-4 text-xs text-white-muted">
              <span className={liked ? 'text-wine-light' : ''}>{liked ? '♥' : '♡'} {likeCount > 0 && likeCount}</span>
              <span>✎ {Number(poem.comment_count) > 0 && poem.comment_count}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="envelope-scene">
          <div className="relative"><div className="env-flap opened" /></div>
          <div className="letter-paper">
            <div className="letter-content">
              <button onClick={() => { setOpened(false); setShowC(false); }} className="absolute top-2 right-3 text-gray-500 hover:text-wine text-xl">✕</button>
              <div className="text-center mb-4">
                <p className="text-[10px] tracking-wider text-wine uppercase">✧ Para Victoria ✧</p>
                <h2 className="font-serif text-xl italic text-gray-800">{poem.title}</h2>
                <div className="divider-wine" />
              </div>
              <p className="font-serif text-base leading-relaxed text-gray-700 whitespace-pre-line text-center">{poem.content}</p>
              <div className="flex justify-center gap-4 mt-5 pt-3 border-t border-gray-200">
                <button onClick={handleLike} className={`flex items-center gap-1 text-xs uppercase tracking-wide ${liked ? 'text-wine' : 'text-gray-500'}`}>
                  <span className="text-base">{liked ? '♥' : '♡'}</span> {likeCount > 0 && likeCount} Me gusta
                </button>
                <button onClick={() => setShowC(!showComments)} className={`flex items-center gap-1 text-xs uppercase tracking-wide ${showComments ? 'text-wine' : 'text-gray-500'}`}>
                  <span>✎</span> {showComments ? 'Ocultar' : 'Comentar'}
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

function TabContent({ activeTab, user, poems, loading }) {
  if (activeTab === 'cartas') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white-muted">✧ Cargando cartas...</div>
        ) : poems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white-muted">No hay cartas aún. Visita /api/init</div>
        ) : (
          poems.map((poem, i) => <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.05} />)
        )}
      </div>
    );
  }
  if (activeTab === 'girasoles') {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-5xl mb-4">✧🌻✧</div>
        <h2 className="font-serif text-3xl italic text-white mb-3">Como los girasoles</h2>
        <p className="text-white-dim leading-relaxed">
          Los girasoles buscan la luz, igual que yo te busco a ti, Victoria. Lealtad, calidez y admiración eterna.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mt-6">
          <div className="bg-black-card p-3 rounded-xl border border-white/10">
            <span className="text-2xl">✧</span>
            <p className="text-xs mt-1 text-white-muted">Lealtad</p>
          </div>
          <div className="bg-black-card p-3 rounded-xl border border-white/10">
            <span className="text-2xl">☀️</span>
            <p className="text-xs mt-1 text-white-muted">Luz propia</p>
          </div>
        </div>
      </div>
    );
  }
  if (activeTab === 'poema') {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="bg-black-card/60 p-8 rounded-xl border border-white/10">
          <p className="font-serif text-xl italic text-white leading-relaxed">
            “Si pudiera escribirte con luz de luna<br />
            cada palabra que el corazón me dicta,<br />
            llenaría el mar sin dejar ninguna<br />
            de las razones por las que me conquista.”
          </p>
          <p className="text-xs tracking-wider text-wine-light mt-5">— Un verso para Victoria —</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
  const [loading, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
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
    const id = setInterval(() => authFetch('/api/auth/heartbeat', { method: 'POST' }), 30000);
    return () => clearInterval(id);
  }, [user]);

  const logout = async () => {
    clearToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    setShowHero(false);
  };
  const goToHero = () => {
    setActiveTab(null);
    setShowHero(true);
  };

  return (
    <>
      <div className="bg-luxury" />
      <AmbientParticles />
      <div className="gold-top-line" />

      <nav className="luxury-nav">
        <button onClick={goToHero} className="nav-logo">Victoria</button>
        <div className="flex gap-4 md:gap-6 ml-auto mr-4">
          {['cartas', 'girasoles', 'poema'].map(tab => (
            <button key={tab} onClick={() => handleTab(tab)}
              className={`text-xs tracking-wide uppercase transition-colors ${activeTab === tab ? 'text-wine-light border-b border-wine-light' : 'text-white-muted hover:text-white'}`}
              style={{ fontFamily: 'Inter, sans-serif', paddingBottom: '4px' }}>
              {tab === 'cartas' && '✧ Cartas'}
              {tab === 'girasoles' && '✧ Girasoles'}
              {tab === 'poema' && '✧ Verso'}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-sm text-white-muted">{user.name}</span>
              {user.isAdmin && <a href="/admin"><button className="btn-outline text-xs py-1 px-3">Admin</button></a>}
              <button onClick={logout} className="btn-outline text-xs py-1 px-3">Salir</button>
            </>
          ) : (
            <>
              <a href="/login"><button className="btn-outline text-xs py-1.5 px-4">Entrar</button></a>
              <a href="/register"><button className="btn-wine text-xs py-1.5 px-4">Unirme</button></a>
            </>
          )}
        </div>
      </nav>

      <main className="pt-20">
        {showHero && (
          <section className="text-center px-4 py-16 md:py-24">
            <p className="text-xs tracking-[4px] text-wine-light uppercase mb-3">✦ Un espacio de amor ✦</p>
            <h1 className="hero-title">Victoria</h1>
            <div className="divider-wine mx-auto my-4" />
            <p className="font-serif text-lg italic text-white-dim max-w-xl mx-auto leading-relaxed">
              Cada carta guarda un sentimiento.<br />
              Ábrelas y encuentra lo que el corazón escribe.
            </p>
            {!user && (
              <div className="flex gap-3 justify-center mt-6">
                <a href="/register"><button className="btn-wine text-sm py-2 px-6">Crear mi cuenta</button></a>
                <a href="/login"><button className="btn-outline text-sm py-2 px-6">Ya tengo cuenta</button></a>
              </div>
            )}
          </section>
        )}

        {activeTab && (
          <div className="max-w-4xl mx-auto px-4 pb-20">
            <TabContent activeTab={activeTab} user={user} poems={poems} loading={loading} />
          </div>
        )}

        <footer className="text-center py-6 border-t border-white/10 text-xs text-white-muted">
          Hecho con amor, para ti. ♥
        </footer>
      </main>
    </>
  );
}