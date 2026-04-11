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

export default function RegisterPage() {
  const [form, setForm]    = useState({ name:'', email:'', password:'' });
  const [error, setError]  = useState('');
  const [loading, setLoad] = useState(false);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoad(true);
    try {
      const res = await fetch('/api/auth/register', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        saveToken(data.token);          // ← save JWT to localStorage
        window.location.href = '/';    // ← full reload
      } else {
        setError(data.error || 'Error al crear la cuenta');
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
            <div style={{ fontSize:'28px', marginBottom:'16px',
              filter:'drop-shadow(0 0 10px rgba(201,148,58,0.5))' }}>✉</div>
            <h1 style={{
              fontFamily:'Cinzel,serif', fontSize:'clamp(18px,3.5vw,24px)',
              fontWeight:600, letterSpacing:'4px', textTransform:'uppercase',
              color:'var(--gold-light)', textShadow:'0 0 20px rgba(201,148,58,0.35)',
              marginBottom:'10px'
            }}>Únete</h1>
            <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'17px',
              fontStyle:'italic', color:'var(--cream-muted)' }}>
              Crea tu cuenta para interactuar
            </p>
            <div style={{ width:'60px', height:'1px', margin:'18px auto 0',
              background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'26px' }}>
            <div>
              <label style={{ display:'block', fontFamily:'Cinzel,serif', fontSize:'9px',
                letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--cream-muted)', marginBottom:'8px' }}>
                Tu nombre
              </label>
              <input className="luxury-input" type="text" name="name"
                value={form.name} onChange={change}
                placeholder="¿Cómo te llamas?" required autoComplete="name" />
            </div>
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
                placeholder="Mínimo 6 caracteres" required autoComplete="new-password" />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-gold" disabled={loading}
              style={{ width:'100%', marginTop:'8px', padding:'15px' }}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'14px', margin:'28px 0' }}>
            <div style={{ flex:1, height:'1px', background:'var(--gold-border)' }} />
            <span style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'2px',
              textTransform:'uppercase', color:'var(--cream-muted)' }}>¿Ya tienes cuenta?</span>
            <div style={{ flex:1, height:'1px', background:'var(--gold-border)' }} />
          </div>

          <a href="/login" style={{ textDecoration:'none', display:'block' }}>
            <button className="btn-ghost" style={{ width:'100%', padding:'13px' }}>
              Iniciar sesión
            </button>
          </a>
        </div>

        <p style={{ marginTop:'32px', fontFamily:'Cormorant Garamond,serif', fontSize:'17px',
          fontStyle:'italic', color:'var(--cream-muted)', textAlign:'center' }}>
          "El corazón tiene razones que la razón no conoce."
        </p>
      </div>
    </>
  );
}
