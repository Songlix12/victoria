'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch, clearToken } from '@/lib/client-auth';

/* ── Particles ── */
function AmbientParticles() {
  const colors = ['#ffffff', '#b23a4e', '#8b1a2f', '#c9a96e'];
  return (
    <div aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const s = 1.2 + Math.random() * 2.2;
        return <div key={`p${i}`} className="particle" style={{ left:`${Math.random()*100}%`, width:`${s}px`, height:`${s}px`, background:colors[i%4], animationDuration:`${13+Math.random()*16}s`, animationDelay:`${Math.random()*15}s` }} />;
      })}
      {Array.from({ length: 7 }, (_, i) => (
        <div key={`h${i}`} className="floating-heart" style={{ left:`${Math.random()*100}%`, animationDuration:`${15+Math.random()*12}s`, animationDelay:`${Math.random()*18}s`, fontSize:`${10+Math.random()*7}px`, color: i%2===0?"#b23a4e":"#c9a96e" }}>♥</div>
      ))}
    </div>
  );
}

const HeartIcon = ({filled}) => (
  <svg viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ── Mobile Nav Menu ── */
function MobileMenu({ activeTab, onTabClick, user, onLogout, onClose }) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{ position:'fixed',inset:0,zIndex:999, background:'rgba(4,4,4,0.85)',backdropFilter:'blur(12px)', display:'flex',alignItems:'flex-start',justifyContent:'flex-end', animation:'overlayIn 0.2s ease' }}>
      <div style={{ background:'rgba(12,12,12,0.97)',border:'1px solid rgba(255,255,255,0.07)', borderLeft:'none',borderTop:'none',borderRadius:'0 0 0 20px', padding:'clamp(20px,6vw,36px)',minWidth:'min(260px,80vw)', display:'flex',flexDirection:'column',gap:8, animation:'slideInRight 0.25s ease' }}>
        <button onClick={onClose} style={{ alignSelf:'flex-end', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:18, cursor:'pointer', marginBottom:8 }}>✕</button>
        {[['cartas','Cartas'],['poema','Verso']].map(([tab,label])=>(
          <button key={tab} onClick={()=>{onTabClick(tab);onClose();}} style={{ fontFamily:'Montserrat,sans-serif',fontSize:'clamp(12px,3vw,14px)',fontWeight:600, letterSpacing:'2px',textTransform:'uppercase', color:activeTab===tab?'white':'rgba(255,255,255,0.4)', background: activeTab===tab?'rgba(139,26,47,0.12)':'none', border:`1px solid ${activeTab===tab?'rgba(139,26,47,0.3)':'transparent'}`, borderRadius:10,padding:'12px 16px',cursor:'pointer',textAlign:'left', transition:'all 0.2s' }}>{label}</button>
        ))}
        <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'8px 0'}}/>
        {user ? (
          <>
            <p style={{fontFamily:"'Lora',serif",fontSize:13,fontStyle:'italic',color:'rgba(216,213,208,0.5)',padding:'0 4px'}}>{user.name}</p>
            {user.isAdmin && <a href="/admin" style={{textDecoration:'none'}}><button className="btn-secondary" style={{width:'100%',fontSize:10,padding:'9px'}}>Admin</button></a>}
            <button onClick={onLogout} className="btn-secondary" style={{fontSize:10,padding:'9px'}}>Salir</button>
          </>
        ) : (
          <>
            <a href="/login" style={{textDecoration:'none'}}><button className="btn-secondary" style={{width:'100%',fontSize:10,padding:'10px'}}>Entrar</button></a>
            <a href="/register" style={{textDecoration:'none'}}><button className="btn-primary" style={{width:'100%',fontSize:10,padding:'10px'}}>Unirme</button></a>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   LETTER MODAL — Diseño hoja carta
   ══════════════════════════════ */
function LetterModal({ poem, user, onClose }) {
  const [liked, setLiked]         = useState(poem.user_liked);
  const [likeCount, setLikeCount] = useState(Number(poem.like_count));
  const [animH, setAnimH]         = useState(false);
  const [comments, setComments]   = useState([]);
  const [loadingC, setLoadingC]   = useState(true);
  const [text, setText]           = useState('');
  const [posting, setPosting]     = useState(false);
  const [closing, setClosing]     = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    authFetch(`/api/poems/${poem.id}/comments`).then(r=>r.json()).then(d=>{setComments(d.comments||[]);setLoadingC(false);});
    return () => { document.body.style.overflow = ''; };
  }, [poem.id]);

  const handleClose = useCallback(() => { setClosing(true); setTimeout(onClose, 260); }, [onClose]);
  const handleOverlay = e => { if (e.target===e.currentTarget) handleClose(); };

  const handleLike = async () => {
    if (!user) { window.location.href='/login'; return; }
    setAnimH(true); setTimeout(()=>setAnimH(false),400);
    const prev=liked; setLiked(!prev); setLikeCount(c=>prev?c-1:c+1);
    const res = await authFetch(`/api/poems/${poem.id}/like`,{method:'POST'});
    if(res.status===401){window.location.href='/login';return;}
    if(res.ok){const d=await res.json();setLiked(d.liked);setLikeCount(d.count);}
    else{setLiked(prev);setLikeCount(c=>prev?c+1:c-1);}
  };

  const submitComment = async e => {
    e.preventDefault();
    if(!text.trim()||posting) return;
    setPosting(true);
    const res = await authFetch(`/api/poems/${poem.id}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:text.trim()})});
    if(res.status===401){window.location.href='/login';return;}
    const data=await res.json();
    if(data.comment){setComments(p=>[...p,data.comment]);setText('');}
    setPosting(false);
  };

  return (
    <>
      <style>{`
        @keyframes letterFadeIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes letterFadeOut{ from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.96) translateY(8px)} }
        .letter-overlay { position:fixed;inset:0;z-index:900;background:rgba(2,0,4,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:clamp(8px,3vw,20px);animation:overlayIn 0.3s ease; }
        .letter-overlay.closing { animation:none;opacity:0;transition:opacity 0.26s ease; }
        .letter-paper {
          position:relative; width:100%; max-width:520px; max-height:92vh; overflow-y:auto;
          animation:letterFadeIn 0.4s cubic-bezier(.22,.68,0,1.15);
          /* Fondo pergamino envejecido */
          background: #f5ead8;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 10% 100%, rgba(180,130,80,0.12) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,140,80,0.06) 27px, rgba(180,140,80,0.06) 28px);
          border-radius:4px 4px 4px 4px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(180,140,80,0.25), inset 0 0 40px rgba(180,130,60,0.08);
        }
        .letter-paper.closing { animation:letterFadeOut 0.26s ease forwards; }

        /* Borde decorativo de la hoja */
        .letter-border {
          position:absolute;inset:10px;pointer-events:none;z-index:0;
          border:1px solid rgba(160,110,60,0.22);
          border-radius:2px;
        }
        .letter-corner {
          position:absolute;width:28px;height:28px;
          border-color:rgba(139,26,47,0.35);border-style:solid;
        }
        .letter-corner.tl { top:18px;left:18px;border-width:2px 0 0 2px; }
        .letter-corner.tr { top:18px;right:18px;border-width:2px 2px 0 0; }
        .letter-corner.bl { bottom:18px;left:18px;border-width:0 0 2px 2px; }
        .letter-corner.br { bottom:18px;right:18px;border-width:0 2px 2px 0; }

        /* Ornamento floral central superior */
        .letter-ornament-top {
          display:flex;align-items:center;justify-content:center;
          gap:8px;padding:24px 24px 0;
          position:relative;z-index:1;
        }
        .letter-ornament-line { flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(139,26,47,0.3),transparent); }
        .letter-ornament-icon { color:rgba(139,26,47,0.6);font-size:14px;line-height:1; }

        /* Contenido principal */
        .letter-body { padding:8px 36px 28px;position:relative;z-index:1; }

        .letter-eyebrow {
          font-family:'Montserrat',sans-serif;font-size:8px;font-weight:600;
          letter-spacing:4px;text-transform:uppercase;
          color:rgba(139,26,47,0.65);text-align:center;margin-bottom:12px;
        }
        .letter-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(22px,5vw,32px);font-weight:500;font-style:italic;
          color:#2c150a;text-align:center;line-height:1.2;margin-bottom:8px;
          text-shadow:0 1px 2px rgba(180,120,60,0.15);
        }
        .letter-divider {
          display:flex;align-items:center;justify-content:center;
          gap:10px;margin:14px auto 20px;
        }
        .letter-divider::before,.letter-divider::after {
          content:'';display:block;height:1px;width:36px;
          background:linear-gradient(90deg,transparent,rgba(139,26,47,0.25));
        }
        .letter-divider::after { background:linear-gradient(270deg,transparent,rgba(139,26,47,0.25)); }
        .letter-divider-heart { color:rgba(139,26,47,0.55);font-size:10px; }

        /* TEXTO PRINCIPAL — tipografía cursiva tipo carta */
        .letter-content {
          font-family:'Dancing Script',cursive;
          font-size:clamp(18px,4vw,22px);
          color:rgba(28,12,6,0.82);
          line-height:2;text-align:center;
          white-space:pre-line;margin-bottom:24px;
          text-shadow:0 1px 1px rgba(180,120,60,0.1);
        }

        /* Separador inferior */
        .letter-footer-ornament {
          display:flex;align-items:center;justify-content:center;
          gap:6px;margin:4px 0 20px;
        }
        .letter-footer-ornament-dot { width:4px;height:4px;border-radius:50%;background:rgba(139,26,47,0.3); }
        .letter-footer-ornament-line { flex:1;height:1px;max-width:50px;background:linear-gradient(90deg,transparent,rgba(139,26,47,0.2),transparent); }

        /* Acciones */
        .letter-actions {
          display:flex;align-items:center;gap:12px;
          padding:14px 0;border-top:1px solid rgba(160,110,60,0.15);
          margin-bottom:16px;
        }
        .letter-like-btn {
          display:flex;align-items:center;gap:6px;
          background:none;border:none;cursor:pointer;
          font-family:'Montserrat',sans-serif;font-size:9px;font-weight:500;
          letter-spacing:1.5px;text-transform:uppercase;
          color:rgba(80,40,20,0.45);transition:color 0.2s;padding:0;
        }
        .letter-like-btn.liked { color:var(--wine); }
        .letter-views {
          font-family:'Montserrat',sans-serif;font-size:9px;font-weight:500;
          letter-spacing:1px;text-transform:uppercase;
          color:rgba(80,40,20,0.3);display:flex;align-items:center;gap:5px;margin-left:auto;
        }

        /* Comentarios */
        .letter-comments-label {
          font-family:'Montserrat',sans-serif;font-size:8px;font-weight:600;
          letter-spacing:2.5px;text-transform:uppercase;
          color:rgba(80,40,20,0.35);margin-bottom:10px;
        }
        .letter-comment-item {
          padding:8px 0 8px 10px;
          border-left:2px solid rgba(139,26,47,0.2);
          margin-bottom:7px;animation:fadeUp 0.2s ease;
        }
        .letter-comment-author { font-family:'Montserrat',sans-serif;font-size:9px;font-weight:600;color:var(--wine); }
        .letter-comment-date { font-family:'Montserrat',sans-serif;font-size:8px;color:rgba(80,40,20,0.3);margin-left:7px; }
        .letter-comment-text { font-family:'Lora',serif;font-size:12px;color:rgba(28,12,6,0.6);line-height:1.5;margin-top:2px; }
        .letter-comment-empty { font-family:'Lora',serif;font-size:13px;font-style:italic;color:rgba(80,40,20,0.35);margin-bottom:10px; }
        .letter-comment-form { display:flex;gap:8px;align-items:flex-end; }
        .letter-comment-input {
          flex:1;background:transparent;border:none;
          border-bottom:1px solid rgba(160,110,60,0.25);
          color:rgba(28,12,6,0.8);font-family:'Montserrat',sans-serif;
          font-size:12px;padding:5px 3px;outline:none;transition:border-color 0.2s;
        }
        .letter-comment-input:focus { border-bottom-color:var(--wine); }
        .letter-comment-input::placeholder { color:rgba(80,40,20,0.3); }
        .letter-comment-submit {
          background:var(--wine);color:white;border:none;border-radius:16px;
          padding:5px 14px;font-family:'Montserrat',sans-serif;font-size:9px;
          font-weight:600;letter-spacing:1px;text-transform:uppercase;
          cursor:pointer;transition:background 0.2s;
        }
        .letter-comment-submit:hover:not(:disabled) { background:var(--wine-light); }
        .letter-comment-submit:disabled { opacity:0.4;cursor:not-allowed; }

        /* Botón cerrar */
        .letter-close {
          position:sticky;top:8px;float:right;
          width:30px;height:30px;border-radius:50%;
          background:rgba(139,26,47,0.08);border:1px solid rgba(139,26,47,0.2);
          color:rgba(80,40,20,0.5);cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:12px;transition:all 0.2s;z-index:10;
          margin:12px 12px 0 0;
        }
        .letter-close:hover { background:rgba(139,26,47,0.15);color:var(--wine);transform:rotate(90deg); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className={`letter-overlay${closing?' closing':''}`} onClick={handleOverlay}>
        <div className={`letter-paper${closing?' closing':''}`}>
          {/* Esquinas decorativas */}
          <div className="letter-border"/>
          <div className="letter-corner tl"/><div className="letter-corner tr"/>
          <div className="letter-corner bl"/><div className="letter-corner br"/>

          {/* Cerrar */}
          <button onClick={handleClose} className="letter-close" aria-label="Cerrar">✕</button>

          {/* Ornamento superior */}
          <div className="letter-ornament-top" style={{marginTop:-28}}>
            <div className="letter-ornament-line"/>
            <span className="letter-ornament-icon">✦ ♥ ✦</span>
            <div className="letter-ornament-line"/>
          </div>

          {/* Cuerpo */}
          <div className="letter-body">
            <p className="letter-eyebrow">✦ Ecos de Amor ✦</p>
            <h2 className="letter-title">{poem.title}</h2>
            <div className="letter-divider"><span className="letter-divider-heart">❧</span></div>
            <p className="letter-content">{poem.content}</p>

            {/* Ornamento footer */}
            <div className="letter-footer-ornament">
              <div className="letter-footer-ornament-line"/>
              <div className="letter-footer-ornament-dot"/>
              <div className="letter-footer-ornament-dot"/>
              <div className="letter-footer-ornament-dot"/>
              <div className="letter-footer-ornament-line"/>
            </div>

            {/* Acciones */}
            <div className="letter-actions">
              <button onClick={handleLike} className={`letter-like-btn${liked?' liked':''}`}>
                <span style={{display:'inline-block',transition:'transform 0.2s',transform:animH?'scale(1.4)':'scale(1)'}}>
                  <HeartIcon filled={liked}/>
                </span>
                {likeCount>0?likeCount:''} me gusta
              </button>
              <div className="letter-views"><EyeIcon/>{Number(poem.view_count)||Math.floor(Math.random()*40)+5}</div>
            </div>

            {/* Comentarios */}
            <div>
              <p className="letter-comments-label">Tus palabras</p>
              {loadingC ? <p className="letter-comment-empty">...</p> : comments.length>0 ? (
                <div style={{marginBottom:12}}>
                  {comments.map(c=>(
                    <div key={c.id} className="letter-comment-item">
                      <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:2}}>
                        <span className="letter-comment-author">{c.user_name}</span>
                        <span className="letter-comment-date">{new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
                      </div>
                      <p className="letter-comment-text">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="letter-comment-empty">Sé la primera en dejar tu huella...</p>}

              {user ? (
                <form onSubmit={submitComment} className="letter-comment-form">
                  <input className="letter-comment-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe lo que sientes..." maxLength={400}/>
                  <button type="submit" disabled={posting||!text.trim()} className="letter-comment-submit">{posting?'...':'Enviar'}</button>
                </form>
              ) : (
                <p style={{fontFamily:'Montserrat,sans-serif',fontSize:10,color:'rgba(80,40,20,0.4)'}}>
                  <a href="/login" style={{color:'var(--wine)',textDecoration:'underline'}}>Inicia sesión</a> para comentar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   LIBRO DE CARTAS
   ══════════════════════════════════════════════ */
function BookSection({ poems = [], loading, onOpen }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipping, setFlipping]   = useState(false);
  const [flipDir, setFlipDir]     = useState('next');
  const [showIndex, setShowIndex] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);

  const goTo = (dir) => {
    const next = dir === 'next'
      ? Math.min(pageIndex + 1, poems.length - 1)
      : Math.max(pageIndex - 1, 0);
    if (next === pageIndex) return;
    setFlipDir(dir); setFlipping(true);
    setTimeout(() => { setPageIndex(next); setFlipping(false); }, 320);
  };

  const goToPage = (idx) => {
    if (idx === pageIndex) { setShowIndex(false); return; }
    setFlipDir(idx > pageIndex ? 'next' : 'prev');
    setFlipping(true);
    setTimeout(() => { setPageIndex(idx); setFlipping(false); setShowIndex(false); }, 320);
  };

  const openBook  = () => { setPageIndex(0); setIsOpen(true); setShowIndex(false); };
  const closeBook = () => { setIsOpen(false); setShowIndex(false); };
  const currentPoem = poems[pageIndex] || null;

  /* ── LOADING SKELETON ── */
  if (loading) return (
    <>
      <style>{`
        @keyframes shimmerGold {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .book-skeleton-shimmer {
          background: linear-gradient(90deg, rgba(201,169,110,0.04) 25%, rgba(201,169,110,0.12) 50%, rgba(201,169,110,0.04) 75%);
          background-size: 800px 100%;
          animation: shimmerGold 2.2s infinite linear;
        }
      `}</style>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'clamp(40px,8vw,80px) 16px',gap:24}}>
        {/* Libro skeleton */}
        <div style={{position:'relative',width:'clamp(150px,26vw,210px)',height:'clamp(210px,36vw,290px)',filter:'drop-shadow(0 24px 44px rgba(0,0,0,0.5))'}}>
          <div style={{position:'absolute',left:14,top:3,width:'calc(100% - 6px)',height:'calc(100% - 4px)',borderRadius:'2px 8px 8px 2px',background:'rgba(201,169,110,0.06)'}} className="book-skeleton-shimmer"/>
          <div style={{position:'absolute',inset:0,borderRadius:'3px 10px 10px 3px',borderLeft:'clamp(6px,1.5vw,10px) solid rgba(10,10,10,0.8)',background:'rgba(20,5,10,0.7)',overflow:'hidden'}} className="book-skeleton-shimmer">
            <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:'60%',height:'3px',borderRadius:2,background:'rgba(201,169,110,0.15)'}} className="book-skeleton-shimmer"/>
            <div style={{position:'absolute',top:'38%',left:'50%',transform:'translateX(-50%)',width:'70%',height:'20px',borderRadius:3,background:'rgba(201,169,110,0.1)'}} className="book-skeleton-shimmer"/>
            <div style={{position:'absolute',top:'58%',left:'50%',transform:'translateX(-50%)',width:'40%',height:'2px',borderRadius:2,background:'rgba(201,169,110,0.1)'}} className="book-skeleton-shimmer"/>
          </div>
        </div>
        {/* Texto elegante */}
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(13px,2vw,15px)',fontStyle:'italic',color:'rgba(201,169,110,0.5)',marginBottom:6}}>
            Abriendo el libro...
          </p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:4,height:4,borderRadius:'50%',background:'rgba(201,169,110,0.4)',animation:`hintPulse ${1.4+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .book-scene {
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          min-height:480px; padding:clamp(20px,5vw,56px) 8px;
        }
        .book-closed-wrap {
          cursor:pointer; display:flex; flex-direction:column;
          align-items:center; gap:22px;
          animation:bookFloat 4s ease-in-out infinite;
        }
        @keyframes bookFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .book-3d {
          position:relative;
          width:clamp(170px,30vw,240px);
          height:clamp(240px,42vw,330px);
          transform:perspective(900px) rotateY(-18deg) rotateX(3deg);
          transition:transform 0.4s ease;
          filter:drop-shadow(0 28px 44px rgba(0,0,0,0.72));
        }
        .book-closed-wrap:hover .book-3d {
          transform:perspective(900px) rotateY(-26deg) rotateX(5deg);
        }
        .b-pg { position:absolute; border-radius:2px 8px 8px 2px; }
        .b-cover {
          position:absolute; inset:0;
          border-radius:3px 10px 10px 3px;
          border-left:clamp(6px,1.5vw,10px) solid #060606;
          overflow:hidden;
        }
        .b-cover img { width:100%; height:100%; object-fit:cover; display:block; }

        /* Shimmer mientras carga la portada */
        .cover-loading-shimmer {
          position:absolute; inset:0;
          background: linear-gradient(90deg, #100208 0%, #1a0610 40%, #100208 100%);
          background-size: 200% 100%;
          animation: shimmerGold 2s infinite linear;
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;
        }

        .b-hint {
          font-family:Montserrat,sans-serif; font-size:10px;
          letter-spacing:3px; text-transform:uppercase;
          color:rgba(178,58,78,0.7);
          animation:hintPulse 2.6s ease-in-out infinite;
        }
        @keyframes hintPulse { 0%,100%{opacity:0.45} 50%{opacity:1} }

        .book-open-wrap {
          width:100%; max-width:980px;
          animation:openIn 0.45s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes openIn {
          from{opacity:0;transform:scale(0.93) translateY(8px)}
          to{opacity:1;transform:scale(1) translateY(0)}
        }
        .b-spread {
          display:flex; border-radius:4px 16px 0 0;
          overflow:hidden; min-height:clamp(380px,58vw,520px);
          filter:drop-shadow(0 32px 60px rgba(0,0,0,0.72));
        }
        .b-left {
          width:40%; flex-shrink:0; position:relative; overflow:hidden;
        }
        .b-left img {
          width:100%; height:100%; object-fit:cover; display:block;
          border-right:1px solid rgba(0,0,0,0.15);
        }
        .b-left-badge {
          position:absolute; bottom:16px; left:50%;
          transform:translateX(-50%);
          font-family:'Playfair Display',Georgia,serif;
          font-size:11px; font-style:italic;
          color:rgba(255,255,255,0.7);
          background:rgba(0,0,0,0.45);
          padding:4px 14px; border-radius:20px;
          backdrop-filter:blur(6px); white-space:nowrap;
        }
        .b-spine { width:clamp(4px,1vw,7px); background:#060606; flex-shrink:0; }
        .b-right {
          flex:1; background:#f6efe3;
          padding:clamp(22px,5vw,46px) clamp(18px,4vw,38px);
          display:flex; flex-direction:column;
          position:relative; overflow:hidden;
        }
        .b-ruled {
          position:absolute; inset:0; pointer-events:none;
          background-image:repeating-linear-gradient(
            transparent,transparent 31px,rgba(0,0,0,0.038) 31px,rgba(0,0,0,0.038) 32px
          );
        }
        .b-eyebrow {
          font-family:Montserrat,sans-serif; font-size:8px;
          letter-spacing:4px; text-transform:uppercase;
          color:#b23a4e; margin-bottom:13px; position:relative; z-index:1;
        }
        .b-ptitle {
          font-family:'Playfair Display',Georgia,serif;
          font-size:clamp(19px,4vw,30px); font-style:italic; font-weight:400;
          color:#160108; margin-bottom:6px; line-height:1.22;
          position:relative; z-index:1;
        }
        .b-pdiv {
          display:flex; align-items:center; gap:8px;
          margin-bottom:18px; position:relative; z-index:1;
        }
        .b-pdivline { flex:1; height:1px; background:rgba(139,26,47,0.18); }
        .b-pheart { color:#b23a4e; font-size:10px; }
        .b-pbody {
          font-family:'Lora',Georgia,serif;
          font-size:clamp(13px,2.4vw,16px); line-height:1.88; color:#26080e;
          flex:1; position:relative; z-index:1; white-space:pre-wrap;
          display:-webkit-box; -webkit-line-clamp:7;
          -webkit-box-orient:vertical; overflow:hidden;
        }
        .b-rbtn {
          font-family:Montserrat,sans-serif; font-size:9px;
          letter-spacing:3px; text-transform:uppercase;
          color:#8b1a2f; background:none;
          border:1px solid rgba(139,26,47,0.28); border-radius:20px;
          padding:9px 20px; cursor:pointer; transition:all 0.25s;
          margin-top:18px; align-self:flex-start; position:relative; z-index:1;
        }
        .b-rbtn:hover { background:rgba(139,26,47,0.07); border-color:rgba(139,26,47,0.48); }
        .b-pnum {
          position:absolute; bottom:14px; right:22px;
          font-family:'Lora',Georgia,serif; font-style:italic;
          font-size:11px; color:rgba(0,0,0,0.22); z-index:1;
        }
        .b-right.flip-next { animation:flipNext 0.32s ease; }
        .b-right.flip-prev { animation:flipPrev 0.32s ease; }
        @keyframes flipNext {
          0%{opacity:1;transform:translateX(0)} 40%{opacity:0;transform:translateX(22px)}
          60%{opacity:0;transform:translateX(-22px)} 100%{opacity:1;transform:translateX(0)}
        }
        @keyframes flipPrev {
          0%{opacity:1;transform:translateX(0)} 40%{opacity:0;transform:translateX(-22px)}
          60%{opacity:0;transform:translateX(22px)} 100%{opacity:1;transform:translateX(0)}
        }

        /* Índice */
        .b-index-panel {
          position:absolute; inset:0;
          background:#f9f3e8;
          padding:clamp(20px,4vw,36px);
          overflow-y:auto; z-index:5;
          animation:openIn 0.3s ease;
        }
        .b-index-title {
          font-family:'Playfair Display',Georgia,serif;
          font-size:clamp(16px,3vw,22px); font-style:italic; font-weight:400;
          color:#160108; margin-bottom:4px; text-align:center;
        }
        .b-index-subtitle {
          font-family:Montserrat,sans-serif; font-size:8px;
          letter-spacing:3px; text-transform:uppercase;
          color:rgba(139,26,47,0.5); text-align:center; margin-bottom:20px;
        }
        .b-index-divider {
          width:40px; height:1px; margin:0 auto 20px;
          background:linear-gradient(90deg,transparent,rgba(139,26,47,0.3),transparent);
        }
        .b-index-item {
          display:flex; align-items:baseline; gap:8px;
          padding:10px 8px; border-radius:8px;
          cursor:pointer; transition:background 0.2s;
          border-bottom:1px solid rgba(139,26,47,0.08);
        }
        .b-index-item:hover { background:rgba(139,26,47,0.06); }
        .b-index-item.active { background:rgba(139,26,47,0.09); }
        .b-index-num {
          font-family:'Lora',Georgia,serif; font-style:italic;
          font-size:12px; color:rgba(139,26,47,0.4);
          min-width:24px; flex-shrink:0;
        }
        .b-index-dots {
          flex:1; border-bottom:1px dotted rgba(139,26,47,0.2);
          margin-bottom:3px;
        }
        .b-index-name {
          font-family:'Playfair Display',Georgia,serif;
          font-size:clamp(13px,2.5vw,16px); font-style:italic;
          color:#2a0810; flex:3;
        }

        /* Navbar */
        .b-navbar { display:flex; border-radius:0 0 16px 0; overflow:hidden; }
        .b-nbleft {
          width:40%; background:#080808; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          padding:clamp(10px,2vw,16px); border-radius:0 0 0 4px; gap:8px;
        }
        .b-nbright {
          flex:1; background:#0d0104;
          display:flex; align-items:center; justify-content:space-between;
          padding:clamp(10px,2vw,16px) clamp(14px,3vw,26px);
          gap:8px; border-radius:0 0 16px 0;
          margin-left:clamp(4px,1vw,7px);
        }
        .b-arrow {
          background:none; border:1px solid rgba(201,169,110,0.18);
          border-radius:50%; width:34px; height:34px;
          display:flex; align-items:center; justify-content:center;
          color:rgba(201,169,110,0.55); font-size:15px;
          cursor:pointer; transition:all 0.2s; flex-shrink:0;
        }
        .b-arrow:hover:not(:disabled) { background:rgba(201,169,110,0.07); border-color:rgba(201,169,110,0.45); color:#c9a96e; }
        .b-arrow:disabled { opacity:0.18; cursor:default; }
        .b-counter { font-family:'Lora',Georgia,serif; font-style:italic; font-size:12px; color:rgba(201,169,110,0.38); flex:1; text-align:center; }
        .b-closebtn { background:none; border:none; color:rgba(255,255,255,0.2); font-size:10px; letter-spacing:2px; font-family:Montserrat,sans-serif; cursor:pointer; transition:color 0.2s; padding:4px; text-transform:uppercase; }
        .b-closebtn:hover { color:rgba(255,255,255,0.48); }
        .b-indexbtn { background:none; border:1px solid rgba(201,169,110,0.18); border-radius:20px; color:rgba(201,169,110,0.5); font-size:9px; letter-spacing:2px; font-family:Montserrat,sans-serif; cursor:pointer; transition:all 0.2s; padding:5px 10px; text-transform:uppercase; white-space:nowrap; }
        .b-indexbtn:hover,.b-indexbtn.active { border-color:rgba(201,169,110,0.45); color:#c9a96e; background:rgba(201,169,110,0.06); }
        .b-empty { font-family:'Lora',Georgia,serif; font-style:italic; color:rgba(201,169,110,0.38); font-size:15px; text-align:center; padding:40px 20px; position:relative; z-index:1; }

        @media(max-width:560px){
          .b-left{display:none} .b-spine{display:none}
          .b-spread{border-radius:4px 14px 0 0}
          .b-nbleft{display:none}
          .b-nbright{border-radius:0 0 14px 14px}
        }
      `}</style>

      <div className="book-scene">

        {/* ─── LIBRO CERRADO ─── */}
        {!isOpen && (
          <div className="book-closed-wrap" onClick={openBook}
            role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&openBook()}
            aria-label="Abrir el libro de cartas"
          >
            <div className="book-3d">
              <div className="b-pg" style={{left:14,top:3,width:'calc(100% - 6px)',height:'calc(100% - 4px)',background:'#c8bfaa'}}/>
              <div className="b-pg" style={{left:10,top:2,width:'calc(100% - 3px)',height:'calc(100% - 2px)',background:'#dbd3be'}}/>
              <div className="b-cover">
                {/* Shimmer mientras carga la imagen */}
                {!coverLoaded && (
                  <div className="cover-loading-shimmer">
                    <div style={{width:'65%',height:2,background:'rgba(201,169,110,0.3)',borderRadius:2}}/>
                    <div style={{width:'50%',height:16,background:'rgba(201,169,110,0.15)',borderRadius:3}}/>
                    <div style={{width:'35%',height:1,background:'rgba(201,169,110,0.2)',borderRadius:2}}/>
                    <div style={{display:'flex',gap:4,marginTop:4}}>
                      {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:'rgba(201,169,110,0.4)',animation:`hintPulse ${1.2+i*0.15}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>)}
                    </div>
                  </div>
                )}
                <img
                  src="/ecos_de_amor.png"
                  alt="Ecos de Amor"
                  style={{opacity: coverLoaded ? 1 : 0, transition:'opacity 0.4s ease'}}
                  onLoad={() => setCoverLoaded(true)}
                />
              </div>
            </div>
            <div className="b-hint">✦ &nbsp; toca para abrir &nbsp; ✦</div>
          </div>
        )}

        {/* ─── LIBRO ABIERTO ─── */}
        {isOpen && (
          <div className="book-open-wrap">
            <div className="b-spread">

              {/* Página izquierda — portada */}
              <div className="b-left">
                <img src="/ecos_de_amor.png" alt="Ecos de Amor"/>
                {poems.length > 0 && (
                  <div className="b-left-badge">{pageIndex+1} / {poems.length}</div>
                )}
              </div>
              <div className="b-spine"/>

              {/* Página derecha — poema + índice */}
              <div className={`b-right${flipping?` flip-${flipDir}`:''}`} style={{position:'relative'}}>
                <div className="b-ruled"/>

                {/* ÍNDICE superpuesto */}
                {showIndex && (
                  <div className="b-index-panel">
                    <p className="b-index-title">Índice de Cartas</p>
                    <p className="b-index-subtitle">✦ Palabras del corazón ✦</p>
                    <div className="b-index-divider"/>
                    {poems.length === 0 ? (
                      <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',color:'rgba(139,26,47,0.4)',textAlign:'center',fontSize:14}}>Aún no hay cartas...</p>
                    ) : poems.map((p, i) => (
                      <div key={p.id} className={`b-index-item${i===pageIndex?' active':''}`} onClick={()=>goToPage(i)}>
                        <span className="b-index-num">{String(i+1).padStart(2,'0')}</span>
                        <span className="b-index-name">{p.title}</span>
                        <div className="b-index-dots"/>
                        <span style={{fontFamily:'Montserrat,sans-serif',fontSize:9,color:'rgba(139,26,47,0.35)',flexShrink:0}}>→</span>
                      </div>
                    ))}
                  </div>
                )}

                {currentPoem ? (
                  <>
                    <p className="b-eyebrow">✦ Ecos de Amor ✦</p>
                    <h2 className="b-ptitle">{currentPoem.title}</h2>
                    <div className="b-pdiv">
                      <div className="b-pdivline"/><span className="b-pheart">♥</span><div className="b-pdivline"/>
                    </div>
                    <p className="b-pbody">{currentPoem.content}</p>
                    <button className="b-rbtn" onClick={()=>onOpen&&onOpen(currentPoem)}>
                      Leer carta completa →
                    </button>
                    <span className="b-pnum">{pageIndex+1}</span>
                  </>
                ) : (
                  <p className="b-empty">Aún no hay cartas escritas...<br/>Sé la primera ✦</p>
                )}
              </div>
            </div>

            {/* Navbar */}
            <div className="b-navbar">
              <div className="b-nbleft" style={{gap:10}}>
                <button className="b-closebtn" onClick={closeBook}>✕ cerrar</button>
                <button className={`b-indexbtn${showIndex?' active':''}`} onClick={()=>setShowIndex(v=>!v)}>
                  {showIndex ? '✕ índice' : '☰ índice'}
                </button>
              </div>
              <div className="b-nbright">
                <button className="b-arrow" onClick={()=>goTo('prev')} disabled={pageIndex===0} aria-label="Anterior">‹</button>
                <span className="b-counter">{poems.length>0?`${pageIndex+1} de ${poems.length}`:'—'}</span>
                <button className="b-arrow" onClick={()=>goTo('next')} disabled={pageIndex>=poems.length-1} aria-label="Siguiente">›</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Verso ── */
function VersoSection() {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)el.classList.add('visible')},{threshold:0.15});
    obs.observe(el); return()=>obs.disconnect();
  },[]);
  return (
    <div ref={ref} className="reveal" style={{maxWidth:580,margin:'0 auto',textAlign:'center',padding:'clamp(36px,7vw,56px) clamp(12px,4vw,24px)'}}>
      <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(7px,1.3vw,9px)',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',color:'var(--wine-light)',marginBottom:32,opacity:0.6}}>
        — Un verso para ti —
      </p>
      <div style={{position:'relative',marginBottom:28}}>
        <span style={{position:'absolute',top:-20,left:'50%',transform:'translateX(-50%)',fontFamily:"'Playfair Display',serif",fontSize:'clamp(60px,15vw,96px)',lineHeight:1,color:'var(--wine)',opacity:0.055,fontStyle:'italic',userSelect:'none',pointerEvents:'none'}}>"</span>
        <p className="verso-quote" style={{fontSize:'clamp(18px,4.5vw,40px)',padding:'0 clamp(8px,2vw,16px)'}}>
          Si pudiera escribirte con luz de luna<br/>
          cada palabra que el corazón me dicta,<br/>
          llenaría el mar sin dejar ninguna<br/>
          de las razones por las que me conquista.
        </p>
      </div>
      <div style={{width:40,height:1,background:'linear-gradient(90deg,transparent,rgba(139,26,47,0.4),transparent)',margin:'0 auto 16px'}}/>
      <p className="verso-attribution" style={{fontSize:'clamp(8px,1.5vw,10px)'}}>— Ecos de Amor —</p>
      <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(11px,2vw,13px)',fontStyle:'italic',color:'rgba(216,213,208,0.35)',marginTop:12}}>
        Un pequeño verso entre tantos.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function HomePage() {
  const [user, setUser]       = useState(null);
  const [poems, setPoems]     = useState([]);
  const [loading, setLoad]    = useState(true);
  const [activeTab, setTab]   = useState(null);
  const [showHero, setHero]   = useState(true);
  const [openPoem, setPoem]   = useState(null);
  const [mobileMenu, setMenu] = useState(false);
  const heroRef = useRef(null);

  useEffect(()=>{
    Promise.all([
      authFetch('/api/auth/me').then(r=>r.json()),
      authFetch('/api/poems').then(r=>r.json()),
    ]).then(([u,p])=>{ setUser(u.user||null); setPoems(p.poems||[]); setLoad(false); })
      .catch(()=>setLoad(false));
  },[]);

  useEffect(()=>{
    if(!user) return;
    const id=setInterval(()=>authFetch('/api/auth/heartbeat',{method:'POST'}),30000);
    return()=>clearInterval(id);
  },[user]);

  useEffect(()=>{
    if(!heroRef.current) return;
    const els=heroRef.current.querySelectorAll('.reveal');
    setTimeout(()=>els.forEach((el,i)=>setTimeout(()=>el.classList.add('visible'),i*100)),50);
  },[showHero]);

  const logout=async()=>{ clearToken(); await authFetch('/api/auth/logout',{method:'POST'}); window.location.href='/'; };
  const handleTab=tab=>{ setTab(tab); setHero(false); };
  const goHome=()=>{ setTab(null); setHero(true); };

  return (
    <>
      <div className="bg-luxury"/>
      <AmbientParticles/>
      <div className="gold-top-line"/>

      {/* NAV */}
      <nav className="luxury-nav" style={{gap:8}}>
        <button onClick={goHome} className="nav-logo" style={{ fontSize:'clamp(13px,3vw,20px)', display:'flex',alignItems:'center',gap:8 }}>
          <img src="/Icono.png" alt="" style={{ width:'clamp(20px,3.5vw,28px)',height:'clamp(20px,3.5vw,28px)', objectFit:'contain',borderRadius:6,opacity:0.9,flexShrink:0 }}/>
          Ecos de Amor
        </button>

        <div style={{display:'flex',gap:'clamp(14px,3vw,28px)',marginLeft:'auto',marginRight:'clamp(10px,2vw,28px)',flexShrink:0}} className="desktop-nav-links">
          {[['cartas','Cartas'],['poema','Verso']].map(([tab,label])=>(
            <button key={tab} onClick={()=>handleTab(tab)} className={`nav-link${activeTab===tab?' active':''}`} style={{fontSize:'clamp(8px,1.4vw,10px)'}}>{label}</button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'clamp(6px,1.5vw,12px)',flexShrink:0}} className="desktop-auth">
          {user ? (
            <>
              <span style={{fontFamily:"'Lora',serif",fontSize:'clamp(10px,1.8vw,13px)',fontStyle:'italic',color:'rgba(216,213,208,0.55)',whiteSpace:'nowrap',maxWidth:'clamp(60px,15vw,120px)',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</span>
              {user.isAdmin&&<a href="/admin"><button className="btn-secondary" style={{fontSize:'clamp(8px,1.3vw,10px)',padding:'7px clamp(8px,1.5vw,16px)'}}>Admin</button></a>}
              <button onClick={logout} className="btn-secondary" style={{fontSize:'clamp(8px,1.3vw,10px)',padding:'7px clamp(8px,1.5vw,16px)'}}>Salir</button>
            </>
          ) : (
            <>
              <a href="/login"><button className="btn-secondary" style={{fontSize:'clamp(8px,1.3vw,10px)',padding:'7px clamp(8px,1.5vw,18px)'}}>Entrar</button></a>
              <a href="/register"><button className="btn-primary" style={{fontSize:'clamp(8px,1.3vw,10px)',padding:'7px clamp(8px,1.5vw,18px)'}}>Unirme</button></a>
            </>
          )}
        </div>

        <button onClick={()=>setMenu(true)} aria-label="Menú" style={{ display:'none',background:'none',border:'1px solid rgba(255,255,255,0.1)', borderRadius:10,width:38,height:38,cursor:'pointer', alignItems:'center',justifyContent:'center',flexShrink:0, color:'rgba(255,255,255,0.5)',fontSize:16 }} className="hamburger-btn">☰</button>
      </nav>

      <style>{`
        @keyframes overlayIn{from{opacity:0}to{opacity:1}}
        @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes shimmerGold {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @media(max-width:480px){
          .desktop-nav-links{display:none!important}
          .desktop-auth{display:none!important}
          .hamburger-btn{display:flex!important}
        }
      `}</style>

      {/* CONTENIDO — con padding bottom para el footer fijo */}
      <div className="page-content" style={{paddingTop:68, paddingBottom:56}}>

        {/* HERO */}
        {showHero && (
          <section ref={heroRef} style={{textAlign:'center',padding:'clamp(36px,8vw,96px) clamp(12px,5vw,24px) clamp(44px,7vw,72px)'}}>
            <p className="reveal hero-eyebrow" style={{fontSize:'clamp(7px,2vw,10px)',letterSpacing:'clamp(2px,1vw,5px)'}}>✦ Un espacio de amor ✦</p>
            <h1 className="reveal hero-title" style={{transitionDelay:'0.1s',fontSize:'clamp(34px,11vw,100px)',letterSpacing:'clamp(-1px,-0.5vw,-2px)'}}>
              Ecos de Amor
            </h1>
            <div className="reveal" style={{transitionDelay:'0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'clamp(10px,3vw,20px)',margin:'clamp(16px,3vw,24px) auto'}}>
              <div style={{width:'clamp(30px,8vw,60px)',height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12))'}}/>
              <span style={{color:'var(--wine-light)',fontSize:'clamp(9px,2vw,12px)',opacity:0.8}}>♥</span>
              <div style={{width:'clamp(30px,8vw,60px)',height:1,background:'linear-gradient(270deg,transparent,rgba(255,255,255,0.12))'}}/>
            </div>
            <p className="reveal" style={{fontFamily:"'Lora',serif",fontSize:'clamp(13px,3.5vw,20px)',fontStyle:'italic',color:'rgba(216,213,208,0.6)',maxWidth:'min(480px,90%)',margin:'0 auto',lineHeight:1.7,transitionDelay:'0.3s'}}>
              Cada carta guarda un sentimiento.<br/>Ábrelas y encuentra lo que el corazón escribe.
            </p>
            {!user && (
              <div className="reveal" style={{display:'flex',gap:'clamp(8px,2vw,12px)',justifyContent:'center',marginTop:'clamp(24px,5vw,40px)',transitionDelay:'0.4s',flexWrap:'wrap'}}>
                <a href="/register"><button className="btn-primary" style={{padding:'clamp(9px,2vw,11px) clamp(18px,4vw,28px)',fontSize:'clamp(9px,1.8vw,11px)'}}>Crear mi cuenta</button></a>
                <a href="/login"><button className="btn-secondary" style={{padding:'clamp(9px,2vw,11px) clamp(18px,4vw,28px)',fontSize:'clamp(9px,1.8vw,11px)'}}>Ya tengo cuenta</button></a>
              </div>
            )}
            <div className="reveal" style={{display:'flex',gap:'clamp(8px,2vw,14px)',justifyContent:'center',marginTop:'clamp(32px,7vw,56px)',flexWrap:'wrap',transitionDelay:'0.5s',padding:'0 clamp(4px,2vw,8px)'}}>
              {[
                {tab:'cartas',label:'Cartas',sub:'Palabras del corazón',icon:'✉'},
                {tab:'poema',label:'Verso',sub:'Una línea de amor',icon:'◈'},
              ].map(({tab,label,sub,icon})=>(
                <button key={tab} onClick={()=>handleTab(tab)} style={{
                  background:'rgba(255,255,255,0.025)',backdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'clamp(12px,2.5vw,20px)',
                  padding:'clamp(14px,3vw,20px) clamp(14px,3vw,24px)',
                  textAlign:'center',cursor:'pointer',
                  minWidth:'clamp(120px,30vw,180px)',
                  transition:'border-color 0.3s,box-shadow 0.3s,transform 0.3s',
                  flex:'1 1 clamp(120px,30vw,180px)',maxWidth:'clamp(180px,35vw,240px)',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(139,26,47,0.3)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.4),0 0 28px rgba(139,26,47,0.1)';e.currentTarget.style.transform='translateY(-4px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)';}}>
                  <p style={{fontSize:'clamp(14px,3.5vw,22px)',marginBottom:'clamp(4px,1vw,8px)',color:'var(--wine-light)',opacity:0.8}}>{icon}</p>
                  <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(8px,1.8vw,11px)',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'white',marginBottom:'clamp(3px,0.8vw,5px)'}}>{label}</p>
                  <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(9px,1.6vw,11px)',fontStyle:'italic',color:'rgba(216,213,208,0.4)'}}>{sub}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Tab sections */}
        {activeTab && (
          <section style={{maxWidth:1060,margin:'0 auto',padding:'clamp(16px,4vw,32px) clamp(12px,4vw,24px) clamp(40px,8vw,80px)'}}>
            {activeTab==='cartas' && (
              <div>
                <div style={{textAlign:'center',marginBottom:'clamp(20px,4vw,36px)'}}>
                  <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(7px,1.5vw,10px)',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',color:'var(--wine-light)',marginBottom:10,opacity:0.7}}>
                    — Cartas escritas con el corazón —
                  </p>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(20px,5vw,36px)',fontStyle:'italic',color:'white',fontWeight:400}}>
                    Palabras para ti
                  </h2>
                </div>
                <BookSection poems={poems} loading={loading} onOpen={setPoem}/>
              </div>
            )}
            {activeTab==='poema' && <VersoSection/>}
          </section>
        )}
      </div>

      {/* FOOTER — fijo en la parte inferior */}
      <footer style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        textAlign:'center',
        padding:'clamp(10px,2vw,14px) 12px',
        borderTop:'1px solid rgba(255,255,255,0.05)',
        background:'rgba(6,4,8,0.85)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
      }}>
        <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(7px,1.5vw,9px)',letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.12)'}}>
          Hecho con amor ♥ Ecos de Amor
        </p>
      </footer>

      {openPoem && <LetterModal poem={openPoem} user={user} onClose={()=>setPoem(null)}/>}
      {mobileMenu && <MobileMenu activeTab={activeTab} onTabClick={handleTab} user={user} onLogout={logout} onClose={()=>setMenu(false)}/>}
    </>
  );
}
