import { contextBridge, ipcRenderer } from 'electron';

console.log('🔌 Preload: Exposing API functions...');

const api = {
  selectFolder: async () => {
    return await ipcRenderer.invoke('select-folder');
  },
  listFolderContents: async (folderPath: string) => {
    return await ipcRenderer.invoke('list-folder-contents', folderPath);
  },
  getVideoUrl: async (filePath: string) => {
    return await ipcRenderer.invoke('get-video-url', filePath);
  },
  saveVideoProgress: async (filePath: string, currentTime: number, duration: number, watched: boolean) => {
    return await ipcRenderer.invoke('db:saveVideoProgress', filePath, currentTime, duration, watched);
  },
  getVideoProgressByPath: async (filePath: string) => {
    return await ipcRenderer.invoke('get-video-progress-by-path', filePath);
  },
  saveRootFolderPath: async (folderPath: string) => {
    return await ipcRenderer.invoke('save-root-folder-path', folderPath);
  },
  getRootFolderPath: async () => {
    return await ipcRenderer.invoke('get-root-folder-path');
  },
  saveAutoPlaySetting: async (autoPlay: boolean) => {
    console.log('🔌 Preload: saveAutoPlaySetting called with:', autoPlay);
    try {
      const result = await ipcRenderer.invoke('save-auto-play-setting', autoPlay);
      console.log('🔌 Preload: saveAutoPlaySetting result:', result);
      return result;
    } catch (error) {
      console.error('🔌 Preload: Error in saveAutoPlaySetting:', error);
      throw error;
    }
  },
  getAutoPlaySetting: async () => {
    console.log('🔌 Preload: getAutoPlaySetting called');
    try {
      const result = await ipcRenderer.invoke('get-auto-play-setting');
      console.log('🔌 Preload: getAutoPlaySetting result:', result);
      return result;
    } catch (error) {
      console.error('🔌 Preload: Error in getAutoPlaySetting:', error);
      throw error;
    }
  },
  // Outros métodos seguros podem ser expostos aqui
};

console.log('🔌 Preload: Available API functions:', Object.keys(api));

contextBridge.exposeInMainWorld('api', api);

console.log('🔌 Preload: API exposed successfully'); 