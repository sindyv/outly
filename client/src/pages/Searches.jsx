import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Searches() {
  const { apiFetch } = useAuth();
  const [searches, setSearches] = useState([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [minDiscount, setMinDiscount] = useState(0);
  const [buyableOnline, setBuyableOnline] = useState(false);

  useEffect(() => {
    loadSearches();
  }, []);

  async function loadSearches() {
    try {
      const res = await apiFetch('/api/searches');
      const data = await res.json();
      setSearches(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!query.trim()) return;
    try {
      const res = await apiFetch('/api/searches', {
        method: 'POST',
        body: JSON.stringify({ query, minDiscount, buyableOnline }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setQuery('');
      setMinDiscount(0);
      setBuyableOnline(false);
      loadSearches();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSearch(id) {
    try {
      await apiFetch(`/api/searches/${id}`, { method: 'DELETE' });
      setSearches(searches.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight italic">Lagrede søk</h2>
      <p className="mb-6 text-sm text-stone-400">
        Du får e-postvarsler når nye outlet-produkter matcher dine lagrede søk.
      </p>
      {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 border border-stone-200 bg-white p-5">
        <input
          type="text"
          placeholder="f.eks. LG TV, Samsung, Sony hodetelefoner..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 w-full border border-stone-200 bg-transparent px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400"
        />
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 text-sm text-stone-500">
            <span>Min. rabatt</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer appearance-none bg-stone-200 accent-stone-900 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-900"
            />
            <span className="min-w-[3ch] text-right font-bold text-stone-900">{minDiscount}%</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-stone-500">
            <span>Kjøpbar på nett</span>
            <button
              type="button"
              role="switch"
              aria-checked={buyableOnline}
              onClick={() => setBuyableOnline(!buyableOnline)}
              className={`relative h-5 w-9 rounded-full transition ${buyableOnline ? 'bg-stone-900' : 'bg-stone-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition ${buyableOnline ? 'translate-x-4 bg-white' : 'bg-white'}`} />
            </button>
          </label>
          <button type="submit" className="ml-auto bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-800">
            Lagre søk
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {searches.length === 0 && <p className="py-8 text-center text-stone-400">Ingen lagrede søk ennå.</p>}
        {searches.map((s) => {
          const params = new URLSearchParams({ q: s.query });
          if (s.minDiscount > 0) params.set('minDiscount', s.minDiscount);
          if (s.buyableOnline) params.set('buyableOnline', 'true');
          return (
            <div key={s._id} className="flex items-center gap-4 border border-stone-100 bg-white px-5 py-4 transition hover:border-stone-300">
              <Link to={`/?${params}`} className="flex flex-1 items-center gap-3 text-stone-900 transition hover:text-stone-500">
                <span className="font-semibold">{s.query}</span>
                {s.minDiscount > 0 && (
                  <span className="border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                    Min -{s.minDiscount}%
                  </span>
                )}
                {s.buyableOnline && (
                  <span className="border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                    Kun nett
                  </span>
                )}
                <span className="ml-auto text-xs text-stone-300">&rsaquo;</span>
              </Link>
              <span className="text-xs text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => deleteSearch(s._id)}
                className="border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Slett
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
