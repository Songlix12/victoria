'use client';
import { useState } from 'react';
import { saveToken } from '@/lib/client-auth';

function Particles() {
  const golds = ['#c9943a','#e2b55a','#f0cc7a'];
  return (
    <div aria-hidden="true">
      {Array.from({length:14},(_,i) => (
        <div key={i} className="particle" style={{
          left:`${Math.random()*100}%`,
          width:`${1.5+Math.random()*2.5}px`, height:`${1.5+Math.random()*2.5}px`,
          background: golds[i%3],
          animationDuration:`${10+Math.random()*14}s`,
          animationDelay:`${Math.random()*12}s`,
        }} />
      ))}
      {Array.from({length:6},(_,i) => (
        <div key={`h${i}`} className="floating-heart" style={{
          left:`${Math.random()*100}%`,
          animationDuration:`${12+Math.random()*10}s`,
          animationDelay:`${Math.random()*14}s`,
        }}>♥</div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm]    = useState({ email: '', password: '' });
  const [error, setError]  = useState('');
  const [loading, setLoad] = useState(false);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoad(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        saveToken(data.token);          // ← save JWT to localStorage
        window.location.href = '/';    // ← full reload so page reads token
      } else {
        setError(data.error || 'Correo o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }
    setLoad(false);
  };

  return (
    <>
      <div className="bg-luxury" />
      <Particles />
      <div className="gold-top-line" />

      <div className="page-content" style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'20px'
      }}>
        <a href="/" style={{
          position:'fixed', top:'20px', left:'24px', zIndex:10,
          fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'2px',
          textTransform:'uppercase', color:'var(--cream-muted)', textDecoration:'none',
          transition:'color 0.2s'
        }}
        onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'}
        onMouseLeave={e=>e.currentTarget.style.color='var(--cream-muted)'}>
          ← Volver
        </a>

        <div className="auth-card fade-in" style={{ width:'100%', maxWidth:'400px', padding:'clamp(32px,6vw,52px)' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div style={{ fontSize:'32px', marginBottom:'16px', filter:'drop-shadow(0 0 10px rgba(139,26,47,0.6))' }}>♥</div>
            <h1 style={{
              fontFamily:'Cinzel,serif', fontSize:'clamp(20px,4vw,26px)',
              fontWeight:600, letterSpacing:'5px', textTransform:'uppercase',
              color:'var(--gold-light)', textShadow:'0 0 20px rgba(201,148,58,0.35)',
              marginBottom:'10px'
            }}>Bienvenida</h1>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'17px',
              fontStyle:'italic', color:'var(--cream-muted)' }}>
              Tu espacio especial te espera
            </p>
            <div style={{ width:'60px', height:'1px', margin:'18px auto 0',
              background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
            <div>
              <label style={{ display:'block', fontFamily:'Cinzel,serif', fontSize:'9px',
                letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'8px' }}>
                Correo electrónico
              </label>
              <input className="luxury-input" type="email" name="email"
                value={form.email} onChange={change}
                placeholder="tu@correo.com" required autoComplete="email" />
            </div>
            <div>
              <label style={{ display:'block', fontFamily:'Cinzel,serif', fontSize:'9px',
                letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'8px' }}>
                Contraseña
              </label>
              <input className="luxury-input" type="password" name="password"
                value={form.password} onChange={change}
                placeholder="Tu contraseña" required autoComplete="current-password" />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-gold" disabled={loading}
              style={{ width:'100%', marginTop:'8px', padding:'15px' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'14px', margin:'28px 0' }}>
            <div style={{ flex:1, height:'1px', background:'var(--gold-border)' }} />
            <span style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'2px',
              textTransform:'uppercase', color:'var(--cream-muted)' }}>¿Primera vez?</span>
            <div style={{ flex:1, height:'1px', background:'var(--gold-border)' }} />
          </div>

          <a href="/register" style={{ textDecoration:'none', display:'block' }}>
            <button className="btn-ghost" style={{ width:'100%', padding:'13px' }}>
              Crear mi cuenta
            </button>
          </a>
        </div>

        <p style={{ marginTop:'32px', fontFamily:'Cormorant Garamond,serif', fontSize:'17px',
          fontStyle:'italic', color:'var(--cream-muted)', textAlign:'center' }}>
          "El amor es la poesía de los sentidos."
        </p>
      </div>
    </>
  );
}
