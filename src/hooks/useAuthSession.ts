import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { usePlayerStore } from '../store/usePlayerStore';

export function useAuthSession(onSessionReady: (userId: string) => void) {
  const [session, setSession] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const setLoading = usePlayerStore(state => state.setLoading);

  const onSessionReadyRef = useRef(onSessionReady);
  useEffect(() => {
    onSessionReadyRef.current = onSessionReady;
  }, [onSessionReady]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        const { session: remoteSession } = event.data;
        if (remoteSession) {
          // Manually set the session in the iframe's memory
          const { data, error } = await supabase.auth.setSession({
            access_token: remoteSession.access_token,
            refresh_token: remoteSession.refresh_token
          });
          
          if (!error && data.session) {
            setSession(data.session);
            onSessionReadyRef.current(data.session.user.id);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Handle OAuth popup closure
        if (window.opener && window.opener !== window) {
          // Get the full session to beam it back to the iframe
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              try {
                window.opener.postMessage({ 
                  type: 'SUPABASE_AUTH_SUCCESS', 
                  session: session 
                }, window.location.origin);
              } catch (e) {
                console.error('Failed to post message to opener:', e);
              }
            }
            window.close();
          });
          return;
        }

        // If user exists, we still need the session for the UI state
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          if (session) onSessionReadyRef.current(session.user.id);
          else setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) onSessionReadyRef.current(session.user.id);
      else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setLoading]);

  return { session, isOffline };
}
