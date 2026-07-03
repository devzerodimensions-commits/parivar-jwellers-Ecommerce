import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatDate } from '../../utils/format.js';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/blogs?all=true&limit=100')
      .then((res) => setBlogs(res.data.blogs))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Blog</h1>
        <Link to="/admin/blog/new" className="btn-primary">
          <FaPlus /> New Article
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Published</th>
                <th className="p-3">Views</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b._id} className="border-t border-charcoal/10">
                  <td className="p-3 font-medium">{b.title}</td>
                  <td className="p-3 text-charcoal/60">{b.category || '—'}</td>
                  <td className="p-3">
                    <span className={`badge ${b.isPublished ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                      {b.isPublished ? formatDate(b.publishedAt) : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3">{b.views}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/blog/${b._id}/edit`} className="text-gold-700"><FaEdit /></Link>
                      <button onClick={() => remove(b._id)} className="text-red-600"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {blogs.length === 0 && <p className="p-6 text-center text-charcoal/50">No articles yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Blogs;
