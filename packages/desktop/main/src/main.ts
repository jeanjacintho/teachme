import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileTypeFromFile } from 'file-type';
import getVideoDuration from 'get-video-duration';

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: __dirname + 'packages/desktop/main/favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, '../../preload/dist/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../../renderer/out/index.html'));
  }
}

// Handler IPC para selecionar pasta
ipcMain.handle('select-folder', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Handler IPC para listar conteúdo de pasta
ipcMain.handle('list-folder-contents', async (event, folderPath: string) => {
  try {
    const items = fs.readdirSync(folderPath);
    const folderItems = [];
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    
    for (const item of items) {
      if (item.startsWith('._')) {
        continue;
      }
      const itemPath = path.join(folderPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        folderItems.push({
          name: item,
          path: itemPath,
          type: 'folder'
        });
      } else if (stats.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (videoExtensions.includes(ext) && stats.size > 102400) { // 100KB mínimo
          try {
            const type = await fileTypeFromFile(itemPath);
            // Só adiciona se o file-type identificou e é video/*
            if (type && type.mime && type.mime.startsWith('video/')) {
              let duration: number | undefined;
              try {
                duration = await getVideoDuration(itemPath);
              } catch (durationError) {
                // Se não conseguir obter a duração, continua sem ela
              }
              
              folderItems.push({
                name: item,
                path: itemPath,
                type: 'video',
                duration
              });
            }
            // Se não identificou, NÃO adiciona!
          } catch (e) {
            continue;
          }
        }
      }
    }
    return folderItems;
  } catch (error) {
    return [];
  }
});

// Handler IPC para obter URL do vídeo
ipcMain.handle('get-video-url', async (event, filePath: string) => {
  return `file://${filePath}`;
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 