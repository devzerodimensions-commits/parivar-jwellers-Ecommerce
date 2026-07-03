import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice, effectivePrice } from '../../utils/format.js';

const Products = () => {
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '15' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    api
      .get(`/products/admin/all?${params}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Products <span className="text-base font-normal text-charcoal/40">({data.total})</span></h1>
        <Link to="/admin/products/new" className="btn-primary">
          <FaPlus /> Add Product
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name or SKU…"
            className="input pr-10"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="input max-w-[180px]"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low-stock">Low stock</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p._id} className="border-t border-charcoal/10">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-charcoal/60">{p.sku}</td>
                  <td className="p-3 text-charcoal/60">{p.category?.name}</td>
                  <td className="p-3">{formatPrice(effectivePrice(p), symbol)}</td>
                  <td className="p-3">
                    <span className={p.stock <= p.lowStockThreshold ? 'text-orange-600' : ''}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-gold-700 hover:text-gold-800" aria-label="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => remove(p._id, p.name)} className="text-red-600 hover:text-red-700" aria-label="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.products.length === 0 && <p className="p-6 text-center text-charcoal/50">No products found.</p>}
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
};

export default Products;
