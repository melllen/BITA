import { useState, useEffect } from 'react';
import { THEMES, DEFAULT_THEME_ID } from '../utils/themes.js';

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--sky', theme.sky);
  // Clear any previously applied overrides first
  const overridable = ['--bg', '--surface', '--surface2', '--text', '--text-muted',
    '--border', '--shadow', '--accent', '--accent-hover', '--header-bg', '--danger'];
  overridable.forEach(v => root.style.removeProperty(v));
  // Apply this theme's overrides
  if (theme.vars) {
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }
}

function getInitialTheme() {
  try {
    const id = localStorage.getItem('bita_theme') ?? DEFAULT_THEME_ID;
    const theme = THEMES.find(t => t.id === id) ?? THEMES[0];
    applyTheme(theme); // apply synchronously to avoid flash
    return id;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function useTheme() {
  const [themeId, setThemeId] = useState(getInitialTheme);
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const selectTheme = (id) => {
    setThemeId(id);
    try { localStorage.setItem('bita_theme', id); } catch {}
  };

  return { theme, selectTheme };
}
