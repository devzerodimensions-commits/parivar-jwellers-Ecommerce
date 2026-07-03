import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaEnvelopeOpenText } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

const STATUS_STYLES = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-700',
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get(`/enquiries${filter ? `?status=${filter}` : ''}`)
      .then((res) => setEnquiries(res.data.enquiries))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}`, { status });
      setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.delete(`/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">
          Enquiries <span className="text-base font-normal text-charcoal/40">({enquiries.length})</span>
        </h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[200px]">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={<FaEnvelopeOpenText />}
          title="No enquiries yet"
          message="When a visitor submits a product enquiry, it appears here."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div key={e._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.name}</span>
                    <span className={`badge capitalize ${STATUS_STYLES[e.status]}`}>{e.status}</span>
                    <span className="text-xs text-charcoal/40">{formatDate(e.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/60">
                    <a href={`mailto:${e.email}`} className="text-gold-700 hover:underline">{e.email}</a>
                    {e.phone && <> · {e.phone}</>}
                  </p>
                  {e.productName && (
                    <p className="mt-1 text-sm">
                      Product:{' '}
                      {e.productSlug ? (
                        <Link to={`/product/${e.productSlug}`} target="_blank" className="font-medium text-gold-700 hover:underline">
                          {e.productName}
                        </Link>
                      ) : (
                        <span className="font-medium">{e.productName}</span>
                      )}
                    </p>
                  )}
                  <p className="mt-2 whitespace-pre-line text-sm text-charcoal/80">{e.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={e.status}
                    onChange={(ev) => setStatus(e._id, ev.target.value)}
                    className="input py-1.5 text-xs"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => remove(e._id)} className="btn bg-red-50 px-3 text-red-700 hover:bg-red-100">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Enquiries;
