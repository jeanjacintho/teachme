"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const file_type_1 = require("file-type");
const get_video_duration_1 = __importDefault(require("get-video-duration"));
const isDev = !electron_1.app.isPackaged;
function createWindow() {
    const win = new electron_1.BrowserWindow({
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
    }
    else {
        win.loadFile(path.join(__dirname, '../../renderer/out/index.html'));
    }
}
// Handler IPC para selecionar pasta
electron_1.ipcMain.handle('select-folder', async (event) => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});
// Handler IPC para listar conteúdo de pasta
electron_1.ipcMain.handle('list-folder-contents', async (event, folderPath) => {
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
            }
            else if (stats.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (videoExtensions.includes(ext) && stats.size > 102400) { // 100KB mínimo
                    try {
                        const type = await (0, file_type_1.fileTypeFromFile)(itemPath);
                        // Só adiciona se o file-type identificou e é video/*
                        if (type && type.mime && type.mime.startsWith('video/')) {
                            let duration;
                            try {
                                duration = await (0, get_video_duration_1.default)(itemPath);
                            }
                            catch (durationError) {
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
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
        }
        return folderItems;
    }
    catch (error) {
        return [];
    }
});
// Handler IPC para obter URL do vídeo
electron_1.ipcMain.handle('get-video-url', async (event, filePath) => {
    return `file://${filePath}`;
});
electron_1.app.whenReady().then(() => {
    createWindow();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
