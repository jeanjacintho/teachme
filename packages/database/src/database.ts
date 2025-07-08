import { PrismaClient } from '@prisma/client';

// Configuração do banco de dados
const databaseUrl = process.env.DATABASE_URL || 'file:./teachme.db';

// Criação do cliente Prisma
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Função para conectar ao banco
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Função para desconectar do banco
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Função para inicializar o banco (criar tabelas se não existirem)
export async function initializeDatabase() {
  try {
    console.log('🗄️ Database: Initializing database...');
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('🗄️ Database: Existing tables:', tables);
    
    // Verificar se a tabela user_settings existe
    const userSettingsExists = await prisma.userSettings.findFirst();
    console.log('🗄️ Database: user_settings table exists, first record:', userSettingsExists);
    
    console.log('✅ Database tables already exist');
  } catch (error) {
    console.log('🔄 Creating database tables...');
    console.error('🗄️ Database: Error during initialization:', error);
    // O Prisma vai criar as tabelas automaticamente na primeira conexão
  }
}

// Função para limpar o banco (apenas para desenvolvimento)
export async function clearDatabase() {
  try {
    await prisma.videoRating.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.videoProgress.deleteMany();
    await prisma.videoTag.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.video.deleteMany();
    await prisma.course.deleteMany();
    await prisma.userSettings.deleteMany();
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Database clear failed:', error);
  }
}

// Listar todos os cursos
export async function getAllCourses() {
  return prisma.course.findMany({
    include: {
      videos: true,
      tags: true,
    },
    orderBy: { name: 'asc' },
  });
}

// Listar vídeos de um curso
export async function getVideosByCourse(courseId: string) {
  return prisma.video.findMany({
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
export async function saveVideoProgress(videoId: string, currentTime: number, duration: number, watched: boolean) {
  console.log('🗄️ Database: saveVideoProgress called with:', { videoId, currentTime, duration, watched });
  
  try {
    if (watched) {
      // Se watched = true, salvar/atualizar o progresso
      console.log('🗄️ Database: Saving video as watched');
      const result = await prisma.videoProgress.upsert({
        where: { videoId },
        update: { currentTime, duration, watched: true, lastWatched: new Date() },
        create: { videoId, currentTime, duration, watched: true, lastWatched: new Date() },
      });
      console.log('🗄️ Database: Video progress saved:', result);
      return result;
    } else {
      // Se watched = false, remover o progresso (marcar como não assistido)
      console.log('🗄️ Database: Removing video from watched list');
      const result = await prisma.videoProgress.deleteMany({ where: { videoId } });
      console.log('🗄️ Database: Video progress removed:', result);
      return { deleted: true, count: result.count };
    }
  } catch (error) {
    console.error('🗄️ Database: Error in saveVideoProgress:', error);
    throw error;
  }
}

// Marcar vídeo como favorito
export async function setFavorite(videoId: string, isFavorite: boolean) {
  if (isFavorite) {
    return prisma.favorite.upsert({
      where: { videoId },
      update: {},
      create: { videoId },
    });
  } else {
    return prisma.favorite.deleteMany({ where: { videoId } });
  }
}

// Salvar avaliação de vídeo
export async function saveVideoRating(videoId: string, rating: number, comment?: string) {
  return prisma.videoRating.upsert({
    where: { videoId },
    update: { rating, comment, updatedAt: new Date() },
    create: { videoId, rating, comment },
  });
}

// Buscar progresso de vídeo pelo path do arquivo
export async function getVideoProgressByPath(filePath: string) {
  // Buscar o vídeo pelo path
  const video = await prisma.video.findUnique({ where: { path: filePath } });
  if (!video) return null;
  // Buscar progresso pelo id do vídeo
  const progress = await prisma.videoProgress.findUnique({ where: { videoId: video.id } });
  return progress;
}

// Buscar vídeo pelo path
export async function getVideoByPath(filePath: string) {
  return prisma.video.findUnique({ where: { path: filePath } });
}

// Salvar path da pasta raiz
export async function saveRootFolderPath(folderPath: string) {
  return prisma.userSettings.upsert({
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
export async function getRootFolderPath() {
  const settings = await prisma.userSettings.findUnique({ where: { id: 'default' } });
  return settings?.rootFolderPath || null;
}

// Salvar configuração de autoplay
export async function saveAutoPlaySetting(autoPlay: boolean) {
  console.log('🗄️ Database: saveAutoPlaySetting called with:', autoPlay);
  try {
    const result = await prisma.userSettings.upsert({
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
  } catch (error) {
    console.error('🗄️ Database: Error in saveAutoPlaySetting:', error);
    throw error;
  }
}

// Carregar configuração de autoplay
export async function getAutoPlaySetting() {
  console.log('🗄️ Database: getAutoPlaySetting called');
  try {
    const settings = await prisma.userSettings.findUnique({ where: { id: 'default' } });
    console.log('🗄️ Database: getAutoPlaySetting found settings:', settings);
    const result = settings?.autoPlay || false;
    console.log('🗄️ Database: getAutoPlaySetting returning:', result);
    return result;
  } catch (error) {
    console.error('🗄️ Database: Error in getAutoPlaySetting:', error);
    throw error;
  }
}

// Verificar se um vídeo é favorito pelo path do arquivo
export async function isFavorite(filePath: string) {
  try {
    // Buscar o vídeo pelo path
    const video = await prisma.video.findUnique({ where: { path: filePath } });
    if (!video) return false;
    
    // Verificar se existe um favorito para este vídeo
    const favorite = await prisma.favorite.findUnique({ where: { videoId: video.id } });
    return !!favorite;
  } catch (error) {
    console.error('🗄️ Database: Error in isFavorite:', error);
    return false;
  }
}

// Listar todos os vídeos favoritos
export async function getFavorites() {
  try {
    const favorites = await prisma.favorite.findMany({
      include: {
        video: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return favorites.map(fav => ({
      filePath: fav.video.path,
      name: fav.video.name,
    }));
  } catch (error) {
    console.error('🗄️ Database: Error in getFavorites:', error);
    return [];
  }
} 