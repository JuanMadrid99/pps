/* RUTAS DE PANEL DE USUARIOS */
import express from 'express';
import { methods as panelUsersCon } from '../controllers/panelUsersCon.js'
const panelUserRou = express.Router();
// Body parser para analizar datos de formularios
panelUserRou.use(express.urlencoded({ extended: true }));

panelUserRou.get('/users', panelUsersCon.getUsers); // Pedimos los datos de los usuarios

panelUserRou.post('/users/agregar', panelUsersCon.postUser); // Agregamos un nuevo usuario

panelUserRou.post('/users/actualizar', panelUsersCon.patchUser); // Actualizamos un usuario

panelUserRou.post('/users/eliminar', panelUsersCon.deleteUser); // Eliminamos un usuario

// Exportar las Rutas
export default panelUserRou;