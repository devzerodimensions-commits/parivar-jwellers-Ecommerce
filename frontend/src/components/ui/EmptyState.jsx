import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, actionText, actionTo }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {icon && <div className="mb-4 text-5xl text-charcoal/20">{icon}</div>}
    <h3 className="font-serif text-xl text-charcoal">{title}</h3>
    {message && <p className="mt-2 max-w-md text-sm text-charcoal/50">{message}</p>}
    {actionText && actionTo && (
      <Link to={actionTo} className="btn-primary mt-6">
        {actionText}
      </Link>
    )}
  </div>
);

export default EmptyState;
