/* DEFINE LA ESTRUCTURA Y LA LÓGICA PRINCIPAL DE LA APLICACIÓN */
import express from 'express'; // Importa el módulo 'express' que permite crear aplicaciones web y APIs en Node.js.
import cors from 'cors'; // Importa el módulo 'cors' para habilitar la política de intercambio de recursos de origen cruzado (CORS) y permitir solicitudes desde diferentes dominios.
import session from 'express-session'; // Importa el módulo 'express-session' para manejar sesiones en la aplicación web, permitiendo la gestión de datos del usuario a lo largo de las solicitudes.
import morgan from 'morgan'; // Modulo morgan nos permite visualizar las solicitudes en la consola
import path from 'path'; // Importa el módulo 'path', que proporciona utilidades para trabajar con rutas de archivos y directorios
import { fileURLToPath } from 'url'; // Importa la función 'fileURLToPath' desde el módulo 'url', que convierte una URL de archivo a una ruta de archivo local
import { store } from './db/session.js'; // Importa el store

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Importar Routers */
import authRou from './routes/authRou.js'; // Rutas de autenticación de usuarios
import dataSucursalRou from './routes/dataSucursalRou.js'; // Rutas para ver datos de sucursales
import dataAplicacionRou from './routes/dataAplicacionRou.js'; // Rutas para ver datos de aplicaciones
import panelUserRou from './routes/panelUsersRou.js' // Rutas para administrar panel de usuarios
import panelSucursalRou from './routes/panelSucursalRou.js' // Rutas para administrar panel de sucursales
import AppInfoRou from './routes/AppInfoRou.js' // Rutas de información
import DeviceInfoRou from './routes/DeviceInfoRou.js' // Rutas de información
import panelAppsRou from './routes/panelAppsRou.js'; // Rutas para administrar panel de aplicaciones


/* Middlewares */
// Cualquier petición que llegue se convierte a json
app.use(express.json())

// app.use(morgan('dev')); // Configuración dev
app.use(morgan('combined')); // Usa 'combined' para producción
// Session
app.use(session({
    secret: 'mysecretkey_pps', // Clave secreta utilizada para firmar la ID de la sesión. Es fundamental que esta clave sea única y difícil de adivinar para asegurar la integridad y autenticidad de la sesión del usuario.
    resave: false, // Configura si la sesión debe ser guardada de nuevo en el almacenamiento en cada solicitud, incluso si no ha sido modificada. Al establecerlo en false, la sesión no se guardará innecesariamente, lo cual puede mejorar el rendimiento y reducir el uso de almacenamiento.
    saveUninitialized: true, // Configura si las sesiones nuevas (que aún no han sido modificadas) deben ser guardadas en el almacenamiento. Al establecerlo en true, se asegura que una sesión se guarde en el almacenamiento incluso si no ha sido modificada, lo que puede ser útil para que se genere una sesión para nuevos usuarios, pero puede aumentar el uso de almacenamiento.
    store: store, // Configura el store aquí
    cookie: {
        secure: false, // Cambiar a true si usas HTTPS
        maxAge: 24 * 60 * 60 * 1000, // Tiempo de vida de la cookie (1 día)
        sameSite: 'strict', // Configura la política SameSite de la cookie para 'strict', la cookie solo se enviará en solicitudes realizadas al mismo sitio que la cookie, proporcionando una capa adicional de seguridad contra ataques de CSRF (Cross-Site Request Forgery). Esta configuración previene que la cookie sea enviada en solicitudes cruzadas a otros dominios, incluso si se navega entre páginas dentro del mismo sitio.
        domain: 'localhost', // Dominio donde se enviará la cookie (sin puerto ni protocolo)
        path: '/' // Ruta donde la cookie será accesible (en todo el sitio)
    }
}))

// Configuración básica de CORS 
app.use(cors({
    origin: 'http://localhost:3000', // Permite solicitudes desde el puerto 3000 (frontend)
    credentials: true, // Permite que las solicitudes CORS incluyan credenciales como cookies, encabezados de autenticación y certificados de cliente. Esto es necesario si tu aplicación necesita intercambiar cookies o información de sesión entre el cliente y el servidor a través de diferentes dominios.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type','Authorization'] // Encabezados permitidos
}));
// Servir archivos estáticos desde la carpeta build
app.use(express.static(path.join(__dirname, 'public')));

/* Rutas */
app.use('', authRou); // Ruta de autenticación de usuarios
app.use('/api', dataSucursalRou); // Ruta para ver datos de sucursales
app.use('/api', dataAplicacionRou); // Ruta para ver datos de aplicaciones
app.use('/panel', panelUserRou); // Ruta para administrar panel de usuarios
app.use('/panel', panelSucursalRou); // Ruta para administrar panel de sucursales
app.use('/status', AppInfoRou); // Ruta de información
app.use('/devices', DeviceInfoRou); // Ruta de información
app.use('/apps',panelAppsRou)  // Rutas para administrar panel de aplicaciones
// Ruta para manejar todas las peticiones y servir el archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;