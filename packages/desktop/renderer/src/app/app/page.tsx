"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { VideoPlayerWrapper } from "@/components/video-player-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bookmark, CheckCheck, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolder } from "../../context/folder-context";
import type { FolderItem } from "../../../../../shared/types/video";

// Componente para o card do vídeo
function VideoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para o card de descrição
function DescriptionCard({ videoName, videoPath, onVideoEnded }: { 
  videoName?: string; 
  videoPath?: string;
  onVideoEnded?: () => void;
}) {
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar estado inicial do vídeo
  useEffect(() => {
    const loadVideoStatus = async () => {
      if (!videoPath || !window.api) return;
      
      try {
        // @ts-ignore - getVideoProgressByPath exists in preload
        const progress = await window.api.getVideoProgressByPath(videoPath);
        setIsWatched(!!progress?.watched);
      } catch (error) {
        console.error('❌ Error loading video status:', error);
      }
    };

    loadVideoStatus();
  }, [videoPath]);

  // Função para alternar estado de assistido
  const toggleWatchedStatus = async () => {
    if (!videoPath || !window.api?.saveVideoProgress) return;
    
    setIsLoading(true);
    try {
      const newWatchedStatus = !isWatched;
      console.log('🎬 Toggling video watched status:', { videoPath, currentStatus: isWatched, newStatus: newWatchedStatus });
      
      // Se está marcando como assistido, usar duração atual (ou 0 se não tiver)
      // Se está desmarcando, usar 0
      const currentTime = newWatchedStatus ? 0 : 0;
      const duration = newWatchedStatus ? 0 : 0;
      
      await window.api.saveVideoProgress(videoPath, currentTime, duration, newWatchedStatus);
      setIsWatched(newWatchedStatus);
      console.log('✅ Video watched status toggled successfully');
      
      // Chamar callback para recarregar sidebar
      onVideoEnded?.();
    } catch (error) {
      console.error('❌ Error toggling video watched status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6 px-6">
          {/* Esquerda: Título e descrição */}
          <CardHeader className="flex-1 min-w-0 p-0">
            <CardTitle>{videoName || "Descrição do Vídeo"}</CardTitle>
            <CardDescription>
              Espaço reservado para a descrição do vídeo. Aqui você poderá adicionar informações sobre o conteúdo, notas, links relacionados e outras informações úteis.
            </CardDescription>
          </CardHeader>
          {/* Direita: Ações */}
          <div className="flex flex-col gap-4 items-end w-full md:w-auto md:min-w-[250px]">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button 
                className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full md:w-auto"
                onClick={toggleWatchedStatus}
                disabled={isLoading}
                variant={isWatched ? "default" : "outline"}
              >
                {isWatched ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Marcar como assistida
                  </>
                ) : (
                  <>
                   <CheckCheck className="w-4 h-4" />
                    Marcar como assistida
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 border"
                aria-label="Favoritar"
              >
                <Bookmark className="w-5 h-5 text-primary" />
              </Button>
            </div>
            <div className="border rounded-lg px-4 py-3 w-full flex flex-col items-center justify-center">
              <span className="text-sm mb-2">O que você achou desta aula?</span>
              <div className="flex gap-1 justify-center w-full">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-7 h-7 text-muted-foreground" strokeWidth={2} fill="none" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Componente para o conteúdo principal da página
function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

// Componente para o layout do vídeo
function VideoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:p-6">
      {children}
    </div>
  );
}

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<{ path: string; name: string } | null>(null);
  const [videoList, setVideoList] = useState<FolderItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const { folderPath } = useFolder();
  const router = useRouter();
  const sidebarRef = useRef<{ reloadCurrentFolder: () => void }>(null);

  useEffect(() => {
    if (!folderPath) {
      router.replace("/");
    }
  }, [folderPath, router]);

  const handleVideoSelect = (video: { path: string; name: string } | null) => {
    setCurrentVideo(video);
  };

  const handleVideoListChange = (newVideoList: FolderItem[], newIndex: number) => {
    setVideoList(newVideoList);
    setCurrentVideoIndex(newIndex);
  };

  const handleVideoChange = (video: { path: string; name: string }, index: number) => {
    setCurrentVideo(video);
    setCurrentVideoIndex(index);
  };

  const handleCloseVideo = () => {
    setCurrentVideo(null);
  };

  const handleVideoEnded = () => {
    // Recarregar a pasta atual para atualizar os ícones
    setTimeout(() => {
      sidebarRef.current?.reloadCurrentFolder();
    }, 1000); // Aguardar 1 segundo para garantir que o banco foi atualizado
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
        onVideoListChange={handleVideoListChange}
        selectedVideoPath={currentVideo?.path}
      />
      <SidebarInset>
        <SiteHeader videoName={currentVideo?.name} />
        <MainContent>
          {currentVideo ? (
            <VideoLayout>
              <VideoCard>
                <VideoPlayerWrapper
                  videoPath={currentVideo.path}
                  videoName={currentVideo.name}
                  onClose={handleCloseVideo}
                  videoList={videoList}
                  currentVideoIndex={currentVideoIndex}
                  onVideoChange={handleVideoChange}
                  onVideoEnded={handleVideoEnded}
                />
              </VideoCard>
              <DescriptionCard 
                videoName={currentVideo.name} 
                videoPath={currentVideo.path}
                onVideoEnded={handleVideoEnded}
              />
            </VideoLayout>
          ) : (
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              <h1>TeachMe - Seus Cursos</h1>
              <p>Selecione uma pasta no menu lateral para começar.</p>
            </div>
          )}
        </MainContent>
      </SidebarInset>
    </SidebarProvider>
  );
} 