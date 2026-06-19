import React, { createContext, useContext, ReactNode } from "react";
import { Href } from "expo-router";

interface NavigationContextValue {
  push: (href: Href, params?: Record<string, string>) => void;
  back: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: NavigationContextValue;
}) {
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useAppNavigation must be used within NavigationProvider");
  }
  return ctx;
}

/** Devuelve el helper de navegación o null si no hay provider (evita error en rutas sin contexto). */
export function useAppNavigationOptional(): NavigationContextValue | null {
  return useContext(NavigationContext);
}
