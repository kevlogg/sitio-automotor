import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider — invisible strip, only a wheel + smoke passes through.
 * No background, no borders, no black box. Just the wheel.
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
            setTimeout(() => setDirection(null), 2000);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goRight = direction === 'right';

  return (
    <>
      <style>{`
        @keyframes wsdRight {
          0%   { transform: translateX(-52px); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 52px)); opacity: 0; }
        }
        @keyframes wsdLeft {
          0%   { transform: translateX(calc(100vw + 52px)); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(-52px); opacity: 0; }
        }
        @keyframes wsdSpinCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(1440deg); }
        }
        @keyframes wsdSpinCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-1440deg); }
        }
        @keyframes wsdPuff1 {
          0%   { transform: translate(0,0) scale(0.5); opacity: 0.7; }
          100% { transform: translate(${goRight ? '-14px' : '14px'},-10px) scale(2.2); opacity: 0; }
        }
        @keyframes wsdPuff2 {
          0%   { transform: translate(0,0) scale(0.4); opacity: 0.6; }
          100% { transform: translate(${goRight ? '-18px' : '18px'},-14px) scale(2.8); opacity: 0; }
        }
        @keyframes wsdPuff3 {
          0%   { transform: translate(0,0) scale(0.3); opacity: 0.5; }
          100% { transform: translate(${goRight ? '-10px' : '10px'},-8px) scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* Invisible container — zero background, just reserves height */}
      <div
        ref={containerRef}
        role="presentation"
        style={{
          position: 'relative',
          width: '100%',
          height: '40px',
          overflow: 'visible',
          background: 'transparent',
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
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              willChange: 'transform',
              animation: `${goRight ? 'wsdRight' : 'wsdLeft'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Smoke puffs — appear behind/beside wheel */}
            {[
              { size: 14, delay: '0s', anim: 'wsdPuff1', offset: goRight ? { right: '28px', top: '6px' } : { left: '28px', top: '6px' } },
              { size: 18, delay: '0.12s', anim: 'wsdPuff2', offset: goRight ? { right: '24px', top: '2px' } : { left: '24px', top: '2px' } },
              { size: 11, delay: '0.25s', anim: 'wsdPuff3', offset: goRight ? { right: '32px', top: '10px' } : { left: '32px', top: '10px' } },
            ].map(({ size, delay, anim, offset }, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(220,190,255,0.6) 0%, rgba(147,51,234,0.3) 40%, transparent 75%)',
                  filter: 'blur(3px)',
                  animation: `${anim} 0.65s ease-out infinite ${delay}`,
                  ...offset,
                }}
              />
            ))}

            {/* Wheel SVG — explicit 36x36, no overflow */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 100 100"
              style={{
                display: 'block',
                flexShrink: 0,
                transform: goRight ? 'skewX(-10deg)' : 'skewX(10deg)',
                filter: 'drop-shadow(0 2px 6px rgba(147,51,234,0.5))',
              }}
            >
              {/* Outer tyre */}
              <circle cx="50" cy="50" r="48" fill="#0f0f12" stroke="#09090b" strokeWidth="3" />
              {/* Tread pattern */}
              <circle cx="50" cy="50" r="43" fill="none" stroke="#222226" strokeWidth="3" strokeDasharray="6 5" />
              {/* Rim base */}
              <circle cx="50" cy="50" r="35" fill="#16161a" stroke="#3f3f46" strokeWidth="2" />

              {/* 5 violet spokes — spinning group */}
              <g
                style={{
                  transformOrigin: '50px 50px',
                  animation: goRight
                    ? 'wsdSpinCW 2s cubic-bezier(0.22,0.61,0.36,1) forwards'
                    : 'wsdSpinCCW 2s cubic-bezier(0.22,0.61,0.36,1) forwards',
                }}
              >
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    d="M47 46 L48 18 Q50 15 52 18 L53 46 Z"
                    fill="url(#spokeGrad)"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
                {/* Center hub */}
                <circle cx="50" cy="50" r="12" fill="#09090b" stroke="#a855f7" strokeWidth="2" />
                <circle cx="50" cy="50" r="5" fill="#a855f7" />
                {/* Lug nuts */}
                {[0, 72, 144, 216, 288].map((deg) => (
                  <circle
                    key={deg}
                    cx="50"
                    cy="33"
                    r="2"
                    fill="#d4d4d8"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
              </g>

              {/* Brake caliper */}
              <path
                d="M76 38 A28 28 0 0 0 76 62 L83 58 A35 35 0 0 1 83 42 Z"
                fill="#4c1d95"
                stroke="#7c3aed"
                strokeWidth="1"
              />

              <defs>
                <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
