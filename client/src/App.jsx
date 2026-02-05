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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.25),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.18),transparent_26%),radial-gradient(circle_at_50%_70%,rgba(34,211,238,0.16),transparent_30%)]" />

      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
