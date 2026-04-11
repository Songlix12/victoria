'use client';
import { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────
   BookSection — reemplaza el masonry de cartas
   Props:
     poems  → array de poemas desde la API
     user   → usuario actual (o null)
     onOpen → función que recibe un poem y abre el LetterModal existente
   ───────────────────────────────────────────── */
export default function BookSection({ poems = [], user, onOpen }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipping, setFlipping]   = useState(false);
  const [flipDir, setFlipDir]     = useState('next');
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const POEMS_PER_PAGE = 1; // una carta por página
  const totalPages = Math.max(1, poems.length);

  const goTo = (dir) => {
    const next = dir === 'next'
      ? Math.min(pageIndex + 1, totalPages - 1)
      : Math.max(pageIndex - 1, 0);
    if (next === pageIndex) return;
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => { setPageIndex(next); setFlipping(false); }, 320);
  };

  const openBook = () => { setPageIndex(0); setIsOpen(true); };
  const closeBook = () => setIsOpen(false);

  const currentPoem = poems[pageIndex] || null;

  return (
    <>
      <style>{`
        .book-scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 480px;
          padding: clamp(24px, 5vw, 60px) 16px;
        }

        /* ── Libro cerrado ── */
        .book-closed {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          animation: bookFloat 4s ease-in-out infinite;
        }
        @keyframes bookFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .book-3d {
          position: relative;
          width: clamp(160px, 28vw, 220px);
          height: clamp(220px, 38vw, 300px);
          transform: perspective(900px) rotateY(-18deg) rotateX(3deg);
          transition: transform 0.4s ease;
          filter: drop-shadow(0 24px 40px rgba(0,0,0,0.6));
        }
        .book-closed:hover .book-3d {
          transform: perspective(900px) rotateY(-26deg) rotateX(5deg);
        }

        .book-pages-bg {
          position: absolute;
          border-radius: 2px 8px 8px 2px;
          background: #ddd5c2;
        }
        .book-cover {
          position: absolute;
          inset: 0;
          border-radius: 3px 10px 10px 3px;
          border-left: clamp(6px,1.5vw,10px) solid #180404;
          background: #1a0208;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(8px,2vw,14px);
          padding: 16px;
          overflow: hidden;
        }
        .cover-ornament-top, .cover-ornament-bot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent);
        }
        .cover-ornament-top { top: 18px; }
        .cover-ornament-bot { bottom: 18px; }

        .cover-stars  { color: #c9a96e; font-size: clamp(10px,2vw,13px); letter-spacing: 8px; }
        .cover-title  {
          color: #c9a96e;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(14px,3vw,20px);
          font-style: italic;
          text-align: center;
          line-height: 1.3;
        }
        .cover-line   { width: 48px; height: 1px; background: rgba(201,169,110,0.4); }
        .cover-sub    {
          color: rgba(201,169,110,0.5);
          font-family: Montserrat, sans-serif;
          font-size: clamp(7px,1.4vw,9px);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-align: center;
        }
        .cover-count  {
          color: rgba(201,169,110,0.35);
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(10px,2vw,12px);
          font-style: italic;
          text-align: center;
        }
        .open-hint {
          font-family: Montserrat, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(178,58,78,0.7);
          animation: hintPulse 2.5s ease-in-out infinite;
        }
        @keyframes hintPulse {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        /* ── Libro abierto ── */
        .book-open-wrapper {
          width: 100%;
          max-width: 800px;
          animation: openIn 0.5s ease;
        }
        @keyframes openIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        .book-spread {
          display: flex;
          border-radius: 4px 14px 14px 4px;
          overflow: hidden;
          min-height: clamp(360px, 55vw, 480px);
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.7));
          position: relative;
        }

        /* Página izquierda — decorativa */
        .page-left {
          width: 42%;
          background: #120208;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(20px,4vw,40px);
          position: relative;
          flex-shrink: 0;
          border-right: 1px solid rgba(201,169,110,0.08);
        }
        .page-left-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(60px,12vw,100px);
          font-style: italic;
          color: rgba(139,26,47,0.12);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          line-height: 1;
          user-select: none;
        }
        .page-left-deco {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .page-left-divider {
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(201,169,110,0.4), transparent);
        }
        .page-left-label {
          font-family: Montserrat, sans-serif;
          font-size: 8px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(201,169,110,0.45);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        /* Lomo */
        .book-spine {
          width: clamp(4px,1vw,8px);
          background: #0a0105;
          flex-shrink: 0;
        }

        /* Página derecha — poema */
        .page-right {
          flex: 1;
          background: #f7f0e6;
          padding: clamp(24px,5vw,48px) clamp(20px,4vw,40px);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .page-lines {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            transparent, transparent 31px, rgba(0,0,0,0.04) 31px, rgba(0,0,0,0.04) 32px
          );
          pointer-events: none;
        }
        .page-eyebrow {
          font-family: Montserrat, sans-serif;
          font-size: 8px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #b23a4e;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }
        .page-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(20px,4vw,30px);
          font-style: italic;
          font-weight: 400;
          color: #1a0208;
          margin-bottom: 6px;
          line-height: 1.2;
          position: relative;
          z-index: 1;
        }
        .page-divider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        .page-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(139,26,47,0.2);
        }
        .page-divider-icon {
          color: #b23a4e;
          font-size: 10px;
        }
        .page-content {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(14px,2.5vw,17px);
          line-height: 1.85;
          color: #2a1015;
          flex: 1;
          position: relative;
          z-index: 1;
          white-space: pre-wrap;
          display: -webkit-box;
          -webkit-line-clamp: 7;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .page-read-btn {
          font-family: Montserrat, sans-serif;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8b1a2f;
          background: none;
          border: 1px solid rgba(139,26,47,0.3);
          border-radius: 20px;
          padding: 9px 20px;
          cursor: pointer;
          transition: all 0.25s;
          margin-top: 20px;
          align-self: flex-start;
          position: relative;
          z-index: 1;
        }
        .page-read-btn:hover {
          background: rgba(139,26,47,0.08);
          border-color: rgba(139,26,47,0.5);
        }
        .page-num {
          position: absolute;
          bottom: 16px;
          right: 24px;
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 11px;
          color: rgba(0,0,0,0.25);
          z-index: 1;
        }

        /* Animación de página */
        .page-right.flipping-next {
          animation: flipNext 0.32s ease;
        }
        .page-right.flipping-prev {
          animation: flipPrev 0.32s ease;
        }
        @keyframes flipNext {
          0%   { opacity: 1; transform: translateX(0); }
          40%  { opacity: 0; transform: translateX(20px); }
          60%  { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes flipPrev {
          0%   { opacity: 1; transform: translateX(0); }
          40%  { opacity: 0; transform: translateX(-20px); }
          60%  { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        /* Navegación del libro */
        .book-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(12px,2vw,18px) clamp(16px,3vw,28px);
          background: #0e0206;
          border-radius: 0 0 14px 0;
        }
        .book-nav-left {
          background: #0e0206;
          border-radius: 0 0 0 4px;
          padding: clamp(12px,2vw,18px) clamp(16px,3vw,28px);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42%;
          flex-shrink: 0;
        }
        .book-nav-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(12px,2vw,18px) clamp(16px,3vw,28px);
          background: #0e0206;
          border-radius: 0 0 14px 0;
          gap: 8px;
        }
        .nav-arrow {
          background: none;
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(201,169,110,0.6);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nav-arrow:hover:not(:disabled) {
          background: rgba(201,169,110,0.08);
          border-color: rgba(201,169,110,0.5);
          color: #c9a96e;
        }
        .nav-arrow:disabled {
          opacity: 0.2;
          cursor: default;
        }
        .nav-counter {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 12px;
          color: rgba(201,169,110,0.4);
          flex: 1;
          text-align: center;
        }
        .nav-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
          letter-spacing: 2px;
          font-family: Montserrat, sans-serif;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px;
          text-transform: uppercase;
        }
        .nav-close:hover { color: rgba(255,255,255,0.5); }

        /* Estado vacío */
        .book-empty {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          color: rgba(201,169,110,0.4);
          font-size: 15px;
          text-align: center;
          padding: 40px;
          position: relative;
          z-index: 1;
        }

        /* Mobile: oculta página izquierda */
        @media (max-width: 520px) {
          .page-left { display: none; }
          .book-spine { display: none; }
          .book-spread { border-radius: 4px 14px 14px 4px; }
          .book-nav-left { display: none; }
          .book-nav-right { border-radius: 0 0 14px 14px; }
        }
      `}</style>

      <div className="book-scene">

        {/* ── LIBRO CERRADO ── */}
        {!isOpen && (
          <div className="book-closed" onClick={openBook} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && openBook()}
            aria-label="Abrir el libro de cartas"
          >
            <div className="book-3d">
              {/* Páginas traseras */}
              <div className="book-pages-bg" style={{ left:14, top:3, width:'calc(100% - 6px)', height:'calc(100% - 4px)', background:'#ccc4b0' }}/>
              <div className="book-pages-bg" style={{ left:10, top:2, width:'calc(100% - 4px)', height:'calc(100% - 2px)', background:'#ddd5c2' }}/>
              {/* Portada */}
              <div className="book-cover">
                <div className="cover-ornament-top"/>
                <div className="cover-stars">✦ ✦ ✦</div>
                <div className="cover-title">Cartas<br/>para Victoria</div>
                <div className="cover-line"/>
                <div className="cover-sub">Palabras del corazón</div>
                {poems.length > 0 && (
                  <div className="cover-count">
                    {poems.length} {poems.length === 1 ? 'carta' : 'cartas'}
                  </div>
                )}
                <div className="cover-ornament-bot"/>
              </div>
            </div>
            <div className="open-hint">✦ &nbsp; toca para abrir &nbsp; ✦</div>
          </div>
        )}

        {/* ── LIBRO ABIERTO ── */}
        {isOpen && (
          <div className="book-open-wrapper">
            {/* Páginas */}
            <div className="book-spread">
              {/* Página izquierda */}
              <div className="page-left">
                <div className="page-left-num">{String(pageIndex + 1).padStart(2, '0')}</div>
                <div className="page-left-deco">
                  <div className="page-left-divider"/>
                  <div className="page-left-label">Para Victoria</div>
                  <div className="page-left-divider"/>
                </div>
                {/* Mini constelación SVG */}
                <svg width="70" height="70" viewBox="0 0 70 70" style={{ position:'absolute', bottom:28, opacity:0.4 }}>
                  <circle cx="35" cy="10" r="1.5" fill="#c9a96e"/>
                  <circle cx="12" cy="35" r="1" fill="#c9a96e"/>
                  <circle cx="58" cy="32" r="1" fill="#c9a96e"/>
                  <circle cx="22" cy="58" r="1.5" fill="#c9a96e"/>
                  <circle cx="50" cy="55" r="1" fill="#c9a96e"/>
                  <circle cx="35" cy="38" r="2" fill="#c9a96e"/>
                  <line x1="35" y1="10" x2="12" y2="35" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5"/>
                  <line x1="35" y1="10" x2="58" y2="32" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5"/>
                  <line x1="12" y1="35" x2="35" y2="38" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5"/>
                  <line x1="58" y1="32" x2="35" y2="38" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5"/>
                  <line x1="35" y1="38" x2="22" y2="58" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="35" y1="38" x2="50" y2="55" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4"/>
                </svg>
              </div>

              {/* Lomo */}
              <div className="book-spine"/>

              {/* Página derecha */}
              <div className={`page-right${flipping ? ` flipping-${flipDir}` : ''}`}>
                <div className="page-lines"/>
                {currentPoem ? (
                  <>
                    <p className="page-eyebrow">✦ Para Victoria ✦</p>
                    <h2 className="page-title">{currentPoem.title}</h2>
                    <div className="page-divider">
                      <div className="page-divider-line"/>
                      <span className="page-divider-icon">♥</span>
                      <div className="page-divider-line"/>
                    </div>
                    <p className="page-content">{currentPoem.content}</p>
                    <button
                      className="page-read-btn"
                      onClick={() => onOpen && onOpen(currentPoem)}
                    >
                      Leer carta completa →
                    </button>
                    <span className="page-num">{pageIndex + 1}</span>
                  </>
                ) : (
                  <p className="book-empty">
                    Aún no hay cartas escritas...<br/>
                    Sé la primera ✦
                  </p>
                )}
              </div>
            </div>

            {/* Barra de navegación */}
            <div style={{ display:'flex' }}>
              <div className="book-nav-left">
                <button className="nav-close" onClick={closeBook}>✕ cerrar</button>
              </div>
              <div className="book-nav-right" style={{ marginLeft: `clamp(4px,1vw,8px)` }}>
                <button
                  className="nav-arrow"
                  onClick={() => goTo('prev')}
                  disabled={pageIndex === 0}
                  aria-label="Carta anterior"
                >‹</button>
                <span className="nav-counter">
                  {poems.length > 0
                    ? `${pageIndex + 1} de ${poems.length}`
                    : '—'}
                </span>
                <button
                  className="nav-arrow"
                  onClick={() => goTo('next')}
                  disabled={pageIndex >= poems.length - 1}
                  aria-label="Carta siguiente"
                >›</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}