import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Lightweight, dependency-free horizontal slider.
 *
 * The track scrolls natively (swipeable on touch, wheel/drag on desktop) and
 * the prev/next arrows page through it with a smooth animation. Arrows render
 * only when the content overflows, and dim (but stay clickable) at the ends.
 *
 * `measure()` (reads scrollWidth) runs on mount/resize/content-change; the
 * frequent scroll handler only reads the cheap scrollLeft against a cached max,
 * so it never forces a reflow that could interrupt the smooth scroll.
 *
 * Each child becomes a slide; `itemClassName` sets how many are visible.
 */
const Carousel = ({
  children,
  itemClassName = 'w-full sm:w-[42%] md:w-[31%] lg:w-[23.5%]',
  mobileGrid = 'grid-cols-2',
  ariaLabel = 'carousel',
}) => {
  const trackRef = useRef(null);
  const maxScroll = useRef(0);
  const slides = Children.toArray(children);
  const [overflowed, setOverflowed] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncPosition = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= maxScroll.current - 4);
  }, []);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    maxScroll.current = el.scrollWidth - el.clientWidth;
    setOverflowed(maxScroll.current > 4);
    syncPosition();
  }, [syncPosition]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 500);
    el.addEventListener('scroll', syncPosition, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener('scroll', syncPosition);
      ro.disconnect();
    };
  }, [measure, syncPosition, slides.length]);

  // Smooth-scroll one "page" by animating scrollLeft ourselves with a timer
  // (works reliably across browsers and headless/preview renderers).
  const page = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const from = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    const to = Math.max(0, Math.min(max, from + dir * el.clientWidth * 0.85));
    const duration = 350;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = () => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      el.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) setTimeout(tick, 16);
      else syncPosition(); // keep arrow states correct even if no scroll event fires
    };
    tick();
  };

  return (
    <div className="relative" role="group" aria-roledescription="carousel" aria-label={ariaLabel}>
      {overflowed && <ArrowButton side="left" dim={atStart} onClick={() => page(-1)} />}

      {/* Mobile: a wrapping grid (no horizontal scroll). sm+: a swipeable row. */}
      <div
        ref={trackRef}
        className={`no-scrollbar -mx-1 grid ${mobileGrid} gap-4 px-1 pb-2 sm:flex sm:gap-5 sm:overflow-x-auto`}
      >
        {slides.map((child, i) => (
          <div key={i} className={`sm:shrink-0 ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {overflowed && <ArrowButton side="right" dim={atEnd} onClick={() => page(1)} />}
    </div>
  );
};

const ArrowButton = ({ side, dim, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={side === 'left' ? 'Previous' : 'Next'}
    className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-card transition hover:text-gold-700 sm:grid ${
      side === 'left' ? '-left-4' : '-right-4'
    } ${dim ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}
  >
    {side === 'left' ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
  </button>
);

export default Carousel;
