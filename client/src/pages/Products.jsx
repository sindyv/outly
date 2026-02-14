import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchForm from '../components/SearchForm';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('q') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const buyableOnline = searchParams.get('buyableOnline') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    fetchProducts();
  }, [query, minDiscount, buyableOnline, sort, minPrice, maxPrice, page]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 24 });
      if (query) params.set('q', query);
      if (minDiscount) params.set('minDiscount', minDiscount);
      if (buyableOnline === 'true') params.set('buyableOnline', 'true');
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(q) {
    setPage(1);
    const next = {};
    if (q) next.q = q;
    if (minDiscount) next.minDiscount = minDiscount;
    if (buyableOnline === 'true') next.buyableOnline = 'true';
    if (sort) next.sort = sort;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    setSearchParams(next);
  }

  function updateParam(key, value) {
    setPage(1);
    const next = {};
    if (query) next.q = query;
    if (minDiscount) next.minDiscount = minDiscount;
    if (buyableOnline === 'true') next.buyableOnline = 'true';
    if (sort) next.sort = sort;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }
    setSearchParams(next);
  }

  function clearFilters() {
    setPage(1);
    setSearchParams({});
  }

  const sortLabels = {
    price_asc: 'Pris lav→høy',
    price_desc: 'Pris høy→lav',
    discount: 'Største rabatt',
  };

  const hasFilters = query || minDiscount || buyableOnline === 'true' || sort || minPrice || maxPrice;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight italic">Outlet-produkter</h2>
      <SearchForm onSubmit={handleSearch} placeholder="Søk etter produkter..." buttonText="Søk" initialValue={query} />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Sortering</label>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700"
          >
            <option value="">Nyeste</option>
            <option value="price_asc">Pris lav→høy</option>
            <option value="price_desc">Pris høy→lav</option>
            <option value="discount">Største rabatt</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Min pris</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
              className="w-24 border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
            />
          </div>
          <span className="pb-1.5 text-stone-400">–</span>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Maks pris</label>
            <input
              type="number"
              min="0"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
              className="w-24 border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
            />
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="mb-6 flex items-center gap-3 text-sm text-stone-500">
          <span>
            {query && <>Resultater for &ldquo;{query}&rdquo; </>}
            {minDiscount && (
              <span className="ml-1 border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                Min -{minDiscount}%
              </span>
            )}
            {buyableOnline === 'true' && (
              <span className="ml-1 border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                Kun nett
              </span>
            )}
            {sort && sortLabels[sort] && (
              <span className="ml-1 border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                {sortLabels[sort]}
              </span>
            )}
            {minPrice && (
              <span className="ml-1 border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                Fra {minPrice} kr
              </span>
            )}
            {maxPrice && (
              <span className="ml-1 border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                Til {maxPrice} kr
              </span>
            )}
            <span className="ml-2">({total} funnet)</span>
          </span>
          <button onClick={clearFilters} className="border border-stone-200 px-3 py-1 text-xs text-stone-600 transition hover:bg-stone-900 hover:text-white">
            Nullstill
          </button>
        </div>
      )}
      {loading ? (
        <p className="py-12 text-center text-stone-400">Laster...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {products.length === 0 && <p className="py-12 text-center text-stone-400">Ingen produkter funnet.</p>}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="border border-stone-200 px-4 py-2 text-xs font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-900"
              >
                Forrige
              </button>
              <span className="text-sm text-stone-400">Side {page} av {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="border border-stone-200 px-4 py-2 text-xs font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-900"
              >
                Neste
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
