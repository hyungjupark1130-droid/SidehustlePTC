'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ArchiveContextType {
  isOpen: boolean;
  openArchive: () => void;
  closeArchive: () => void;
}

const ArchiveContext = createContext<ArchiveContextType>({
  isOpen: false,
  openArchive: () => {},
  closeArchive: () => {},
});

export function useArchive() {
  return useContext(ArchiveContext);
}

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openArchive = useCallback(() => setIsOpen(true), []);
  const closeArchive = useCallback(() => setIsOpen(false), []);

  return (
    <ArchiveContext.Provider value={{ isOpen, openArchive, closeArchive }}>
      {children}
    </ArchiveContext.Provider>
  );
}
