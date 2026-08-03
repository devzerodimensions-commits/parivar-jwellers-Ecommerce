import { useEffect, useState } from 'react';
import { FaTrash, FaEnvelope, FaCopy, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

const Subscribers = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/subscribers')
      .then((r) => setSubs(r.data.subscribers))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await api.delete(`/subscribers/${id}`);
      setSubs((s) => s.filter((x) => x._id !== id));
      toast.success('Removed.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const copyAll = async () => {
    if (!subs.length) return;
    try {
      await navigator.clipboard.writeText(subs.map((s) => s.email).join(', '));
      toast.success(`Copied ${subs.length} email(s).`);
    } catch {
      toast.error('Could not copy.');
    }
  };

  const exportCsv = () => {
    if (!subs.length) return;
    const rows = ['Email,Subscribed On', ...subs.map((s) => `${s.email},${new Date(s.createdAt).toLocaleDateString('en-IN')}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">
          Newsletter Subscribers <span className="text-base font-normal text-charcoal/40">({subs.length})</span>
        </h1>
        {subs.length > 0 && (
          <div className="flex gap-2">
            <button onClick={copyAll} className="btn-outline">
              <FaCopy /> Copy all
            </button>
            <button onClick={exportCsv} className="btn-primary">
              <FaDownload /> Export CSV
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : subs.length === 0 ? (
        <EmptyState
          icon={<FaEnvelope />}
          title="No subscribers yet"
          message="Emails from the footer newsletter form will appear here."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Subscribed on</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s._id} className="border-t border-charcoal/10">
                  <td className="p-3 font-medium">{s.email}</td>
                  <td className="p-3 text-charcoal/60">{formatDate(s.createdAt)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(s._id)} className="text-red-600 hover:text-red-700" aria-label="Remove">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
