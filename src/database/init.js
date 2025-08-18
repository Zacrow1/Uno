import { sequelize } from './database.js';

const initDatabase = async () => {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Sincronizar todos los modelos (crear tablas si no existen)
    await sequelize.sync({ force: false });
    
    console.log('✅ Base de datos sincronizada exitosamente');
    console.log('📋 Tablas creadas:');
    console.log('   - Players');
    console.log('   - Games');
    console.log('   - Cards');
    console.log('   - Scores');
    console.log('   - GamePlayers (tabla de relación)');
    console.log('   - PlayerCards (cartas en mano)');
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

// Ejecutar si este archivo se ejecuta directamente
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initDatabase()
    .then(() => {
      console.log('🎉 Inicialización completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la inicialización:', error);
      process.exit(1);
    });
}

export default initDatabase; 