import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const CmsPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/pages/${slug}`)
      .then((res) => setPage(res.data.page))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner className="py-32" />;
  if (!page)
    return (
      <div className="container-page py-32 text-center">
        <h2 className="font-serif text-2xl">Page not found</h2>
        <Link to="/" className="btn-primary mt-6">
          Go home
        </Link>
      </div>
    );

  return (
    <div className="container-page py-12">
      <Seo title={page.metaTitle || page.title} description={page.metaDescription} />
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-serif text-4xl font-bold">{page.title}</h1>

        {page.content && (
          <div
            className="text-charcoal/80 [&_a]:text-gold-700 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:text-charcoal"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* FAQ accordion */}
        {page.type === 'faq' && page.faqs?.length > 0 && (
          <div className="mt-8 space-y-3">
            {page.faqs.map((f, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium"
                >
                  {f.question}
                  <span className="text-gold-600">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-charcoal/10 p-4 text-sm text-charcoal/70">{f.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CmsPage;
