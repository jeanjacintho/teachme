"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset,SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header";
import { VideoPlayer } from "@/components/video-player";

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<{ path: string; name: string } | null>(null);

  const handleVideoSelect = (video: { path: string; name: string } | null) => {
    setCurrentVideo(video);
  };

  const handleCloseVideo = () => {
    setCurrentVideo(null);
  };

  return (
    <SidebarProvider style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)",
    } as React.CSSProperties}>
      <AppSidebar variant="inset" onVideoSelect={handleVideoSelect} />
      <SidebarInset>
        <SiteHeader videoName={currentVideo?.name} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {currentVideo ? (
              <div className="flex-1 flex flex-col gap-4">
                {/* Video Container */}
                <div className="flex-1 p-4 md:p-6 h-[calc(100vh-300px)]">
                  <VideoPlayer
                    videoPath={currentVideo.path}
                    videoName={currentVideo.name}
                    onClose={handleCloseVideo}
                  />
                </div>
                
                {/* Description Container */}
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Descrição do Vídeo</h3>
                    <p className="text-muted-foreground">
                      Espaço reservado para a descrição do vídeo. Aqui você poderá adicionar informações sobre o conteúdo, 
                      notas, links relacionados e outras informações úteis.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <h1>TeachMe - Seus Cursos</h1>
                <p>Selecione uma pasta no menu lateral para começar.</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
