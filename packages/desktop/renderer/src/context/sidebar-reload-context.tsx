"use client";
import React, { createContext, useContext } from "react";

const SidebarReloadContext = createContext<{
  reloadSidebar: () => void;
}>({
  reloadSidebar: () => {},
});

export function SidebarReloadProvider({ children, reloadSidebar }: { children: React.ReactNode, reloadSidebar: () => void }) {
  return (
    <SidebarReloadContext.Provider value={{ reloadSidebar }}>
      {children}
    </SidebarReloadContext.Provider>
  );
}

export function useSidebarReload() {
  return useContext(SidebarReloadContext);
} 