import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider
 * Dense drift smoke cloud — 8 overlapping puffs with staggered timing
 * create a continuous burnout aura trailing behind the wheel.
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
            setTimeout(() => setDirection(null), 2300);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goRight = direction === 'right';

  // 8 smoke puffs — each has size, x/y position in smoke zone, delay, duration
  // Positions are within the 180px smoke zone, varying to create a wide cloud
  const puffs = [
    { size: 65, x: 55,  y: 20, delay: '0s',    dur: '0.9s'  },
    { size: 80, x: 30,  y: 12, delay: '0.1s',  dur: '1.1s'  },
    { size: 50, x: 90,  y: 28, delay: '0.2s',  dur: '0.75s' },
    { size: 70, x: 15,  y: 22, delay: '0.3s',  dur: '1.0s'  },
    { size: 55, x: 70,  y: 8,  delay: '0.15s', dur: '0.85s' },
    { size: 85, x: 45,  y: 18, delay: '0.4s',  dur: '1.15s' },
    { size: 45, x: 105, y: 30, delay: '0.05s', dur: '0.7s'  },
    { size: 60, x: 80,  y: 25, delay: '0.25s', dur: '0.95s' },
  ];

  return (
    <>
      <style>{`
        @keyframes rollRight {
          0%   { transform: translateX(-240px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 30px)); opacity: 0; }
        }
        @keyframes rollLeft {
          0%   { transform: translateX(calc(100vw + 30px)); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(-240px); opacity: 0; }
        }
        @keyframes rimCW  { from { transform: rotate(0deg); } to { transform: rotate(1440deg); } }
        @keyframes rimCCW { from { transform: rotate(0deg); } to { transform: rotate(-1440deg); } }

        /* Dense smoke — puffs expand upward and fade */
        @keyframes driftPuff {
          0%   { transform: scale(0.35); opacity: 0.0; }
          15%  { opacity: 0.85; }
          55%  { opacity: 0.6; }
          100% { transform: scale(1) translateY(-18px); opacity: 0; }
        }
      `}</style>

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
          <div
            key={`${direction}-${animKey}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '228px',    // 180px smoke + 48px wheel
              height: '48px',
              marginTop: '-24px',
              willChange: 'transform',
              animation: `${goRight ? 'rollRight' : 'rollLeft'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards`,
              display: 'flex',
              flexDirection: goRight ? 'row' : 'row-reverse',
              alignItems: 'center',
            }}
          >
            {/* ─── SMOKE CLOUD ZONE (180px) ─── */}
            <div
              style={{
                position: 'relative',
                width: '180px',
                height: '48px',
                flexShrink: 0,
                overflow: 'visible',
              }}
            >
              {puffs.map(({ size, x, y, delay, dur }, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    // Mirror x position for left-travel direction
                    left: goRight ? `${x}px` : `${180 - x - size}px`,
                    top: `${y}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle,
                      rgba(240,225,255,0.88) 0%,
                      rgba(192,132,252,0.60) 30%,
                      rgba(147,51,234,0.35) 58%,
                      transparent 78%
                    )`,
                    filter: 'blur(8px)',
                    animation: `driftPuff ${dur} ease-out infinite ${delay}`,
                    willChange: 'transform, opacity',
                  }}
                />
              ))}

              {/* Wide glow base — continuous ambient aura under the cloud */}
              <div style={{
                position: 'absolute',
                left: goRight ? '0px' : '0px',
                top: '8px',
                width: '160px',
                height: '36px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }} />
            </div>

            {/* ─── WHEEL SVG 48×48 ─── */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              style={{
                flexShrink: 0,
                display: 'block',
                transform: goRight ? 'skewX(-10deg)' : 'skewX(10deg)',
                filter: 'drop-shadow(0 2px 12px rgba(147,51,234,0.7))',
              }}
            >
              <defs>
                <linearGradient id="wsdSpoke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="55%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="#0c0c0f" stroke="#09090b" strokeWidth="3" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1e22" strokeWidth="5" strokeDasharray="7 5" />
              <circle cx="50" cy="50" r="35" fill="#141418" stroke="#3f3f46" strokeWidth="2" />
              <g style={{ transformOrigin: '50px 50px', animation: `${goRight ? 'rimCW' : 'rimCCW'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards` }}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path key={deg} d="M47 46 L48 17 Q50 14 52 17 L53 46 Z" fill="url(#wsdSpoke)" transform={`rotate(${deg} 50 50)`} />
                ))}
                <circle cx="50" cy="50" r="13" fill="#09090b" stroke="#a855f7" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="6"  fill="#a855f7" />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <circle key={deg} cx="50" cy="31" r="2.5" fill="#d4d4d8" transform={`rotate(${deg} 50 50)`} />
                ))}
              </g>
              <path d="M76 36 A28 28 0 0 0 76 64 L85 59 A37 37 0 0 1 85 41 Z" fill="#4c1d95" stroke="#7c3aed" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
