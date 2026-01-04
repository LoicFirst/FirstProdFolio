'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteSettings } from '@/types';

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

const defaultSettings: SiteSettings = {
  lightWaveEffect: true,
  reviewsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use defaults on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
