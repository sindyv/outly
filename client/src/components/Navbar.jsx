import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Logo';

export default function Navbar() {
  const { token, email, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <>
      {/* Desktop top bar */}
      <nav className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900 uppercase">
          <Logo className="h-7 w-7" />
          Outly
          <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white normal-case">beta</span>
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/" className="text-sm text-stone-400 transition hover:text-stone-900">Produkter</Link>
          {token ? (
            <>
              <Link to="/searches" className="text-sm text-stone-400 transition hover:text-stone-900">Mine søk</Link>
              {isAdmin && <Link to="/admin" className="text-sm text-stone-400 transition hover:text-stone-900">Admin</Link>}
              <span className="text-xs text-stone-400">{email}</span>
              <button
                onClick={logout}
                className="border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
              >
                Logg ut
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-stone-400 transition hover:text-stone-900">Logg inn</Link>
              <Link
                to="/register"
                className="bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800"
              >
                Registrer deg
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around rounded-full border border-stone-200 bg-white/90 px-2 py-2 shadow-lg backdrop-blur-sm md:hidden">
        <Link to="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${pathname === '/' ? 'text-stone-900' : 'text-stone-400'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
          Produkter
        </Link>
        {token ? (
          <>
            <Link to="/searches" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${pathname === '/searches' ? 'text-stone-900' : 'text-stone-400'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Mine søk
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${pathname === '/admin' ? 'text-stone-900' : 'text-stone-400'}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Admin
              </Link>
            )}
            <button onClick={logout} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium text-stone-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3h-9m9 0-3-3m3 3-3 3" />
              </svg>
              Logg ut
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${pathname === '/login' ? 'text-stone-900' : 'text-stone-400'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Logg inn
            </Link>
            <Link to="/register" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${pathname === '/register' ? 'text-stone-900' : 'text-stone-400'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Registrer
            </Link>
          </>
        )}
      </div>

      {/* Bottom spacer on mobile so content isn't hidden behind the bar */}
      <div className="h-20 md:hidden" />
    </>
  );
}
