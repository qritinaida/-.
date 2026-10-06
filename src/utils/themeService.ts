export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'dms_theme_mode_v1';

export const ThemeService = {
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage:', e);
    }
    return 'light';
  },

  setTheme(mode: ThemeMode): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      this.applyTheme(mode);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  toggleTheme(): ThemeMode {
    const current = this.getTheme();
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },

  initTheme(): ThemeMode {
    const mode = this.getTheme();
    this.applyTheme(mode);
    return mode;
  }
};
