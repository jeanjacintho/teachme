import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectFolder: async () => {
    return await ipcRenderer.invoke('select-folder');
  },
  listFolderContents: async (folderPath: string) => {
    return await ipcRenderer.invoke('list-folder-contents', folderPath);
  },
  getVideoUrl: async (filePath: string) => {
    return await ipcRenderer.invoke('get-video-url', filePath);
  },
  // Outros métodos seguros podem ser expostos aqui
}); 