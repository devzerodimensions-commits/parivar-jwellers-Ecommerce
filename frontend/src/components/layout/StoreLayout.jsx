import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Wraps all storefront pages with the shared chrome.
const StoreLayout = () => (
  <div className="flex min-h-screen flex-col">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default StoreLayout;
