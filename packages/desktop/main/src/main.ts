import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileTypeFromFile } from 'file-type';
import getVideoDuration from 'get-video-duration';
// Importação do database via require para evitar problemas de TypeScript
const { getAllCourses, getVideosByCourse, saveVideoProgress, setFavorite, saveVideoRating, getVideoProgressByPath, getVideoByPath, saveRootFolderPath, getRootFolderPath, saveAutoPlaySetting, getAutoPlaySetting, isFavorite, getFavorites, connectDatabase, initializeDatabase, prisma } = require('../../../database/dist/database');

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
              // Buscar progresso para saber se foi assistido
              let watched = false;
              try {
                // Garantir que o vídeo está cadastrado no banco
                const video = await ensureVideoInDatabase(itemPath, item, duration);
                if (video) {
                  const progress = await getVideoProgressByPath(itemPath);
                  watched = !!progress?.watched;
                }
              } catch {}
              folderItems.push({
                name: item,
                path: itemPath,
                type: 'video',
                duration,
                watched
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

// Listar cursos
ipcMain.handle('db:getAllCourses', async () => {
  return getAllCourses();
});

// Listar vídeos de um curso
ipcMain.handle('db:getVideosByCourse', async (_event, courseId: string) => {
  return getVideosByCourse(courseId);
});

// Salvar progresso
ipcMain.handle('db:saveVideoProgress', async (_event, filePath: string, currentTime: number, duration: number, watched: boolean) => {
  console.log('🔄 Saving video progress:', { filePath, currentTime, duration, watched });
  // Buscar o vídeo pelo path
  const video = await getVideoByPath(filePath);
  if (!video) {
    console.log('❌ Video not found in database:', filePath);
    return null;
  }
  const result = await saveVideoProgress(video.id, currentTime, duration, watched);
  console.log('✅ Progress saved:', result);
  // LOGAR O PROGRESSO LIDO IMEDIATAMENTE APÓS SALVAR
  const progressRead = await getVideoProgressByPath(filePath);
  console.log('🔁 Progress read after save:', progressRead);
  return result;
});

// Favoritar
ipcMain.handle('db:setFavorite', async (_event, filePath: string, isFavorite: boolean) => {
  console.log('❤️ IPC: Setting favorite:', { filePath, isFavorite });
  try {
    // Buscar o vídeo pelo path
    const video = await getVideoByPath(filePath);
    if (!video) {
      console.log('❌ Video not found in database:', filePath);
      return null;
    }
    const result = await setFavorite(video.id, isFavorite);
    console.log('❤️ IPC: Favorite set successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ IPC: Error setting favorite:', error);
    throw error;
  }
});

// Avaliação
ipcMain.handle('db:saveVideoRating', async (_event, videoId: string, rating: number, comment?: string) => {
  return saveVideoRating(videoId, rating, comment);
});

// Get video progress by path
ipcMain.handle('get-video-progress-by-path', async (_event, filePath: string) => {
  console.log('🔍 Getting video progress for:', filePath);
  const result = await getVideoProgressByPath(filePath);
  console.log('📊 Progress result:', result);
  return result;
});

// Salvar path da pasta raiz
ipcMain.handle('save-root-folder-path', async (_event, folderPath: string) => {
  console.log('💾 Saving root folder path:', folderPath);
  const result = await saveRootFolderPath(folderPath);
  console.log('✅ Root folder path saved:', result);
  return result;
});

// Carregar path da pasta raiz
ipcMain.handle('get-root-folder-path', async () => {
  console.log('📂 Loading root folder path...');
  const result = await getRootFolderPath();
  console.log('📂 Root folder path loaded:', result);
  return result;
});

// Salvar configuração de autoplay
ipcMain.handle('save-auto-play-setting', async (_event, autoPlay: boolean) => {
  console.log('🎬 IPC: Saving autoplay setting:', autoPlay);
  try {
    const result = await saveAutoPlaySetting(autoPlay);
    console.log('✅ IPC: Autoplay setting saved successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ IPC: Error saving autoplay setting:', error);
    throw error;
  }
});

// Carregar configuração de autoplay
ipcMain.handle('get-auto-play-setting', async () => {
  console.log('🎬 IPC: Loading autoplay setting...');
  try {
    const result = await getAutoPlaySetting();
    console.log('🎬 IPC: Autoplay setting loaded successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ IPC: Error loading autoplay setting:', error);
    throw error;
  }
});

// Verificar se um vídeo é favorito
ipcMain.handle('is-favorite', async (_event, filePath: string) => {
  console.log('❤️ IPC: Checking if video is favorite:', filePath);
  try {
    const result = await isFavorite(filePath);
    console.log('❤️ IPC: Favorite status:', result);
    return result;
  } catch (error) {
    console.error('❌ IPC: Error checking favorite status:', error);
    return false;
  }
});

// Listar todos os vídeos favoritos
ipcMain.handle('get-favorites', async () => {
  console.log('❤️ IPC: Getting favorites list...');
  try {
    const result = await getFavorites();
    console.log('❤️ IPC: Favorites list:', result);
    return result;
  } catch (error) {
    console.error('❌ IPC: Error getting favorites list:', error);
    return [];
  }
});

// Inicializar banco de dados
async function initializeApp() {
  try {
    await connectDatabase();
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Função para cadastrar vídeo no banco se não existir
async function ensureVideoInDatabase(filePath: string, fileName: string, duration?: number) {
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
      } else {
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
    } else {
      console.log('✅ Video already exists in database:', video.id);
    }
    return video;
  } catch (error) {
    console.error('❌ Error ensuring video in database:', error);
    return null;
  }
}

app.whenReady().then(async () => {
  console.log('🚀 App is ready, initializing...');
  await initializeApp();
  console.log('✅ App initialization completed, creating window...');
  createWindow();
  console.log('✅ Window created, app is ready to use');
  
  // Aguardar um pouco para garantir que tudo está inicializado
  setTimeout(() => {
    console.log('⏰ App fully initialized and ready for IPC calls');
  }, 1000);
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