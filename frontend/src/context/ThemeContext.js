import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  dark: {
    name: 'dark',
    label: 'Dark',
    vars: {
      '--bg-base':       '#08080f',
      '--bg-surface':    '#0f0f1a',
      '--bg-elevated':   '#14141f',
      '--bg-card':       '#18182a',
      '--bg-card-hover': '#1e1e30',
      '--text-primary':  '#f0f0fa',
      '--text-secondary':'#9090b0',
      '--text-muted':    '#555570',
      '--border-subtle': 'rgba(255,255,255,0.06)',
      '--border-mid':    'rgba(255,255,255,0.10)',
      '--border-strong': 'rgba(255,255,255,0.18)',
    }
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    vars: {
      '--bg-base':       '#020817',
      '--bg-surface':    '#060d20',
      '--bg-elevated':   '#0a1428',
      '--bg-card':       '#0e1830',
      '--bg-card-hover': '#121e38',
      '--text-primary':  '#e8eeff',
      '--text-secondary':'#7888aa',
      '--text-muted':    '#445566',
      '--border-subtle': 'rgba(100,140,220,0.08)',
      '--border-mid':    'rgba(100,140,220,0.14)',
      '--border-strong': 'rgba(100,140,220,0.24)',
    }
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    vars: {
      '--bg-base':       '#0d0f14',
      '--bg-surface':    '#131620',
      '--bg-elevated':   '#191c28',
      '--bg-card':       '#1e2130',
      '--bg-card-hover': '#242738',
      '--text-primary':  '#eef0f8',
      '--text-secondary':'#8090a8',
      '--text-muted':    '#505870',
      '--border-subtle': 'rgba(180,200,255,0.06)',
      '--border-mid':    'rgba(180,200,255,0.10)',
      '--border-strong': 'rgba(180,200,255,0.18)',
    }
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    vars: {
      '--bg-base':       '#060d08',
      '--bg-surface':    '#0c1610',
      '--bg-elevated':   '#111e16',
      '--bg-card':       '#15251a',
      '--bg-card-hover': '#1a2e20',
      '--text-primary':  '#edf7f0',
      '--text-secondary':'#7a9e84',
      '--text-muted':    '#445a4a',
      '--border-subtle': 'rgba(100,200,120,0.07)',
      '--border-mid':    'rgba(100,200,120,0.12)',
      '--border-strong': 'rgba(100,200,120,0.20)',
    }
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('resumeiq-theme') || 'dark';
  });

  useEffect(() => {
    const themeVars = THEMES[theme]?.vars || THEMES.dark.vars;
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    localStorage.setItem('resumeiq-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
