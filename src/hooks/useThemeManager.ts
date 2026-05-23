import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export function useThemeManager() {
  const player = usePlayerStore(state => state.player);

  useEffect(() => {
    if (player.themeColor) {
      document.documentElement.setAttribute('data-theme', player.themeColor);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [player.themeColor]);
}
