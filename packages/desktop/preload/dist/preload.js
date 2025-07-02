"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    selectFolder: async () => {
        return await electron_1.ipcRenderer.invoke('select-folder');
    },
    listFolderContents: async (folderPath) => {
        return await electron_1.ipcRenderer.invoke('list-folder-contents', folderPath);
    },
    getVideoUrl: async (filePath) => {
        return await electron_1.ipcRenderer.invoke('get-video-url', filePath);
    },
    // Outros métodos seguros podem ser expostos aqui
});
