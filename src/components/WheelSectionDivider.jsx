import React, { useState, useEffect, useRef } from 'react';

/**
 * WheelSectionDivider Component (Drift Scroll Separator)
 * Exact custom drift wheel design with 60fps GPU drift pass:
 * - Scrolling DOWN: Wheel drifts smoothly from left to right with smoke to the left.
 * - Scrolling UP: Wheel drifts smoothly in reverse from right to left with smoke to the right.
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const [triggerState, setTriggerState] = useState(null); // 'down' | 'up' | null
  const [animKey, setAnimKey] = useState(0);
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);

  // Track global scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 3) {
        isScrollingDown.current = true;
      } else if (currentY < lastScrollY.current - 3) {
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
            setAnimKey((prev) => prev + 1);

            // Hide wheel after sweep finishes (1.8s)
            setTimeout(() => {
              setTriggerState(null);
            }, 1850);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px 100px 0px'
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const isRight = triggerState === 'down';

  return (
    <div ref={containerRef} className="drift-scroll-separator" role="presentation">
      <div className="drift-track">
        {/* Marcas de asfalto y línea guía */}
        <div className="skid-marks"></div>
        <div className="asphalt-line"></div>

        {/* Conjunto Rueda en Drift */}
        {triggerState && (
          <div
            key={`${triggerState}-${animKey}`}
            className={`drifter-assembly smoke-active ${
              isRight ? 'animate-drift-right' : 'animate-drift-left'
            }`}
          >
            {/* Partículas de Humo en densidad media */}
            <div className={isRight ? 'smoke-trail' : 'smoke-trail-reverse'}>
              <span className={`puff ${isRight ? 'p1' : 'p1-reverse'}`}></span>
              <span className={`puff ${isRight ? 'p2' : 'p2-reverse'}`}></span>
              <span className={`puff ${isRight ? 'p3' : 'p3-reverse'}`}></span>
              <span className={`puff ${isRight ? 'p4' : 'p4-reverse'}`}></span>
            </div>

            {/* Inclinación de Derrape (Camber normal o invertido) */}
            <div className={isRight ? 'wheel-camber' : 'wheel-camber-reverse'}>
              <svg className="sport-wheel" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id={`violetSpokeGrad-${animKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc"/>
                    <stop offset="50%" stopColor="#9333ea"/>
                    <stop offset="100%" stopColor="#6b21a8"/>
                  </linearGradient>
                </defs>

                {/* Neumático exterior */}
                <circle cx="100" cy="100" r="92" fill="#141416" stroke="#09090b" strokeWidth="8" />
                <circle cx="100" cy="100" r="84" fill="none" stroke="#27272a" strokeWidth="4" strokeDasharray="8 6" />

                {/* Aro interior */}
                <circle cx="100" cy="100" r="76" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />

                {/* Disco de freno perforado estático */}
                <circle cx="100" cy="100" r="54" fill="#3f3f46" stroke="#52525b" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="48" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="3 5" />

                {/* Caliper violeta oscuro */}
                <path d="M 148 78 A 54 54 0 0 0 148 122 L 160 116 A 66 66 0 0 1 160 84 Z" fill="#581c87" stroke="#7e22ce" strokeWidth="1.5"/>

                {/* 5 Rayos Violetas (Grupo giratorio continuo) */}
                <g className={`spinning-rim ${isRight ? 'animate-spin-cw' : 'animate-spin-ccw'}`}>
                  {/* Rayo 1 (0°) */}
                  <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill={`url(#violetSpokeGrad-${animKey})`} />
                  {/* Rayo 2 (72°) */}
                  <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill={`url(#violetSpokeGrad-${animKey})`} transform="rotate(72 100 100)" />
                  {/* Rayo 3 (144°) */}
                  <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill={`url(#violetSpokeGrad-${animKey})`} transform="rotate(144 100 100)" />
                  {/* Rayo 4 (216°) */}
                  <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill={`url(#violetSpokeGrad-${animKey})`} transform="rotate(216 100 100)" />
                  {/* Rayo 5 (288°) */}
                  <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill={`url(#violetSpokeGrad-${animKey})`} transform="rotate(288 100 100)" />

                  {/* Centro de llanta y pernos */}
                  <circle cx="100" cy="100" r="22" fill="#09090b" stroke="#a855f7" strokeWidth="2.5" />
                  <circle cx="100" cy="100" r="10" fill="#a855f7" />
                  <circle cx="100" cy="85" r="2.5" fill="#e4e4e7" />
                  <circle cx="114" cy="95" r="2.5" fill="#e4e4e7" />
                  <circle cx="109" cy="111" r="2.5" fill="#e4e4e7" />
                  <circle cx="91" cy="111" r="2.5" fill="#e4e4e7" />
                  <circle cx="86" cy="95" r="2.5" fill="#e4e4e7" />
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
