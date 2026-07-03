import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TwoFactorSettings from '../../components/TwoFactorSettings.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.put('/users/profile', profile);
      updateUser(res.data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/users/password', pwd);
      setPwd({ currentPassword: '', newPassword: '' });
      toast.success('Password changed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="mb-4 font-serif text-xl">Profile Details</h2>
        <div className="mb-4">
          <label className="label">Profile photo</label>
          <ImageUploader
            value={profile.avatar}
            endpoint="/users/avatar"
            onChange={(url) => setProfile((p) => ({ ...p, avatar: url }))}
          />
        </div>
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-cream" value={user?.email} disabled />
          </div>
          <div className="sm:col-span-2">
            <button disabled={busy} className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-serif text-xl">Change Password</h2>
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              required
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              required
              value={pwd.newPassword}
              onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button disabled={busy} className="btn-dark">
              Update Password
            </button>
          </div>
        </form>
      </section>

      <TwoFactorSettings />
    </div>
  );
};

export default Profile;
