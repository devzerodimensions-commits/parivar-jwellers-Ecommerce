import { Link } from 'react-router-dom';

const SectionHeading = ({ eyebrow, title, link, linkText = 'View all', center }) => (
  <div className={`mb-8 flex items-end justify-between ${center ? 'flex-col items-center text-center' : ''}`}>
    <div>
      {eyebrow && (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      )}
      <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">{title}</h2>
    </div>
    {link && (
      <Link to={link} className="text-sm font-medium text-gold-700 hover:text-gold-800">
        {linkText} →
      </Link>
    )}
  </div>
);

export default SectionHeading;
