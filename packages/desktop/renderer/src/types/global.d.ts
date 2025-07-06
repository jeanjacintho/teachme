import type { FolderItem } from "../../../../shared/types/video";

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

export {}; 