import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatDate } from '../utils/format.js';

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blogs/${slug}`)
      .then((res) => setBlog(res.data.blog))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner className="py-32" />;
  if (!blog)
    return (
      <div className="container-page py-32 text-center">
        <h2 className="font-serif text-2xl">Article not found</h2>
        <Link to="/blog" className="btn-primary mt-6">
          Back to journal
        </Link>
      </div>
    );

  return (
    <article className="container-page py-10">
      <Seo title={blog.metaTitle || blog.title} description={blog.metaDescription || blog.excerpt} image={blog.coverImage} type="article" />
      <div className="mx-auto max-w-3xl">
        <Link to="/blog" className="text-sm text-gold-700 hover:underline">
          ← Back to journal
        </Link>
        {blog.category && (
          <p className="mt-4 text-xs uppercase tracking-wide text-gold-600">{blog.category}</p>
        )}
        <h1 className="mt-1 font-serif text-4xl font-bold leading-tight">{blog.title}</h1>
        <p className="mt-3 text-sm text-charcoal/50">
          {blog.author} · {formatDate(blog.publishedAt)}
        </p>
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="mt-6 w-full rounded-lg object-cover" />
        )}
        <div
          className="prose prose-charcoal mt-8 max-w-none text-charcoal/80 [&_a]:text-gold-700 [&_p]:mb-4 [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        {blog.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((t) => (
              <span key={t} className="badge bg-cream text-charcoal/60">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
