import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : fallback;
}
