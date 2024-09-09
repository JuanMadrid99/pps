/* RUTAS DE AUTENTICACIÓN DE USUARIOS */
import express from 'express'
import { methods as authControllers } from '../controllers/authCon.js'; // Importamos los controladores de autenticación de usuarios
const authRou = express.Router(); // Creamos las rutas

// Body parser para analizar datos de formularios
authRou.use(express.urlencoded({ extended: true }));

authRou.post('/login/users', authControllers.login); // Leer y comprobar el usuario y crear sesión

authRou.get('', authControllers.logout) // Destruir sesión

authRou.get('/api/user', authControllers.user) // Definimos el tipo de usuario si se ha definido o no entre administrador y visita  

// Exportar las Rutas
export default authRou;