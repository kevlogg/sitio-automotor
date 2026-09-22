import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider
 * Transparent strip: a 48px wheel rolls across with a visible smoke cloud trailing behind.
 * Smoke and wheel are siblings in a wider motion container so nothing clips the puffs.
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState(null); // 'right' | 'left' | null
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 2) isScrollingDown.current = true;
      else if (y < lastScrollY.current - 2) isScrollingDown.current = false;
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dir = isScrollingDown.current ? 'right' : 'left';
            setDirection(dir);
            setAnimKey((k) => k + 1);
            setTimeout(() => setDirection(null), 2200);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goRight = direction === 'right';

  return (
    <>
      <style>{`
        /* Wheel translation across screen */
        @keyframes rollRight {
          0%   { transform: translateX(-120px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
        }
        @keyframes rollLeft {
          0%   { transform: translateX(calc(100vw + 20px)); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(-120px); opacity: 0; }
        }
        /* Rim spin */
        @keyframes rimCW  { to { transform: rotate(1440deg); } }
        @keyframes rimCCW { to { transform: rotate(-1440deg); } }

        /* Smoke puffs — drift away from trailing side */
        @keyframes puffOutLeft {
          0%   { transform: translate(0px, 0px)   scale(0.4); opacity: 0.9; }
          40%  { opacity: 0.75; }
          100% { transform: translate(-38px, -20px) scale(3);   opacity: 0; }
        }
        @keyframes puffOutLeft2 {
          0%   { transform: translate(0px, 0px)   scale(0.3); opacity: 0.8; }
          40%  { opacity: 0.65; }
          100% { transform: translate(-48px, -30px) scale(3.5); opacity: 0; }
        }
        @keyframes puffOutLeft3 {
          0%   { transform: translate(0px, 0px)   scale(0.5); opacity: 0.7; }
          40%  { opacity: 0.55; }
          100% { transform: translate(-28px, -14px) scale(2.5); opacity: 0; }
        }
        @keyframes puffOutRight {
          0%   { transform: translate(0px, 0px)  scale(0.4); opacity: 0.9; }
          40%  { opacity: 0.75; }
          100% { transform: translate(38px, -20px) scale(3);   opacity: 0; }
        }
        @keyframes puffOutRight2 {
          0%   { transform: translate(0px, 0px)  scale(0.3); opacity: 0.8; }
          40%  { opacity: 0.65; }
          100% { transform: translate(48px, -30px) scale(3.5); opacity: 0; }
        }
        @keyframes puffOutRight3 {
          0%   { transform: translate(0px, 0px)  scale(0.5); opacity: 0.7; }
          40%  { opacity: 0.55; }
          100% { transform: translate(28px, -14px) scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* Invisible height-reserving container */}
      <div
        ref={containerRef}
        role="presentation"
        style={{
          position: 'relative',
          width: '100%',
          height: '56px',
          background: 'transparent',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {direction && (
          /*
           * Motion wrapper: 120px wide (48px wheel + 72px smoke room).
           * When going right: smoke is on the LEFT side (index 0..70 = smoke, 72..120 = wheel).
           * When going left:  smoke is on the RIGHT side (0..48 = wheel, 48..120 = smoke).
           * translateX animation moves this entire wrapper across the screen.
           */
          <div
            key={`${direction}-${animKey}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '120px',
              height: '48px',
              marginTop: '-24px',
              willChange: 'transform',
              animation: `${goRight ? 'rollRight' : 'rollLeft'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards`,
              display: 'flex',
              flexDirection: goRight ? 'row' : 'row-reverse', // smoke always trails behind wheel
              alignItems: 'center',
            }}
          >
            {/* ── SMOKE CLUSTER (72px wide, positioned trailing side) ── */}
            <div
              style={{
                position: 'relative',
                width: '72px',
                height: '48px',
                flexShrink: 0,
                overflow: 'visible',
              }}
            >
              {/* Puff 1 */}
              <div style={{
                position: 'absolute',
                left: '28px', top: '14px',
                width: '22px', height: '22px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(235,215,255,0.85) 0%, rgba(168,85,247,0.55) 45%, transparent 72%)',
                filter: 'blur(4px)',
                animation: `${goRight ? 'puffOutLeft' : 'puffOutRight'} 0.7s ease-out infinite 0s`,
              }} />
              {/* Puff 2 — larger, slower */}
              <div style={{
                position: 'absolute',
                left: '20px', top: '18px',
                width: '30px', height: '30px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,190,255,0.75) 0%, rgba(147,51,234,0.45) 40%, transparent 70%)',
                filter: 'blur(6px)',
                animation: `${goRight ? 'puffOutLeft2' : 'puffOutRight2'} 0.9s ease-out infinite 0.18s`,
              }} />
              {/* Puff 3 — small, fast */}
              <div style={{
                position: 'absolute',
                left: '34px', top: '10px',
                width: '16px', height: '16px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,230,255,0.9) 0%, rgba(192,132,252,0.6) 40%, transparent 75%)',
                filter: 'blur(3px)',
                animation: `${goRight ? 'puffOutLeft3' : 'puffOutRight3'} 0.55s ease-out infinite 0.35s`,
              }} />
            </div>

            {/* ── WHEEL SVG 48×48 ── */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              style={{
                flexShrink: 0,
                display: 'block',
                transform: goRight ? 'skewX(-10deg)' : 'skewX(10deg)',
                filter: 'drop-shadow(0 2px 10px rgba(147,51,234,0.6))',
              }}
            >
              <defs>
                <linearGradient id="wsdSpoke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="55%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
              </defs>

              {/* Black tyre */}
              <circle cx="50" cy="50" r="48" fill="#0c0c0f" stroke="#09090b" strokeWidth="3" />
              {/* Tread */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1e22" strokeWidth="5" strokeDasharray="7 5" />
              {/* Rim */}
              <circle cx="50" cy="50" r="35" fill="#141418" stroke="#3f3f46" strokeWidth="2" />

              {/* Spinning group */}
              <g style={{ transformOrigin: '50px 50px', animation: `${goRight ? 'rimCW' : 'rimCCW'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards` }}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    d="M47 46 L48 17 Q50 14 52 17 L53 46 Z"
                    fill="url(#wsdSpoke)"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
                <circle cx="50" cy="50" r="13" fill="#09090b" stroke="#a855f7" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="6"  fill="#a855f7" />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <circle key={deg} cx="50" cy="31" r="2.5" fill="#d4d4d8" transform={`rotate(${deg} 50 50)`} />
                ))}
              </g>

              {/* Brake caliper (static) */}
              <path d="M76 36 A28 28 0 0 0 76 64 L85 59 A37 37 0 0 1 85 41 Z" fill="#4c1d95" stroke="#7c3aed" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
