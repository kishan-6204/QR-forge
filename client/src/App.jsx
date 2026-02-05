import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MyQRCodesPage from './pages/MyQRCodesPage';
import ProtectedRoute from './components/ProtectedRoute';

const getPathname = () => window.location.pathname;

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [pathname, setPathname] = useState(getPathname);

  const navigate = (path) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    setPathname(path);
  };

  useEffect(() => {
    const onPopState = () => setPathname(getPathname());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/auth') {
      navigate('/auth');
    }

    if (isAuthenticated && (pathname === '/' || pathname === '/auth')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    const known = ['/auth', '/dashboard', '/my-qrcodes'];
    if (!known.includes(pathname)) {
      navigate(isAuthenticated ? '/dashboard' : '/auth');
    }
  }, [isAuthenticated, pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(129,140,248,0.24),transparent_36%),radial-gradient(circle_at_92%_8%,rgba(236,72,153,0.16),transparent_28%),radial-gradient(circle_at_45%_78%,rgba(34,211,238,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_28%,rgba(255,255,255,0.2))] dark:bg-[linear-gradient(to_bottom,rgba(15,23,42,0.55),transparent_24%,rgba(2,6,23,0.55))]" />

      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {pathname === '/auth' && <AuthPage onAuthenticated={() => navigate('/dashboard')} />}

        {pathname === '/dashboard' && (
          <ProtectedRoute fallback={<AuthPage onAuthenticated={() => navigate('/dashboard')} />}>
            <DashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        )}

        {pathname === '/my-qrcodes' && (
          <ProtectedRoute fallback={<AuthPage onAuthenticated={() => navigate('/dashboard')} />}>
            <MyQRCodesPage onNavigate={navigate} />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
