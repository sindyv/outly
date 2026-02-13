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

  useEffect(() => {
    fetchProducts();
  }, [query, minDiscount, buyableOnline, page]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 24 });
      if (query) params.set('q', query);
      if (minDiscount) params.set('minDiscount', minDiscount);
      if (buyableOnline === 'true') params.set('buyableOnline', 'true');
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
    setSearchParams(q ? { q } : {});
  }

  function clearFilters() {
    setPage(1);
    setSearchParams({});
  }

  const hasFilters = query || minDiscount || buyableOnline === 'true';

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight italic">Outlet-produkter</h2>
      <SearchForm onSubmit={handleSearch} placeholder="Søk etter produkter..." buttonText="Søk" initialValue={query} />
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
