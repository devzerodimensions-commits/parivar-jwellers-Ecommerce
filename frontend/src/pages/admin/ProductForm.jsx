import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const blank = {
  name: '',
  sku: '',
  shortDescription: '',
  description: '',
  price: '',
  salePrice: '',
  category: '',
  brand: '',
  tags: '',
  stock: 0,
  lowStockThreshold: 5,
  material: 'Gold',
  purity: '',
  grossWeight: '',
  netWeight: '',
  gender: 'Women',
  images: [],
  attributes: [],
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isActive: true,
  metaTitle: '',
  metaDescription: '',
};

const MATERIALS = ['Gold', 'Diamond', 'Silver', 'Platinum', 'Gemstone', 'Other'];
const GENDERS = ['Women', 'Men', 'Unisex', 'Kids'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/categories?all=true'), api.get('/brands?all=true')]).then(([c, b]) => {
      setCategories(c.data.categories);
      setBrands(b.data.brands);
    });
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/products/admin/${id}`)
      .then((res) => {
        const p = res.data.product;
        setForm({
          ...blank,
          ...p,
          category: p.category?._id || '',
          brand: p.brand?._id || '',
          tags: (p.tags || []).join(', '),
          salePrice: p.salePrice ?? '',
          images: p.images || [],
          attributes: p.attributes || [],
        });
      })
      .catch(() => toast.error('Could not load product'))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const setAttr = (i, key, val) =>
    setForm((f) => {
      const attributes = [...f.attributes];
      attributes[i] = { ...attributes[i], [key]: val };
      return { ...f, attributes };
    });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice === '' ? null : Number(form.salePrice),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        grossWeight: form.grossWeight === '' ? undefined : Number(form.grossWeight),
        netWeight: form.netWeight === '' ? undefined : Number(form.netWeight),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        brand: form.brand || undefined,
        attributes: form.attributes.filter((a) => a.key && a.value),
      };
      if (editing) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created.');
      }
      navigate('/admin/products');
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
          <Link to="/admin/products" className="text-sm text-gold-700 hover:underline">
            ← Products
          </Link>
          <h1 className="font-serif text-3xl font-bold">{editing ? 'Edit Product' : 'New Product'}</h1>
        </div>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <Field label="Name" value={form.name} onChange={set('name')} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU (optional)" value={form.sku} onChange={set('sku')} placeholder="Leave blank if not needed" />
              <Select label="Category" value={form.category} onChange={set('category')} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <Field label="Short description" value={form.shortDescription} onChange={set('shortDescription')} />
            <div>
              <label className="label">Description</label>
              <textarea className="input h-32 resize-none" value={form.description} onChange={set('description')} />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Images</h3>
            <ImageUploader
              multiple
              value={form.images.map((i) => i.url)}
              onChange={(urls) => setForm((f) => ({ ...f, images: urls.map((url) => ({ url, alt: f.name })) }))}
            />
            <Field
              label="Add image by URL"
              placeholder="https://…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const url = e.target.value.trim();
                  if (url) {
                    setForm((f) => ({ ...f, images: [...f.images, { url, alt: f.name }] }));
                    e.target.value = '';
                  }
                }
              }}
            />
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Specifications</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Material" value={form.material} onChange={set('material')}>
                {MATERIALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
              <Field label="Purity" value={form.purity} onChange={set('purity')} placeholder="22K BIS 916" />
              <Select label="Gender" value={form.gender} onChange={set('gender')}>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
              <Field label="Gross weight (g)" type="number" value={form.grossWeight} onChange={set('grossWeight')} />
              <Field label="Net weight (g)" type="number" value={form.netWeight} onChange={set('netWeight')} />
              <Field label="Tags (comma separated)" value={form.tags} onChange={set('tags')} />
            </div>

            {/* Custom attributes */}
            <div>
              <label className="label">Custom attributes</label>
              {form.attributes.map((a, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input
                    className="input"
                    placeholder="Key"
                    value={a.key || ''}
                    onChange={(e) => setAttr(i, 'key', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Value"
                    value={a.value || ''}
                    onChange={(e) => setAttr(i, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }))}
                    className="px-2 text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, attributes: [...f.attributes, { key: '', value: '' }] }))}
                className="btn-outline mt-1"
              >
                <FaPlus /> Add attribute
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Pricing</h3>
            <Field label="Price (₹)" type="number" value={form.price} onChange={set('price')} required />
            <Field label="Sale price (₹)" type="number" value={form.salePrice} onChange={set('salePrice')} />
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Inventory</h3>
            <Field label="Stock" type="number" value={form.stock} onChange={set('stock')} />
            <Field label="Low-stock threshold" type="number" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
            <Select label="Brand / Collection" value={form.brand} onChange={set('brand')}>
              <option value="">None</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </section>

          <section className="card space-y-3 p-6">
            <h3 className="font-serif text-lg">Visibility</h3>
            <Toggle label="Active (visible in store)" checked={form.isActive} onChange={set('isActive')} />
            <Toggle label="Featured" checked={form.isFeatured} onChange={set('isFeatured')} />
            <Toggle label="New arrival" checked={form.isNewArrival} onChange={set('isNewArrival')} />
            <Toggle label="Best seller" checked={form.isBestSeller} onChange={set('isBestSeller')} />
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">SEO</h3>
            <Field label="Meta title" value={form.metaTitle} onChange={set('metaTitle')} />
            <div>
              <label className="label">Meta description</label>
              <textarea className="input h-20 resize-none" value={form.metaDescription} onChange={set('metaDescription')} />
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <input className="input" {...props} />
  </div>
);
const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select className="input" {...props}>
      {children}
    </select>
  </div>
);
const Toggle = ({ label, ...props }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" className="h-4 w-4 rounded text-gold-600 focus:ring-gold-500" {...props} />
    {label}
  </label>
);

export default ProductForm;
