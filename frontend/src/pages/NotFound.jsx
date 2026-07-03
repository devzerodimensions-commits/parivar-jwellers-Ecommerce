import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo.jsx';

const NotFound = () => (
  <div className="container-page py-32 text-center">
    <Seo title="Page Not Found" />
    <p className="font-serif text-7xl font-bold text-gold-300">404</p>
    <h1 className="mt-4 font-serif text-3xl font-bold">Page not found</h1>
    <p className="mt-2 text-charcoal/60">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary mt-8">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
