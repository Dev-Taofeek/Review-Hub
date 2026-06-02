'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored || (prefersDark ? 'dark' : 'light');
    setThemeState(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const applyTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => applyTheme(theme === 'dark' ? 'light' : 'dark'), setTheme: applyTheme }}>
      {/* Prevent flash of wrong theme */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var t=localStorage.getItem('theme');
              var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
              if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark');}
            })()
          `,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
