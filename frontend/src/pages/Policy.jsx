import Seo from '../components/ui/Seo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

/**
 * Temporary store policies page (Privacy, Shipping, Returns, etc.).
 * Placeholder content — replace with finalised legal copy before launch.
 */
const SECTIONS = [
  {
    title: 'Privacy Policy',
    body: [
      'We respect your privacy and are committed to protecting the personal information you share with us. We collect only the details needed to process your orders and enquiries — such as your name, phone number, email address, and delivery address.',
      'Your information is never sold or rented to third parties. It is used solely to fulfil orders, respond to enquiries, and — where you have opted in — send occasional updates about new collections and offers. You may unsubscribe at any time.',
    ],
  },
  {
    title: 'Information We Collect',
    body: [
      'Contact details you provide when creating an account, placing an order, or submitting an enquiry.',
      'Order and enquiry history, which helps us provide support and improve our service.',
      'Basic technical data (such as browser type) used to keep the website secure and running smoothly.',
    ],
  },
  {
    title: 'Shipping & Delivery',
    body: [
      'All jewellery is fully insured during transit and shipped through trusted, tracked courier partners.',
      'Estimated delivery timelines are shown at checkout. Made-to-order and customised pieces may require additional time, which our team will confirm with you directly.',
    ],
  },
  {
    title: 'Returns & Exchanges',
    body: [
      'If you are not completely satisfied, most items may be returned or exchanged within the window communicated at the time of purchase, provided they are unworn and in their original packaging with certificates intact.',
      'Customised, engraved, or made-to-order pieces are non-returnable unless they arrive damaged or defective.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'We use essential cookies to keep you signed in and to remember items in your cart or wishlist. These help the site function and are not used to track you across other websites.',
    ],
  },
];

const Policy = () => {
  const settings = useSettings();
  const contactEmail = settings.contact?.email;
  const contactPhone = settings.contact?.phone;

  return (
    <div className="container-page py-12">
      <Seo title="Policies" description={`Store policies for ${settings.siteName || 'our store'}.`} />

      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">Legal</p>
        <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Our Policies</h1>
        <p className="mt-3 text-charcoal/60">
          Please read the following policies carefully. They govern your use of our store and services.
        </p>
      </header>

      {/* Temporary notice */}
      <div className="mb-10 rounded-lg border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
        <strong>Note:</strong> This is a temporary policy page with placeholder content. Final,
        legally reviewed policies will be published soon.
      </div>

      <div className="max-w-3xl space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="mb-3 font-serif text-2xl">{s.title}</h2>
            <div className="space-y-3 leading-relaxed text-charcoal/75">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-3 font-serif text-2xl">Contact Us</h2>
          <p className="leading-relaxed text-charcoal/75">
            Questions about any of these policies? Reach out and we&apos;ll be happy to help.
          </p>
          <ul className="mt-3 space-y-1 text-charcoal/75">
            {contactEmail && (
              <li>
                Email:{' '}
                <a href={`mailto:${contactEmail}`} className="text-gold-700 hover:underline">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li>
                Phone:{' '}
                <a href={`tel:${contactPhone}`} className="text-gold-700 hover:underline">
                  {contactPhone}
                </a>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Policy;
