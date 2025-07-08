"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var file_type_1 = require("file-type");
var get_video_duration_1 = require("get-video-duration");
// Importação do database via require para evitar problemas de TypeScript
var _a = require('../../../database/dist/database'), getAllCourses = _a.getAllCourses, getVideosByCourse = _a.getVideosByCourse, saveVideoProgress = _a.saveVideoProgress, setFavorite = _a.setFavorite, saveVideoRating = _a.saveVideoRating, getVideoProgressByPath = _a.getVideoProgressByPath, getVideoByPath = _a.getVideoByPath, saveRootFolderPath = _a.saveRootFolderPath, getRootFolderPath = _a.getRootFolderPath, saveAutoPlaySetting = _a.saveAutoPlaySetting, getAutoPlaySetting = _a.getAutoPlaySetting, isFavorite = _a.isFavorite, getFavorites = _a.getFavorites, connectDatabase = _a.connectDatabase, initializeDatabase = _a.initializeDatabase, prisma = _a.prisma;
var isDev = !electron_1.app.isPackaged;
function createWindow() {
    var win = new electron_1.BrowserWindow({
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
electron_1.ipcMain.handle('select-folder', function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, electron_1.dialog.showOpenDialog({
                    properties: ['openDirectory']
                })];
            case 1:
                result = _a.sent();
                if (result.canceled || result.filePaths.length === 0) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, result.filePaths[0]];
        }
    });
}); });
// Handler IPC para listar conteúdo de pasta
electron_1.ipcMain.handle('list-folder-contents', function (event, folderPath) { return __awaiter(void 0, void 0, void 0, function () {
    var items, folderItems, videoExtensions, _i, items_1, item, itemPath, stats, ext, type, duration, durationError_1, watched, video, progress, _a, e_1, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 19, , 20]);
                items = fs.readdirSync(folderPath);
                folderItems = [];
                videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
                _i = 0, items_1 = items;
                _b.label = 1;
            case 1:
                if (!(_i < items_1.length)) return [3 /*break*/, 18];
                item = items_1[_i];
                if (item.startsWith('._')) {
                    return [3 /*break*/, 17];
                }
                itemPath = path.join(folderPath, item);
                stats = fs.statSync(itemPath);
                if (!stats.isDirectory()) return [3 /*break*/, 2];
                folderItems.push({
                    name: item,
                    path: itemPath,
                    type: 'folder'
                });
                return [3 /*break*/, 17];
            case 2:
                if (!stats.isFile()) return [3 /*break*/, 17];
                ext = path.extname(item).toLowerCase();
                if (!(videoExtensions.includes(ext) && stats.size > 102400)) return [3 /*break*/, 17];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 16, , 17]);
                return [4 /*yield*/, (0, file_type_1.fileTypeFromFile)(itemPath)];
            case 4:
                type = _b.sent();
                if (!(type && type.mime && type.mime.startsWith('video/'))) return [3 /*break*/, 15];
                duration = void 0;
                _b.label = 5;
            case 5:
                _b.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, get_video_duration_1.default)(itemPath)];
            case 6:
                duration = _b.sent();
                return [3 /*break*/, 8];
            case 7:
                durationError_1 = _b.sent();
                return [3 /*break*/, 8];
            case 8:
                watched = false;
                _b.label = 9;
            case 9:
                _b.trys.push([9, 13, , 14]);
                return [4 /*yield*/, ensureVideoInDatabase(itemPath, item, duration)];
            case 10:
                video = _b.sent();
                if (!video) return [3 /*break*/, 12];
                return [4 /*yield*/, getVideoProgressByPath(itemPath)];
            case 11:
                progress = _b.sent();
                watched = !!(progress === null || progress === void 0 ? void 0 : progress.watched);
                _b.label = 12;
            case 12: return [3 /*break*/, 14];
            case 13:
                _a = _b.sent();
                return [3 /*break*/, 14];
            case 14:
                folderItems.push({
                    name: item,
                    path: itemPath,
                    type: 'video',
                    duration: duration,
                    watched: watched
                });
                _b.label = 15;
            case 15: return [3 /*break*/, 17];
            case 16:
                e_1 = _b.sent();
                return [3 /*break*/, 17];
            case 17:
                _i++;
                return [3 /*break*/, 1];
            case 18: return [2 /*return*/, folderItems];
            case 19:
                error_1 = _b.sent();
                return [2 /*return*/, []];
            case 20: return [2 /*return*/];
        }
    });
}); });
// Handler IPC para obter URL do vídeo
electron_1.ipcMain.handle('get-video-url', function (event, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, "file://".concat(filePath)];
    });
}); });
// Listar cursos
electron_1.ipcMain.handle('db:getAllCourses', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAllCourses()];
    });
}); });
// Listar vídeos de um curso
electron_1.ipcMain.handle('db:getVideosByCourse', function (_event, courseId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getVideosByCourse(courseId)];
    });
}); });
// Salvar progresso
electron_1.ipcMain.handle('db:saveVideoProgress', function (_event, filePath, currentTime, duration, watched) { return __awaiter(void 0, void 0, void 0, function () {
    var video, result, progressRead;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔄 Saving video progress:', { filePath: filePath, currentTime: currentTime, duration: duration, watched: watched });
                return [4 /*yield*/, getVideoByPath(filePath)];
            case 1:
                video = _a.sent();
                if (!video) {
                    console.log('❌ Video not found in database:', filePath);
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, saveVideoProgress(video.id, currentTime, duration, watched)];
            case 2:
                result = _a.sent();
                console.log('✅ Progress saved:', result);
                return [4 /*yield*/, getVideoProgressByPath(filePath)];
            case 3:
                progressRead = _a.sent();
                console.log('🔁 Progress read after save:', progressRead);
                return [2 /*return*/, result];
        }
    });
}); });
// Favoritar
electron_1.ipcMain.handle('db:setFavorite', function (_event, filePath, isFavorite) { return __awaiter(void 0, void 0, void 0, function () {
    var video, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('❤️ IPC: Setting favorite:', { filePath: filePath, isFavorite: isFavorite });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, getVideoByPath(filePath)];
            case 2:
                video = _a.sent();
                if (!video) {
                    console.log('❌ Video not found in database:', filePath);
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, setFavorite(video.id, isFavorite)];
            case 3:
                result = _a.sent();
                console.log('❤️ IPC: Favorite set successfully:', result);
                return [2 /*return*/, result];
            case 4:
                error_2 = _a.sent();
                console.error('❌ IPC: Error setting favorite:', error_2);
                throw error_2;
            case 5: return [2 /*return*/];
        }
    });
}); });
// Avaliação
electron_1.ipcMain.handle('db:saveVideoRating', function (_event, videoId, rating, comment) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, saveVideoRating(videoId, rating, comment)];
    });
}); });
// Get video progress by path
electron_1.ipcMain.handle('get-video-progress-by-path', function (_event, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔍 Getting video progress for:', filePath);
                return [4 /*yield*/, getVideoProgressByPath(filePath)];
            case 1:
                result = _a.sent();
                console.log('📊 Progress result:', result);
                return [2 /*return*/, result];
        }
    });
}); });
// Salvar path da pasta raiz
electron_1.ipcMain.handle('save-root-folder-path', function (_event, folderPath) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('💾 Saving root folder path:', folderPath);
                return [4 /*yield*/, saveRootFolderPath(folderPath)];
            case 1:
                result = _a.sent();
                console.log('✅ Root folder path saved:', result);
                return [2 /*return*/, result];
        }
    });
}); });
// Carregar path da pasta raiz
electron_1.ipcMain.handle('get-root-folder-path', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('📂 Loading root folder path...');
                return [4 /*yield*/, getRootFolderPath()];
            case 1:
                result = _a.sent();
                console.log('📂 Root folder path loaded:', result);
                return [2 /*return*/, result];
        }
    });
}); });
// Salvar configuração de autoplay
electron_1.ipcMain.handle('save-auto-play-setting', function (_event, autoPlay) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🎬 IPC: Saving autoplay setting:', autoPlay);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, saveAutoPlaySetting(autoPlay)];
            case 2:
                result = _a.sent();
                console.log('✅ IPC: Autoplay setting saved successfully:', result);
                return [2 /*return*/, result];
            case 3:
                error_3 = _a.sent();
                console.error('❌ IPC: Error saving autoplay setting:', error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); });
// Carregar configuração de autoplay
electron_1.ipcMain.handle('get-auto-play-setting', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🎬 IPC: Loading autoplay setting...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getAutoPlaySetting()];
            case 2:
                result = _a.sent();
                console.log('🎬 IPC: Autoplay setting loaded successfully:', result);
                return [2 /*return*/, result];
            case 3:
                error_4 = _a.sent();
                console.error('❌ IPC: Error loading autoplay setting:', error_4);
                throw error_4;
            case 4: return [2 /*return*/];
        }
    });
}); });
// Verificar se um vídeo é favorito
electron_1.ipcMain.handle('is-favorite', function (_event, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('❤️ IPC: Checking if video is favorite:', filePath);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, isFavorite(filePath)];
            case 2:
                result = _a.sent();
                console.log('❤️ IPC: Favorite status:', result);
                return [2 /*return*/, result];
            case 3:
                error_5 = _a.sent();
                console.error('❌ IPC: Error checking favorite status:', error_5);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Listar todos os vídeos favoritos
electron_1.ipcMain.handle('get-favorites', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('❤️ IPC: Getting favorites list...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getFavorites()];
            case 2:
                result = _a.sent();
                console.log('❤️ IPC: Favorites list:', result);
                return [2 /*return*/, result];
            case 3:
                error_6 = _a.sent();
                console.error('❌ IPC: Error getting favorites list:', error_6);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Inicializar banco de dados
function initializeApp() {
    return __awaiter(this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, connectDatabase()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, initializeDatabase()];
                case 2:
                    _a.sent();
                    console.log('✅ Database initialized successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('❌ Database initialization failed:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Função para cadastrar vídeo no banco se não existir
function ensureVideoInDatabase(filePath, fileName, duration) {
    return __awaiter(this, void 0, void 0, function () {
        var video, course, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    console.log('🔍 Checking if video exists in database:', filePath);
                    return [4 /*yield*/, getVideoByPath(filePath)];
                case 1:
                    video = _a.sent();
                    if (!!video) return [3 /*break*/, 7];
                    console.log('📝 Video not found, creating new entry...');
                    return [4 /*yield*/, prisma.course.findFirst({ where: { name: 'Vídeos Locais' } })];
                case 2:
                    course = _a.sent();
                    if (!!course) return [3 /*break*/, 4];
                    console.log('📁 Creating default course...');
                    return [4 /*yield*/, prisma.course.create({
                            data: {
                                name: 'Vídeos Locais',
                                path: path.dirname(filePath),
                                description: 'Vídeos importados localmente'
                            }
                        })];
                case 3:
                    course = _a.sent();
                    console.log('✅ Course created:', course.id);
                    return [3 /*break*/, 5];
                case 4:
                    console.log('📁 Using existing course:', course.id);
                    _a.label = 5;
                case 5: return [4 /*yield*/, prisma.video.create({
                        data: {
                            name: fileName,
                            path: filePath,
                            courseId: course.id,
                            order: 0,
                            duration: duration || null
                        }
                    })];
                case 6:
                    // Criar vídeo
                    video = _a.sent();
                    console.log('✅ Video registered in database:', video.id);
                    return [3 /*break*/, 8];
                case 7:
                    console.log('✅ Video already exists in database:', video.id);
                    _a.label = 8;
                case 8: return [2 /*return*/, video];
                case 9:
                    error_8 = _a.sent();
                    console.error('❌ Error ensuring video in database:', error_8);
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🚀 App is ready, initializing...');
                return [4 /*yield*/, initializeApp()];
            case 1:
                _a.sent();
                console.log('✅ App initialization completed, creating window...');
                createWindow();
                console.log('✅ Window created, app is ready to use');
                // Aguardar um pouco para garantir que tudo está inicializado
                setTimeout(function () {
                    console.log('⏰ App fully initialized and ready for IPC calls');
                }, 1000);
                return [2 /*return*/];
        }
    });
}); });
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
