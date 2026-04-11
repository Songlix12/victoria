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

/* ── SVG Icons ── */
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
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{width:22,height:22}}>
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{width:22,height:22}}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.7 21C9.19 20 18 17 21 10z"/><path d="M5 22s2-8 9-10"/>
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{width:22,height:22}}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const FlowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{width:22,height:22}}>
    <circle cx="12" cy="12" r="3"/><path d="M12 2a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM12 16a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM2 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0zM16 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0z"/>
  </svg>
);

/* ── Mobile Nav Menu ── */
function MobileMenu({ activeTab, onTabClick, user, onLogout, onClose }) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{
      position:'fixed',inset:0,zIndex:999,
      background:'rgba(4,4,4,0.85)',backdropFilter:'blur(12px)',
      display:'flex',alignItems:'flex-start',justifyContent:'flex-end',
      animation:'overlayIn 0.2s ease',
    }}>
      <div style={{
        background:'rgba(12,12,12,0.97)',border:'1px solid rgba(255,255,255,0.07)',
        borderLeft:'none',borderTop:'none',borderRadius:'0 0 0 20px',
        padding:'clamp(20px,6vw,36px)',minWidth:'min(260px,80vw)',
        display:'flex',flexDirection:'column',gap:8,
        animation:'slideInRight 0.25s ease',
      }}>
        <button onClick={onClose} style={{ alignSelf:'flex-end', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:18, cursor:'pointer', marginBottom:8 }}>✕</button>
        {[['cartas','Cartas'],['girasoles','Girasoles'],['poema','Verso']].map(([tab,label])=>(
          <button key={tab} onClick={()=>{onTabClick(tab);onClose();}} style={{
            fontFamily:'Montserrat,sans-serif',fontSize:'clamp(12px,3vw,14px)',fontWeight:600,
            letterSpacing:'2px',textTransform:'uppercase',
            color:activeTab===tab?'white':'rgba(255,255,255,0.4)',
            background: activeTab===tab?'rgba(139,26,47,0.12)':'none',
            border:`1px solid ${activeTab===tab?'rgba(139,26,47,0.3)':'transparent'}`,
            borderRadius:10,padding:'12px 16px',cursor:'pointer',textAlign:'left',
            transition:'all 0.2s',
          }}>{label}</button>
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

/* ── Letter Modal ── */
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
    <div className={`modal-overlay${closing?' closing':''}`} onClick={handleOverlay} style={{padding:'clamp(10px,4vw,20px)'}}>
      <div className={`modal-card${closing?' closing':''}`} style={{maxWidth:'min(500px,100%)'}}>
        <button onClick={handleClose} className="modal-close" aria-label="Cerrar">✕</button>
        <div className="modal-inner" style={{padding:'clamp(24px,5vw,38px) clamp(18px,5vw,32px) clamp(18px,4vw,26px)'}}>
          <p className="modal-eyebrow">✦ Para Victoria ✦</p>
          <h2 className="modal-title" style={{fontSize:'clamp(18px,5vw,28px)'}}>{poem.title}</h2>
          <div className="modal-divider"><span className="modal-divider-icon">♥</span></div>
          <p className="modal-content" style={{fontSize:'clamp(15px,4vw,20px)'}}>{poem.content}</p>

          <div className="modal-actions">
            <button onClick={handleLike} className={`modal-like-btn${liked?' liked':''}`}>
              <span style={{display:'inline-block',transition:'transform 0.2s',transform:animH?'scale(1.4)':'scale(1)'}}>
                <HeartIcon filled={liked}/>
              </span>
              {likeCount>0?likeCount:''} me gusta
            </button>
            <div className="modal-views"><EyeIcon/>{Number(poem.view_count)||Math.floor(Math.random()*40)+5}</div>
          </div>

          <div>
            <p className="modal-comment-label">Tus palabras</p>
            {loadingC ? <p className="modal-comment-empty">...</p> : comments.length>0 ? (
              <div style={{marginBottom:14}}>
                {comments.map(c=>(
                  <div key={c.id} className="modal-comment-item">
                    <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:3}}>
                      <span className="modal-comment-author">{c.user_name}</span>
                      <span className="modal-comment-date">{new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
                    </div>
                    <p className="modal-comment-text">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : <p className="modal-comment-empty">Sé la primera en dejar tu huella...</p>}

            {user ? (
              <form onSubmit={submitComment} className="modal-comment-form">
                <input className="modal-comment-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe lo que sientes..." maxLength={400}/>
                <button type="submit" disabled={posting||!text.trim()} className="modal-comment-submit">{posting?'...':'Enviar'}</button>
              </form>
            ) : (
              <p style={{fontFamily:'Montserrat,sans-serif',fontSize:11,color:'rgba(0,0,0,0.35)'}}>
                <a href="/login" style={{color:'var(--wine)',textDecoration:'underline'}}>Inicia sesión</a> para comentar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bento / Masonry Card ── */
function EnvelopeCard({ poem, user, delay, onOpen, size }) {
  const [liked, setLiked]     = useState(poem.user_liked);
  const [count, setCount]     = useState(Number(poem.like_count));
  const [animH, setAnimH]     = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current; if(!el) return;
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add('visible');obs.disconnect();}},{threshold:0.1});
    obs.observe(el); return ()=>obs.disconnect();
  },[]);

  const handleLike = async e => {
    e.stopPropagation();
    if(!user){window.location.href='/login';return;}
    setAnimH(true);setTimeout(()=>setAnimH(false),400);
    const prev=liked;setLiked(!prev);setCount(c=>prev?c-1:c+1);
    const res=await authFetch(`/api/poems/${poem.id}/like`,{method:'POST'});
    if(res.status===401){window.location.href='/login';return;}
    if(res.ok){const d=await res.json();setLiked(d.liked);setCount(d.count);}
    else{setLiked(prev);setCount(c=>prev?c+1:c-1);}
  };

  // Size classes: 'tall' shows content preview, 'wide' etc.
  const isTall = size === 'tall';
  const isFeat = size === 'featured';

  return (
    <div ref={cardRef} className="reveal" style={{
      transitionDelay:`${delay}s`,
      breakInside:'avoid',
      marginBottom: 'clamp(12px,2vw,18px)',
    }}>
      <div
        onClick={()=>onOpen(poem)}
        style={{
          position:'relative',overflow:'hidden',cursor:'pointer',
          background: isFeat
            ? 'linear-gradient(145deg,rgba(20,10,12,0.9),rgba(14,14,14,0.8))'
            : 'rgba(14,14,14,0.7)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          border:`1px solid ${isFeat?'rgba(139,26,47,0.25)':'rgba(255,255,255,0.07)'}`,
          borderRadius:'clamp(14px,2.5vw,22px)',
          padding: isFeat
            ? 'clamp(20px,4vw,32px)'
            : 'clamp(16px,3vw,24px)',
          transition:'border-color 0.35s,box-shadow 0.35s,transform 0.35s',
          boxShadow: isFeat
            ? '0 8px 32px rgba(0,0,0,0.5),0 0 40px rgba(139,26,47,0.06)'
            : '0 6px 24px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={e=>{
          e.currentTarget.style.borderColor='rgba(139,26,47,0.3)';
          e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.55),0 0 32px rgba(139,26,47,0.1)';
          e.currentTarget.style.transform='translateY(-3px)';
        }}
        onMouseLeave={e=>{
          e.currentTarget.style.borderColor=isFeat?'rgba(139,26,47,0.25)':'rgba(255,255,255,0.07)';
          e.currentTarget.style.boxShadow=isFeat?'0 8px 32px rgba(0,0,0,0.5),0 0 40px rgba(139,26,47,0.06)':'0 6px 24px rgba(0,0,0,0.4)';
          e.currentTarget.style.transform='translateY(0)';
        }}
      >
        {/* Ambient top glow */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',pointerEvents:'none'}}/>

        {/* Wax seal */}
        <div style={{
          width:isFeat?'clamp(32px,5vw,44px)':'clamp(28px,4vw,36px)',
          height:isFeat?'clamp(32px,5vw,44px)':'clamp(28px,4vw,36px)',
          borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%,var(--wine-light),var(--wine) 70%)',
          border:'1px solid rgba(255,255,255,0.15)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:isFeat?'clamp(12px,2vw,16px)':'clamp(10px,1.8vw,14px)',
          color:'white',marginBottom:'clamp(10px,2vw,16px)',
          boxShadow:'0 2px 10px rgba(0,0,0,0.4),0 0 14px rgba(139,26,47,0.2)',
          transition:'transform 0.3s,box-shadow 0.3s',
          flexShrink:0,
        }}>♥</div>

        <h3 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize: isFeat?'clamp(16px,3vw,22px)':'clamp(13px,2.5vw,17px)',
          fontStyle:'italic',fontWeight:500,
          color:'white',lineHeight:1.25,
          marginBottom: isFeat?'clamp(10px,2vw,16px)':'clamp(6px,1.5vw,10px)',
          wordBreak:'break-word',
        }}>{poem.title}</h3>

        {/* Content preview for tall/featured cards */}
        {(isTall||isFeat) && (
          <p style={{
            fontFamily:"'Lora',serif",fontSize:'clamp(11px,1.8vw,13px)',
            fontStyle:'italic',color:'rgba(216,213,208,0.45)',
            lineHeight:1.7,marginBottom:'clamp(12px,2vw,18px)',
            display:'-webkit-box',WebkitLineClamp:isFeat?4:3,
            WebkitBoxOrient:'vertical',overflow:'hidden',
            wordBreak:'break-word',
          }}>
            {poem.content}
          </p>
        )}

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto'}}>
          <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(7px,1.2vw,9px)',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.2)'}}>
            Toca para abrir
          </p>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button onClick={handleLike} style={{
              background:'none',border:'none',cursor:'pointer',padding:0,
              display:'flex',alignItems:'center',gap:4,
              fontFamily:'Montserrat,sans-serif',fontSize:'clamp(9px,1.5vw,11px)',
              color:liked?'var(--wine-light)':'rgba(255,255,255,0.25)',
              transition:'color 0.2s',
            }}>
              <span style={{display:'inline-block',transition:'transform 0.2s',transform:animH?'scale(1.4)':'scale(1)',fontSize:'clamp(11px,2vw,14px)'}}>
                {liked?'❤':'♡'}
              </span>
              {count>0?count:''}
            </button>
            {Number(poem.comment_count)>0 && (
              <span style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(9px,1.5vw,11px)',color:'rgba(255,255,255,0.2)'}}>
                ✉ {poem.comment_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bento Grid ── */
function BentoGrid({ poems, user, loading, onOpen }) {
  const gridRef = useRef(null);

  useEffect(()=>{
    const el=gridRef.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)el.classList.add('visible')},{threshold:0.05});
    obs.observe(el); return()=>obs.disconnect();
  },[]);

  if (loading) return (
    <div style={{textAlign:'center',padding:'clamp(40px,8vw,80px) 20px',opacity:0.5}}>
      <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(14px,2vw,17px)',fontStyle:'italic',color:'rgba(216,213,208,0.5)'}}>
        Preparando las cartas...
      </p>
    </div>
  );
  if (poems.length===0) return (
    <div style={{textAlign:'center',padding:'clamp(40px,8vw,80px) 20px'}}>
      <p style={{fontFamily:'Montserrat,sans-serif',fontSize:12,color:'rgba(255,255,255,0.2)'}}>
        Visita <code style={{color:'var(--wine-light)'}}>api/init</code> para inicializar.
      </p>
    </div>
  );

  // Assign bento sizes based on content length and index
  const getSize = (poem, idx) => {
    const len = poem.content?.length || 0;
    if (idx === 0 && len > 100) return 'featured';
    if (len > 200) return 'tall';
    return 'normal';
  };

  return (
    <div ref={gridRef} className="reveal" style={{
      columns: 'clamp(160px,40vw,280px)',
      columnGap: 'clamp(12px,2vw,18px)',
      columnFill: 'balance',
    }}>
      {poems.map((poem,i)=>(
        <EnvelopeCard
          key={poem.id}
          poem={poem}
          user={user}
          delay={i*0.055}
          onOpen={onOpen}
          size={getSize(poem,i)}
        />
      ))}
    </div>
  );
}

/* ── Girasoles ── */
function GirasolesSection() {
  const ref=useRef(null);
  const bgRef=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)el.classList.add('visible')},{threshold:0.1});
    obs.observe(el); return()=>obs.disconnect();
  },[]);
  useEffect(()=>{
    const h=()=>{ if(!bgRef.current) return; const r=bgRef.current.getBoundingClientRect(); const p=(window.innerHeight-r.top)/(window.innerHeight+r.height); bgRef.current.style.transform=`translateY(${(p-0.5)*28}px)`; };
    window.addEventListener('scroll',h,{passive:true}); return()=>window.removeEventListener('scroll',h);
  },[]);

  const items = [
    {icon:<SunIcon/>,label:'Luz propia',desc:'Como el sol que llevas dentro'},
    {icon:<LeafIcon/>,label:'Lealtad',desc:'Firme en cada estación'},
    {icon:<StarIcon/>,label:'Admiración',desc:'Sin palabras para describir'},
    {icon:<FlowerIcon/>,label:'Alegría',desc:'Que ilumina todo a su paso'},
  ];

  return (
    <div ref={ref} className="reveal" style={{maxWidth:640,margin:'0 auto',textAlign:'center',padding:'clamp(32px,6vw,48px) clamp(12px,4vw,24px)',position:'relative',overflow:'hidden'}}>
      <div ref={bgRef} style={{position:'absolute',inset:-40,pointerEvents:'none',background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,169,110,0.04) 0%,transparent 70%)',transition:'transform 0.1s linear'}}/>
      <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(8px,1.5vw,10px)',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',color:'var(--gold)',marginBottom:16,opacity:0.8}}>
        — La flor que te define —
      </p>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,5vw,38px)',fontStyle:'italic',fontWeight:400,color:'white',marginBottom:16,lineHeight:1.25}}>
        Como los girasoles que amas
      </h2>
      <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(13px,2.2vw,15px)',color:'rgba(216,213,208,0.65)',lineHeight:1.85,maxWidth:480,margin:'0 auto clamp(28px,5vw,40px)'}}>
        Siempre buscan la luz, igual que mi corazón te busca a ti, Victoria.
        Por eso cada vez que veo uno, me acuerdo de tu sonrisa.
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(clamp(120px,28vw,160px),1fr))',gap:'clamp(10px,2vw,14px)',maxWidth:400,margin:'0 auto'}}>
        {items.map((q,i)=>(
          <div key={i} style={{background:'rgba(201,169,110,0.04)',border:'1px solid rgba(201,169,110,0.12)',borderRadius:'clamp(12px,2vw,18px)',padding:'clamp(14px,3vw,20px) clamp(10px,2vw,16px)',transition:'border-color 0.3s,box-shadow 0.3s,transform 0.3s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(201,169,110,0.28)';e.currentTarget.style.boxShadow='0 8px 24px rgba(201,169,110,0.08)';e.currentTarget.style.transform='translateY(-3px)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(201,169,110,0.12)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)';}}>
            <div className="girasoles-icon" style={{width:'clamp(36px,6vw,52px)',height:'clamp(36px,6vw,52px)',borderRadius:'clamp(10px,2vw,16px)'}}>{q.icon}</div>
            <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(8px,1.5vw,10px)',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'var(--gold)',marginBottom:6}}>{q.label}</p>
            <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(10px,1.8vw,12px)',color:'rgba(216,213,208,0.45)',fontStyle:'italic'}}>{q.desc}</p>
          </div>
        ))}
      </div>
    </div>
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
      <p className="verso-attribution" style={{fontSize:'clamp(8px,1.5vw,10px)'}}>— Para Victoria —</p>
      <p style={{fontFamily:"'Lora',serif",fontSize:'clamp(11px,2vw,13px)',fontStyle:'italic',color:'rgba(216,213,208,0.35)',marginTop:12}}>
        Un pequeño verso entre tantos.
      </p>
    </div>
  );
}

/* ── Main ── */
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
        <button onClick={goHome} className="nav-logo" style={{fontSize:'clamp(16px,4vw,26px)'}}>Victoria</button>

        {/* Desktop links */}
        <div style={{display:'flex',gap:'clamp(14px,3vw,28px)',marginLeft:'auto',marginRight:'clamp(10px,2vw,28px)',flexShrink:0}} className="desktop-nav-links">
          {[['cartas','Cartas'],['girasoles','Girasoles'],['poema','Verso']].map(([tab,label])=>(
            <button key={tab} onClick={()=>handleTab(tab)} className={`nav-link${activeTab===tab?' active':''}`} style={{fontSize:'clamp(8px,1.4vw,10px)'}}>
              {label}
            </button>
          ))}
        </div>

        {/* Desktop auth */}
        <div style={{display:'flex',alignItems:'center',gap:'clamp(6px,1.5vw,12px)',flexShrink:0}} className="desktop-auth">
          {user ? (
            <>
              <span style={{fontFamily:"'Lora',serif",fontSize:'clamp(10px,1.8vw,13px)',fontStyle:'italic',color:'rgba(216,213,208,0.55)',whiteSpace:'nowrap',maxWidth:'clamp(60px,15vw,120px)',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user.name}
              </span>
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

        {/* Hamburger — visible below 480px */}
        <button onClick={()=>setMenu(true)} aria-label="Menú" style={{
          display:'none', background:'none', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:10, width:38, height:38, cursor:'pointer',
          alignItems:'center', justifyContent:'center', flexShrink:0,
          color:'rgba(255,255,255,0.5)', fontSize:16,
        }} className="hamburger-btn">☰</button>
      </nav>

      {/* Responsive nav styles */}
      <style>{`
        @keyframes overlayIn{from{opacity:0}to{opacity:1}}
        @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @media(max-width:480px){
          .desktop-nav-links{display:none!important}
          .desktop-auth{display:none!important}
          .hamburger-btn{display:flex!important}
        }
        @media(max-width:320px){
          .nav-logo{font-size:clamp(14px,6vw,18px)!important}
        }
        @media(max-width:260px){
          .luxury-nav{padding:0 8px!important}
          .hamburger-btn{width:32px!important;height:32px!important}
        }
      `}</style>

      <div className="page-content" style={{paddingTop:68}}>
        {/* HERO */}
        {showHero && (
          <section ref={heroRef} style={{textAlign:'center',padding:'clamp(36px,8vw,96px) clamp(12px,5vw,24px) clamp(44px,7vw,72px)'}}>
            <p className="reveal hero-eyebrow" style={{fontSize:'clamp(7px,2vw,10px)',letterSpacing:'clamp(2px,1vw,5px)'}}>✦ Un espacio de amor ✦</p>
            <h1 className="reveal hero-title" style={{transitionDelay:'0.1s',fontSize:'clamp(42px,14vw,128px)',letterSpacing:'clamp(-1px,-0.5vw,-3px)'}}>
              Victoria
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

            {/* Tiles */}
            <div className="reveal" style={{display:'flex',gap:'clamp(8px,2vw,14px)',justifyContent:'center',marginTop:'clamp(32px,7vw,56px)',flexWrap:'wrap',transitionDelay:'0.5s',padding:'0 clamp(4px,2vw,8px)'}}>
              {[
                {tab:'cartas',label:'Cartas',sub:'Palabras para ti',icon:'✉'},
                {tab:'girasoles',label:'Girasoles',sub:'La flor que te define',icon:'✦'},
                {tab:'poema',label:'Verso',sub:'Una línea de amor',icon:'◈'},
              ].map(({tab,label,sub,icon})=>(
                <button key={tab} onClick={()=>handleTab(tab)} style={{
                  background:'rgba(255,255,255,0.025)',
                  backdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'clamp(12px,2.5vw,20px)',
                  padding:'clamp(14px,3vw,20px) clamp(14px,3vw,24px)',
                  textAlign:'center',cursor:'pointer',
                  minWidth:'clamp(90px,25vw,140px)',
                  transition:'border-color 0.3s,box-shadow 0.3s,transform 0.3s',
                  flex:'1 1 clamp(90px,25vw,140px)',maxWidth:'clamp(140px,30vw,200px)',
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
          <section style={{maxWidth:940,margin:'0 auto',padding:'clamp(16px,4vw,32px) clamp(12px,4vw,24px) clamp(40px,8vw,80px)'}}>
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
                <BentoGrid poems={poems} user={user} loading={loading} onOpen={setPoem}/>
              </div>
            )}
            {activeTab==='girasoles' && <GirasolesSection/>}
            {activeTab==='poema' && <VersoSection/>}
          </section>
        )}

        <footer style={{textAlign:'center',padding:'clamp(16px,4vw,28px) 12px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
          <p style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(7px,1.5vw,10px)',letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.12)'}}>
            Hecho con amor, para ti ♥
          </p>
        </footer>
      </div>

      {openPoem && <LetterModal poem={openPoem} user={user} onClose={()=>setPoem(null)}/>}
      {mobileMenu && <MobileMenu activeTab={activeTab} onTabClick={handleTab} user={user} onLogout={logout} onClose={()=>setMenu(false)}/>}
    </>
  );
}