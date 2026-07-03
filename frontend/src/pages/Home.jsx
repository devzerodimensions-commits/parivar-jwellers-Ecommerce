import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import Carousel from '../components/Carousel.jsx';
import ProductCarousel from '../components/ProductCarousel.jsx';

const Home = () => {
  const [data, setData] = useState({
    banners: [],
    promo: null,
    categories: [],
    featured: [],
    newArrivals: [],
    bestSellers: [],
    loading: true,
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/banners?position=hero'),
      api.get('/banners?position=promo'),
      api.get('/categories?featured=true'),
      api.get('/products/featured?limit=8'),
      api.get('/products/new-arrivals?limit=8'),
      api.get('/products/best-sellers?limit=4'),
    ])
      .then(([hero, promo, cats, feat, news, best]) => {
        if (!active) return;
        setData({
          banners: hero.data.banners,
          promo: promo.data.banners?.[0] || null,
          categories: cats.data.categories,
          featured: feat.data.products,
          newArrivals: news.data.products,
          bestSellers: best.data.products,
          loading: false,
        });
      })
      .catch(() => active && setData((d) => ({ ...d, loading: false })));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Seo title="" description="Shop BIS hallmarked gold, certified diamond and sterling silver jewellery online." />

      <HeroCarousel banners={data.banners} />

      {/* Featured categories */}
      <section className="container-page py-14">
        <SectionHeading eyebrow="Browse" title="Shop by Category" center />
        <Carousel
          itemClassName="w-full sm:w-[28%] md:w-[22%] lg:w-[16%]"
          mobileGrid="grid-cols-3"
          ariaLabel="Shop by category"
        >
          {data.categories.map((c) => (
            <Link key={c._id} to={`/category/${c.slug}`} className="group block text-center">
              <div className="overflow-hidden rounded-full border border-charcoal/10 bg-white p-2 shadow-card">
                <img
                  src={c.image}
                  alt={c.name}
                  className="aspect-square w-full rounded-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-charcoal group-hover:text-gold-700">
                {c.name}
              </p>
            </Link>
          ))}
        </Carousel>
      </section>

      {/* Featured products */}
      <section className="container-page py-8">
        <SectionHeading eyebrow="Handpicked" title="Featured Pieces" link="/shop?featured=true" />
        <ProductCarousel products={data.featured} loading={data.loading} skeletonCount={6} ariaLabel="Featured pieces" />
      </section>

      {/* Promo banner */}
      {data.promo && (
        <section className="container-page py-12">
          <Link to={data.promo.link || '/shop'} className="block overflow-hidden rounded-xl">
            <div className="relative">
              <img src={data.promo.image} alt={data.promo.title} className="h-48 w-full object-cover sm:h-64" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center text-white">
                <h3 className="font-serif text-3xl font-bold sm:text-4xl">{data.promo.title}</h3>
                {data.promo.subtitle && <p className="mt-2 text-gold-200">{data.promo.subtitle}</p>}
                {data.promo.buttonText && <span className="btn-primary mt-4">{data.promo.buttonText}</span>}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* New arrivals */}
      <section className="container-page py-8">
        <SectionHeading eyebrow="Just In" title="New Arrivals" link="/shop?sort=newest" />
        <ProductCarousel products={data.newArrivals} loading={data.loading} skeletonCount={6} ariaLabel="New arrivals" />
      </section>

      {/* Best sellers */}
      <section className="bg-white py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Loved by Customers" title="Best Sellers" link="/shop?sort=popular" />
          <ProductCarousel products={data.bestSellers} loading={data.loading} skeletonCount={4} ariaLabel="Best sellers" />
        </div>
      </section>

      {/* Editorial / trust */}
      <section className="container-page grid gap-6 py-14 md:grid-cols-3">
        {[
          ['Complete Transparency', 'Honest pricing with a detailed price breakup on every piece.'],
          ['Lifetime Maintenance', 'Free cleaning, polishing and prong checks for life.'],
          ['Easy Exchange & Buy-back', '15-day returns and transparent lifetime gold buy-back.'],
        ].map(([t, s]) => (
          <div key={t} className="card p-8 text-center">
            <h3 className="font-serif text-xl text-gold-700">{t}</h3>
            <p className="mt-2 text-sm text-charcoal/60">{s}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
