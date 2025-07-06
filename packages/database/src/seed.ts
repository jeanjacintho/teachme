import { prisma, connectDatabase, disconnectDatabase } from './database';

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    await connectDatabase();
    
    // Criar configurações padrão do usuário
    const userSettings = await prisma.userSettings.upsert({
      where: { id: 'default-settings' },
      update: {},
      create: {
        id: 'default-settings',
        autoPlay: false,
        defaultVolume: 1.0,
        playbackSpeed: 1.0,
        theme: 'system',
        language: 'pt-BR',
      },
    });
    
    console.log('✅ User settings created:', userSettings);
    
    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Database seed failed:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 