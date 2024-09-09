/* INICIAR SERVIDOR */
import { connectToDatabase, syncStore } from './db/session.js';
import app from "./app.js";
const port = 5000; // Puerto del host
import debug from 'debug';

// Define los prefijos
const debugServer = debug('app:server');

if (process.env.NODE_ENV === 'development') {
  debug.enable('app:*'); // Habilita todos los mensajes de depuración en desarrollo
} else {
  debug.disable(); // Desactiva los mensajes de depuración en producción
}


/* Iniciar */
const startServer = async () => {
  try {
    await connectToDatabase(); // Conecta a la base de datos
    await syncStore(); // Sincroniza la base de datos para crear tablas de sesión
    app.listen(port, () => {
      debugServer(`Servidor backend escuchando en http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};


startServer();