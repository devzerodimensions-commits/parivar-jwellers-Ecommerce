import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Auto-rotating hero banner carousel.
const HeroCarousel = ({ banners = [] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <Link
            key={b._id}
            to={b.link || '/shop'}
            className="relative block w-full shrink-0"
          >
            <img src={b.image} alt={b.title} className="h-[320px] w-full object-cover sm:h-[460px]" />
            <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/30 to-transparent px-8 sm:px-16">
              {b.subtitle && (
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-gold-300">{b.subtitle}</p>
              )}
              <h2 className="max-w-md font-serif text-3xl font-bold text-white drop-shadow sm:text-5xl">
                {b.title}
              </h2>
              {b.buttonText && (
                <span className="btn-primary mt-6 w-fit">{b.buttonText}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-gold-400' : 'w-2 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
