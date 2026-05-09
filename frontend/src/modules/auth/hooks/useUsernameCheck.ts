import { useState, useEffect } from 'react';
import apiService from '@/api/api';

type UsernameCheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

interface UseUsernameCheckReturn {
  status: UsernameCheckStatus;
}

function useUsernameCheck(username: string): UseUsernameCheckReturn {
  const [status, setStatus] = useState<UsernameCheckStatus>('idle');

  useEffect(() => {
    const isValid =
      username.length >= 3 &&
      username.length <= 15 &&
      /^[a-zA-Z0-9_]+$/.test(username);

    if (!isValid) {
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    let timerId: ReturnType<typeof setTimeout>;

    timerId = setTimeout(async () => {
      setStatus('checking');
      try {
        const { data } = await apiService.get<{ available: boolean }>(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`,
          undefined,
          controller.signal,
        );
        if (data.available === true) {
          setStatus('available');
        } else if (data.available === false) {
          setStatus('taken');
        } else {
          setStatus('error');
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [username]);

  return { status };
}

export default useUsernameCheck;
