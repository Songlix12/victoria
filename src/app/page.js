'use client';
import { useState, useEffect } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

function AmbientParticles() {
  const colors = ['#ffffff', '#b23a4e', '#8b1a2f'];
  return (
    <div aria-hidden="true">
      {Array.from({length:20},(_,i) => {
        const s = 1.5 + Math.random() * 3;
        return (
          <div key={`p${i}`} className="particle" style={{
            left:`${Math.random()*100}%`,
            width:`${s}px`, height:`${s}px`,
            background: colors[i%3],
            animationDuration:`${12+Math.random()*16}s`,
            animationDelay:`${Math.random()*14}s`,
          }} />
        );
      })}
      {Array.from({length:10},(_,i) => (
        <div key={`h${i}`} className="floating-heart" style={{
          left:`${Math.random()*100}%`,
          animationDuration:`${14+Math.random()*12}s`,
          animationDelay:`${Math.random()*16}s`,
          fontSize:`${10+Math.random()*8}px`,
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
      <p className="font-inter text-[10px] tracking-wider uppercase text-gray-400 mb-2">Tus palabras</p>
      {loading ? (
        <p className="text-gray-400 text-sm italic">...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-2 mb-3">
          {comments.map(c => (
            <div key={c.id} className="border-l-2 border-wine/30 pl-3">
              <div className="flex gap-2 items-baseline mb-0.5">
                <span className="font-inter text-[11px] font-semibold text-wine-light">{c.user_name}</span>
                <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
              </div>
              <p className="text-[13px] text-letter-text leading-tight">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic mb-3">Sé la primera en dejar tu huella aquí...</p>
      )}
      {user ? (
        <form onSubmit={submit} className="flex gap-2 items-end">
          <input className="luxury-input flex-1 text-sm py-1 px-0" value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe lo que sientes..."
            maxLength={400}
          />
          <button type="submit" disabled={posting || !text.trim()} className="btn-primary text-xs py-2 px-4 rounded-full">
            {posting ? '...' : 'Enviar'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-400 italic">
          <a href="/login" className="text-wine-light">Inicia sesión</a> para dejar un mensaje
        </p>
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
        <div className="envelope-scene" onClick={() => setOpened(true)}>
          <div className="envelope-body">
            <div className="env-flap" />
            <div className="env-flap-bottom" />
            <div className="wax-seal">♥</div>
            <div className="text-center z-10">
              <h3 className="font-playfair text-[12px] font-semibold text-white tracking-wide mb-1">{poem.title}</h3>
              <p className="envelope-hint">Toca para abrir</p>
            </div>
            <div className="flex gap-3 z-10 mt-1 text-[11px] text-gray-400">
              <span className={`flex items-center gap-1 ${liked ? 'text-wine-light' : ''}`}>
                {liked ? '❤' : '♡'} {likeCount > 0 ? likeCount : ''}
              </span>
              <span className="flex items-center gap-1">💬 {Number(poem.comment_count) > 0 ? poem.comment_count : ''}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="envelope-scene">
          <div className="relative">
            <div className="env-flap opened" />
          </div>
          <div className="letter-paper">
            <div className="letter-content">
              <button onClick={e => { e.stopPropagation(); setOpened(false); setShowC(false); }} className="absolute top-3 right-4 text-gray-400 hover:text-wine text-lg leading-none z-10">
                ✕
              </button>
              <div className="text-center mb-4">
                <p className="font-inter text-[9px] tracking-wider uppercase text-wine mb-2">✦ Para Victoria ✦</p>
                <h2 className="font-playfair text-lg italic text-letter-text">{poem.title}</h2>
                <div className="w-8 h-px bg-wine/30 mx-auto mt-2" />
              </div>
              <p className="font-garamond text-sm leading-relaxed text-letter-text text-center whitespace-pre-line">
                {poem.content}
              </p>
              <div className="flex justify-center gap-4 mt-5 pt-3 border-t border-wine/10">
                <button onClick={handleLike} className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${liked ? 'text-wine-light' : 'text-gray-500'}`}>
                  <span className={`text-base ${animHeart ? 'scale-125' : ''} transition-transform`}>{liked ? '❤' : '♡'}</span>
                  {likeCount > 0 ? `${likeCount} ` : ''}Me gusta
                </button>
                <div className="w-px h-3 bg-gray-600" />
                <button onClick={() => setShowC(!showComments)} className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${showComments ? 'text-wine-light' : 'text-gray-500'}`}>
                  ✉ {showComments ? 'Ocultar' : 'Comentar'}
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
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-3xl mb-2 opacity-50">✉</div>
            <p className="font-cormorant text-lg italic">Preparando las cartas...</p>
          </div>
        ) : poems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p>Visita <code className="text-wine-light">/api/init</code> para inicializar el contenido.</p>
          </div>
        ) : (
          poems.map((poem, i) => <EnvelopeCard key={poem.id} poem={poem} user={user} delay={i * 0.05} />)
        )}
      </div>
    );
  }
  if (activeTab === 'girasoles') {
    return (
      <div className="max-w-2xl mx-auto text-center py-8 px-4">
        <div className="text-6xl mb-4">🌻🌻🌻</div>
        <h2 className="font-playfair text-3xl italic text-white mb-3">Como los girasoles que amas</h2>
        <p className="font-inter text-base text-gray-300 leading-relaxed">
          Los girasoles siempre buscan la luz, igual que mi corazón te busca a ti, Victoria.
          Son la flor de la lealtad, la alegría y la admiración. Por eso cada vez que veo uno,
          me acuerdo de tu sonrisa que ilumina todo a su alrededor.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="bg-black/40 p-3 rounded-xl border border-white/10">
            <span className="text-2xl">✨</span>
            <p className="text-xs font-inter text-white mt-1">Lealtad</p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10">
            <span className="text-2xl">☀️</span>
            <p className="text-xs font-inter text-white mt-1">Luz propia</p>
          </div>
        </div>
      </div>
    );
  }
  if (activeTab === 'poema') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 px-4">
        <div className="bg-black/30 p-6 rounded-2xl border border-white/10">
          <p className="font-cormorant text-xl italic text-white leading-relaxed">
            “Si pudiera escribirte con luz de luna<br />
            cada palabra que el corazón me dicta,<br />
            llenaría el mar sin dejar ninguna<br />
            de las razones por las que me conquista.”
          </p>
          <p className="font-inter text-xs tracking-wider text-wine-light mt-4">— Para Victoria —</p>
          <div className="w-8 h-px bg-wine/50 mx-auto my-3" />
          <p className="font-inter text-gray-400 text-sm">Un pequeño verso entre tantos que nacen al pensar en ti.</p>
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
    const id = setInterval(() => {
      authFetch('/api/auth/heartbeat', { method: 'POST' });
    }, 30000);
    return () => clearInterval(id);
  }, [user]);

  const logout = async () => {
    clearToken();
    await authFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleTabClick = (tab) => {
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
        <button onClick={goToHero} className="nav-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          Victoria
        </button>

        <div className="flex gap-5 ml-auto mr-4">
          <button onClick={() => handleTabClick('cartas')} className={`font-inter text-[11px] tracking-wide uppercase transition-all ${activeTab === 'cartas' ? 'text-white border-b-2 border-wine-light' : 'text-gray-400 hover:text-white'}`}>
            📜 Cartas
          </button>
          <button onClick={() => handleTabClick('girasoles')} className={`font-inter text-[11px] tracking-wide uppercase transition-all ${activeTab === 'girasoles' ? 'text-white border-b-2 border-wine-light' : 'text-gray-400 hover:text-white'}`}>
            🌻 Girasoles
          </button>
          <button onClick={() => handleTabClick('poema')} className={`font-inter text-[11px] tracking-wide uppercase transition-all ${activeTab === 'poema' ? 'text-white border-b-2 border-wine-light' : 'text-gray-400 hover:text-white'}`}>
            ✨ Verso
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="font-inter text-sm italic text-gray-300">{user.name}</span>
              {user.isAdmin && <a href="/admin"><button className="btn-secondary text-xs py-1.5 px-3">✦ Admin</button></a>}
              <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Salir</button>
            </>
          ) : (
            <>
              <a href="/login"><button className="btn-secondary text-xs py-1.5 px-4">Entrar</button></a>
              <a href="/register"><button className="btn-primary text-xs py-1.5 px-4">Unirme</button></a>
            </>
          )}
        </div>
      </nav>

      <div className="page-content pt-20">
        {showHero && (
          <section className="text-center px-5 py-12 md:py-20">
            <p className="font-inter text-[11px] tracking-[4px] text-wine-light mb-4">✦ UN ESPACIO DE AMOR ✦</p>
            <h1 className="hero-title">Victoria</h1>
            <div className="divider-wine my-5"><span>♥</span></div>
            <p className="font-cormorant text-xl italic text-gray-300 max-w-xl mx-auto leading-relaxed">
              Cada carta guarda un sentimiento.<br />
              Ábrelas y encuentra lo que el corazón escribe.
            </p>
            {!user && (
              <div className="flex gap-3 justify-center mt-8">
                <a href="/register"><button className="btn-primary text-sm py-2 px-6">Crear mi cuenta</button></a>
                <a href="/login"><button className="btn-secondary text-sm py-2 px-6">Ya tengo cuenta</button></a>
              </div>
            )}
          </section>
        )}

        {activeTab && (
          <section className="max-w-4xl mx-auto px-5 pb-20">
            <TabContent activeTab={activeTab} user={user} poems={poems} loading={loading} />
          </section>
        )}

        <footer className="text-center py-6 border-t border-white/10">
          <p className="font-inter text-sm text-gray-500">Hecho con amor, para ti. ♥</p>
        </footer>
      </div>
    </>
  );
}