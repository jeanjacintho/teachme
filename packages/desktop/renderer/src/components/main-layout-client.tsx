"use client";

import React, { useState, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { VideoProvider } from "@/context/video-context";
import { SidebarReloadProvider } from "@/context/sidebar-reload-context";
import { useVideo } from "@/context/video-context";

export function MainLayoutClient({ children, minimized = false }: { children: React.ReactNode; minimized?: boolean }) {
  const sidebarRef = useRef<{ reloadCurrentFolder: () => void }>(null);

  return (
    <SidebarProvider
      defaultOpen={!minimized}
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <VideoProvider>
        <SidebarReloadProvider reloadSidebar={() => sidebarRef.current?.reloadCurrentFolder?.()}>
          <MainLayoutContent sidebarRef={sidebarRef}>
            {children}
          </MainLayoutContent>
        </SidebarReloadProvider>
      </VideoProvider>
    </SidebarProvider>
  );
}

// Componente interno que pode usar o contexto
function MainLayoutContent({ children, sidebarRef }: { children: React.ReactNode; sidebarRef: React.RefObject<{ reloadCurrentFolder: () => void } | null> }) {
  const { currentVideo, setCurrentVideo } = useVideo();

  const handleVideoSelect = (video: { path: string; name: string } | null) => {
    setCurrentVideo(video);
  };

  return (
    <>
      <AppSidebar 
        ref={sidebarRef}
        variant="inset" 
        onVideoSelect={handleVideoSelect}
        onVideoListChange={() => {}} // Placeholder for now, will be handled by specific pages
        selectedVideoPath={currentVideo?.path}
      />
      <SidebarInset>
        <SiteHeader videoName={currentVideo?.name} />
        {children}
      </SidebarInset>
    </>
  );
}


