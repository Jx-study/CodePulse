import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import authService from '@/services/authService';

const ERROR_MESSAGES: Record<string, string> = {
  account_disabled: 'This account has been disabled. Please contact support.',
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  server_error: 'Server error. Please try again later.',
};

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const error = searchParams.get('error');
    const linked = searchParams.get('linked');
    const linkPrompt = searchParams.get('link_prompt');

    if (error) {
      const msg = ERROR_MESSAGES[error] || 'OAuth sign-in failed.';
      navigate('/auth', { state: { oauthError: msg }, replace: true });
      return;
    }

    if (linkPrompt === 'true') {
      authService.getLinkInfo().then((info) => {
        navigate('/auth', { state: { linkPromptEmail: info.email ?? null }, replace: true });
      }).catch(() => {
        navigate('/auth', { state: { linkPromptEmail: null }, replace: true });
      });
      return;
    }

    // Refresh auth state from cookie (cookies already set by backend)
    checkAuthStatus().then(() => {
      if (linked === 'true') {
        navigate('/dashboard', { state: { oauthLinked: true }, replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    });
  }, []); // run once on mount

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Signing in...</p>
    </div>
  );
}
