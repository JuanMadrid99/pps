/* CONEXIÓN A LA BASE DE DATOS */
import config from "../configs/config.js"; // Configuraciones de las variables de entorno
import sql from 'mssql'; // SQL SERVER
import debug from 'debug';

const debugDb = debug('app:db');


// Configuración de la conexión a la base de datos 
const dbConfig = {
    server: config.host,
    database: config.database,
    user: config.user,
    password: config.password,
    options: {
        encrypt: true, // Si estás utilizando encriptación
        trustServerCertificate: true // Para desarrollo local
    }
};
async function dbConnection() {
    debugDb('Conectando a la base de datos...');
    await sql.connect(dbConfig); // Conectarse a la base de datos
}

export default dbConnection;