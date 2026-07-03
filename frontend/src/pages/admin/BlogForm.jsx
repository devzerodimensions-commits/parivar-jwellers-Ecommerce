import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const blank = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Jewelly Editorial',
  category: '',
  tags: '',
  isPublished: true,
  metaTitle: '',
  metaDescription: '',
};

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    // Admin loads the full article (slug endpoint returns content).
    api
      .get('/blogs?all=true&limit=200')
      .then((res) => {
        const b = res.data.blogs.find((x) => x._id === id);
        if (b)
          return api.get(`/blogs/${b.slug}`).then((r) => {
            const full = r.data.blog;
            setForm({ ...blank, ...full, tags: (full.tags || []).join(', ') });
          });
      })
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/blogs/${id}`, payload);
      else await api.post('/blogs', payload);
      toast.success(editing ? 'Article updated.' : 'Article created.');
      navigate('/admin/blog');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/blog" className="text-sm text-gold-700 hover:underline">
            ← Blog
          </Link>
          <h1 className="font-serif text-3xl font-bold">{editing ? 'Edit Article' : 'New Article'}</h1>
        </div>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Article'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-4 p-6">
          <Field label="Title" value={form.title} onChange={set('title')} required />
          <Field label="Excerpt" value={form.excerpt} onChange={set('excerpt')} />
          <div>
            <label className="label">Content (HTML allowed)</label>
            <textarea className="input h-72 resize-none font-mono text-xs" value={form.content} onChange={set('content')} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <label className="label">Cover image</label>
            <ImageUploader value={form.coverImage} onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))} />
            <Field label="Author" value={form.author} onChange={set('author')} />
            <Field label="Category" value={form.category} onChange={set('category')} />
            <Field label="Tags (comma separated)" value={form.tags} onChange={set('tags')} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} /> Published
            </label>
          </div>
          <div className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">SEO</h3>
            <Field label="Meta title" value={form.metaTitle} onChange={set('metaTitle')} />
            <div>
              <label className="label">Meta description</label>
              <textarea className="input h-20 resize-none" value={form.metaDescription} onChange={set('metaDescription')} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default BlogForm;
