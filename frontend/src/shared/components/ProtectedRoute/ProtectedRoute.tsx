import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from '@/shared/components/Toast';
import { useEffect, useRef } from 'react';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || hasTriggered.current) return;
    hasTriggered.current = true;

    toast.warning('請先登入才能使用此功能');
    const timer = setTimeout(() => {
      navigate('/auth', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <Outlet />;
}

export default ProtectedRoute;
