import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { LiveSession } from '../types';
import { createLiveSessionRequest, fetchLiveSessions, NewLiveSessionPayload } from '../api/live';

interface LiveContextValue {
  liveSessions: LiveSession[];
  loading: boolean;
  refresh: () => Promise<void>;
  createLiveSession: (payload: NewLiveSessionPayload) => Promise<LiveSession>;
}

const LiveContext = createContext<LiveContextValue | undefined>(undefined);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLiveSessions(await fetchLiveSessions());
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const createLiveSession = useCallback(
    async (payload: NewLiveSessionPayload) => {
      const created = await createLiveSessionRequest(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ liveSessions, loading, refresh, createLiveSession }),
    [liveSessions, loading, refresh, createLiveSession]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
};

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used within a LiveProvider');
  return ctx;
}
