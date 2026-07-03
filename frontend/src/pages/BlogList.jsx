import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatDate } from '../utils/format.js';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blogs')
      .then((res) => setBlogs(res.data.blogs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-10">
      <Seo title="Journal" description="Jewellery buying guides, care tips and stories from Jewelly." />
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-600">The Jewelly Journal</p>
        <h1 className="font-serif text-4xl font-bold">Stories & Guides</h1>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link key={b._id} to={`/blog/${b.slug}`} className="card group overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-cream">
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                {b.category && (
                  <span className="text-xs uppercase tracking-wide text-gold-600">{b.category}</span>
                )}
                <h2 className="mt-1 font-serif text-xl group-hover:text-gold-700">{b.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-charcoal/60">{b.excerpt}</p>
                <p className="mt-3 text-xs text-charcoal/40">
                  {b.author} · {formatDate(b.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
