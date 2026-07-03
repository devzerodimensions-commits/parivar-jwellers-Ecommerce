import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Render a 0–5 star rating. Set `interactive` + `onChange` to pick a value.
const Rating = ({ value = 0, count, size = 'text-sm', interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5].map((i) => {
    if (interactive) {
      return (
        <button
          key={i}
          type="button"
          aria-label={`${i} star`}
          onClick={() => onChange?.(i)}
          className="text-gold-500 hover:scale-110 transition-transform"
        >
          {i <= value ? <FaStar /> : <FaRegStar />}
        </button>
      );
    }
    if (value >= i) return <FaStar key={i} className="text-gold-500" />;
    if (value >= i - 0.5) return <FaStarHalfAlt key={i} className="text-gold-500" />;
    return <FaRegStar key={i} className="text-gold-300" />;
  });

  return (
    <div className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars}
      {count != null && <span className="ml-1 text-xs text-charcoal/50">({count})</span>}
    </div>
  );
};

export default Rating;
