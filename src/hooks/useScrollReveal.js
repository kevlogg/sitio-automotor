import { useEffect, useRef } from 'react';

/**
 * Custom hook to trigger scroll animations using IntersectionObserver.
 * Adds 'is-visible' class to elements with '.reveal-on-scroll' when they enter the viewport.
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (options.once !== false) {
              observer.unobserve(entry.target);
            }
          } else if (options.once === false) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -40px 0px',
      }
    );

    const elements = target.querySelectorAll('.reveal-on-scroll');
    if (elements.length > 0) {
      elements.forEach((el) => observer.observe(el));
    } else if (target.classList.contains('reveal-on-scroll')) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return containerRef;
}
