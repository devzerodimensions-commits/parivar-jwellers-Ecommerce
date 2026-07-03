import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FaSlidersH, FaTimes } from 'react-icons/fa';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice } from '../utils/format.js';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['popular', 'Popularity'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
];

const Shop = () => {
  const { slug } = useParams(); // present on /category/:slug
  const [searchParams, setSearchParams] = useSearchParams();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';

  const search = searchParams.get('q') || '';
  const isSearch = window.location.pathname.startsWith('/search');

  const [filters, setFilters] = useState(null);
  const [category, setCategory] = useState(null);
  const [result, setResult] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Multi-select filter state from the URL.
  const getMulti = (key) => searchParams.get(key)?.split(',').filter(Boolean) || [];
  const selected = {
    brand: getMulti('brand'),
    material: getMulti('material'),
    gender: getMulti('gender'),
  };
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Load filter options once.
  useEffect(() => {
    api.get('/products/filters').then((res) => setFilters(res.data.filters)).catch(() => {});
  }, []);

  // Load category info when on a category route.
  useEffect(() => {
    if (slug) {
      api.get(`/categories/${slug}`).then((res) => setCategory(res.data.category)).catch(() => setCategory(null));
    } else {
      setCategory(null);
    }
  }, [slug]);

  // Fetch products whenever the query changes.
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    if (isSearch && search) params.set('search', search);
    ['brand', 'material', 'gender'].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (searchParams.get('featured')) params.set('featured', searchParams.get('featured'));
    if (searchParams.get('onSale')) params.set('onSale', searchParams.get('onSale'));
    params.set('sort', sort);
    params.set('page', page);
    params.set('limit', '12');

    api
      .get(`/products?${params.toString()}`)
      .then((res) => setResult(res.data))
      .catch(() => setResult({ products: [], total: 0, page: 1, pages: 1 }))
      .finally(() => setLoading(false));
  }, [slug, isSearch, search, searchParams, sort, page, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update a URL param and reset to page 1.
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value == null || value === '') next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setSearchParams(next);
  };

  const toggleMulti = (key, value) => {
    const current = getMulti(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.join(','));
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (isSearch && search) next.set('q', search);
    setSearchParams(next);
  };

  const title = category ? category.name : isSearch ? `Search: ${search}` : 'All Jewellery';
  const activeCount =
    selected.brand.length + selected.material.length + selected.gender.length + (minPrice || maxPrice ? 1 : 0);

  return (
    <div className="container-page py-8">
      <Seo title={title} description={category?.metaDescription} />

      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
        {category?.description && <p className="mt-2 max-w-2xl text-charcoal/60">{category.description}</p>}
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Filters */}
        <aside
          className={`fixed inset-0 z-50 overflow-y-auto bg-white p-6 lg:sticky lg:inset-auto lg:top-24 lg:z-auto lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:rounded-lg lg:border lg:border-charcoal/10 lg:p-5 lg:shadow-card ${
            showFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h3 className="font-serif text-xl">Filters</h3>
            <button onClick={() => setShowFilters(false)} aria-label="Close">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between lg:border-b lg:border-charcoal/10 lg:pb-4">
            <h3 className="hidden font-serif text-lg lg:block">Filters</h3>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-gold-700 hover:underline">
                Clear all ({activeCount})
              </button>
            )}
          </div>

          {filters && (
            <div className="mt-4 space-y-6">
              <FilterGroup title="Metal">
                {filters.materials.map((m) => (
                  <Check
                    key={m}
                    label={m}
                    checked={selected.material.includes(m)}
                    onChange={() => toggleMulti('material', m)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="For">
                {filters.genders.map((g) => (
                  <Check
                    key={g}
                    label={g}
                    checked={selected.gender.includes(g)}
                    onChange={() => toggleMulti('gender', g)}
                  />
                ))}
              </FilterGroup>

              {filters.brands?.length > 0 && (
                <FilterGroup title="Collection">
                  {filters.brands.map((b) => (
                    <Check
                      key={b._id}
                      label={b.name}
                      checked={selected.brand.includes(b.slug)}
                      onChange={() => toggleMulti('brand', b.slug)}
                    />
                  ))}
                </FilterGroup>
              )}

              <FilterGroup title="Price">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    defaultValue={minPrice}
                    onBlur={(e) => setParam('minPrice', e.target.value)}
                    className="input py-1.5 text-sm"
                  />
                  <span className="text-charcoal/40">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    defaultValue={maxPrice}
                    onBlur={(e) => setParam('maxPrice', e.target.value)}
                    className="input py-1.5 text-sm"
                  />
                </div>
                {filters.priceRange && (
                  <p className="mt-2 text-xs text-charcoal/40">
                    {formatPrice(filters.priceRange.min, symbol)} – {formatPrice(filters.priceRange.max, symbol)}
                  </p>
                )}
              </FilterGroup>
            </div>
          )}
        </aside>

        {/* Products */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="btn-outline lg:hidden"
            >
              <FaSlidersH /> Filters {activeCount > 0 && `(${activeCount})`}
            </button>
            <p className="hidden text-sm text-charcoal/50 sm:block">{result.total} results</p>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="input max-w-[220px] py-2 text-sm"
            >
              {SORT_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  Sort: {l}
                </option>
              ))}
            </select>
          </div>

          {!loading && result.products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search term."
              actionText="Browse all jewellery"
              actionTo="/shop"
            />
          ) : (
            <>
              <ProductGrid products={result.products} loading={loading} skeletonCount={12} />
              <Pagination
                page={result.page}
                pages={result.pages}
                onChange={(p) => setParam('page', p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, children }) => (
  <div className="border-b border-charcoal/10 pb-5 last:border-b-0 last:pb-0">
    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/70">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal/80">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-charcoal/30 text-gold-600 focus:ring-gold-500"
    />
    {label}
  </label>
);

export default Shop;
