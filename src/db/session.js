/* CONEXIÓN A LA BASE DE DATOS DE SESSION */
import config from "../configs/config.js"; // Configuraciones de las variables de entorno
import { Sequelize } from 'sequelize';
import tedious from 'tedious';
import session from 'express-session'; // Importar express-session
import SequelizeStore from 'connect-session-sequelize'; // Importar connect-session-sequelize

// Configuración de Sequelize para conectar a SQL Server
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'mssql',
  dialectModule: tedious,
  logging: false,
});

// Verifica la conexión
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida a la base de datos de sesiones con éxito.');
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  }
};

// Crea una instancia de SequelizeStore usando la conexión a la base de datos 'sequelize'
const Store = SequelizeStore(session.Store);
const store = new Store({
  db: sequelize,
});

// Sincronizar la base de datos para crear las tablas de sesión si aún no existen
const syncStore = async () => {
  try {
    await store.sync();
    console.log('Base de datos de sesiones sincronizada.');
  } catch (err) {
    console.error('Error al sincronizar la base de datos de sesiones:', err);
    process.exit(1);
  }
};

export { sequelize, connectToDatabase, syncStore, store };
