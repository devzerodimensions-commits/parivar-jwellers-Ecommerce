import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useSettings } from '../../context/SettingsContext.jsx';

const Footer = () => {
  const settings = useSettings();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/subscribers', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const social = settings.social || {};

  return (
    <footer className="mt-20 bg-charcoal text-cream/80">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container-page grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[
            ['BIS 916 Hallmarked', 'Certified gold purity'],
            ['Certified Diamonds', 'IGI / SGL graded'],
            ['Lifetime Maintenance', 'Free cleaning & checks'],
            ['Insured Shipping', 'Safe, tracked delivery'],
          ].map(([t, s]) => (
            <div key={t}>
              <p className="font-serif text-base text-gold-400">{t}</p>
              <p className="text-xs text-cream/50">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="font-serif text-2xl text-gold-400">{settings.siteName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">
            {settings.footer?.aboutText || settings.tagline}
          </p>
          {settings.contact?.address && (
            <p className="mt-4 flex items-start gap-2 text-sm text-cream/70">
              <FaMapMarkerAlt className="mt-1 shrink-0 text-gold-400" />
              <span>{settings.contact.address}</span>
            </p>
          )}
          <div className="mt-4 flex gap-3">
            {social.facebook && <Social href={social.facebook}><FaFacebookF /></Social>}
            {social.instagram && <Social href={social.instagram}><FaInstagram /></Social>}
            {social.youtube && <Social href={social.youtube}><FaYoutube /></Social>}
            {social.twitter && <Social href={social.twitter}><FaTwitter /></Social>}
          </div>
        </div>

        <FooterCol title="Shop">
          <FLink to="/shop">All Jewellery</FLink>
          <FLink to="/category/gold-jewellery">Gold</FLink>
          <FLink to="/category/diamond-jewellery">Diamond</FLink>
          <FLink to="/category/silver-jewellery">Silver</FLink>
          <FLink to="/category/gold-coins">Gold Coins</FLink>
        </FooterCol>

        <FooterCol title="Help">
          <FLink to="/page/faq">FAQ</FLink>
          <FLink to="/page/shipping-returns">Shipping & Returns</FLink>
          <FLink to="/track-order">Track Order</FLink>
          <FLink to="/page/contact">Contact Us</FLink>
          <FLink to="/policy">Privacy Policy</FLink>
        </FooterCol>

        <div>
          <h4 className="mb-3 font-medium text-cream">Newsletter</h4>
          <p className="mb-3 text-sm text-cream/60">
            Get early access to new collections and offers.
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold-400"
            />
            <button disabled={busy} className="btn-primary whitespace-nowrap">
              {busy ? '…' : 'Subscribe'}
            </button>
          </form>
          {settings.contact?.phone && (
            <p className="mt-4 text-sm text-cream/60">
              Call us: <span className="text-cream">{settings.contact.phone}</span>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-4 text-center text-xs text-cream/50">
          {settings.footer?.copyright || `© ${settings.siteName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, children }) => (
  <div>
    <h4 className="mb-3 font-medium text-cream">{title}</h4>
    <ul className="space-y-2 text-sm">{children}</ul>
  </div>
);
const FLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-cream/60 transition-colors hover:text-gold-400">
      {children}
    </Link>
  </li>
);
const Social = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream/70 hover:border-gold-400 hover:text-gold-400"
  >
    {children}
  </a>
);

export default Footer;
