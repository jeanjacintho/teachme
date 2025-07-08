"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('🔌 Preload: Exposing API functions...');
const api = {
    selectFolder: async () => {
        return await electron_1.ipcRenderer.invoke('select-folder');
    },
    listFolderContents: async (folderPath) => {
        return await electron_1.ipcRenderer.invoke('list-folder-contents', folderPath);
    },
    getVideoUrl: async (filePath) => {
        return await electron_1.ipcRenderer.invoke('get-video-url', filePath);
    },
    saveVideoProgress: async (filePath, currentTime, duration, watched) => {
        return await electron_1.ipcRenderer.invoke('db:saveVideoProgress', filePath, currentTime, duration, watched);
    },
    setFavorite: async (filePath, isFavorite) => {
        console.log('🔌 Preload: setFavorite called with:', { filePath, isFavorite });
        try {
            const result = await electron_1.ipcRenderer.invoke('db:setFavorite', filePath, isFavorite);
            console.log('🔌 Preload: setFavorite result:', result);
            return result;
        }
        catch (error) {
            console.error('🔌 Preload: Error in setFavorite:', error);
            throw error;
        }
    },
    getVideoProgressByPath: async (filePath) => {
        return await electron_1.ipcRenderer.invoke('get-video-progress-by-path', filePath);
    },
    saveRootFolderPath: async (folderPath) => {
        return await electron_1.ipcRenderer.invoke('save-root-folder-path', folderPath);
    },
    getRootFolderPath: async () => {
        return await electron_1.ipcRenderer.invoke('get-root-folder-path');
    },
    saveAutoPlaySetting: async (autoPlay) => {
        console.log('🔌 Preload: saveAutoPlaySetting called with:', autoPlay);
        try {
            const result = await electron_1.ipcRenderer.invoke('save-auto-play-setting', autoPlay);
            console.log('🔌 Preload: saveAutoPlaySetting result:', result);
            return result;
        }
        catch (error) {
            console.error('🔌 Preload: Error in saveAutoPlaySetting:', error);
            throw error;
        }
    },
    getAutoPlaySetting: async () => {
        console.log('🔌 Preload: getAutoPlaySetting called');
        try {
            const result = await electron_1.ipcRenderer.invoke('get-auto-play-setting');
            console.log('🔌 Preload: getAutoPlaySetting result:', result);
            return result;
        }
        catch (error) {
            console.error('🔌 Preload: Error in getAutoPlaySetting:', error);
            throw error;
        }
    },
    isFavorite: async (filePath) => {
        console.log('🔌 Preload: isFavorite called with:', filePath);
        try {
            const result = await electron_1.ipcRenderer.invoke('is-favorite', filePath);
            console.log('🔌 Preload: isFavorite result:', result);
            return result;
        }
        catch (error) {
            console.error('🔌 Preload: Error in isFavorite:', error);
            return false;
        }
    },
    getFavorites: async () => {
        console.log('🔌 Preload: getFavorites called');
        try {
            const result = await electron_1.ipcRenderer.invoke('get-favorites');
            console.log('🔌 Preload: getFavorites result:', result);
            return result;
        }
        catch (error) {
            console.error('🔌 Preload: Error in getFavorites:', error);
            return [];
        }
    },
    // Outros métodos seguros podem ser expostos aqui
};
console.log('🔌 Preload: Available API functions:', Object.keys(api));
electron_1.contextBridge.exposeInMainWorld('api', api);
console.log('🔌 Preload: API exposed successfully');
