import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.token) {
        login(data.token, data.email, data.role);
        navigate('/');
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto mt-16 max-w-sm border border-stone-200 bg-white p-8">
        <h2 className="mb-4 text-xl font-bold italic">Sjekk e-posten din</h2>
        <p className="text-sm text-stone-600">
          Vi har sendt en bekreftelseslenke til <strong>{email}</strong>. Klikk på lenken for å aktivere kontoen din.
        </p>
        <p className="mt-4 text-sm text-stone-400">
          <Link to="/login" className="text-stone-900 underline transition hover:text-stone-500">Gå til innlogging</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm border border-stone-200 bg-white p-8">
      <h2 className="mb-6 text-xl font-bold italic">Registrer deg</h2>
      {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-stone-200 bg-transparent px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400"
        />
        <input
          type="password"
          placeholder="Passord (min. 6 tegn)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-stone-200 bg-transparent px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400"
        />
        <button type="submit" className="mt-2 bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800">
          Registrer deg
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-400">
        Har du allerede en konto? <Link to="/login" className="text-stone-900 underline transition hover:text-stone-500">Logg inn</Link>
      </p>
    </div>
  );
}
