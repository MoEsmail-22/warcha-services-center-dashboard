/**
 * LoadingContext — shows the full-screen loader while an API call runs.
 *
 * Usage:
 *   const { withLoading } = useLoading();
 *   await withLoading(() => createOffer(form), t('loading.saving'));
 *
 * withLoading returns (or throws) exactly what the API call does, so the
 * caller's try/catch keeps working. Several calls at once keep the overlay
 * up until the last one finishes.
 */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const LoadingContext = createContext(null);

// Calls faster than this never show the overlay, so quick actions don't flash.
const SHOW_AFTER_MS = 250;

export function LoadingProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const nextId = useRef(0);

  const withLoading = useCallback(async (task, message) => {
    const id = ++nextId.current;
    setTasks((current) => [...current, { id, message }]);

    try {
      return await (typeof task === 'function' ? task() : task);
    } finally {
      setTasks((current) => current.filter((item) => item.id !== id));
    }
  }, []);

  // The newest running call decides the message.
  const current = tasks[tasks.length - 1];

  return (
    <LoadingContext.Provider value={{ withLoading, isLoading: tasks.length > 0 }}>
      {children}
      {current && (
        <LoadingScreen variant="fullscreen" message={current.message} delay={SHOW_AFTER_MS} />
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used inside a <LoadingProvider>');
  return context;
}
