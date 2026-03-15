import { useState, useEffect } from 'react';

type UsernameCheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

interface UseUsernameCheckReturn {
  status: UsernameCheckStatus;
}

function useUsernameCheck(username: string): UseUsernameCheckReturn {
  const [status, setStatus] = useState<UsernameCheckStatus>('idle');

  useEffect(() => {
    // Front-end format check
    const isValid =
      username.length >= 3 &&
      username.length <= 20 &&
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
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
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
