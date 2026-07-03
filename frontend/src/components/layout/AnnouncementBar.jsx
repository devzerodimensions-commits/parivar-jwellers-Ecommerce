import { useSettings } from '../../context/SettingsContext.jsx';

// Rotating one-line announcements above the navbar.
const AnnouncementBar = () => {
  const settings = useSettings();
  const messages = settings.announcements || [];
  if (!messages.length) return null;
  return (
    <div className="bg-charcoal text-cream">
      <div className="container-page flex items-center justify-center gap-6 overflow-hidden py-2 text-center text-xs sm:text-sm">
        {messages.map((m, i) => (
          <span key={i} className={i > 0 ? 'hidden sm:inline' : ''}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
