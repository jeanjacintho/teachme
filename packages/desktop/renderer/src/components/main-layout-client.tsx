"use client";

import { useState, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<{ path: string; name: string } | null>(null);
  const sidebarRef = useRef<{ reloadCurrentFolder: () => void }>(null);

  const handleVideoSelect = (video: { path: string; name: string } | null) => {
    setCurrentVideo(video);
  };

  return (
    <SidebarProvider style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)",
    } as React.CSSProperties}>
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
    </SidebarProvider>
  );
}


