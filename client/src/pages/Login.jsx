import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'true';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendStatus('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setNeedsVerification(true);
        setError(data.error);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.email, data.role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleResend() {
    setResendStatus('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResendStatus('Ny bekreftelseslenke er sendt!');
    } catch (err) {
      setResendStatus(err.message);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm border border-stone-200 bg-white p-8">
      <h2 className="mb-6 text-xl font-bold italic">Logg inn</h2>
      {verified && (
        <p className="mb-4 text-sm font-medium text-green-600">E-posten er bekreftet — du kan nå logge inn.</p>
      )}
      {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}
      {needsVerification && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-stone-900 underline transition hover:text-stone-500"
          >
            Send bekreftelseslenke på nytt
          </button>
          {resendStatus && <p className="mt-2 text-sm text-stone-600">{resendStatus}</p>}
        </div>
      )}
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
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-stone-200 bg-transparent px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400"
        />
        <button type="submit" className="mt-2 bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800">
          Logg inn
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-400">
        Har du ikke en konto? <Link to="/register" className="text-stone-900 underline transition hover:text-stone-500">Registrer deg</Link>
      </p>
    </div>
  );
}
