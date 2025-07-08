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
  setFavorite: async (filePath: string, isFavorite: boolean) => {
    console.log('🔌 Preload: setFavorite called with:', { filePath, isFavorite });
    try {
      const result = await ipcRenderer.invoke('db:setFavorite', filePath, isFavorite);
      console.log('🔌 Preload: setFavorite result:', result);
      return result;
    } catch (error) {
      console.error('🔌 Preload: Error in setFavorite:', error);
      throw error;
    }
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
  isFavorite: async (filePath: string) => {
    console.log('🔌 Preload: isFavorite called with:', filePath);
    try {
      const result = await ipcRenderer.invoke('is-favorite', filePath);
      console.log('🔌 Preload: isFavorite result:', result);
      return result;
    } catch (error) {
      console.error('🔌 Preload: Error in isFavorite:', error);
      return false;
    }
  },
  getFavorites: async () => {
    console.log('🔌 Preload: getFavorites called');
    try {
      const result = await ipcRenderer.invoke('get-favorites');
      console.log('🔌 Preload: getFavorites result:', result);
      return result;
    } catch (error) {
      console.error('🔌 Preload: Error in getFavorites:', error);
      return [];
    }
  },
  // Outros métodos seguros podem ser expostos aqui
};

console.log('🔌 Preload: Available API functions:', Object.keys(api));

contextBridge.exposeInMainWorld('api', api);

console.log('🔌 Preload: API exposed successfully'); 