'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type MotionContextType = {
  motionEnabled: boolean;
  setMotionEnabled: (v: boolean) => void;
  toggleMotion: () => void;
};

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [motionEnabled, setMotionEnabled] = useState(true);
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
