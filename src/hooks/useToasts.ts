import { useState, useCallback } from 'react';
import { Toast } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'> & { duration?: number }) => {
    const id = uid();
    setToasts(p => [...p, { ...t, id }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), t.duration ?? 4000);
  }, []);

  const dismiss = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);

  return { toasts, addToast, dismiss };
}
