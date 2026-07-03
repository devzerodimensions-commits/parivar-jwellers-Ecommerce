import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaUsers, FaTimes, FaCheckSquare } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS, ROLE_BADGE, roleLabel } from '../../config/roles.js';
import { formatDate } from '../../utils/format.js';

const Avatar = ({ user, size = 'h-9 w-9' }) =>
  user.avatar ? (
    <img src={user.avatar} alt={user.name} className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} grid place-items-center rounded-full bg-gold-100 text-sm font-semibold text-gold-800`}>
      {(user.name || '?').charAt(0).toUpperCase()}
    </span>
  );

const Users = () => {
  const { user: me, can } = useAuth();
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1, roleCounts: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [view, setView] = useState(null); // user being viewed
  const [deletingBulk, setDeletingBulk] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '15' });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    api
      .get(`/users?${params}`)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page, search, role, status]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  const remove = async (u) => {
    if (u._id === me._id) return toast.error('You cannot delete your own account.');
    if (!window.confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('User deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected user(s)?`)) return;
    setDeletingBulk(true);
    try {
      const res = await api.post('/users/bulk-delete', { ids });
      toast.success(`Deleted ${res.data.deleted} user(s).`);
      clearSelection();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingBulk(false);
    }
  };

  if (!can('users')) {
    return (
      <EmptyState
        icon={<FaUsers />}
        title="Access denied"
        message="Your role does not have permission to manage users."
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">
          Users <span className="text-base font-normal text-charcoal/40">({data.total})</span>
        </h1>
        <Link to="/admin/users/new" className="btn-primary">
          <FaPlus /> Add New User
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search name, username, email…"
            className="input pr-10"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
        </div>
        <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }} className="input max-w-[180px]">
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]} {data.roleCounts?.[r] ? `(${data.roleCounts[r]})` : ''}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="input max-w-[160px]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gold-300 bg-gold-50 px-4 py-2.5">
          <FaCheckSquare className="text-gold-600" />
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={clearSelection} className="text-xs text-charcoal/60 hover:underline">Clear</button>
          <button onClick={bulkDelete} disabled={deletingBulk} className="btn ml-auto bg-red-600 text-white hover:bg-red-700">
            <FaTrash /> {deletingBulk ? 'Deleting…' : `Delete Selected (${selected.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : data.users.length === 0 ? (
        <EmptyState icon={<FaUsers />} title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="w-10 p-3"></th>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Registered</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u._id} className={`border-t border-charcoal/10 ${selected.has(u._id) ? 'bg-gold-50/50' : ''}`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(u._id)}
                      onChange={() => toggleSelect(u._id)}
                      disabled={u._id === me._id}
                      className="h-4 w-4 rounded border-charcoal/30 text-gold-600 focus:ring-gold-500"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <div>
                        <p className="font-medium">
                          {u.name} {u._id === me._id && <span className="text-xs text-gold-700">(you)</span>}
                        </p>
                        <p className="text-xs text-charcoal/40">@{u.username || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-charcoal/70">
                    {u.email}
                    {u.twoFactorEnabled && <span className="ml-2 badge bg-green-100 text-green-700">2FA</span>}
                  </td>
                  <td className="p-3">
                    <span className={`badge ${ROLE_BADGE[u.role] || ''}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-charcoal/60">{formatDate(u.createdAt)}</td>
                  <td className="p-3 text-charcoal/60">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setView(u)} title="View" className="text-charcoal/60 hover:text-gold-700"><FaEye /></button>
                      <Link to={`/admin/users/${u._id}/edit`} title="Edit" className="text-gold-700 hover:text-gold-800"><FaEdit /></Link>
                      <button onClick={() => remove(u)} title="Delete" className="text-red-600 hover:text-red-700" disabled={u._id === me._id}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-3">
              <h3 className="font-serif text-lg">User details</h3>
              <button onClick={() => setView(null)} aria-label="Close" className="text-charcoal/60 hover:text-charcoal"><FaTimes /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                <Avatar user={view} size="h-16 w-16" />
                <div>
                  <p className="font-serif text-xl">{view.name}</p>
                  <p className="text-sm text-charcoal/50">@{view.username || '—'}</p>
                  <span className={`badge mt-1 ${ROLE_BADGE[view.role] || ''}`}>{roleLabel(view.role)}</span>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-y-3 text-sm">
                <dt className="text-charcoal/50">Email</dt><dd className="col-span-2">{view.email}</dd>
                <dt className="text-charcoal/50">Phone</dt><dd className="col-span-2">{view.phone || '—'}</dd>
                <dt className="text-charcoal/50">Status</dt><dd className="col-span-2">{view.isActive ? 'Active' : 'Inactive'}</dd>
                <dt className="text-charcoal/50">2FA</dt><dd className="col-span-2">{view.twoFactorEnabled ? 'Enabled' : 'Off'}</dd>
                <dt className="text-charcoal/50">Registered</dt><dd className="col-span-2">{formatDate(view.createdAt)}</dd>
                <dt className="text-charcoal/50">Last login</dt><dd className="col-span-2">{view.lastLogin ? formatDate(view.lastLogin) : 'Never'}</dd>
              </dl>
              <div className="mt-5 flex justify-end gap-2">
                <Link to={`/admin/users/${view._id}/edit`} className="btn-primary" onClick={() => setView(null)}>
                  <FaEdit /> Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
