"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
async function main() {
    console.log('🌱 Starting database seed...');
    try {
        await (0, database_1.connectDatabase)();
        // Criar configurações padrão do usuário
        const userSettings = await database_1.prisma.userSettings.upsert({
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
    }
    catch (error) {
        console.error('❌ Database seed failed:', error);
        throw error;
    }
    finally {
        await (0, database_1.disconnectDatabase)();
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await database_1.prisma.$disconnect();
});
