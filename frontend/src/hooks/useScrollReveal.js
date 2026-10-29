import { useEffect, useRef } from 'react';

/**
 * Custom hook to trigger scroll-driven animations with IntersectionObserver fallback.
 * Works seamlessly across all modern browsers and respects prefers-reduced-motion.
 */
export function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const elements = containerRef.current?.querySelectorAll('.reveal-on-scroll');
      elements?.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = containerRef.current?.querySelectorAll('.reveal-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
