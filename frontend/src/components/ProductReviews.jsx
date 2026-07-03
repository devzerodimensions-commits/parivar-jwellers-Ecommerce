import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import Rating from './ui/Rating.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/format.js';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get(`/products/${productId}/reviews`)
      .then((res) => setReviews(res.data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(load, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return toast.error('Please write a comment.');
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, form);
      toast.success('Thanks for your review!');
      setForm({ rating: 5, title: '', comment: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* List */}
      <div>
        <h3 className="mb-4 font-serif text-2xl">Customer Reviews ({reviews.length})</h3>
        {loading ? (
          <p className="text-sm text-charcoal/50">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-charcoal/50">No reviews yet. Be the first to review this piece.</p>
        ) : (
          <ul className="space-y-5">
            {reviews.map((r) => (
              <li key={r._id} className="border-b border-charcoal/10 pb-5">
                <div className="flex items-center justify-between">
                  <Rating value={r.rating} />
                  <span className="text-xs text-charcoal/40">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-charcoal/70">{r.comment}</p>
                <p className="mt-2 text-xs text-charcoal/50">
                  {r.name}
                  {r.isVerifiedPurchase && (
                    <span className="ml-2 text-green-600">✓ Verified purchase</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Form */}
      <div>
        <h3 className="mb-4 font-serif text-2xl">Write a Review</h3>
        {user ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <span className="label">Your rating</span>
              <Rating
                value={form.rating}
                interactive
                size="text-2xl"
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
            </div>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Sum up your experience"
              />
            </div>
            <div>
              <label className="label">Your review</label>
              <textarea
                className="input h-28 resize-none"
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="What did you love about this piece?"
              />
            </div>
            <button disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-charcoal/60">
            Please{' '}
            <a href="/login" className="text-gold-700 underline">
              log in
            </a>{' '}
            to write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
