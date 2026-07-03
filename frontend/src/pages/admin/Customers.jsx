import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../utils/format.js';

const Customers = () => {
  const [data, setData] = useState({ users: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (search) params.set('search', search);
    api
      .get(`/users?${params}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Customer disabled.' : 'Customer enabled.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">
          Customers <span className="text-base font-normal text-charcoal/40">({data.total})</span>
        </h1>
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name, email, phone…"
          className="input max-w-xs"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u._id} className="border-t border-charcoal/10">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-charcoal/60">{u.email}</td>
                  <td className="p-3 text-charcoal/60">{u.phone || '—'}</td>
                  <td className="p-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-gold-100 text-gold-800' : 'bg-charcoal/10 text-charcoal/60'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-charcoal/60">{formatDate(u.createdAt)}</td>
                  <td className="p-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleActive(u)}
                        className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
};

export default Customers;
