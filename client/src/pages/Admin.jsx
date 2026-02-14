import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="border border-stone-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function Bar({ label, value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 text-right text-xs text-stone-500">{label}</span>
      <div className="h-5 flex-1 bg-stone-100">
        <div className="h-full bg-stone-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-xs font-medium text-stone-700">{value}</span>
    </div>
  );
}

function UsersTab({ apiFetch }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '' });
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/admin/users?page=${page}&limit=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleDelete(id, email) {
    if (!confirm(`Slett bruker ${email}? Alle lagrede søk vil også bli slettet.`)) return;
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(id) {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}
      <p className="mb-4 text-sm text-stone-400">{total} brukere totalt</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="pb-3 pr-4 font-medium">E-post</th>
              <th className="pb-3 pr-4 font-medium">Rolle</th>
              <th className="pb-3 pr-4 font-medium">Registrert</th>
              <th className="pb-3 pr-4 font-medium">Søk</th>
              <th className="pb-3 font-medium">Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-stone-100">
                {editingId === u._id ? (
                  <>
                    <td className="py-3 pr-4">
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full border border-stone-200 px-2 py-1 text-sm outline-none focus:border-stone-400"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="border border-stone-200 px-2 py-1 text-sm outline-none focus:border-stone-400"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-stone-400">{new Date(u.createdAt).toLocaleDateString('nb-NO')}</td>
                    <td className="py-3 pr-4 text-stone-400">{u.searchCount}</td>
                    <td className="flex gap-2 py-3">
                      <button onClick={() => handleSave(u._id)} className="text-xs font-medium text-stone-900 underline">Lagre</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-stone-400 underline">Avbryt</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 pr-4 font-medium text-stone-900">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.role === 'admin' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-stone-400">{new Date(u.createdAt).toLocaleDateString('nb-NO')}</td>
                    <td className="py-3 pr-4 text-stone-400">{u.searchCount}</td>
                    <td className="flex gap-2 py-3">
                      <button
                        onClick={() => { setEditingId(u._id); setEditForm({ email: u.email, role: u.role }); }}
                        className="text-xs font-medium text-stone-900 underline"
                      >
                        Rediger
                      </button>
                      <button onClick={() => handleDelete(u._id, u.email)} className="text-xs font-medium text-red-500 underline">
                        Slett
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border border-stone-200 px-3 py-1 text-xs font-medium text-stone-900 transition hover:bg-stone-100 disabled:opacity-30"
          >
            Forrige
          </button>
          <span className="text-xs text-stone-400">Side {page} av {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="border border-stone-200 px-3 py-1 text-xs font-medium text-stone-900 transition hover:bg-stone-100 disabled:opacity-30"
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}

function StatsTab({ apiFetch }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [apiFetch]);

  if (error) return <p className="text-sm font-medium text-red-500">{error}</p>;
  if (!stats) return <p className="text-sm text-stone-400">Laster statistikk...</p>;

  const discountMax = Math.max(...stats.discountDistribution.map((d) => d.count), 1);
  const dailyMax = Math.max(...stats.productsPerDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Produkter totalt" value={stats.totalProducts} />
        <StatCard label="Brukere totalt" value={stats.totalUsers} />
        <StatCard label="Nye i dag" value={stats.productsToday} />
        <StatCard label="Snitt rabatt" value={`${stats.avgDiscount}%`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-900">Topp 5 kategorier</h3>
          <div className="space-y-2">
            {stats.topCategories.map((c) => (
              <Bar key={c.category} label={c.category} value={c.count} max={stats.topCategories[0]?.count || 1} />
            ))}
            {stats.topCategories.length === 0 && <p className="text-sm text-stone-400">Ingen data</p>}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-900">Rabattfordeling</h3>
          <div className="space-y-2">
            {stats.discountDistribution.map((d) => (
              <Bar key={d.label} label={d.label} value={d.count} max={discountMax} />
            ))}
            {stats.discountDistribution.length === 0 && <p className="text-sm text-stone-400">Ingen data</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-900">Produkter per dag (siste 30 dager)</h3>
        <div className="flex items-end gap-1" style={{ height: 160 }}>
          {stats.productsPerDay.map((d) => (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
              <div
                className="w-full bg-stone-900 transition-all"
                style={{ height: `${(d.count / dailyMax) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }}
              />
              <span className="absolute -top-5 hidden text-[10px] font-medium text-stone-700 group-hover:block">{d.count}</span>
              <span className="mt-1 hidden text-[8px] text-stone-400 group-hover:block">{d.date.slice(5)}</span>
            </div>
          ))}
          {stats.productsPerDay.length === 0 && <p className="text-sm text-stone-400">Ingen data</p>}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { apiFetch } = useAuth();
  const [tab, setTab] = useState('users');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold italic">Admin</h1>
      <div className="mb-6 flex gap-1">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-medium transition ${tab === 'users' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
        >
          Brukere
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`px-4 py-2 text-sm font-medium transition ${tab === 'stats' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
        >
          Statistikk
        </button>
      </div>
      {tab === 'users' ? <UsersTab apiFetch={apiFetch} /> : <StatsTab apiFetch={apiFetch} />}
    </div>
  );
}
