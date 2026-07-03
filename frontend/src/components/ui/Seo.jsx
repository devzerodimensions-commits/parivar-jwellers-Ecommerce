import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext.jsx';

// Per-page SEO: title, meta description and Open Graph tags.
const Seo = ({ title, description, image, type = 'website' }) => {
  const settings = useSettings();
  const fullTitle = title ? `${title} | ${settings.siteName}` : settings.seo?.metaTitle || settings.siteName;
  const desc = description || settings.seo?.metaDescription || settings.tagline;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

export default Seo;
