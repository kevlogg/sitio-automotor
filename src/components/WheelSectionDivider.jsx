import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider Component
 * Renders an animated rolling wheel (black tire + violet alloy rim) with smoke trail.
 * - Scrolling DOWN: Rolls left -> right with smoke to the left.
 * - Scrolling UP: Rolls right -> left with smoke to the right.
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const [triggerState, setTriggerState] = useState(null); // 'down' | 'up' | null
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);

  // Track global scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 5) {
        isScrollingDown.current = true;
      } else if (currentY < lastScrollY.current - 5) {
        isScrollingDown.current = false;
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to trigger wheel animation on section entry
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dir = isScrollingDown.current ? 'down' : 'up';
            setTriggerState(dir);

            // Reset after animation completes (2.2s)
            setTimeout(() => {
              setTriggerState(null);
            }, 2200);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-16 my-4 overflow-hidden pointer-events-none flex items-center justify-center"
    >
      {/* Decorative Track Line */}
      <div className="absolute inset-x-0 bottom-3 h-[2px] bg-gradient-to-r from-transparent via-purple-900/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-2.5 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      {/* Animated Wheel & Smoke Wrapper */}
      {triggerState && (
        <div
          className={`absolute bottom-2 flex items-center justify-center ${
            triggerState === 'down' ? 'animate-roll-right' : 'animate-roll-left'
          }`}
          style={{ width: '64px', height: '64px' }}
        >
          {/* Particle Smoke Trail behind wheel */}
          <div
            className={`absolute bottom-1 z-0 flex items-center gap-1.5 ${
              triggerState === 'down' ? 'right-6 flex-row-reverse' : 'left-6 flex-row'
            }`}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`rounded-full bg-gradient-to-tr from-purple-500/40 via-purple-300/30 to-slate-200/20 blur-[3px] ${
                  triggerState === 'down' ? 'animate-smoke-right' : 'animate-smoke-left'
                }`}
                style={{
                  width: `${18 + i * 6}px`,
                  height: `${18 + i * 6}px`,
                  animationDelay: `${i * 120}ms`
                }}
              />
            ))}
          </div>

          {/* SVG Wheel (Black Tire + Violet Alloy Rim) */}
          <svg
            viewBox="0 0 100 100"
            className="w-14 h-14 z-10 drop-shadow-xl filter brightness-105"
          >
            <defs>
              {/* Radial gradient for metallic violet rim */}
              <radialGradient id="violetRimGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="45%" stopColor="#8B5CF6" />
                <stop offset="85%" stopColor="#6D28D9" />
                <stop offset="100%" stopColor="#4C1D95" />
              </radialGradient>
              {/* Tire dark rubber gradient */}
              <radialGradient id="tireRubberGrad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#1E293B" />
                <stop offset="90%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>

            {/* Outer Black Rubber Tire */}
            <circle cx="50" cy="50" r="48" fill="url(#tireRubberGrad)" stroke="#090D16" strokeWidth="3" />

            {/* Tire Tread Markings */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="3"
                x2="50"
                y2="9"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}

            {/* Outer Rim Ring */}
            <circle cx="50" cy="50" r="38" fill="#020617" stroke="#A78BFA" strokeWidth="1.5" />

            {/* Violet Alloy Rim Circle */}
            <circle cx="50" cy="50" r="35" fill="url(#violetRimGrad)" stroke="#5B21B6" strokeWidth="1" />

            {/* 5 Alloy Spokes (Violet & Silver Metallic) */}
            {[0, 72, 144, 216, 288].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 50 50)`}>
                <polygon points="47,50 44,18 56,18 53,50" fill="#DDD6FE" opacity="0.9" />
                <polygon points="48.5,50 46.5,20 53.5,20 51.5,50" fill="url(#violetRimGrad)" />
              </g>
            ))}

            {/* Inner Brake Disc */}
            <circle cx="50" cy="50" r="18" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.5" />

            {/* Center Cap with SA Accent */}
            <circle cx="50" cy="50" r="10" fill="#6D28D9" stroke="#E9D5FF" strokeWidth="1.5" />
            <text
              x="50"
              y="53.5"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              SA
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
