"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"
import type { FolderItem } from "../../../../shared/types/video"
import { useFolder } from "../context/folder-context"
import "@/app/sidebar-scrollbar.css"
declare global {
  interface Window {
    api?: {
      selectFolder: () => Promise<string | null>;
      listFolderContents: (folderPath: string) => Promise<FolderItem[]>;
      getVideoUrl: (filePath: string) => Promise<string>;
      saveVideoProgress: (filePath: string, currentTime: number, duration: number, watched: boolean) => Promise<void>;
      getVideoProgressByPath: (filePath: string) => Promise<{ currentTime: number; duration: number; watched: boolean } | null>;
      saveRootFolderPath: (folderPath: string) => Promise<void>;
      getRootFolderPath: () => Promise<string | null>;
      saveAutoPlaySetting: (autoPlay: boolean) => Promise<void>;
      getAutoPlaySetting: () => Promise<boolean>;
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
import { GraduationCapIcon, FolderIcon, PlayIcon, CheckIcon, ChevronLeftIcon, Settings as SettingsIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogSettings } from "./dialog-settings"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onVideoSelect?: (video: { path: string; name: string } | null) => void;
  onVideoListChange?: (videoList: FolderItem[], currentIndex: number) => void;
  selectedVideoPath?: string;
}

export const AppSidebar = forwardRef<{ reloadCurrentFolder: () => void }, AppSidebarProps>(
  ({ onVideoSelect, onVideoListChange, selectedVideoPath, ...props }, ref) => {
    const { folderPath } = useFolder();
    const [currentPath, setCurrentPath] = useState<string | null>(folderPath);
    const [pathHistory, setPathHistory] = useState<string[]>(folderPath ? [folderPath] : []);
    const [currentItems, setCurrentItems] = useState<FolderItem[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const loadFolderContents = useCallback(async (folder: string) => {
      try {
        if (window.api) {
          const items = await window.api.listFolderContents(folder);
          console.log("📁 Folder contents loaded:", items);
          setCurrentItems(items);
          const videoItems = items.filter(item => item.type === "video");
          console.log("🎬 Video items:", videoItems);
          onVideoListChange?.(videoItems, 0);
        }
      } catch (error) {
        console.error("❌ Error loading folder contents:", error);
      }
    }, [onVideoListChange]);

    useImperativeHandle(ref, () => ({
      reloadCurrentFolder: () => {
        if (currentPath) {
          loadFolderContents(currentPath);
        }
      }
    }), [currentPath, loadFolderContents]);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (folderPath) {
        setCurrentPath(folderPath);
        setPathHistory([folderPath]);
      }
    }, [folderPath]);

    useEffect(() => {
      if (currentPath) {
        loadFolderContents(currentPath);
      }
    }, [currentPath, loadFolderContents]);

    const handleItemClick = (item: FolderItem) => {
      if (item.type === "folder") {
        setCurrentPath(item.path);
        setPathHistory(prev => [...prev, item.path]);
      } else if (item.type === "video") {
        const videoItems = currentItems.filter(i => i.type === "video");
        const currentIndex = videoItems.findIndex(video => video.path === item.path);
        onVideoSelect?.({ path: item.path, name: item.name });
        onVideoListChange?.(videoItems, currentIndex);
      }
    };

    const handleBackClick = () => {
      if (pathHistory.length > 1) {
        const newHistory = pathHistory.slice(0, -1);
        setPathHistory(newHistory);
        setCurrentPath(newHistory[newHistory.length - 1]);
      }
    };

    const getCurrentFolderName = () => {
      if (!currentPath) return "";
      return currentPath.split("/").pop() || currentPath;
    };

    const formatDuration = (seconds: number | undefined) => {
      if (!seconds || isNaN(seconds)) return "";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
                {currentPath && isClient && (
                  <div className="px-3 py-2 space-y-2">
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
                    <div className="space-y-1">
                      {currentItems.map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-between h-8 px-2 text-sm ${
                            item.type === "video" && selectedVideoPath === item.path
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {item.type === "folder" ? (
                              <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            ) : item.watched ? (
                              <CheckIcon className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                            ) : (
                              <PlayIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            )}
                            <span className="truncate">{item.name}</span>
                            
                          </div>
                          {item.type === "video" && item.duration && (
                            <span className={`text-xs ml-2 flex-shrink-0 ${
                              selectedVideoPath === item.path
                                ? "text-primary"
                                : "text-muted-foreground"
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
)

AppSidebar.displayName = "AppSidebar";


