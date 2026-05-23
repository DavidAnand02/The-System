import { useEffect } from 'react';
import { initGA, trackPageView } from '../lib/analytics';

export function useAnalytics(currentPage: string) {
  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);
}
