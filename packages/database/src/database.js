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
        // Verificar se as tabelas existem
        await exports.prisma.$queryRaw `SELECT name FROM sqlite_master WHERE type='table'`;
        console.log('✅ Database tables already exist');
    }
    catch (error) {
        console.log('🔄 Creating database tables...');
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
    return exports.prisma.videoProgress.upsert({
        where: { videoId },
        update: { currentTime, duration, watched, lastWatched: new Date() },
        create: { videoId, currentTime, duration, watched, lastWatched: new Date() },
    });
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
