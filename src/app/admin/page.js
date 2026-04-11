'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router  = useRouter();
  const [users, setUsers]   = useState([]);
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [updated, setUpd]   = useState(null);

  const load = async () => {
    const [me, usrs] = await Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]);
    if (!me.user?.isAdmin) { router.push('/'); return; }
    setUser(me.user);
    if (usrs.users) { setUsers(usrs.users); setUpd(new Date()); }
    setLoad(false);
  };

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, []);

  const fmt = d => new Date(d).toLocaleString('es-ES',{
    day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  const online  = users.filter(u => u.is_online);
  const offline = users.filter(u => !u.is_online);

  if (loading) return (
    <>
      <div className="bg-luxury" />
      <div className="page-content" style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'20px',
          fontStyle:'italic', color:'var(--cream-muted)' }}>
          Cargando panel...
        </p>
      </div>
    </>
  );

  return (
    <>
      <div className="bg-luxury" />
      <div className="gold-top-line" />

      {/* Nav */}
      <nav className="luxury-nav">
        <a href="/" className="nav-logo">Victoria</a>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'16px',
            fontStyle:'italic', color:'var(--cream-muted)' }}>
            ✦ {user?.name}
          </span>
          <a href="/" style={{ textDecoration:'none' }}>
            <button className="btn-ghost" style={{ padding:'7px 14px', fontSize:'10px' }}>
              Ver cartas
            </button>
          </a>
        </div>
      </nav>

      <main className="page-content" style={{ paddingTop:'80px', padding:'80px clamp(16px,4vw,40px) 60px' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto' }}>

          {/* Title */}
          <div style={{ textAlign:'center', marginBottom:'50px' }} className="fade-in">
            <p style={{ fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'4px',
              textTransform:'uppercase', color:'var(--crimson-soft)', marginBottom:'16px' }}>
              ✦ &nbsp; Panel Secreto &nbsp; ✦
            </p>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontStyle:'italic',
              fontSize:'clamp(28px,5vw,40px)', color:'var(--gold-light)', fontWeight:400 }}>
              Administrador
            </h1>
            <div style={{ width:'60px', height:'1px', margin:'16px auto',
              background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'16px',
              fontStyle:'italic', color:'var(--cream-muted)' }}>
              Solo tú puedes ver esta página
            </p>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',
            gap:'16px', marginBottom:'36px' }}>
            {[
              { label:'Registradas', value:users.length, icon:'✉' },
              { label:'En línea', value:online.length, icon:'●', green:true },
              { label:'Corazones', value:users.reduce((a,u)=>a+(u.total_likes||0),0), icon:'♥' },
              { label:'Comentarios', value:users.reduce((a,u)=>a+(u.total_comments||0),0), icon:'✦' },
            ].map(s => (
              <div key={s.label} className="admin-card" style={{ textAlign:'center', padding:'24px 16px' }}>
                <div style={{ fontSize:'22px', color: s.green ? '#4ade80':'var(--gold)',
                  marginBottom:'10px' }}>{s.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'30px', fontWeight:600,
                  color:'var(--gold-light)' }}>{s.value}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'2px',
                  textTransform:'uppercase', color:'var(--cream-muted)', marginTop:'6px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Refresh */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'12px', marginBottom:'20px' }}>
            {updated && (
              <span style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1px',
                color:'var(--cream-muted)', textTransform:'uppercase' }}>
                Actualizado: {updated.toLocaleTimeString('es-ES')}
              </span>
            )}
            <button onClick={load} className="btn-ghost" style={{ padding:'7px 14px', fontSize:'10px' }}>
              Actualizar
            </button>
          </div>

          {/* Users */}
          {users.length === 0 ? (
            <div className="admin-card" style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'40px', marginBottom:'16px', opacity:0.4 }}>✉</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'20px',
                fontStyle:'italic', color:'var(--cream-muted)' }}>
                Nadie se ha registrado aún.<br />
                Comparte el link y espera...
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[...online, ...offline].map(u => (
                <div key={u.id} className="admin-card" style={{
                  borderColor: u.is_online ? 'rgba(74,222,128,0.35)' : 'var(--gold-border)'
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    flexWrap:'wrap', gap:'14px' }}>
                    {/* Left */}
                    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                      {/* Avatar */}
                      <div style={{
                        width:'46px', height:'46px', borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg, var(--gold) 0%, var(--crimson) 100%)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:600, color:'#0f0600',
                        boxShadow:'0 2px 10px rgba(0,0,0,0.4)'
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'3px' }}>
                          <span style={{ fontFamily:'Playfair Display,serif', fontSize:'17px',
                            fontStyle:'italic', color:'var(--cream)' }}>
                            {u.name}
                          </span>
                          {u.is_online ? (
                            <span style={{ display:'flex', alignItems:'center', gap:'5px',
                              fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1.5px',
                              textTransform:'uppercase', color:'#4ade80' }}>
                              <span className="online-pulse" /> En línea
                            </span>
                          ) : (
                            <span style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1.5px',
                              textTransform:'uppercase', color:'var(--cream-muted)' }}>
                              Desconectada
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily:'EB Garamond,serif', fontSize:'14px',
                          color:'var(--cream-muted)', fontStyle:'italic' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                    {/* Right stats */}
                    <div style={{ display:'flex', gap:'22px' }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px',
                          color:'var(--crimson-soft)' }}>♥ {u.total_likes}</div>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'1px',
                          textTransform:'uppercase', color:'var(--cream-muted)' }}>gustos</div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px',
                          color:'var(--gold)' }}>✦ {u.total_comments}</div>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'1px',
                          textTransform:'uppercase', color:'var(--cream-muted)' }}>mensajes</div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ marginTop:'14px', paddingTop:'12px',
                    borderTop:'1px solid rgba(201,148,58,0.08)',
                    display:'flex', gap:'24px', flexWrap:'wrap' }}>
                    {[
                      { label:'Cuenta creada', value: fmt(u.created_at), icon:'✉' },
                      { label:'Última vez vista', value: u.last_seen ? fmt(u.last_seen) : 'Nunca',
                        icon:'●', green: u.is_online },
                    ].map(d => (
                      <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:'8px', letterSpacing:'1.5px',
                          textTransform:'uppercase', color:'var(--cream-muted)' }}>
                          {d.label}:
                        </span>
                        <span style={{ fontFamily:'EB Garamond,serif', fontSize:'14px',
                          fontStyle:'italic', color: d.green ? '#4ade80':'var(--gold)' }}>
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop:'48px', textAlign:'center', padding:'24px',
            border:'1px solid rgba(201,148,58,0.1)', borderRadius:'2px' }}>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'17px',
              fontStyle:'italic', color:'var(--cream-muted)' }}>
              "Espero con el corazón en la mano el momento en que ella llegue." ♥
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
