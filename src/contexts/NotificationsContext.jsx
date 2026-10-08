/**
 * NotificationsContext — the workshop's notifications for the Topbar bell.
 *
 * Loads only while someone is signed in (never on the login page), checks for
 * new ones every minute, and marks items as read right away on screen,
 * undoing that if the API call fails.
 *
 * Exposes:
 *   { items, unreadCount, loading, error, hasMore, refresh, loadMore, markAsRead, markAllAsRead }
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/API/notificationsApi';
import { isDemoMode } from '@/API/client';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const PAGE_SIZE = 20;
const REFRESH_EVERY_MS = 60_000;

/** Backend field names may vary, so read each one from the likely candidates. */
function normalizeNotification(item) {
  const readAt = item.readAt ?? item.readDate ?? null;

  return {
    id: item.id ?? item.notificationId,
    title: { en: item.titleEn ?? item.title ?? '', ar: item.titleAr ?? item.title ?? '' },
    message: {
      en: item.messageEn ?? item.bodyEn ?? item.message ?? item.body ?? item.content ?? '',
      ar: item.messageAr ?? item.bodyAr ?? item.message ?? item.body ?? item.content ?? '',
    },
    type: item.type ?? item.notificationType ?? '',
    isRead: Boolean(item.isRead ?? item.read ?? readAt),
    createdAt: item.createdAt ?? item.createdOn ?? item.sentAt ?? item.date ?? null,
  };
}

/** Accepts a plain array or a paged object ({ items, hasNextPage, unreadCount, ... }). */
function readPage(result) {
  const data = result?.data ?? result;
  const rows = Array.isArray(data)
    ? data
    : (data?.items ?? data?.notifications ?? data?.data ?? []);
  const meta = Array.isArray(data) ? {} : (data ?? {});

  return {
    items: (Array.isArray(rows) ? rows : []).map(normalizeNotification),
    hasMore: meta.hasNextPage ?? (Array.isArray(rows) && rows.length === PAGE_SIZE),
    unreadCount: meta.unreadCount ?? meta.unReadCount ?? null,
  };
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [serverUnread, setServerUnread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);

  const enabled = Boolean(user) && !isDemoMode();

  // Reload the first page (used on login, by the timer and by "Try again").
  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const result = readPage(await getNotifications({ page: 1, pageSize: PAGE_SIZE }));
      if (requestId !== latestRequest.current) return;
      setItems(result.items);
      setHasMore(result.hasMore);
      setServerUnread(result.unreadCount);
      setPage(1);
    } catch (err) {
      if (requestId === latestRequest.current) setError(err);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = readPage(await getNotifications({ page: nextPage, pageSize: PAGE_SIZE }));
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...result.items.filter((item) => !known.has(item.id))];
      });
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!enabled) {
      // Signed out: forget the previous account's notifications.
      setItems([]);
      setServerUnread(null);
      setError(null);
      return undefined;
    }

    refresh();
    const timer = setInterval(refresh, REFRESH_EVERY_MS);
    return () => clearInterval(timer);
  }, [enabled, user?.id, refresh]);

  const setReadState = (ids, isRead) =>
    setItems((current) =>
      current.map((item) => (ids.includes(item.id) ? { ...item, isRead } : item))
    );

  const markAsRead = useCallback(async (id) => {
    setReadState([id], true);
    setServerUnread((count) => (count == null ? count : Math.max(0, count - 1)));
    try {
      await markNotificationRead(id);
    } catch (err) {
      setReadState([id], false);
      setServerUnread((count) => (count == null ? count : count + 1));
      throw err;
    }
  }, []);

  // There is no "read all" endpoint, so mark the loaded unread items one by one.
  const markAllAsRead = useCallback(async () => {
    const unreadIds = items.filter((item) => !item.isRead).map((item) => item.id);
    if (unreadIds.length === 0) return;

    setReadState(unreadIds, true);
    const results = await Promise.allSettled(unreadIds.map((id) => markNotificationRead(id)));
    const failedIds = unreadIds.filter((_, index) => results[index].status === 'rejected');

    if (failedIds.length) {
      setReadState(failedIds, false);
      throw results.find((result) => result.status === 'rejected').reason;
    }
    await refresh();
  }, [items, refresh]);

  const unreadCount = serverUnread ?? items.filter((item) => !item.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{
        items,
        unreadCount,
        loading,
        error,
        hasMore,
        refresh,
        loadMore,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used inside a <NotificationsProvider>');
  return context;
}
