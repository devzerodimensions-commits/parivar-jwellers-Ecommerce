import { useEffect, useState } from 'react';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Rating from '../../components/ui/Rating.jsx';
import { formatDate } from '../../utils/format.js';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get(`/reviews${filter === 'pending' ? '?approved=false' : ''}`)
      .then((res) => setReviews(res.data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setApproval = async (id, isApproved) => {
    try {
      await api.put(`/reviews/${id}/approve`, { isApproved });
      toast.success(isApproved ? 'Approved.' : 'Hidden.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Reviews</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[200px]">
          <option value="">All reviews</option>
          <option value="pending">Pending approval</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <p className="text-charcoal/50">No reviews to show.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <Rating value={r.rating} />
                    <span className="text-sm font-medium">{r.name}</span>
                    {!r.isApproved && <span className="badge bg-yellow-100 text-yellow-800">Pending</span>}
                  </div>
                  <p className="mt-1 text-xs text-charcoal/40">
                    on <span className="font-medium text-charcoal/60">{r.product?.name}</span> · {formatDate(r.createdAt)}
                  </p>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  <p className="mt-1 text-sm text-charcoal/70">{r.comment}</p>
                </div>
                <div className="flex gap-2">
                  {r.isApproved ? (
                    <button onClick={() => setApproval(r._id, false)} className="btn-outline" title="Hide">
                      <FaTimes /> Hide
                    </button>
                  ) : (
                    <button onClick={() => setApproval(r._id, true)} className="btn-primary" title="Approve">
                      <FaCheck /> Approve
                    </button>
                  )}
                  <button onClick={() => remove(r._id)} className="btn bg-red-50 text-red-700 hover:bg-red-100">
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

export default Reviews;
