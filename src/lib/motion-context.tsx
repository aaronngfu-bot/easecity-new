'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type MotionContextType = {
  motionEnabled: boolean;
  setMotionEnabled: (v: boolean) => void;
  toggleMotion: () => void;
};

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  // Default = true; after mount, override with OS prefers-reduced-motion (read once, not reactive).
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMotionEnabled(!prefersReduced);
  }, []);

  const toggleMotion = () => setMotionEnabled((v) => !v);

  return (
    <MotionContext.Provider value={{ motionEnabled, setMotionEnabled, toggleMotion }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionEnabled() {
  const ctx = useContext(MotionContext);
  if (!ctx) {
    throw new Error('useMotionEnabled must be used within MotionProvider');
  }
  return ctx;
}
