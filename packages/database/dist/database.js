"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
exports.initializeDatabase = initializeDatabase;
exports.clearDatabase = clearDatabase;
exports.getAllCourses = getAllCourses;
exports.getVideosByCourse = getVideosByCourse;
exports.saveVideoProgress = saveVideoProgress;
exports.setFavorite = setFavorite;
exports.saveVideoRating = saveVideoRating;
exports.getVideoProgressByPath = getVideoProgressByPath;
exports.getVideoByPath = getVideoByPath;
exports.saveRootFolderPath = saveRootFolderPath;
exports.getRootFolderPath = getRootFolderPath;
exports.saveAutoPlaySetting = saveAutoPlaySetting;
exports.getAutoPlaySetting = getAutoPlaySetting;
const client_1 = require("@prisma/client");
// Configuração do banco de dados
const databaseUrl = process.env.DATABASE_URL || 'file:./teachme.db';
// Criação do cliente Prisma
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});
// Função para conectar ao banco
async function connectDatabase() {
    try {
        await exports.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
// Função para desconectar do banco
async function disconnectDatabase() {
    try {
        await exports.prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    }
    catch (error) {
        console.error('❌ Database disconnection failed:', error);
    }
}
// Função para inicializar o banco (criar tabelas se não existirem)
async function initializeDatabase() {
    try {
        console.log('🗄️ Database: Initializing database...');
        // Verificar se as tabelas existem
        const tables = await exports.prisma.$queryRaw `SELECT name FROM sqlite_master WHERE type='table'`;
        console.log('🗄️ Database: Existing tables:', tables);
        // Verificar se a tabela user_settings existe
        const userSettingsExists = await exports.prisma.userSettings.findFirst();
        console.log('🗄️ Database: user_settings table exists, first record:', userSettingsExists);
        console.log('✅ Database tables already exist');
    }
    catch (error) {
        console.log('🔄 Creating database tables...');
        console.error('🗄️ Database: Error during initialization:', error);
        // O Prisma vai criar as tabelas automaticamente na primeira conexão
    }
}
// Função para limpar o banco (apenas para desenvolvimento)
async function clearDatabase() {
    try {
        await exports.prisma.videoRating.deleteMany();
        await exports.prisma.favorite.deleteMany();
        await exports.prisma.videoProgress.deleteMany();
        await exports.prisma.videoTag.deleteMany();
        await exports.prisma.courseTag.deleteMany();
        await exports.prisma.video.deleteMany();
        await exports.prisma.course.deleteMany();
        await exports.prisma.userSettings.deleteMany();
        console.log('✅ Database cleared successfully');
    }
    catch (error) {
        console.error('❌ Database clear failed:', error);
    }
}
// Listar todos os cursos
async function getAllCourses() {
    return exports.prisma.course.findMany({
        include: {
            videos: true,
            tags: true,
        },
        orderBy: { name: 'asc' },
    });
}
// Listar vídeos de um curso
async function getVideosByCourse(courseId) {
    return exports.prisma.video.findMany({
        where: { courseId },
        include: {
            progress: true,
            tags: true,
            favorites: true,
            ratings: true,
        },
        orderBy: { order: 'asc' },
    });
}
// Salvar ou atualizar progresso de vídeo
async function saveVideoProgress(videoId, currentTime, duration, watched) {
    console.log('🗄️ Database: saveVideoProgress called with:', { videoId, currentTime, duration, watched });
    try {
        if (watched) {
            // Se watched = true, salvar/atualizar o progresso
            console.log('🗄️ Database: Saving video as watched');
            const result = await exports.prisma.videoProgress.upsert({
                where: { videoId },
                update: { currentTime, duration, watched: true, lastWatched: new Date() },
                create: { videoId, currentTime, duration, watched: true, lastWatched: new Date() },
            });
            console.log('🗄️ Database: Video progress saved:', result);
            return result;
        }
        else {
            // Se watched = false, remover o progresso (marcar como não assistido)
            console.log('🗄️ Database: Removing video from watched list');
            const result = await exports.prisma.videoProgress.deleteMany({ where: { videoId } });
            console.log('🗄️ Database: Video progress removed:', result);
            return { deleted: true, count: result.count };
        }
    }
    catch (error) {
        console.error('🗄️ Database: Error in saveVideoProgress:', error);
        throw error;
    }
}
// Marcar vídeo como favorito
async function setFavorite(videoId, isFavorite) {
    if (isFavorite) {
        return exports.prisma.favorite.upsert({
            where: { videoId },
            update: {},
            create: { videoId },
        });
    }
    else {
        return exports.prisma.favorite.deleteMany({ where: { videoId } });
    }
}
// Salvar avaliação de vídeo
async function saveVideoRating(videoId, rating, comment) {
    return exports.prisma.videoRating.upsert({
        where: { videoId },
        update: { rating, comment, updatedAt: new Date() },
        create: { videoId, rating, comment },
    });
}
// Buscar progresso de vídeo pelo path do arquivo
async function getVideoProgressByPath(filePath) {
    // Buscar o vídeo pelo path
    const video = await exports.prisma.video.findUnique({ where: { path: filePath } });
    if (!video)
        return null;
    // Buscar progresso pelo id do vídeo
    const progress = await exports.prisma.videoProgress.findUnique({ where: { videoId: video.id } });
    return progress;
}
// Buscar vídeo pelo path
async function getVideoByPath(filePath) {
    return exports.prisma.video.findUnique({ where: { path: filePath } });
}
// Salvar path da pasta raiz
async function saveRootFolderPath(folderPath) {
    return exports.prisma.userSettings.upsert({
        where: { id: 'default' },
        update: { rootFolderPath: folderPath },
        create: {
            id: 'default',
            rootFolderPath: folderPath,
            theme: 'system',
            autoPlay: false,
            defaultVolume: 1.0
        },
    });
}
// Carregar path da pasta raiz
async function getRootFolderPath() {
    const settings = await exports.prisma.userSettings.findUnique({ where: { id: 'default' } });
    return settings?.rootFolderPath || null;
}
// Salvar configuração de autoplay
async function saveAutoPlaySetting(autoPlay) {
    console.log('🗄️ Database: saveAutoPlaySetting called with:', autoPlay);
    try {
        const result = await exports.prisma.userSettings.upsert({
            where: { id: 'default' },
            update: { autoPlay },
            create: {
                id: 'default',
                autoPlay,
                theme: 'system',
                defaultVolume: 1.0
            },
        });
        console.log('🗄️ Database: saveAutoPlaySetting result:', result);
        return result;
    }
    catch (error) {
        console.error('🗄️ Database: Error in saveAutoPlaySetting:', error);
        throw error;
    }
}
// Carregar configuração de autoplay
async function getAutoPlaySetting() {
    console.log('🗄️ Database: getAutoPlaySetting called');
    try {
        const settings = await exports.prisma.userSettings.findUnique({ where: { id: 'default' } });
        console.log('🗄️ Database: getAutoPlaySetting found settings:', settings);
        const result = settings?.autoPlay || false;
        console.log('🗄️ Database: getAutoPlaySetting returning:', result);
        return result;
    }
    catch (error) {
        console.error('🗄️ Database: Error in getAutoPlaySetting:', error);
        throw error;
    }
}
