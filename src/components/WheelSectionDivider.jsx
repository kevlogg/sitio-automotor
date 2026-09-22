import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider — thin 20px strip with a tiny 32px wheel rolling across.
 * The SVG wheel has explicit width/height so it NEVER bleeds outside its box.
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState(null); // 'right' | 'left' | null
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);

  // Track scroll direction globally
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

  // Trigger animation when this strip enters the viewport
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
            setTimeout(() => setDirection(null), 1900);
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
    <div
      ref={containerRef}
      role="presentation"
      style={{
        position: 'relative',
        width: '100%',
        height: '20px',
        backgroundColor: '#08080c',
        overflow: 'hidden',
        borderTop: '1px solid rgba(168,85,247,0.15)',
        borderBottom: '1px solid rgba(168,85,247,0.15)',
        flexShrink: 0,
      }}
    >
      {/* Asphalt guide line */}
      <div style={{
        position: 'absolute',
        bottom: '3px',
        left: 0,
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)',
      }} />

      {/* Rolling wheel */}
      {direction && (
        <div
          key={`${direction}-${animKey}`}
          style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            width: '32px',
            height: '16px',
            willChange: 'transform',
            animation: goRight
              ? 'wsdRight 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards'
              : 'wsdLeft 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards',
          }}
        >
          {/* The wheel SVG — explicit width & height, NO overflow:visible */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 100 100"
            style={{ display: 'block', transform: goRight ? 'skewX(-8deg)' : 'skewX(8deg)' }}
          >
            {/* Tyre */}
            <circle cx="50" cy="50" r="48" fill="#111113" stroke="#09090b" strokeWidth="4" />
            {/* Tread marks */}
            <circle cx="50" cy="50" r="43" fill="none" stroke="#2a2a2e" strokeWidth="2" strokeDasharray="5 4" />
            {/* Rim */}
            <circle cx="50" cy="50" r="36" fill="#1a1a1f" stroke="#3f3f46" strokeWidth="1.5" />
            {/* Spokes group — spins via CSS animation */}
            <g
              style={{
                transformOrigin: '50px 50px',
                animation: goRight
                  ? 'wsdSpinCW 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards'
                  : 'wsdSpinCCW 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards',
              }}
            >
              {/* 5 violet spokes */}
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M47 45 L48 16 Q50 14 52 16 L53 45 Z"
                  fill="#9333ea"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
              {/* Center hub */}
              <circle cx="50" cy="50" r="11" fill="#09090b" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="5" fill="#a855f7" />
            </g>
            {/* Brake caliper accent */}
            <path
              d="M76 38 A27 27 0 0 0 76 62 L82 58 A33 33 0 0 1 82 42 Z"
              fill="#581c87"
              stroke="#7e22ce"
              strokeWidth="1"
            />
          </svg>

          {/* Tiny smoke puff */}
          <div style={{
            position: 'absolute',
            bottom: '1px',
            [goRight ? 'left' : 'right']: '-6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216,180,254,0.5) 0%, transparent 70%)',
            filter: 'blur(2px)',
            animation: 'wsdPuff 0.6s ease-out infinite',
          }} />
        </div>
      )}

      {/* Keyframe injector */}
      <style>{`
        @keyframes wsdRight {
          0%   { transform: translateX(-36px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
        }
        @keyframes wsdLeft {
          0%   { transform: translateX(calc(100vw + 20px)); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(-36px); opacity: 0; }
        }
        @keyframes wsdSpinCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(1440deg); }
        }
        @keyframes wsdSpinCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-1440deg); }
        }
        @keyframes wsdPuff {
          0%   { transform: scale(0.4); opacity: 0.7; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
