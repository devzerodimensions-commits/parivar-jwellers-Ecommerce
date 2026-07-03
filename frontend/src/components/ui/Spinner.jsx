const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-16 ${className}`}>
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-200 border-t-gold-600" />
  </div>
);

export default Spinner;
