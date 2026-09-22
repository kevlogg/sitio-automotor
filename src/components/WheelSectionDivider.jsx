import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider
 * Dark strip with a wheel rolling across leaving a long ground-hugging smoke trail.
 * Reference style: horizontal cloud of purple puffs, small sparks near wheel.
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState(null);
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
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const dir = isScrollingDown.current ? 'right' : 'left';
            setDirection(dir);
            setAnimKey((k) => k + 1);
            setTimeout(() => setDirection(null), 2400);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goRight = direction === 'right';

  // Smoke puffs: arranged in a horizontal line.
  // Index 0 = farthest from wheel (small + faint), last = closest to wheel (large + bright)
  // positions are in the 280px smoke zone
  const smokePuffs = [
    { size: 18, x: 8,   bottom: -4,  opacity: 0.25, blur: 6,  delay: '0.6s',  dur: '1.2s' },
    { size: 24, x: 28,  bottom: -4,  opacity: 0.35, blur: 7,  delay: '0.5s',  dur: '1.1s' },
    { size: 32, x: 50,  bottom: -6,  opacity: 0.45, blur: 8,  delay: '0.45s', dur: '1.0s' },
    { size: 38, x: 72,  bottom: -6,  opacity: 0.50, blur: 9,  delay: '0.4s',  dur: '0.95s' },
    { size: 44, x: 96,  bottom: -8,  opacity: 0.58, blur: 9,  delay: '0.35s', dur: '0.9s' },
    { size: 50, x: 118, bottom: -8,  opacity: 0.62, blur: 10, delay: '0.3s',  dur: '0.88s' },
    { size: 52, x: 142, bottom: -10, opacity: 0.68, blur: 10, delay: '0.22s', dur: '0.82s' },
    { size: 56, x: 162, bottom: -10, opacity: 0.72, blur: 11, delay: '0.18s', dur: '0.78s' },
    { size: 58, x: 182, bottom: -12, opacity: 0.78, blur: 11, delay: '0.12s', dur: '0.75s' },
    { size: 56, x: 198, bottom: -12, opacity: 0.82, blur: 12, delay: '0.08s', dur: '0.72s' },
    { size: 52, x: 214, bottom: -14, opacity: 0.85, blur: 12, delay: '0.04s', dur: '0.7s'  },
    { size: 48, x: 228, bottom: -14, opacity: 0.88, blur: 12, delay: '0s',    dur: '0.68s' },
  ];

  // Sparks: tiny bright dots near wheel
  const sparks = [
    { size: 3,  x: 8,  bottom: 14, delay: '0s',    dur: '0.5s' },
    { size: 2,  x: 18, bottom: 20, delay: '0.15s', dur: '0.4s' },
    { size: 3,  x: 4,  bottom: 8,  delay: '0.3s',  dur: '0.6s' },
    { size: 2,  x: 28, bottom: 16, delay: '0.1s',  dur: '0.45s' },
  ];

  // Total motion width: 280px smoke + 52px wheel
  const smokeW = 280;
  const wheelW = 52;

  return (
    <>
      <style>{`
        @keyframes rollRight {
          0%   { transform: translateX(-${smokeW + wheelW + 20}px); opacity: 0; }
          4%   { opacity: 1; }
          96%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
        }
        @keyframes rollLeft {
          0%   { transform: translateX(calc(100vw + 20px)); opacity: 0; }
          4%   { opacity: 1; }
          96%  { opacity: 1; }
          100% { transform: translateX(-${smokeW + wheelW + 20}px); opacity: 0; }
        }
        @keyframes rimCW  { from { transform: rotate(0deg); } to { transform: rotate(1440deg); } }
        @keyframes rimCCW { from { transform: rotate(0deg); } to { transform: rotate(-1440deg); } }

        /* Ground-level smoke puff: expands upward and fades */
        @keyframes groundPuff {
          0%   { transform: scaleY(0.5) scaleX(0.7); opacity: 0; }
          20%  { opacity: 1; }
          70%  { opacity: 0.8; }
          100% { transform: scaleY(1) scaleX(1) translateY(-6px); opacity: 0; }
        }

        /* Sparks float upward and disappear */
        @keyframes sparkFloat {
          0%   { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>

      {/* Dark section divider strip */}
      <div
        ref={containerRef}
        role="presentation"
        style={{
          position: 'relative',
          width: '100%',
          height: '68px',
          background: 'linear-gradient(180deg, #06060a 0%, #0a0a12 50%, #06060a 100%)',
          overflow: 'hidden',
          borderTop: '1px solid rgba(139,92,246,0.25)',
          borderBottom: '1px solid rgba(139,92,246,0.25)',
          pointerEvents: 'none',
        }}
      >
        {/* Subtle purple ambient glow on the floor */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '30px',
          background: 'linear-gradient(0deg, rgba(109,40,217,0.08) 0%, transparent 100%)',
        }} />

        {direction && (
          <div
            key={`${direction}-${animKey}`}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: `${smokeW + wheelW}px`,
              height: '68px',
              willChange: 'transform',
              animation: `${goRight ? 'rollRight' : 'rollLeft'} 2s cubic-bezier(0.18,0.6,0.34,1) forwards`,
              display: 'flex',
              flexDirection: goRight ? 'row' : 'row-reverse',
              alignItems: 'flex-end',
            }}
          >
            {/* ─── SMOKE TRAIL ZONE (280px) ─── */}
            <div
              style={{
                position: 'relative',
                width: `${smokeW}px`,
                height: '68px',
                flexShrink: 0,
                overflow: 'visible',
              }}
            >
              {smokePuffs.map(({ size, x, bottom, opacity, blur, delay, dur }, i) => {
                // Mirror positions when going left
                const posX = goRight ? x : smokeW - x - size;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${posX}px`,
                      bottom: `${bottom}px`,
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      background: `radial-gradient(circle,
                        rgba(245,230,255,${opacity * 0.9}) 0%,
                        rgba(192,132,252,${opacity * 0.75}) 25%,
                        rgba(139,92,246,${opacity * 0.55}) 50%,
                        rgba(109,40,217,${opacity * 0.25}) 70%,
                        transparent 85%
                      )`,
                      filter: `blur(${blur}px)`,
                      animation: `groundPuff ${dur} ease-out infinite ${delay}`,
                      willChange: 'transform, opacity',
                    }}
                  />
                );
              })}
            </div>

            {/* ─── WHEEL + SPARKS (52px) ─── */}
            <div style={{ position: 'relative', width: `${wheelW}px`, height: '68px', flexShrink: 0 }}>
              {/* Sparks near wheel base */}
              {sparks.map(({ size, x, bottom, delay, dur }, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: goRight ? `${x}px` : `${wheelW - x - size}px`,
                    bottom: `${bottom}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    background: 'rgba(245,208,80,0.95)',
                    boxShadow: '0 0 4px 2px rgba(245,208,80,0.5)',
                    animation: `sparkFloat ${dur} ease-out infinite ${delay}`,
                  }}
                />
              ))}

              {/* Wheel SVG */}
              <svg
                width={wheelW}
                height={wheelW}
                viewBox="0 0 100 100"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: 0,
                  display: 'block',
                  transform: goRight ? 'skewX(-8deg)' : 'skewX(8deg)',
                  filter: 'drop-shadow(0 0 10px rgba(147,51,234,0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.9))',
                }}
              >
                <defs>
                  <linearGradient id="wsdSpoke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="55%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                </defs>
                {/* Tyre */}
                <circle cx="50" cy="50" r="48" fill="#0d0d10" stroke="#09090b" strokeWidth="3" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#202025" strokeWidth="5" strokeDasharray="7 5" />
                {/* Rim */}
                <circle cx="50" cy="50" r="35" fill="#14141a" stroke="#3f3f46" strokeWidth="2" />
                {/* Spokes + center — spinning */}
                <g style={{ transformOrigin: '50px 50px', animation: `${goRight ? 'rimCW' : 'rimCCW'} 2s cubic-bezier(0.18,0.6,0.34,1) forwards` }}>
                  {[0,72,144,216,288].map((deg) => (
                    <path key={deg} d="M47 46 L48 17 Q50 14 52 17 L53 46 Z" fill="url(#wsdSpoke)" transform={`rotate(${deg} 50 50)`} />
                  ))}
                  <circle cx="50" cy="50" r="13" fill="#09090b" stroke="#a855f7" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="6" fill="#a855f7" />
                  {[0,72,144,216,288].map((deg) => (
                    <circle key={deg} cx="50" cy="31" r="2.5" fill="#d4d4d8" transform={`rotate(${deg} 50 50)`} />
                  ))}
                </g>
                {/* Caliper */}
                <path d="M76 36 A28 28 0 0 0 76 64 L85 59 A37 37 0 0 1 85 41 Z" fill="#4c1d95" stroke="#7c3aed" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
