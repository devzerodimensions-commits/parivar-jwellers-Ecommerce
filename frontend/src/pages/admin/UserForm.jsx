import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../config/roles.js';

const blank = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirm: '',
  phone: '',
  avatar: '',
  role: 'subscriber',
  isActive: true,
};

// Password field with a show/hide toggle.
const PasswordField = ({ label, value, onChange, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} className="input pr-10" value={value} onChange={onChange} {...props} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const editing = Boolean(id);

  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  // Only a Super Admin may assign the Super Admin role.
  const roleOptions = ROLES.filter((r) => r !== 'super_admin' || me?.role === 'super_admin');

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/users/${id}`)
      .then((res) => {
        const u = res.data.user;
        setForm({ ...blank, ...u, password: '', confirm: '' });
      })
      .catch(() => toast.error('Could not load user'))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const isSelf = editing && me?._id === id;

  const submit = async (e) => {
    e.preventDefault();
    if (form.password || !editing) {
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
      if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    }
    setSaving(true);
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      avatar: form.avatar,
      role: form.role,
      isActive: form.isActive,
    };
    if (form.password) payload.password = form.password;

    try {
      if (editing) {
        await api.put(`/users/${id}`, payload);
        toast.success('User updated.');
      } else {
        await api.post('/users', payload);
        toast.success('User created.');
      }
      navigate('/admin/users');
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
          <Link to="/admin/users" className="text-sm text-gold-700 hover:underline">← Users</Link>
          <h1 className="font-serif text-3xl font-bold">{editing ? 'Edit User' : 'Add New User'}</h1>
        </div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save User'}</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Account</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" required value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input" value={form.username} onChange={set('username')} placeholder="auto-generated if blank" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input className="input" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">
              Password {editing && <span className="text-sm font-normal text-charcoal/40">— leave blank to keep current</span>}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label={editing ? 'New password' : 'Password'}
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
                required={!editing}
                placeholder="••••••••"
              />
              <PasswordField
                label="Confirm password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
                required={!editing}
                placeholder="••••••••"
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Profile photo</h3>
            <ImageUploader value={form.avatar} onChange={(url) => setForm((f) => ({ ...f, avatar: url }))} />
          </section>

          <section className="card space-y-4 p-6">
            <h3 className="font-serif text-lg">Role &amp; status</h3>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={set('role')} disabled={isSelf}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {isSelf && <p className="mt-1 text-xs text-charcoal/40">You cannot change your own role.</p>}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} disabled={isSelf} className="h-4 w-4 rounded text-gold-600 focus:ring-gold-500" />
              Active (can sign in)
            </label>
          </section>
        </div>
      </div>
    </form>
  );
};

export default UserForm;
