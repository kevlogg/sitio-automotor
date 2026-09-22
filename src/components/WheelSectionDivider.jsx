import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider — fully transparent strip, 48px wheel + visible smoke drift.
 * Fixed smoke keyframes (no JSX template dependency).
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
      {/* Static keyframes — no JSX variable dependency */}
      <style>{`
        @keyframes wsdRight {
          0%   { transform: translateX(-60px); opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 60px)); opacity: 0; }
        }
        @keyframes wsdLeft {
          0%   { transform: translateX(calc(100vw + 60px)); opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes wsdSpinCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(1440deg); }
        }
        @keyframes wsdSpinCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-1440deg); }
        }
        /* Smoke drifts left (behind wheel moving right) */
        @keyframes smokeL1 {
          0%   { transform: translate(0px, 0px) scale(0.5); opacity: 0.85; }
          100% { transform: translate(-20px, -12px) scale(2.5); opacity: 0; }
        }
        @keyframes smokeL2 {
          0%   { transform: translate(0px, 0px) scale(0.4); opacity: 0.7; }
          100% { transform: translate(-26px, -18px) scale(3.2); opacity: 0; }
        }
        @keyframes smokeL3 {
          0%   { transform: translate(0px, 0px) scale(0.3); opacity: 0.6; }
          100% { transform: translate(-14px, -8px) scale(2); opacity: 0; }
        }
        /* Smoke drifts right (behind wheel moving left) */
        @keyframes smokeR1 {
          0%   { transform: translate(0px, 0px) scale(0.5); opacity: 0.85; }
          100% { transform: translate(20px, -12px) scale(2.5); opacity: 0; }
        }
        @keyframes smokeR2 {
          0%   { transform: translate(0px, 0px) scale(0.4); opacity: 0.7; }
          100% { transform: translate(26px, -18px) scale(3.2); opacity: 0; }
        }
        @keyframes smokeR3 {
          0%   { transform: translate(0px, 0px) scale(0.3); opacity: 0.6; }
          100% { transform: translate(14px, -8px) scale(2); opacity: 0; }
        }
      `}</style>

      {/* Transparent container */}
      <div
        ref={containerRef}
        role="presentation"
        style={{
          position: 'relative',
          width: '100%',
          height: '52px',
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
              marginTop: '-24px', // half of 48px wheel
              width: '48px',
              height: '48px',
              willChange: 'transform',
              animation: `${goRight ? 'wsdRight' : 'wsdLeft'} 2s cubic-bezier(0.22,0.61,0.36,1) forwards`,
            }}
          >
            {/* === SMOKE PUFFS === */}
            {/* Smoke appears on the trailing side of the wheel */}
            {[
              {
                size: 18,
                delay: '0s',
                duration: '0.7s',
                anim: goRight ? 'smokeL1' : 'smokeR1',
                style: goRight
                  ? { right: '-4px', bottom: '6px' }
                  : { left: '-4px', bottom: '6px' },
              },
              {
                size: 24,
                delay: '0.15s',
                duration: '0.85s',
                anim: goRight ? 'smokeL2' : 'smokeR2',
                style: goRight
                  ? { right: '-2px', bottom: '2px' }
                  : { left: '-2px', bottom: '2px' },
              },
              {
                size: 14,
                delay: '0.3s',
                duration: '0.6s',
                anim: goRight ? 'smokeL3' : 'smokeR3',
                style: goRight
                  ? { right: '2px', bottom: '10px' }
                  : { left: '2px', bottom: '10px' },
              },
            ].map(({ size, delay, duration, anim, style: puffStyle }, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(230,200,255,0.75) 0%, rgba(147,51,234,0.45) 40%, transparent 72%)',
                  filter: 'blur(4px)',
                  animation: `${anim} ${duration} ease-out infinite ${delay}`,
                  ...puffStyle,
                }}
              />
            ))}

            {/* === WHEEL SVG 48×48 === */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              style={{
                display: 'block',
                transform: goRight ? 'skewX(-10deg)' : 'skewX(10deg)',
                filter: 'drop-shadow(0 3px 8px rgba(147,51,234,0.55))',
              }}
            >
              <defs>
                <linearGradient id="wsdSpokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
              </defs>

              {/* Outer tyre - black rubber */}
              <circle cx="50" cy="50" r="48" fill="#0d0d10" stroke="#09090b" strokeWidth="3" />
              {/* Tread dashes */}
              <circle cx="50" cy="50" r="43" fill="none" stroke="#1f1f24" strokeWidth="4" strokeDasharray="7 5" />
              {/* Inner rim edge */}
              <circle cx="50" cy="50" r="37" fill="#141418" stroke="#3f3f46" strokeWidth="2" />

              {/* Spinning group (5 violet spokes + center) */}
              <g
                style={{
                  transformOrigin: '50px 50px',
                  animation: goRight
                    ? 'wsdSpinCW 2s cubic-bezier(0.22,0.61,0.36,1) forwards'
                    : 'wsdSpinCCW 2s cubic-bezier(0.22,0.61,0.36,1) forwards',
                }}
              >
                {/* 5 spokes at 72° intervals */}
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    d="M47 46 L48 17 Q50 14 52 17 L53 46 Z"
                    fill="url(#wsdSpokeGrad)"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
                {/* Center hub ring */}
                <circle cx="50" cy="50" r="13" fill="#09090b" stroke="#a855f7" strokeWidth="2.5" />
                {/* Center cap */}
                <circle cx="50" cy="50" r="6" fill="#a855f7" />
                {/* Lug nuts */}
                {[0, 72, 144, 216, 288].map((deg) => (
                  <circle
                    key={deg}
                    cx="50"
                    cy="31"
                    r="2.5"
                    fill="#d4d4d8"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
              </g>

              {/* Brake caliper (fixed, doesn't spin) */}
              <path
                d="M76 36 A28 28 0 0 0 76 64 L85 59 A37 37 0 0 1 85 41 Z"
                fill="#4c1d95"
                stroke="#7c3aed"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
