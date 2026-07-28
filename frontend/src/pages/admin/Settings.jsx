import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import ImageEditor from '../../components/admin/ImageEditor.jsx';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState(null); // { field, src, aspect, round, title }

  useEffect(() => {
    api
      .get('/settings/admin')
      .then((res) => setSettings(res.data.settings))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helpers to update nested keys immutably.
  const setTop = (k, v) => setSettings((s) => ({ ...s, [k]: v }));
  const setNested = (group, k, v) => setSettings((s) => ({ ...s, [group]: { ...s[group], [k]: v } }));

  if (loading) return <Spinner />;
  if (!settings) return <p>Could not load settings.</p>;

  return (
    <>
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Website Settings</h1>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <Section title="General">
          <Field label="Site name" value={settings.siteName} onChange={(v) => setTop('siteName', v)} />
          <Field label="Tagline" value={settings.tagline} onChange={(v) => setTop('tagline', v)} />
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Header Logo</label>
              {settings.logo && (
                <button
                  type="button"
                  onClick={() => setEditor({ field: 'logo', src: settings.logo, aspect: 'original', title: 'Edit Header Logo' })}
                  className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-gold-700 hover:underline"
                >
                  <FaPen size={10} /> Edit
                </button>
              )}
            </div>
            <ImageUploader value={settings.logo} onChange={(url) => setTop('logo', url)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Favicon</label>
              {settings.favicon && (
                <button
                  type="button"
                  onClick={() => setEditor({ field: 'favicon', src: settings.favicon, aspect: 1, round: false, title: 'Edit Favicon' })}
                  className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-gold-700 hover:underline"
                >
                  <FaPen size={10} /> Edit
                </button>
              )}
            </div>
            <ImageUploader value={settings.favicon} onChange={(url) => setTop('favicon', url)} />
          </div>
        </Section>

        {/* Catalog mode */}
        <Section title="Catalog & Pricing">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={!!settings.enquiryMode}
              onChange={(e) => setTop('enquiryMode', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-charcoal/30 text-gold-600 focus:ring-gold-500"
            />
            <span>
              <span className="font-medium">Enquiry mode</span>
              <span className="mt-0.5 block text-xs text-charcoal/50">
                Hide all prices and show a <strong>Send Enquiry</strong> button on product pages
                instead of Add to Cart. Enquiries appear under Admin → Enquiries.
              </span>
            </span>
          </label>
        </Section>

        {/* Theme */}
        <Section title="Theme">
          <ColorField label="Primary color" value={settings.theme?.primaryColor} onChange={(v) => setNested('theme', 'primaryColor', v)} />
          <ColorField label="Secondary color" value={settings.theme?.secondaryColor} onChange={(v) => setNested('theme', 'secondaryColor', v)} />
        </Section>

        {/* Contact */}
        <Section title="Contact">
          <Field label="Email" value={settings.contact?.email} onChange={(v) => setNested('contact', 'email', v)} />
          <Field label="Phone" value={settings.contact?.phone} onChange={(v) => setNested('contact', 'phone', v)} />
          <Field label="WhatsApp" value={settings.contact?.whatsapp} onChange={(v) => setNested('contact', 'whatsapp', v)} />
          <Field label="Address" value={settings.contact?.address} onChange={(v) => setNested('contact', 'address', v)} />
        </Section>

        {/* Social */}
        <Section title="Social Links">
          <Field label="Facebook" value={settings.social?.facebook} onChange={(v) => setNested('social', 'facebook', v)} />
          <Field label="Instagram" value={settings.social?.instagram} onChange={(v) => setNested('social', 'instagram', v)} />
          <Field label="YouTube" value={settings.social?.youtube} onChange={(v) => setNested('social', 'youtube', v)} />
          <Field label="Twitter" value={settings.social?.twitter} onChange={(v) => setNested('social', 'twitter', v)} />
        </Section>

        {/* Commerce */}
        <Section title="Shipping & Tax">
          <Field label="Free shipping threshold (₹)" type="number" value={settings.shipping?.freeShippingThreshold} onChange={(v) => setNested('shipping', 'freeShippingThreshold', Number(v))} />
          <Field label="Flat shipping rate (₹)" type="number" value={settings.shipping?.flatRate} onChange={(v) => setNested('shipping', 'flatRate', Number(v))} />
          <Field label="Tax rate (%)" type="number" value={settings.tax?.rate} onChange={(v) => setNested('tax', 'rate', Number(v))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency code" value={settings.currency?.code} onChange={(v) => setNested('currency', 'code', v)} />
            <Field label="Currency symbol" value={settings.currency?.symbol} onChange={(v) => setNested('currency', 'symbol', v)} />
          </div>
        </Section>

        {/* SMTP */}
        <Section title="Email (SMTP)">
          <Field label="Host" value={settings.smtp?.host} onChange={(v) => setNested('smtp', 'host', v)} />
          <Field label="Port" type="number" value={settings.smtp?.port} onChange={(v) => setNested('smtp', 'port', Number(v))} />
          <Field label="User" value={settings.smtp?.user} onChange={(v) => setNested('smtp', 'user', v)} />
          <Field label="From address" value={settings.smtp?.from} onChange={(v) => setNested('smtp', 'from', v)} />
        </Section>

        {/* SEO */}
        <Section title="SEO">
          <Field label="Default meta title" value={settings.seo?.metaTitle} onChange={(v) => setNested('seo', 'metaTitle', v)} />
          <div>
            <label className="label">Default meta description</label>
            <textarea
              className="input h-20 resize-none"
              value={settings.seo?.metaDescription || ''}
              onChange={(e) => setNested('seo', 'metaDescription', e.target.value)}
            />
          </div>
        </Section>

        {/* Footer */}
        <Section title="Footer">
          <div>
            <label className="label">About text</label>
            <textarea
              className="input h-24 resize-none"
              value={settings.footer?.aboutText || ''}
              onChange={(e) => setNested('footer', 'aboutText', e.target.value)}
            />
          </div>
          <Field label="Copyright" value={settings.footer?.copyright} onChange={(v) => setNested('footer', 'copyright', v)} />
          <div>
            <label className="label">Announcements (one per line)</label>
            <textarea
              className="input h-20 resize-none"
              value={(settings.announcements || []).join('\n')}
              onChange={(e) => setTop('announcements', e.target.value.split('\n').filter(Boolean))}
            />
          </div>
        </Section>
      </div>
    </form>

      {editor && (
        <ImageEditor
          src={editor.src}
          title={editor.title}
          initialAspect={editor.aspect}
          round={editor.round}
          onClose={() => setEditor(null)}
          onSaved={({ url }) => {
            setTop(editor.field, url);
            setEditor(null);
            toast.success('Updated — click “Save Settings” to apply.');
          }}
        />
      )}
    </>
  );
};

const Section = ({ title, children }) => (
  <section className="card space-y-4 p-6">
    <h3 className="font-serif text-lg">{title}</h3>
    {children}
  </section>
);

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="label">{label}</label>
    <input type={type} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const ColorField = ({ label, value, onChange }) => (
  <div>
    <label className="label">{label}</label>
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded border border-charcoal/15" />
      <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  </div>
);

export default Settings;
