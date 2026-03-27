import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from '@/shared/components/Toast';

/**
 * Returns a guard function that checks authentication before proceeding.
 * If not authenticated: shows a toast warning and redirects to /auth after 3 seconds.
 * Usage:
 *   const authGuard = useAuthGuard();
 *   const handleClick = () => { if (!authGuard()) return; // proceed
 *   };
 */
export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guard = useCallback((): boolean => {
    if (isAuthenticated) return true;

    toast.warning(t('auth.loginRequired'));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigate('/auth', { replace: true });
      timerRef.current = null;
    }, 3000);

    return false;
  }, [isAuthenticated, navigate, t]);

  return guard;
}
