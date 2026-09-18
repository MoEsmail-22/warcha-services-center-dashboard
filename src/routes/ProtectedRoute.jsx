import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteFallback from '../components/ui/RouteFallback';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { lang = 'en' } = useParams(); // get :lang from URL

  if (loading) return <RouteFallback />;

  // if (!user) {
  //   return <Navigate to={`/${lang}/login`} state={{ from: location }} replace />;
  // }

  return children;
}
