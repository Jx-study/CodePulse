import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useEffect } from 'react';

function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    navigate('/', { replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || isAuthenticated) return null;

  return <Outlet />;
}

export default GuestRoute;
