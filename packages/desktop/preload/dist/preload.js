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
    // Outros métodos seguros podem ser expostos aqui
};
console.log('🔌 Preload: Available API functions:', Object.keys(api));
electron_1.contextBridge.exposeInMainWorld('api', api);
console.log('🔌 Preload: API exposed successfully');
