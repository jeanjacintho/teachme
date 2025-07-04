"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import type { FolderItem } from "../../../../shared/types/video"
import { useFolder } from "../context/folder-context"
import "@/app/sidebar-scrollbar.css"
declare global {
  interface Window {
    api?: {
      selectFolder: () => Promise<string | null>;
      listFolderContents: (folderPath: string) => Promise<FolderItem[]>;
      getVideoUrl: (filePath: string) => Promise<string>;
    };
  }
}

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { GraduationCapIcon, FolderIcon, PlayIcon, ChevronLeftIcon, Settings as SettingsIcon } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogSettings } from "./dialog-settings"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onVideoSelect?: (video: { path: string; name: string } | null) => void;
}

export function AppSidebar({ onVideoSelect, ...props }: AppSidebarProps) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [currentItems, setCurrentItems] = useState<FolderItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);
  const { folderPath } = useFolder();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar automaticamente a pasta selecionada ao abrir a página de cursos
  useEffect(() => {
    if (folderPath && currentPath !== folderPath) {
      setCurrentPath(folderPath);
      setPathHistory([folderPath]);
      loadFolderContents(folderPath);
    }
  }, [folderPath]);

  // Função para navegar entre subpastas e vídeos
  const loadFolderContents = async (folderPath: string) => {
    try {
      if (window.api) {
        const items = await window.api.listFolderContents(folderPath);
        setCurrentItems(items);
      }
    } catch (error) {
      // erro ao carregar pasta
    }
  };

  const handleItemClick = async (item: FolderItem) => {
    if (item.type === 'folder') {
      const newPath = item.path;
      setCurrentPath(newPath);
      setPathHistory(prev => [...prev, newPath]);
      await loadFolderContents(newPath);
      setSelectedVideoPath(null); // Reset seleção ao entrar em pasta
    } else if (item.type === 'video') {
      setSelectedVideoPath(item.path);
      onVideoSelect?.({ path: item.path, name: item.name });
    }
  };

  const handleBackClick = async () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      const newPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      setCurrentPath(newPath);
      await loadFolderContents(newPath);
    }
  };

  const getCurrentFolderName = () => {
    if (!currentPath) return '';
    return currentPath.split('/').pop() || currentPath;
  };

  // Função para formatar duração em HH:MM:SS
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds || isNaN(seconds)) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#" className="">
                  <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"><GraduationCapIcon className="size-4"/></div>
                  <span className="text-base font-semibold">Teach Me.</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="custom-scrollbar overflow-y-auto h-full">
            <SidebarMenu>
              {/* Interface de navegação só aparece após seleção */}
              {currentPath && isClient && (
                <div className="px-3 py-2 space-y-2">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {pathHistory.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={handleBackClick}
                      >
                        <ChevronLeftIcon className="h-3 w-3" />
                      </Button>
                    )}
                    <span className="truncate">{getCurrentFolderName()}</span>
                  </div>
                  {/* Lista de itens */}
                  <div className="space-y-1">
                    {currentItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-between h-8 px-2 text-sm ${
                          item.type === 'video' && selectedVideoPath === item.path
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {item.type === 'folder' ? (
                            <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <PlayIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.type === 'video' && item.duration && (
                          <span className={`text-xs ml-2 flex-shrink-0 ${
                            selectedVideoPath === item.path
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}>
                            {formatDuration(item.duration)}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-2"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
              >
                <SettingsIcon className="h-5 w-5" />
                <span>Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <DialogSettings />
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
