import React, { useEffect, useRef } from 'react';

/**
 * WheelSectionDivider Component (Drift Scroll Separator)
 * Exact custom drift wheel design provided:
 * - Camber angle (skewX(-14deg) rotate(-6deg))
 * - Outer dark tire with tread dashes & inner rim
 * - Static perforated brake disc & dark violet caliper (#581c87)
 * - 5 violet gradient spokes (#c084fc -> #9333ea -> #6b21a8) with bolts
 * - Real-time scroll progress tracking & smoke trail on active scroll
 */
export default function WheelSectionDivider() {
  const containerRef = useRef(null);
  const drifterRef = useRef(null);
  const rimRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const drifter = drifterRef.current;
    const rim = rimRef.current;

    if (!container || !drifter || !rim) return;

    let isInView = false;
    let lastScrollY = window.scrollY;
    let smokeTimeout = null;
    let animationFrameId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        isInView = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    function onScrollUpdate() {
      if (!isInView || !container || !drifter || !rim) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Progress 0 to 1: from entering screen bottom to leaving screen top
      const totalRange = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const progress = Math.min(Math.max(currentPos / totalRange, 0), 1);

      // Horizontal position: -90px off-screen left to 100vw + 20px off-screen right
      const screenWidth = window.innerWidth;
      const startX = -90;
      const endX = screenWidth + 20;
      const currentX = startX + (endX - startX) * progress;

      // Angular rotation tied to pixel progress (4 full rotations)
      const rotationDeg = progress * 1440;

      // Apply GPU-accelerated transforms
      drifter.style.transform = `translateX(${currentX}px)`;
      rim.style.transform = `rotate(${rotationDeg}deg)`;

      // Detect active scrolling to trigger smoke trail
      if (Math.abs(window.scrollY - lastScrollY) > 1) {
        drifter.classList.add('smoke-active');
        if (smokeTimeout) clearTimeout(smokeTimeout);
        smokeTimeout = setTimeout(() => {
          if (drifter) drifter.classList.remove('smoke-active');
        }, 150);
      }

      lastScrollY = window.scrollY;
    }

    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(onScrollUpdate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    onScrollUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (smokeTimeout) clearTimeout(smokeTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="drift-scroll-separator" role="presentation">
      <div className="drift-track">
        {/* Marcas de asfalto y línea guía */}
        <div className="skid-marks"></div>
        <div className="asphalt-line"></div>

        {/* Conjunto Rueda en Drift */}
        <div ref={drifterRef} className="drifter-assembly">
          
          {/* Partículas de Humo en densidad media */}
          <div className="smoke-trail">
            <span className="puff p1"></span>
            <span className="puff p2"></span>
            <span className="puff p3"></span>
            <span className="puff p4"></span>
          </div>

          {/* Inclinación de Derrape */}
          <div className="wheel-camber">
            <svg className="sport-wheel" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="violetSpokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

              {/* 5 Rayos Violetas (Grupo giratorio controlado por JS) */}
              <g ref={rimRef} className="spinning-rim">
                {/* Rayo 1 (0°) */}
                <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill="url(#violetSpokeGrad)" />
                {/* Rayo 2 (72°) */}
                <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill="url(#violetSpokeGrad)" transform="rotate(72 100 100)" />
                {/* Rayo 3 (144°) */}
                <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill="url(#violetSpokeGrad)" transform="rotate(144 100 100)" />
                {/* Rayo 4 (216°) */}
                <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill="url(#violetSpokeGrad)" transform="rotate(216 100 100)" />
                {/* Rayo 5 (288°) */}
                <path d="M 94 92 L 96 32 Q 100 28 104 32 L 106 92 Z" fill="url(#violetSpokeGrad)" transform="rotate(288 100 100)" />

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
      </div>
    </div>
  );
}
