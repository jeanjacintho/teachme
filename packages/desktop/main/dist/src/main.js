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
// Importação do database via require para evitar problemas de TypeScript
// const { getAllCourses, getVideosByCourse, saveVideoProgress, setFavorite, saveVideoRating, getVideoProgressByPath, getVideoByPath, connectDatabase, initializeDatabase, prisma } = require('../../../database/src/database');
// Temporariamente, vamos usar funções mock para testar
const mockDatabase = {
    getAllCourses: async () => [],
    getVideosByCourse: async (courseId) => [],
    saveVideoProgress: async (videoId, currentTime, duration, watched) => {
        console.log('Mock saveVideoProgress:', { videoId, currentTime, duration, watched });
        return { id: 'mock', videoId, currentTime, duration, watched };
    },
    setFavorite: async (videoId, isFavorite) => null,
    saveVideoRating: async (videoId, rating, comment) => null,
    getVideoProgressByPath: async (filePath) => {
        console.log('Mock getVideoProgressByPath:', filePath);
        return { id: 'mock', videoId: 'mock', currentTime: 0, duration: 0, watched: false };
    },
    getVideoByPath: async (filePath) => {
        console.log('Mock getVideoByPath:', filePath);
        return { id: 'mock-video-id', name: 'mock', path: filePath };
    },
    connectDatabase: async () => console.log('Mock connectDatabase'),
    initializeDatabase: async () => console.log('Mock initializeDatabase'),
    prisma: {
        course: {
            findFirst: async (params) => ({ id: 'mock-course-id', name: 'mock', path: 'mock' }),
            create: async (params) => ({ id: 'mock-course-id', name: 'mock', path: 'mock' })
        },
        video: {
            create: async (params) => ({ id: 'mock-video-id', name: 'mock', path: 'mock' })
        }
    }
};
const { getAllCourses, getVideosByCourse, saveVideoProgress, setFavorite, saveVideoRating, getVideoProgressByPath, getVideoByPath, connectDatabase, initializeDatabase, prisma } = mockDatabase;
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
                            // Buscar progresso para saber se foi assistido
                            let watched = false;
                            try {
                                // Garantir que o vídeo está cadastrado no banco
                                const video = await ensureVideoInDatabase(itemPath, item, duration);
                                if (video) {
                                    const progress = await getVideoProgressByPath(itemPath);
                                    watched = !!progress?.watched;
                                }
                            }
                            catch { }
                            folderItems.push({
                                name: item,
                                path: itemPath,
                                type: 'video',
                                duration,
                                watched
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
// Listar cursos
electron_1.ipcMain.handle('db:getAllCourses', async () => {
    return getAllCourses();
});
// Listar vídeos de um curso
electron_1.ipcMain.handle('db:getVideosByCourse', async (_event, courseId) => {
    return getVideosByCourse(courseId);
});
// Salvar progresso
electron_1.ipcMain.handle('db:saveVideoProgress', async (_event, filePath, currentTime, duration, watched) => {
    console.log('🔄 Saving video progress:', { filePath, currentTime, duration, watched });
    // Buscar o vídeo pelo path
    const video = await getVideoByPath(filePath);
    if (!video) {
        console.log('❌ Video not found in database:', filePath);
        return null;
    }
    console.log('✅ Video found:', video.id);
    const result = await saveVideoProgress(video.id, currentTime, duration, watched);
    console.log('✅ Progress saved:', result);
    return result;
});
// Favoritar
electron_1.ipcMain.handle('db:setFavorite', async (_event, videoId, isFavorite) => {
    return setFavorite(videoId, isFavorite);
});
// Avaliação
electron_1.ipcMain.handle('db:saveVideoRating', async (_event, videoId, rating, comment) => {
    return saveVideoRating(videoId, rating, comment);
});
// Get video progress by path
electron_1.ipcMain.handle('get-video-progress-by-path', async (_event, filePath) => {
    console.log('🔍 Getting video progress for:', filePath);
    const result = await getVideoProgressByPath(filePath);
    console.log('📊 Progress result:', result);
    return result;
});
// Inicializar banco de dados
async function initializeApp() {
    try {
        await connectDatabase();
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
}
// Função para cadastrar vídeo no banco se não existir
async function ensureVideoInDatabase(filePath, fileName, duration) {
    try {
        console.log('🔍 Checking if video exists in database:', filePath);
        let video = await getVideoByPath(filePath);
        if (!video) {
            console.log('📝 Video not found, creating new entry...');
            // Criar curso padrão se não existir
            let course = await prisma.course.findFirst({ where: { name: 'Vídeos Locais' } });
            if (!course) {
                console.log('📁 Creating default course...');
                course = await prisma.course.create({
                    data: {
                        name: 'Vídeos Locais',
                        path: path.dirname(filePath),
                        description: 'Vídeos importados localmente'
                    }
                });
                console.log('✅ Course created:', course.id);
            }
            else {
                console.log('📁 Using existing course:', course.id);
            }
            // Criar vídeo
            video = await prisma.video.create({
                data: {
                    name: fileName,
                    path: filePath,
                    courseId: course.id,
                    order: 0,
                    duration: duration || null
                }
            });
            console.log('✅ Video registered in database:', video.id);
        }
        else {
            console.log('✅ Video already exists in database:', video.id);
        }
        return video;
    }
    catch (error) {
        console.error('❌ Error ensuring video in database:', error);
        return null;
    }
}
electron_1.app.whenReady().then(async () => {
    await initializeApp();
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
