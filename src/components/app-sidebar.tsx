"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import type { VideoFile, FolderItem } from "../../../../shared/types/video"

// Declaração de tipo para window.api
declare global {
  interface Window {
    api?: {
      selectFolder: () => Promise<string | null>;
      listFolderContents: (folderPath: string) => Promise<FolderItem[]>;
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
import { GraduationCapIcon, FolderOpenIcon, FolderIcon, PlayIcon, ChevronLeftIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [currentItems, setCurrentItems] = useState<FolderItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectFolder = async () => {
    try {
      if (typeof window !== 'undefined' && window.api) {
        const selectedFolder = await window.api.selectFolder();
        if (selectedFolder) {
          setCurrentPath(selectedFolder);
          setPathHistory([selectedFolder]);
          await loadFolderContents(selectedFolder);
        }
      } else {
        console.log('Não estamos no Electron. Esta funcionalidade só funciona no app desktop.');
        alert('Esta funcionalidade só funciona no app desktop. Execute o Electron para testar.');
      }
    } catch (error) {
      console.error('Erro ao selecionar pasta:', error);
      alert('Erro ao selecionar pasta. Verifique o console para mais detalhes.');
    }
  };

  const loadFolderContents = async (folderPath: string) => {
    try {
      if (window.api) {
        const items = await window.api.listFolderContents(folderPath);
        setCurrentItems(items);
      }
    } catch (error) {
      console.error('Erro ao carregar pasta:', error);
    }
  };

  const handleItemClick = async (item: FolderItem) => {
    if (item.type === 'folder') {
      const newPath = item.path;
      setCurrentPath(newPath);
      setPathHistory(prev => [...prev, newPath]);
      await loadFolderContents(newPath);
    } else if (item.type === 'video') {
      // TODO: Implementar player de vídeo
      console.log('Reproduzir vídeo:', item.path);
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

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <GraduationCapIcon/>
                <span className="text-base font-semibold">Teach Me.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              className="w-full justify-start text-seconday"
              onClick={handleSelectFolder}
            >
              <FolderOpenIcon />
              <span>Selecionar Pasta</span>
            </Button>
          </SidebarMenuItem>
          
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
                    className="w-full justify-start h-8 px-2 text-sm"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.type === 'folder' ? (
                      <FolderIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <PlayIcon className="h-4 w-4 mr-2" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
       
      </SidebarFooter>
    </Sidebar>
  )
}
