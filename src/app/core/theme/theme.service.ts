import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';

  private currentThemeSignal = signal<Theme>(this.getStoredTheme());

  currentTheme = computed(() => this.currentThemeSignal());

  constructor() {
    // Automatically apply theme when it changes
    effect(() => {
      this.applyThemeToDocument(this.currentThemeSignal());
    });
  }

  toggleTheme() {
    const newTheme = this.currentThemeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme) {
    localStorage.setItem(this.THEME_KEY, theme);
    this.currentThemeSignal.set(theme);
  }

  private getStoredTheme(): Theme {
    const storedTheme = localStorage.getItem(this.THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme as Theme;
    }
    // Check system preference if no stored theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default
  }

  private applyThemeToDocument(theme: Theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
